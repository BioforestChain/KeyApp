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
import { isPermissionsPolicyDirective, normalizePermissionsPolicy } from './permissions-policy';

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
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const key = entry.url;
      const request = store.keyPath ? store.put(entry) : store.put(entry, key);
      request.onerror = () => resolve();
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
const DEBUG_ECOSYSTEM = import.meta.env.DEV || __DEV_MODE__;

function debugLog(message: string, data?: Record<string, unknown>): void {
  if (!DEBUG_ECOSYSTEM) return;
  if (data) {
    console.log(`[ecosystem] ${message}`, data);
  } else {
    console.log(`[ecosystem] ${message}`);
  }
}

function normalizeFetchUrl(rawUrl: string): string {
  if (typeof window === 'undefined') return rawUrl;
  const trimmed = rawUrl.trim();
  if (trimmed.length === 0) return rawUrl;

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `${window.location.protocol}${trimmed}`;
  }

  try {
    const baseUrl = typeof document !== 'undefined' ? document.baseURI : window.location.origin;
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return rawUrl;
  }
}

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
  const fetchUrl = normalizeFetchUrl(url);
  const cacheKey = fetchUrl;
  // Check TTL cache first
  const ttlCached = getTTLCached<EcosystemSource>(`source:${cacheKey}`);
  if (ttlCached) return ttlCached;

  // Get cached entry for ETag
  const cached = await getCachedSource(cacheKey);
  const headers: Record<string, string> = {};
  if (cached?.etag && (typeof window === 'undefined' || new URL(fetchUrl).origin === window.location.origin)) {
    headers['If-None-Match'] = cached.etag;
  }

  try {
    debugLog('fetch source start', { url, fetchUrl });
    const response = await fetch(fetchUrl, { headers });

    // 304 Not Modified - use cache
    if (response.status === 304 && cached) {
      debugLog('fetch source not modified', { url, fetchUrl });
      setTTLCached(`source:${cacheKey}`, cached.data, TTL_MS);
      return cached.data;
    }

    if (!response.ok) {
      debugLog('fetch source failed', { url, fetchUrl, status: response.status });
      // Fall back to cache on error
      if (cached) {
        setTTLCached(`source:${cacheKey}`, cached.data, TTL_MS);
        return cached.data;
      }
      return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    let json: unknown;
    try {
      json = await response.json();
    } catch (error) {
      debugLog('fetch source parse error', {
        url,
        fetchUrl,
        contentType,
        message: error instanceof Error ? error.message : String(error),
      });
      if (cached) return cached.data;
      return null;
    }
    const parsed = EcosystemSourceSchema.safeParse(json);
    if (!parsed.success) {
      debugLog('fetch source invalid payload', {
        url,
        fetchUrl,
        issues: parsed.error.issues.map((issue) => issue.path.join('.')),
      });
      if (cached) return cached.data;
      return null;
    }

    const data = parsed.data;
    const etag = response.headers.get('etag') ?? undefined;

    // Update cache
    await setCachedSource({ url: cacheKey, data, etag, cachedAt: Date.now() });
    setTTLCached(`source:${cacheKey}`, data, TTL_MS);
    debugLog('fetch source success', { url, fetchUrl, apps: data.apps?.length ?? 0 });

    return data;
  } catch (error) {
    debugLog('fetch source error', {
      url,
      fetchUrl,
      message: error instanceof Error ? error.message : String(error),
    });
    // Fall back to cache on error
    if (cached) {
      setTTLCached(`source:${cacheKey}`, cached.data, TTL_MS);
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
const sourcePayloads = new Map<string, EcosystemSource | null>();

type AppsSubscriber = (apps: MiniappManifest[]) => void;
const appSubscribers: AppsSubscriber[] = [];

function notifyApps(): void {
  const snapshot = [...cachedApps];
  appSubscribers.forEach((fn) => fn(snapshot));
}

function computeGaussianWeightedAverage(values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0] ?? 0;

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / Math.max(1, values.length - 1);
  const sigma = Math.sqrt(variance);
  const sigmaSafe = sigma > 0 ? sigma : 1;
  const minWeight = 0.05;

  let weightedSum = 0;
  let weightTotal = 0;

  for (const v of values) {
    const z = (v - mean) / sigmaSafe;
    const gaussianWeight = Math.exp(-0.5 * z * z);
    const weight = Math.max(minWeight, gaussianWeight);
    weightedSum += v * weight;
    weightTotal += weight;
  }

  if (weightTotal === 0) return mean;
  return weightedSum / weightTotal;
}

function mergeAppsFromSources(
  sources: SourceRecord[],
  payloadsByUrl: Map<string, EcosystemSource | null>,
): MiniappManifest[] {
  const merged: MiniappManifest[] = [];
  const indexById = new Map<string, number>();
  const officialScoresById = new Map<string, number[]>();
  const communityScoresById = new Map<string, number[]>();

  for (const source of sources) {
    const payload = payloadsByUrl.get(source.url);
    if (!payload) continue;

    for (const app of payload.apps ?? []) {
      const normalized = normalizeAppFromSource(app, source, payload);
      if (!normalized) continue;

      const appId = normalized.id;
      const existingIndex = indexById.get(appId);

      if (existingIndex === undefined) {
        indexById.set(appId, merged.length);
        merged.push(normalized);
      } else {
        merged[existingIndex] = normalized;
      }

      if (typeof normalized.officialScore === 'number') {
        const list = officialScoresById.get(appId) ?? [];
        list.push(normalized.officialScore);
        officialScoresById.set(appId, list);
      }

      if (typeof normalized.communityScore === 'number') {
        const list = communityScoresById.get(appId) ?? [];
        list.push(normalized.communityScore);
        communityScoresById.set(appId, list);
      }
    }
  }

  for (const [id, index] of indexById) {
    const base = merged[index];
    if (!base) continue;

    const officialScores = officialScoresById.get(id);
    if (officialScores && officialScores.length > 0) {
      base.officialScore = computeGaussianWeightedAverage(officialScores);
    }

    const communityScores = communityScoresById.get(id);
    if (communityScores && communityScores.length > 0) {
      base.communityScore = computeGaussianWeightedAverage(communityScores);
    }
  }

  debugLog('merge apps', { sources: sources.length, apps: merged.length });
  return merged;
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

  const permissionsPolicy = normalizePermissionsPolicy(app.permissionsPolicy ?? []);
  if ((app.permissionsPolicy?.length ?? 0) > 0) {
    const unknown = (app.permissionsPolicy ?? []).filter((entry) => !isPermissionsPolicyDirective(entry));
    if (unknown.length > 0) {
      debugLog('unknown permissions policy directives', { appId: app.id, directives: unknown });
    }
  }

  return {
    ...app,
    permissionsPolicy,
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

async function rebuildCachedAppsFromCache(): Promise<void> {
  const enabledSources = ecosystemSelectors.getEnabledSources(ecosystemStore.state);
  if (enabledSources.length === 0) {
    debugLog('no enabled sources');
  }

  await Promise.all(
    enabledSources.map(async (source) => {
      const payload = await fetchSourceWithCache(source.url);
      sourcePayloads.set(source.url, payload);
      cachedApps = mergeAppsFromSources(enabledSources, sourcePayloads);
      notifyApps();
    }),
  );
}

function getSourcesSignature(sources: SourceRecord[]): string {
  return sources
    .map((source) => `${source.url}|${source.enabled ? '1' : '0'}`)
    .sort()
    .join(',');
}

let lastSourcesSignature = '';
ecosystemStore.subscribe(() => {
  const nextSignature = getSourcesSignature(ecosystemStore.state.sources);
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
  if (enabledSources.length === 0) {
    debugLog('refresh skipped: no enabled sources');
  }

  if (force) {
    invalidateTTLCache('source:');
  }

  await Promise.all(
    enabledSources.map(async (source) => {
      ecosystemActions.updateSourceStatus(source.url, 'loading');
      try {
        const payload = await fetchSourceWithEtag(source.url);
        ecosystemActions.updateSourceStatus(source.url, 'success');
        sourcePayloads.set(source.url, payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        ecosystemActions.updateSourceStatus(source.url, 'error', message);
        sourcePayloads.set(source.url, null);
      } finally {
        cachedApps = mergeAppsFromSources(enabledSources, sourcePayloads);
        notifyApps();
      }
    }),
  );
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
