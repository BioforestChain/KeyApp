export type { ChainConfig, ChainConfigSource, ChainConfigSubscription, ChainKind, ParsedApiEntry, ApiProviderEntry, ApiProviders } from './types'

import { z } from 'zod'
import { ChainConfigListSchema, ChainConfigSchema, ChainConfigSubscriptionSchema, VersionedChainConfigFileSchema } from './schema'
import { fetchSubscription, type FetchSubscriptionResult } from './subscription'
import {
  loadChainConfigs,
  loadSubscriptionMeta,
  loadUserPreferences,
  saveChainConfigs,
  saveUserPreferences,
  saveSubscriptionMeta,
  loadDefaultVersion,
  saveDefaultVersion,
} from './storage'
import type { ChainConfig, ChainConfigSource, ChainConfigSubscription, ChainKind } from './types'

/** 数据库版本不兼容错误，需要用户清空数据 */
export class ChainConfigMigrationError extends Error {
  readonly code = 'MIGRATION_REQUIRED'
  readonly storedVersion: string | null
  readonly requiredVersion: string

  constructor(storedVersion: string | null, requiredVersion: string) {
    super(`Database migration required: stored version ${storedVersion ?? 'unknown'} is incompatible with ${requiredVersion}`)
    this.name = 'ChainConfigMigrationError'
    this.storedVersion = storedVersion
    this.requiredVersion = requiredVersion
  }
}

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

const SUPPORTED_MAJOR_BY_KIND: Record<ChainKind, number> = {
  bioforest: 1,
  evm: 1,
  bitcoin: 1,
  tron: 1,
}

const DEFAULT_CHAINS_PATH = `${import.meta.env.BASE_URL}configs/default-chains.json`

interface DefaultChainsResult {
  version: string
  configs: ChainConfig[]
}

let defaultChainsCache: DefaultChainsResult | null = null
let defaultChainsLoading: Promise<DefaultChainsResult> | null = null

function parseMajor(version: string): number | null {
  const majorPart = version.split('.')[0]
  const major = Number(majorPart)
  if (!Number.isInteger(major)) return null
  return major
}

function isCompatible(config: ChainConfig): boolean {
  const major = parseMajor(config.version)
  if (major === null) return false
  return major <= SUPPORTED_MAJOR_BY_KIND[config.chainKind]
}

function getDefaultChainsUrl(): string {
  const base = typeof window === 'undefined' ? 'http://localhost/' : window.location.href
  return new URL(DEFAULT_CHAINS_PATH, base).toString()
}

async function loadDefaultChainConfigs(): Promise<DefaultChainsResult> {
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
    const parsedResult = VersionedChainConfigFileSchema.safeParse(json)
    if (!parsedResult.success) {
      const firstIssue = parsedResult.error.issues[0]
      throw new Error(firstIssue?.message ?? 'Invalid default chain config file')
    }

    const parsed = parsedResult.data

    const configs = parsed.chains.map((config) => {
      const resolvedPaths = resolveIconPaths(config, jsonUrl)
      return {
        ...config,
        ...resolvedPaths,
        source: 'default' as const,
        enabled: true,
      }
    })

    const result: DefaultChainsResult = {
      version: parsed.version,
      configs,
    }
    defaultChainsCache = result
    return result
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
 * 解析配置中的 icon、tokenIconBase 和 tokenIconContract 相对路径
 */
function resolveIconPaths(
  config: { icon?: string | undefined; tokenIconBase?: string[] | undefined; tokenIconContract?: string[] | undefined },
  jsonFileUrl: string
): { icon?: string; tokenIconBase?: string[]; tokenIconContract?: string[] } {
  const result: { icon?: string; tokenIconBase?: string[]; tokenIconContract?: string[] } = {}

  if (config.icon !== undefined) {
    result.icon = resolveRelativePath(config.icon, jsonFileUrl)
  }

  if (config.tokenIconBase !== undefined) {
    result.tokenIconBase = config.tokenIconBase.map((base) =>
      resolveRelativePath(base, jsonFileUrl)
    )
  }

  if (config.tokenIconContract !== undefined) {
    result.tokenIconContract = config.tokenIconContract.map((base) =>
      resolveRelativePath(base, jsonFileUrl)
    )
  }

  return result
}

function parseConfigs(input: unknown, source: ChainConfigSource, jsonFileUrl?: string): ChainConfig[] {
  // Strict validation: unknown chainKind will fail schema validation directly
  const parsedResult = Array.isArray(input)
    ? ChainConfigListSchema.safeParse(input)
    : ChainConfigSchema.safeParse(input)

  if (!parsedResult.success) {
    const firstIssue = parsedResult.error.issues[0]
    throw new Error(firstIssue?.message ?? 'Invalid chain config')
  }

  // Normalize to array - use type assertion since Zod union types are complex
  const configs = Array.isArray(input)
    ? (parsedResult.data as z.infer<typeof ChainConfigListSchema>)
    : [parsedResult.data as z.infer<typeof ChainConfigSchema>]

  return configs.map((config) => {
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

    const supportedMajor = SUPPORTED_MAJOR_BY_KIND[config.chainKind]
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

/** Parse major version from semver string */
function parseMajorFromSemver(version: string): number {
  const major = parseInt(version.split('.')[0] ?? '0', 10)
  return Number.isNaN(major) ? 0 : major
}

/** Compare semver versions: returns 1 if a > b, -1 if a < b, 0 if equal */
function compareSemver(a: string, b: string): number {
  const partsA = a.split('.').map(Number)
  const partsB = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const numA = partsA[i] ?? 0
    const numB = partsB[i] ?? 0
    if (numA > numB) return 1
    if (numA < numB) return -1
  }
  return 0
}

export async function initialize(): Promise<ChainConfigSnapshot> {
  const { version: bundledVersion, configs: defaultConfigs } = await loadDefaultChainConfigs()

  const [storedConfigs, enabledMap, subscription, storedDefaultVersion] = await Promise.all([
    loadChainConfigs(),
    loadUserPreferences(),
    loadSubscriptionMeta(),
    loadDefaultVersion(),
  ])

  // 检测旧版数据：storedVersion 为 null 且有存储的配置数据（说明是旧版升级）
  const bundledMajor = parseMajorFromSemver(bundledVersion)
  const hasStoredData = storedConfigs.length > 0 || Object.keys(enabledMap).length > 0 || subscription !== null
  if (storedDefaultVersion === null && bundledMajor >= 2 && hasStoredData) {
    throw new ChainConfigMigrationError(storedDefaultVersion, bundledVersion)
  }

  // 版本比较：bundled > stored 时强制合并默认配置
  const shouldForceMerge = compareSemver(bundledVersion, storedDefaultVersion ?? '0.0.0') > 0
  if (shouldForceMerge) {
    await saveDefaultVersion(bundledVersion)
  }

  const manual = storedConfigs.filter((c) => c.source === 'manual')

  const subscriptionConfigs =
    subscription?.url && subscription.url !== 'default'
      ? storedConfigs.filter((c) => c.source === 'subscription')
      : []

  const merged = mergeBySource({ manual, subscription: subscriptionConfigs, defaults: defaultConfigs })
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
