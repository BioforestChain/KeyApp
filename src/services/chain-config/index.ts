export type { ChainConfig, ChainConfigSource, ChainConfigSubscription, ChainConfigType } from './types'

import { ChainConfigListSchema, ChainConfigSchema, ChainConfigSubscriptionSchema } from './schema'
import { fetchSubscription, type FetchSubscriptionResult } from './subscription'
import {
  loadChainConfigs,
  loadSubscriptionMeta,
  loadUserPreferences,
  saveChainConfigs,
  saveUserPreferences,
  saveSubscriptionMeta,
} from './storage'
import type { ChainConfig, ChainConfigSource, ChainConfigSubscription, ChainConfigType } from './types'

export interface ChainConfigWarning {
  id: string
  kind: 'incompatible_major'
  version: string
  supportedMajor: number
  source: ChainConfigSource
}

export interface ChainConfigSnapshot {
  configs: ChainConfig[]
  enabledMap: Record<string, boolean>
  subscription: ChainConfigSubscription | null
  warnings: ChainConfigWarning[]
}

const KNOWN_TYPES: ReadonlySet<string> = new Set(['bioforest', 'evm', 'tron', 'bip39', 'custom'])

const SUPPORTED_MAJOR_BY_TYPE: Record<ChainConfigType, number> = {
  bioforest: 1,
  evm: 1,
  tron: 1,
  bip39: 1,
  custom: 1,
}

const DEFAULT_CHAINS_PATH = `${import.meta.env.BASE_URL}configs/default-chains.json`

let defaultChainsCache: ChainConfig[] | null = null
let defaultChainsLoading: Promise<ChainConfig[]> | null = null

function normalizeUnknownType(input: unknown): unknown {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return input
  const record = input as Record<string, unknown>

  const type = record.type
  if (typeof type === 'string' && !KNOWN_TYPES.has(type)) {
    return { ...record, type: 'custom' }
  }

  return input
}

function parseMajor(version: string): number | null {
  const majorPart = version.split('.')[0]
  const major = Number(majorPart)
  if (!Number.isInteger(major)) return null
  return major
}

function isCompatible(config: ChainConfig): boolean {
  const major = parseMajor(config.version)
  if (major === null) return false
  return major <= SUPPORTED_MAJOR_BY_TYPE[config.type]
}

function getDefaultChainsUrl(): string {
  const base = typeof window === 'undefined' ? 'http://localhost/' : window.location.href
  return new URL(DEFAULT_CHAINS_PATH, base).toString()
}

