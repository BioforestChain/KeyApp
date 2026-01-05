import { ChainConfigListSchema, ChainConfigSchema, ChainConfigSubscriptionSchema } from './schema'
import type { ChainConfig, ChainConfigSubscription } from './types'
import { loadChainConfigs, loadSubscriptionMeta, saveChainConfigs, saveSubscriptionMeta } from './storage'

export type FetchSubscriptionResult =
  | {
      status: 'skipped'
      reason: 'default'
      configs: ChainConfig[]
      meta: ChainConfigSubscription | null
    }
  | {
      status: 'not_modified'
      configs: ChainConfig[]
      meta: ChainConfigSubscription | null
    }
  | {
      status: 'updated'
      configs: ChainConfig[]
      meta: ChainConfigSubscription
    }
  | {
      status: 'error'
      error: string
      configs: ChainConfig[]
      meta: ChainConfigSubscription | null
    }

const REQUEST_TIMEOUT = 10_000

const KNOWN_TYPES = new Set(['bioforest', 'evm', 'bip39', 'custom'] as const)

function normalizeUnknownType(input: unknown): unknown {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return input
  const record = input as Record<string, unknown>

  const type = record.type
  if (typeof type === 'string' && !KNOWN_TYPES.has(type as never)) {
    return { ...record, chainKind: 'custom' }
  }

  return input
}

export function parseAndValidate(json: unknown): ChainConfig[] {
  const normalized: unknown = Array.isArray(json) ? json.map(normalizeUnknownType) : normalizeUnknownType(json)

  const parsed = Array.isArray(normalized)
    ? ChainConfigListSchema.parse(normalized)
    : [ChainConfigSchema.parse(normalized)]

  return parsed.map((c) => ({
    ...c,
    source: 'subscription',
    enabled: true,
  }))
}

export function mergeWithExisting(fetched: ChainConfig[], cached: ChainConfig[]): ChainConfig[] {
  if (fetched.length === 0) return cached

  const deduped = new Map<string, ChainConfig>()
  for (const config of fetched) {
    deduped.set(config.id, { ...config, source: 'subscription', enabled: true })
  }
  return [...deduped.values()]
}

function getCachedSubscriptionConfigs(allConfigs: ChainConfig[]): ChainConfig[] {
  return allConfigs.filter((c) => c.source === 'subscription')
}

export async function fetchSubscription(
  url: string,
  options?: {
    force?: boolean
  }
): Promise<FetchSubscriptionResult> {
  if (url === 'default') {
    return { status: 'skipped', reason: 'default', configs: [], meta: null }
  }

  const force = options?.force === true

  const allConfigs = await loadChainConfigs()
  const cachedConfigs = getCachedSubscriptionConfigs(allConfigs)

  const existingMeta = await loadSubscriptionMeta()
  const etag = !force && existingMeta?.url === url ? existingMeta.etag : undefined

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(etag !== undefined ? { 'If-None-Match': etag } : {}),
      },
    })

    clearTimeout(timeoutId)

    if (response.status === 304) {
      return { status: 'not_modified', configs: cachedConfigs, meta: existingMeta }
    }

    if (!response.ok) {
      return {
        status: 'error',
        error: `Subscription fetch failed: ${response.status} ${response.statusText}`,
        configs: cachedConfigs,
        meta: existingMeta,
      }
    }

    const json: unknown = await response.json()
    const fetchedConfigs = parseAndValidate(json)
    const merged = mergeWithExisting(fetchedConfigs, cachedConfigs)

    const responseEtag = response.headers.get('ETag') ?? undefined
    const nextMeta: ChainConfigSubscription = ChainConfigSubscriptionSchema.parse({
      url,
      ...(responseEtag !== undefined ? { etag: responseEtag } : {}),
      lastUpdated: new Date().toISOString(),
    })

    await saveChainConfigs({ source: 'subscription', configs: merged })
    await saveSubscriptionMeta(nextMeta)

    return { status: 'updated', configs: merged, meta: nextMeta }
  } catch (error) {
    clearTimeout(timeoutId)

    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'Subscription request timeout'
        : error instanceof Error
          ? error.message
          : 'Failed to fetch subscription'

    return { status: 'error', error: message, configs: cachedConfigs, meta: existingMeta ?? null }
  }
}
