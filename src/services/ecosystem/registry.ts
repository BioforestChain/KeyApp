/**
 * Miniapp Registry (Subscription v2)
 *
 * Responsibilities:
 * - Read trusted source configs from `ecosystemStore`
 * - Cache source payloads in IndexedDB (ETag/304)
 * - Provide merged app catalog + helpers (ranking/search)
 */

import { Effect } from 'effect';
import { HttpError, SchemaError, type FetchError } from '@biochain/chain-effect';
import { ecosystemStore, ecosystemSelectors, ecosystemActions } from '@/stores/ecosystem';
import type { EcosystemSource, MiniappManifest, SourceRecord } from './types';
import { EcosystemSearchResponseSchema, EcosystemSourceSchema } from './schema';
import { computeFeaturedScore } from './scoring';
import { createResolver } from '@/lib/url-resolver';

const SUPPORTED_SEARCH_RESPONSE_VERSIONS = new Set(['1', '1.0.0']);

// ==================== IndexedDB Cache ====================

const DB_NAME = 'ecosystem-sources';
const STORE_NAME = 'sources';

interface CacheEntry {
  url: string;
  data: EcosystemSource;
  etag?: string;
  cachedAt: number;
}

async function openCacheDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'url' });
      }
    };
  });
}

async function getCachedSource(url: string): Promise<CacheEntry | null> {
  try {
    const db = await openCacheDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(url);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result ?? null);
    });
  } catch {
    return null;
  }
}