async function loadDefaultChainConfigs(): Promise<ChainConfig[]> {
  if (defaultChainsCache) return defaultChainsCache
  if (defaultChainsLoading) return defaultChainsLoading

  defaultChainsLoading = (async () => {
    if (typeof fetch === 'undefined') {
      throw new Error('fetch is not available in this environment')
    }

    const jsonUrl = getDefaultChainsUrl()
    const response = await fetch(jsonUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Failed to load default chain configs: ${response.status} ${response.statusText}`)
    }

    const json: unknown = await response.json()
    // 传入 JSON 文件 URL，用于解析相对路径
    const parsed = parseConfigs(json, 'default', jsonUrl)
    defaultChainsCache = parsed
    return parsed
  })()

  try {
    return await defaultChainsLoading
  } finally {
    defaultChainsLoading = null
  }
}

function parseJsonString(input: string): unknown {
  try {
    return JSON.parse(input) as unknown
  } catch {
    throw new Error('Invalid JSON')
  }
}

/**
 * 解析相对路径为绝对 URL（相对于 JSON 文件位置）
 */
function resolveRelativePath(path: string, jsonFileUrl: string): string {
  // 已经是绝对 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // 解析相对路径
  return new URL(path, jsonFileUrl).toString()
}

/**
 * 解析配置中的 icon 和 tokenIconBase 相对路径
 */
function resolveIconPaths(
  config: { icon?: string | undefined; tokenIconBase?: string[] | undefined },
  jsonFileUrl: string
): { icon?: string; tokenIconBase?: string[] } {
  const result: { icon?: string; tokenIconBase?: string[] } = {}
  
  if (config.icon !== undefined) {
    result.icon = resolveRelativePath(config.icon, jsonFileUrl)
  }
  
  if (config.tokenIconBase !== undefined) {
    result.tokenIconBase = config.tokenIconBase.map((base) =>
      resolveRelativePath(base, jsonFileUrl)
    )
  }
  
  return result
}

function parseConfigs(input: unknown, source: ChainConfigSource, jsonFileUrl?: string): ChainConfig[] {
  const normalized: unknown = Array.isArray(input) ? input.map(normalizeUnknownType) : normalizeUnknownType(input)

  const parsed = Array.isArray(normalized)
    ? ChainConfigListSchema.parse(normalized)
    : [ChainConfigSchema.parse(normalized)]

  return parsed.map((config) => {
    const resolvedPaths = jsonFileUrl ? resolveIconPaths(config, jsonFileUrl) : {}
    return {
      ...config,
      ...resolvedPaths,
      source,
      enabled: true,
    }
  })
}

function mergeBySource(options: {
  manual: ChainConfig[]
  subscription: ChainConfig[]
  defaults: ChainConfig[]
}): ChainConfig[] {
  const byId = new Map<string, ChainConfig>()

  for (const config of options.manual) {
    byId.set(config.id, { ...config, source: 'manual' })
  }

  for (const config of options.subscription) {
    if (!byId.has(config.id)) byId.set(config.id, { ...config, source: 'subscription' })
  }

  for (const config of options.defaults) {
    if (!byId.has(config.id)) byId.set(config.id, { ...config, source: 'default' })
  }

  return [...byId.values()]
}

function applyEnabledMap(configs: ChainConfig[], enabledMap: Record<string, boolean>): ChainConfig[] {
  return configs.map((config) => {
    const enabledOverride = enabledMap[config.id]
    const enabled = typeof enabledOverride === 'boolean' ? enabledOverride : true
    return { ...config, enabled }
  })
}

function collectWarnings(configs: ChainConfig[]): ChainConfigWarning[] {
  const warnings: ChainConfigWarning[] = []
  for (const config of configs) {
    const major = parseMajor(config.version)
    if (major === null) continue

    const supportedMajor = SUPPORTED_MAJOR_BY_TYPE[config.type]
    if (major > supportedMajor) {
      warnings.push({
        id: config.id,
        kind: 'incompatible_major',
        version: config.version,
        supportedMajor,
        source: config.source,
      })
    }
  }
  return warnings
}

export async function initialize(): Promise<ChainConfigSnapshot> {
  const defaults = await loadDefaultChainConfigs()

  const [storedConfigs, enabledMap, subscription] = await Promise.all([
    loadChainConfigs(),
    loadUserPreferences(),
    loadSubscriptionMeta(),
  ])

  const manual = storedConfigs.filter((c) => c.source === 'manual')

  const subscriptionConfigs =
    subscription?.url && subscription.url !== 'default'
      ? storedConfigs.filter((c) => c.source === 'subscription')
      : []

  const merged = mergeBySource({ manual, subscription: subscriptionConfigs, defaults })
  const configs = applyEnabledMap(merged, enabledMap)
  const warnings = collectWarnings(configs)

  return { configs, enabledMap, subscription, warnings }
}

export async function addManualConfig(input: unknown): Promise<ChainConfigSnapshot> {
  const json = typeof input === 'string' ? parseJsonString(input) : input
  const nextConfigs = parseConfigs(json, 'manual')

  const existing = await loadChainConfigs()
  const existingManual = existing.filter((c) => c.source === 'manual')

  const byId = new Map<string, ChainConfig>()
  for (const config of existingManual) {
    byId.set(config.id, { ...config, source: 'manual', enabled: true })
  }
  for (const config of nextConfigs) {
    byId.set(config.id, { ...config, source: 'manual', enabled: true })
  }

  await saveChainConfigs({ source: 'manual', configs: [...byId.values()] })
  return initialize()
}

export async function setChainEnabled(id: string, enabled: boolean): Promise<ChainConfigSnapshot> {
  const enabledMap = await loadUserPreferences()
  const nextEnabledMap: Record<string, boolean> = { ...enabledMap, [id]: enabled }
  await saveUserPreferences(nextEnabledMap)
  return initialize()
}

export async function refreshSubscription(): Promise<{ result: FetchSubscriptionResult; snapshot: ChainConfigSnapshot }> {
  const meta = await loadSubscriptionMeta()
  const url = meta?.url ?? 'default'

  const result = await fetchSubscription(url, { force: true })
  const snapshot = await initialize()
  return { result, snapshot }
}

function normalizeSubscriptionUrl(input: string): string {
  const url = input.trim()
  if (url === '') return 'default'
  if (url === 'default') return url

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('Invalid subscription URL')
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Subscription URL must use http(s)')
  }

  return url
}

export async function setSubscriptionUrl(input: string): Promise<ChainConfigSnapshot> {
  const url = normalizeSubscriptionUrl(input)

  const existingMeta = await loadSubscriptionMeta()
  const previousUrl = existingMeta?.url

  if (previousUrl !== url) {
    await saveChainConfigs({ source: 'subscription', configs: [] })
  }

  const nextMeta: ChainConfigSubscription = ChainConfigSubscriptionSchema.parse({
    url,
    refreshIntervalMinutes: existingMeta?.refreshIntervalMinutes ?? 1440,
    ...(previousUrl === url
      ? {
          ...(existingMeta?.etag ? { etag: existingMeta.etag } : {}),
          ...(existingMeta?.lastUpdated ? { lastUpdated: existingMeta.lastUpdated } : {}),
        }
      : {}),
  })

  await saveSubscriptionMeta(nextMeta)
  return initialize()
}

export function getEnabledChains(snapshot: ChainConfigSnapshot): ChainConfig[] {
  return snapshot.configs.filter((c) => c.enabled && isCompatible(c))
}

export function getChainById(snapshot: ChainConfigSnapshot, id: string): ChainConfig | null {
  return snapshot.configs.find((c) => c.id === id) ?? null
}
