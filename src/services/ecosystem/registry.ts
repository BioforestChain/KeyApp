/**
 * Miniapp Registry (Subscription v2)
 *
 * Responsibilities:
 * - Read trusted source configs from `ecosystemStore`
 * - Cache source payloads in IndexedDB (ETag/304)
 * - Provide merged app catalog + helpers (ranking/search)
 */

import { ecosystemStore, ecosystemSelectors, ecosystemActions } from '@/stores/ecosystem'
import type { EcosystemSource, MiniappManifest, SourceRecord } from './types'
import { EcosystemSearchResponseSchema, EcosystemSourceSchema } from './schema'
import { loadSourcePayload, saveSourcePayload } from './storage'
import { computeFeaturedScore } from './scoring'
import { createResolver } from '@/lib/url-resolver'

const REQUEST_TIMEOUT = 10_000

const SUPPORTED_SEARCH_RESPONSE_VERSIONS = new Set(['1', '1.0.0'])

/** Cached apps from enabled sources */
let cachedApps: MiniappManifest[] = []

type AppsSubscriber = (apps: MiniappManifest[]) => void
const appSubscribers: AppsSubscriber[] = []

function notifyApps(): void {
  const snapshot = [...cachedApps]
  appSubscribers.forEach((fn) => fn(snapshot))
}

export function subscribeApps(listener: AppsSubscriber): () => void {
  appSubscribers.push(listener)
  return () => {
    const index = appSubscribers.indexOf(listener)
    if (index >= 0) appSubscribers.splice(index, 1)
  }
}

function isValidAppId(appId: string): boolean {
  // Reverse-domain style: com.domain.my-app (must contain at least one dot)
  return /^[a-z0-9]+(?:\.[a-z0-9-]+)+$/i.test(appId)
}

function normalizeAppFromSource(app: MiniappManifest, source: SourceRecord, payload: EcosystemSource): MiniappManifest | null {
  if (!isValidAppId(app.id)) {
    console.warn(`[Registry] Invalid appId "${app.id}" from source "${source.url}", skipping`)
    return null
  }

  // 创建基于 source URL 的路径解析器
  const resolve = createResolver(source.url)

  return {
    ...app,
    // 解析相对路径
    icon: resolve(app.icon),
    url: resolve(app.url),
    screenshots: app.screenshots?.map(resolve),
    // splashScreen 现在是 true | { timeout?: number }，不再需要解析 icon
    splashScreen: app.splashScreen,
    // 来源元数据
    sourceUrl: source.url,
    sourceName: source.name,
    sourceIcon: source.icon ?? (payload.icon ? resolve(payload.icon) : undefined),
  }
}

function requestWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = REQUEST_TIMEOUT): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  return fetch(input, { ...init, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId))
}

async function fetchSourceWithCache(url: string, force: boolean): Promise<EcosystemSource | null> {
  const cached = await loadSourcePayload(url)
  const etag = !force ? cached?.etag : undefined

  try {
    const response = await requestWithTimeout(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(etag !== undefined ? { 'If-None-Match': etag } : {}),
      },
    })

    if (response.status === 304) {
      return cached?.payload ?? null
    }

    if (!response.ok) {
      console.warn(`[Registry] Failed to fetch source: ${url}`, response.status, response.statusText)
      return cached?.payload ?? null
    }

    const json: unknown = await response.json()
    const parsed = EcosystemSourceSchema.safeParse(json)
    if (!parsed.success) {
      console.warn(`[Registry] Invalid source JSON: ${url}`, parsed.error)
      return cached?.payload ?? null
    }

    const payload = parsed.data as EcosystemSource
    const responseEtag = response.headers.get('ETag') ?? undefined

    await saveSourcePayload({
      url,
      payload,
      ...(responseEtag !== undefined ? { etag: responseEtag } : {}),
      lastUpdated: new Date().toISOString(),
    })

    return payload
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'request timeout'
        : error instanceof Error
          ? error.message
          : String(error)
    console.warn(`[Registry] Error fetching source: ${url}`, message)
    return cached?.payload ?? null
  }
}

async function rebuildCachedAppsFromCache(): Promise<void> {
  const enabledSources = ecosystemSelectors.getEnabledSources(ecosystemStore.state)

  const entries = await Promise.all(
    enabledSources.map(async (source) => {
      const cached = await loadSourcePayload(source.url)
      return { source, cached }
    }),
  )

  const next: MiniappManifest[] = []
  const seen = new Set<string>()

  for (const { source, cached } of entries) {
    const payload = cached?.payload
    if (!payload) continue

    for (const app of payload.apps ?? []) {
      const normalized = normalizeAppFromSource(app, source, payload)
      if (!normalized) continue

      if (seen.has(normalized.id)) {
        console.warn(`[Registry] Duplicate appId "${normalized.id}" detected, skipping later entry`)
        continue
      }
      seen.add(normalized.id)
      next.push(normalized)
    }
  }

  cachedApps = next
  notifyApps()
}

let lastSourcesSignature = ''
ecosystemStore.subscribe(() => {
  // Only react to source config changes (not permissions).
  const nextSignature = JSON.stringify(ecosystemStore.state.sources)
  if (nextSignature === lastSourcesSignature) return
  lastSourcesSignature = nextSignature
  void rebuildCachedAppsFromCache()
})

/** Initialize registry: load cached apps first, then refresh in background */
export async function initRegistry(options?: { refresh?: boolean }): Promise<void> {
  await rebuildCachedAppsFromCache()

  if (options?.refresh === true) {
    void refreshSources({ force: false })
  }
}

