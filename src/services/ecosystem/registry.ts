/**
 * Miniapp Registry
 *
 * Manages miniapp sources and manifests
 */

import type { EcosystemSource, MiniappManifest } from './types'

const DEFAULT_SOURCE_URL = '/ecosystem.json'

/** Storage key for ecosystem sources */
const STORAGE_KEY = 'ecosystem_sources'

/** Cached apps from all sources */
let cachedApps: MiniappManifest[] = []

/** Registered sources */
let sources: { url: string; name: string; enabled: boolean }[] = []

/** Load sources from localStorage */
export function loadSources(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      sources = JSON.parse(stored)
    } else {
      // Default source
      sources = [{ url: DEFAULT_SOURCE_URL, name: 'Bio 官方生态', enabled: true }]
    }
  } catch {
    sources = [{ url: DEFAULT_SOURCE_URL, name: 'Bio 官方生态', enabled: true }]
  }
}

/** Save sources to localStorage */
function saveSources(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sources))
}

/** Add a new source */
export function addSource(url: string, name: string): void {
  if (sources.some((s) => s.url === url)) {
    return
  }
  sources.push({ url, name, enabled: true })
  saveSources()
}

/** Remove a source */
export function removeSource(url: string): void {
  sources = sources.filter((s) => s.url !== url)
  saveSources()
}

/** Toggle source enabled state */
export function toggleSource(url: string, enabled: boolean): void {
  const source = sources.find((s) => s.url === url)
  if (source) {
    source.enabled = enabled
    saveSources()
  }
}

/** Get all sources */
export function getSources(): typeof sources {
  return [...sources]
}

/** Fetch a single source */
async function fetchSource(url: string): Promise<EcosystemSource | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`[Registry] Failed to fetch source: ${url}`, response.status)
      return null
    }
    return await response.json()
  } catch (error) {
    console.warn(`[Registry] Error fetching source: ${url}`, error)
    return null
  }
}

/** Refresh all sources and update cached apps */
export async function refreshSources(): Promise<MiniappManifest[]> {
  const enabledSources = sources.filter((s) => s.enabled)
  const results = await Promise.all(enabledSources.map((s) => fetchSource(s.url)))

  cachedApps = []
  for (const result of results) {
    if (result?.apps) {
      cachedApps.push(...result.apps)
    }
  }

  console.log(`[Registry] Loaded ${cachedApps.length} apps from ${enabledSources.length} sources`)
  return cachedApps
}

/** Get all cached apps */
export function getApps(): MiniappManifest[] {
  return [...cachedApps]
}

/** Get app by ID */
export function getAppById(id: string): MiniappManifest | undefined {
  return cachedApps.find((app) => app.id === id)
}

/** Initialize registry */
export async function initRegistry(): Promise<void> {
  loadSources()
  await refreshSources()
}
