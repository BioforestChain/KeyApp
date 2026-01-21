/**
 * Miniapp Registry (Subscription v2)
 *
 * Responsibilities:
 * - Read trusted source configs from `ecosystemStore`
 * - Cache source payloads in IndexedDB (ETag/304)
 * - Provide merged app catalog + helpers (ranking/search)
 */

import { keyFetch, etag, cache, IndexedDBCacheStorage, ttl } from '@biochain/key-fetch';
import { ecosystemStore, ecosystemSelectors, ecosystemActions } from '@/stores/ecosystem';
import type { EcosystemSource, MiniappManifest, SourceRecord } from './types';
import { EcosystemSearchResponseSchema, EcosystemSourceSchema } from './schema';
import { computeFeaturedScore } from './scoring';
import { createResolver } from '@/lib/url-resolver';

const SUPPORTED_SEARCH_RESPONSE_VERSIONS = new Set(['1', '1.0.0']);

const ecosystemSourceStorage = new IndexedDBCacheStorage('ecosystem-sources', 'sources');

function createSourceFetcher(url: string) {
  return keyFetch.create({
    name: `ecosystem.source.${url}`,
    outputSchema: EcosystemSourceSchema,
    url,
    use: [etag(), cache({ storage: ecosystemSourceStorage }), ttl(5 * 60 * 1000)],
  });
}

function createSearchFetcher(url: string) {
  return keyFetch.create({
    name: `ecosystem.search.${url}`,
    outputSchema: EcosystemSearchResponseSchema,
    url,
    use: [ttl(30 * 1000)],
  });
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
  try {
    const fetcher = createSourceFetcher(url);
    return await fetcher.fetch({});
  } catch {
    return null;
  }
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
    keyFetch.invalidate('ecosystem.source');
  }

  const results = await Promise.all(
    enabledSources.map(async (source) => {
      ecosystemActions.updateSourceStatus(source.url, 'loading');
      try {
        const fetcher = createSourceFetcher(source.url);
        const payload = await fetcher.fetch({});
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
    keyFetch.invalidate(`ecosystem.source.${url}`);
    const fetcher = createSourceFetcher(url);
    const payload = await fetcher.fetch({});
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
    const fetcher = createSearchFetcher(url);
    const response = await fetcher.fetch({});
    const { version, data } = response as { version: string; data: MiniappManifest[] };

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