/** Get all sources (from ecosystemStore) */
export function getSources(): SourceRecord[] {
  // ecosystemStore is the single source of truth for source configs.
  return ecosystemStore.state.sources.map((s) => ({
    url: s.url,
    name: s.name,
    enabled: s.enabled,
    lastUpdated: s.lastUpdated,
  }))
}

/** Fetch enabled sources and update cache + store timestamp */
export async function refreshSources(options?: { force?: boolean }): Promise<MiniappManifest[]> {
  const force = options?.force === true
  const enabledSources = ecosystemSelectors.getEnabledSources(ecosystemStore.state)

  const results = await Promise.all(
    enabledSources.map(async (source) => {
      const payload = await fetchSourceWithCache(source.url, force)
      if (payload) {
        ecosystemActions.updateSourceTimestamp(source.url)
      }
      return { source, payload }
    }),
  )

  // Rebuild from payloads fetched (avoid extra IndexedDB reads)
  const next: MiniappManifest[] = []
  const seen = new Set<string>()

  for (const { source, payload } of results) {
    if (!payload) continue
    for (const app of payload.apps ?? []) {
      const normalized = normalizeAppFromSource(app, source, payload)
      if (!normalized) continue

      if (seen.has(normalized.id)) {
        console.warn(`[Registry] Duplicate appId "${normalized.id}" detected, skipping later entry`)
        continue
      }
      seen.add(normalized.id)
      next.push(normalized)
    }
  }

  cachedApps = next
  notifyApps()

  console.log(`[Registry] Loaded ${cachedApps.length} apps from ${enabledSources.length} sources`)
  return [...cachedApps]
}

export async function loadSource(url: string): Promise<EcosystemSource | null> {
  const cached = await loadSourcePayload(url)
  return cached?.payload ?? null
}

/** Get all cached apps */
export function getApps(): MiniappManifest[] {
  return [...cachedApps]
}

/** Get app by ID */
export function getAppById(id: string): MiniappManifest | undefined {
  return cachedApps.find((app) => app.id === id)
}

export async function getAllApps(): Promise<MiniappManifest[]> {
  return getApps()
}

export async function getFeaturedApps(limit: number, date: Date = new Date()): Promise<MiniappManifest[]> {
  const apps = getApps()
  const ranked = [...apps].sort((a, b) => computeFeaturedScore(b, date) - computeFeaturedScore(a, date))
  return ranked.slice(0, Math.max(0, limit))
}

export async function searchCachedApps(query: string): Promise<MiniappManifest[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []

  return getApps().filter((app) => {
    const haystacks = [
      app.name,
      app.description,
      app.longDescription ?? '',
      ...(app.tags ?? []),
    ]
    return haystacks.some((v) => v.toLowerCase().includes(q))
  })
}

function isSupportedSearchResponseVersion(version: string): boolean {
  if (SUPPORTED_SEARCH_RESPONSE_VERSIONS.has(version)) return true
  // Allow "1.x" as forward-compatible minor bumps.
  if (version.startsWith('1.')) return true
  return false
}

async function fetchRemoteSearch(source: SourceRecord, urlTemplate: string, query: string): Promise<MiniappManifest[]> {
  const encoded = encodeURIComponent(query)
  const url = urlTemplate.replace(/%s/g, encoded)

  const response = await requestWithTimeout(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    console.warn(`[Registry] Remote search failed: ${source.url}`, response.status, response.statusText)
    return []
  }

  const json: unknown = await response.json()
  const parsed = EcosystemSearchResponseSchema.safeParse(json)
  if (!parsed.success) {
    console.warn(`[Registry] Invalid search response from source: ${source.url}`, parsed.error)
    return []
  }

  const { version, data } = parsed.data as { version: string; data: MiniappManifest[] }
  if (!isSupportedSearchResponseVersion(version)) {
    console.warn(`[Registry] Unsupported search response version "${version}" from source: ${source.url}`)
    return []
  }

  // Attach source metadata and validate appId.
  return data
    .map((app) => ({
      ...app,
      sourceUrl: source.url,
      sourceName: source.name,
    }))
    .filter((app) => {
      if (isValidAppId(app.id)) return true
      console.warn(`[Registry] Invalid appId "${app.id}" from remote search of source "${source.url}", skipping`)
      return false
    })
}

export async function searchRemoteApps(query: string): Promise<MiniappManifest[]> {
  const q = query.trim()
  if (!q) return []

  const enabledSources = ecosystemSelectors.getEnabledSources(ecosystemStore.state)
  const cachedPayloads = await Promise.all(
    enabledSources.map(async (source) => ({
      source,
      cached: await loadSourcePayload(source.url),
    })),
  )

  const searchTargets = cachedPayloads
    .map(({ source, cached }) => ({ source, urlTemplate: cached?.payload.search?.urlTemplate }))
    .filter((t): t is { source: SourceRecord; urlTemplate: string } => typeof t.urlTemplate === 'string' && t.urlTemplate.length > 0)

  const results = await Promise.all(
    searchTargets.map(({ source, urlTemplate }) => fetchRemoteSearch(source, urlTemplate, q)),
  )

  const merged: MiniappManifest[] = []
  const seen = new Set<string>()

  for (const list of results) {
    for (const app of list) {
      if (seen.has(app.id)) continue
      seen.add(app.id)
      merged.push(app)
    }
  }

  return merged
}
