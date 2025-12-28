/**
 * Miniapp Registry
 *
 * Manages miniapp sources and manifests
 */

import type { EcosystemSource, MiniappManifest, SourceRecord } from './types'

const DEFAULT_SOURCE_URL = '/ecosystem.json'

/** 内置 Bio 官方生态图标 */
const BIO_OFFICIAL_ICON = '/logo.svg'

/** Storage key for ecosystem sources */
const STORAGE_KEY = 'ecosystem_sources'

/** Cached apps from all sources */
let cachedApps: MiniappManifest[] = []

/** Registered sources */
let sources: SourceRecord[] = []

/** 默认内置源 */
const DEFAULT_BUILTIN_SOURCE: SourceRecord = {
  url: DEFAULT_SOURCE_URL,
  name: 'Bio 官方生态',
  enabled: true,
  icon: BIO_OFFICIAL_ICON,
  builtin: true,
}

/** Load sources from localStorage */
export function loadSources(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as SourceRecord[]
      // 确保内置源始终存在
      const hasBuiltin = parsed.some((s) => s.builtin && s.url === DEFAULT_SOURCE_URL)
      if (!hasBuiltin) {
        sources = [DEFAULT_BUILTIN_SOURCE, ...parsed.filter((s) => !s.builtin)]
      } else {
        sources = parsed
      }
    } else {
      sources = [DEFAULT_BUILTIN_SOURCE]
    }
  } catch {
    sources = [DEFAULT_BUILTIN_SOURCE]
  }
}

/** Save sources to localStorage */
function saveSources(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sources))
}

/** Add a new source */
export function addSource(url: string, name: string, icon?: string): void {
  if (sources.some((s) => s.url === url)) {
    return
  }
  sources.push({ 
    url, 
    name, 
    enabled: true,
    // 默认使用 https 锁图标（由 UI 层处理，这里不存储）
    icon,
    builtin: false,
  })
  saveSources()
}

/** Remove a source */
export function removeSource(url: string): void {
  // 不允许删除内置源
  const source = sources.find((s) => s.url === url)
  if (source?.builtin) {
    console.warn('[Registry] Cannot remove builtin source')
    return
  }
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
export function getSources(): SourceRecord[] {
  return [...sources]
}

/** Update source icon from fetched data */
function updateSourceIcon(url: string, icon?: string): void {
  const source = sources.find((s) => s.url === url)
  if (source && icon && !source.builtin) {
    source.icon = icon
    saveSources()
  }
}

/** Fetch a single source */
async function fetchSource(url: string): Promise<EcosystemSource | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`[Registry] Failed to fetch source: ${url}`, response.status)
      return null
    }
    const data = await response.json() as EcosystemSource
    // 更新源图标（如果 JSON 中提供了）
    if (data.icon) {
      updateSourceIcon(url, data.icon)
    }
    return data
  } catch (error) {
    console.warn(`[Registry] Error fetching source: ${url}`, error)
    return null
  }
}

/** Refresh all sources and update cached apps */
export async function refreshSources(): Promise<MiniappManifest[]> {
  const enabledSources = sources.filter((s) => s.enabled)
  const results = await Promise.all(
    enabledSources.map(async (s) => {
      const data = await fetchSource(s.url)
      return { source: s, data }
    })
  )

  cachedApps = []
  for (const { source, data } of results) {
    if (data?.apps) {
      // 为每个应用附加来源信息
      const appsWithSource = data.apps.map((app) => ({
        ...app,
        sourceUrl: source.url,
        sourceIcon: source.icon || data.icon,
        sourceName: source.name,
      }))
      cachedApps.push(...appsWithSource)
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