async function setCachedSource(entry: CacheEntry): Promise<void> {
  try {
    const db = await openCacheDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(entry);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch {
    // Ignore cache errors
  }
}

// ==================== TTL Cache ====================

const TTL_MS = 5 * 60 * 1000; // 5 minutes
const SEARCH_TTL_MS = 30 * 1000; // 30 seconds
const ttlCache = new Map<string, { data: unknown; expiresAt: number }>();

function getTTLCached<T>(key: string): T | null {
  const entry = ttlCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    ttlCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setTTLCached<T>(key: string, data: T, ttlMs: number): void {
  ttlCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

function invalidateTTLCache(prefix: string): void {
  for (const key of ttlCache.keys()) {
    if (key.startsWith(prefix)) {
      ttlCache.delete(key);
    }
  }
}

// ==================== Fetch with ETag/Cache ====================

async function fetchSourceWithEtag(url: string): Promise<EcosystemSource | null> {
  // Check TTL cache first
  const ttlCached = getTTLCached<EcosystemSource>(`source:${url}`);
  if (ttlCached) return ttlCached;

  // Get cached entry for ETag
  const cached = await getCachedSource(url);
  const headers: Record<string, string> = {};
  if (cached?.etag) {
    headers['If-None-Match'] = cached.etag;
  }

  try {
    const response = await fetch(url, { headers });

    // 304 Not Modified - use cache
    if (response.status === 304 && cached) {
      setTTLCached(`source:${url}`, cached.data, TTL_MS);
      return cached.data;
    }

    if (!response.ok) {
      // Fall back to cache on error
      if (cached) {
        setTTLCached(`source:${url}`, cached.data, TTL_MS);
        return cached.data;
      }
      return null;
    }

    const json = await response.json();
    const parsed = EcosystemSourceSchema.safeParse(json);
    if (!parsed.success) {
      if (cached) return cached.data;
      return null;
    }

    const data = parsed.data;
    const etag = response.headers.get('etag') ?? undefined;

    // Update cache
    await setCachedSource({ url, data, etag, cachedAt: Date.now() });
    setTTLCached(`source:${url}`, data, TTL_MS);

    return data;
  } catch {
    // Fall back to cache on error
    if (cached) {
      setTTLCached(`source:${url}`, cached.data, TTL_MS);
      return cached.data;
    }
    return null;
  }
}

function fetchSearchResults(url: string): Effect.Effect<{ version: string; data: MiniappManifest[] }, FetchError> {
  // Check TTL cache first
  const ttlCached = getTTLCached<{ version: string; data: MiniappManifest[] }>(`search:${url}`);
  if (ttlCached) return Effect.succeed(ttlCached);

  return Effect.tryPromise({
    try: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new HttpError(`Search request failed: ${response.status}`, response.status);
      }
      const json = await response.json();
      const parsed = EcosystemSearchResponseSchema.safeParse(json);
      if (!parsed.success) {
        throw new SchemaError('Invalid ecosystem search response', parsed.error);
      }
      return parsed.data;
    },
    catch: (error) => {
      if (error instanceof HttpError || error instanceof SchemaError) return error;
      if (error instanceof Error) return new HttpError(error.message);
      return new HttpError('Unknown search error');
    },
  }).pipe(
    Effect.tap((result) =>
      Effect.sync(() => {
        setTTLCached(`search:${url}`, result, SEARCH_TTL_MS);
      })
    )
  );
}

let cachedApps: MiniappManifest[] = [];

type AppsSubscriber = (apps: MiniappManifest[]) => void;
const appSubscribers: AppsSubscriber[] = [];

function notifyApps(): void {
  const snapshot = [...cachedApps];
  appSubscribers.forEach((fn) => fn(snapshot));
}

export function subscribeApps(listener: AppsSubscriber): () => void {
  appSubscribers.push(listener);
  return () => {
    const index = appSubscribers.indexOf(listener);
    if (index >= 0) appSubscribers.splice(index, 1);
  };
}

function isValidAppId(appId: string): boolean {
  return /^[a-z0-9]+(?:\.[a-z0-9-]+)+$/i.test(appId);
}

function normalizeAppFromSource(
  app: MiniappManifest,
  source: SourceRecord,
  payload: EcosystemSource,
): MiniappManifest | null {
  if (!isValidAppId(app.id)) {
    return null;
  }

  const resolve = createResolver(source.url);

  return {
    ...app,
    icon: resolve(app.icon),
    url: resolve(app.url),
    screenshots: app.screenshots?.map(resolve),
    splashScreen: app.splashScreen,
    sourceUrl: source.url,
    sourceName: source.name,
    sourceIcon: source.icon ?? (payload.icon ? resolve(payload.icon) : undefined),
  };
}

async function fetchSourceWithCache(url: string): Promise<EcosystemSource | null> {
  return fetchSourceWithEtag(url);
}

async function rebuildCachedAppsFromSources(
  sources: Array<{ source: SourceRecord; payload: EcosystemSource | null }>,
): Promise<void> {
  const next: MiniappManifest[] = [];
  const seen = new Set<string>();

  for (const { source, payload } of sources) {
    if (!payload) continue;

    for (const app of payload.apps ?? []) {
      const normalized = normalizeAppFromSource(app, source, payload);
      if (!normalized) continue;

      if (seen.has(normalized.id)) continue;
      seen.add(normalized.id);
      next.push(normalized);
    }
  }

  cachedApps = next;
  notifyApps();
}

async function rebuildCachedAppsFromCache(): Promise<void> {
  const enabledSources = ecosystemSelectors.getEnabledSources(ecosystemStore.state);

  const entries = await Promise.all(
    enabledSources.map(async (source) => {
      const payload = await fetchSourceWithCache(source.url);
      return { source, payload };
    }),
  );

  await rebuildCachedAppsFromSources(entries);
}

let lastSourcesSignature = '';
ecosystemStore.subscribe(() => {
  const nextSignature = JSON.stringify(ecosystemStore.state.sources);
  if (nextSignature === lastSourcesSignature) return;
  lastSourcesSignature = nextSignature;
  void rebuildCachedAppsFromCache();
});

export async function initRegistry(options?: { refresh?: boolean }): Promise<void> {
  await rebuildCachedAppsFromCache();

  if (options?.refresh === true) {
    void refreshSources({ force: false });
  }
}

export function getSources(): SourceRecord[] {
  return ecosystemStore.state.sources;
}

export async function refreshSources(options?: { force?: boolean }): Promise<MiniappManifest[]> {
  const force = options?.force === true;
  const enabledSources = ecosystemSelectors.getEnabledSources(ecosystemStore.state);

  if (force) {
    invalidateTTLCache('source:');
  }

  const results = await Promise.all(
    enabledSources.map(async (source) => {
      ecosystemActions.updateSourceStatus(source.url, 'loading');
      try {
        const payload = await fetchSourceWithEtag(source.url);
        ecosystemActions.updateSourceStatus(source.url, 'success');
        return { source, payload };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        ecosystemActions.updateSourceStatus(source.url, 'error', message);
        return { source, payload: null };
      }
    }),
  );

  await rebuildCachedAppsFromSources(results);
  return [...cachedApps];
}

export async function refreshSource(url: string): Promise<void> {
  ecosystemActions.updateSourceStatus(url, 'loading');
  try {
    invalidateTTLCache(`source:${url}`);
    const payload = await fetchSourceWithEtag(url);
    if (payload) {
      ecosystemActions.updateSourceStatus(url, 'success');
      await rebuildCachedAppsFromCache();
    } else {
      ecosystemActions.updateSourceStatus(url, 'error', 'Failed to fetch source');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    ecosystemActions.updateSourceStatus(url, 'error', message);
  }
}

export async function loadSource(url: string): Promise<EcosystemSource | null> {
  return fetchSourceWithCache(url);
}

export function getApps(): MiniappManifest[] {
  return [...cachedApps];
}

export function getAppById(id: string): MiniappManifest | undefined {
  return cachedApps.find((app) => app.id === id);
}

export async function getAllApps(): Promise<MiniappManifest[]> {
  return getApps();
}

export async function getFeaturedApps(limit: number, date: Date = new Date()): Promise<MiniappManifest[]> {
  const apps = getApps();
  const ranked = [...apps].toSorted((a, b) => computeFeaturedScore(b, date) - computeFeaturedScore(a, date));
  return ranked.slice(0, Math.max(0, limit));
}

export async function searchCachedApps(query: string): Promise<MiniappManifest[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return getApps().filter((app) => {
    const haystacks = [app.name, app.description, app.longDescription ?? '', ...(app.tags ?? [])];
    return haystacks.some((v) => v.toLowerCase().includes(q));
  });
}

function isSupportedSearchResponseVersion(version: string): boolean {
  if (SUPPORTED_SEARCH_RESPONSE_VERSIONS.has(version)) return true;
  if (version.startsWith('1.')) return true;
  return false;
}

async function fetchRemoteSearch(source: SourceRecord, urlTemplate: string, query: string): Promise<MiniappManifest[]> {
  const encoded = encodeURIComponent(query);
  const url = urlTemplate.replace(/%s/g, encoded);

  try {
    const result = await Effect.runPromise(fetchSearchResults(url));
    const { version, data } = result;

    if (!isSupportedSearchResponseVersion(version)) {
      return [];
    }

    return data
      .map((app) => ({
        ...app,
        sourceUrl: source.url,
        sourceName: source.name,
      }))
      .filter((app) => isValidAppId(app.id));
  } catch {
    return [];
  }
}

export async function searchRemoteApps(query: string): Promise<MiniappManifest[]> {
  const q = query.trim();
  if (!q) return [];

  const enabledSources = ecosystemSelectors.getEnabledSources(ecosystemStore.state);
  const cachedPayloads = await Promise.all(
    enabledSources.map(async (source) => ({
      source,
      payload: await fetchSourceWithCache(source.url),
    })),
  );

  const searchTargets = cachedPayloads
    .map(({ source, payload }) => ({ source, urlTemplate: payload?.search?.urlTemplate }))
    .filter(
      (t): t is { source: SourceRecord; urlTemplate: string } =>
        typeof t.urlTemplate === 'string' && t.urlTemplate.length > 0,
    );

  const results = await Promise.all(
    searchTargets.map(({ source, urlTemplate }) => fetchRemoteSearch(source, urlTemplate, q)),
  );

  const merged: MiniappManifest[] = [];
  const seen = new Set<string>();

  for (const list of results) {
    for (const app of list) {
      if (seen.has(app.id)) continue;
      seen.add(app.id);
      merged.push(app);
    }
  }

  return merged;
}
