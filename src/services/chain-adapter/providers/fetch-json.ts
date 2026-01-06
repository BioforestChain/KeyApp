export type FetchJsonOptions = {
  /** Cache key; defaults to method+url+body (string bodies only). */
  cacheKey?: string
  /** TTL for response JSON cache; 0/undefined disables caching. */
  ttlMs?: number
  /** Tags for invalidation; only effective when ttlMs > 0. */
  tags?: string[]
}

type CacheEntry = {
  expiresAt: number
  value: unknown
}

const inFlight = new Map<string, Promise<unknown>>()
const jsonCache = new Map<string, CacheEntry>()
const tagIndex = new Map<string, Set<string>>()

const observedValues = new Map<string, string>()

function buildDefaultKey(url: string, init?: RequestInit): string {
  const method = (init?.method ?? 'GET').toUpperCase()
  const body = typeof init?.body === 'string' ? init.body : ''
  return `${method}:${url}:${body}`
}

function addTags(cacheKey: string, tags: string[]): void {
  for (const tag of tags) {
    const existing = tagIndex.get(tag) ?? new Set<string>()
    existing.add(cacheKey)
    tagIndex.set(tag, existing)
  }
}

export function invalidateTags(tags: string[]): void {
  for (const tag of tags) {
    const keys = tagIndex.get(tag)
    if (!keys) continue
    for (const key of keys) {
      jsonCache.delete(key)
    }
    tagIndex.delete(tag)
  }
}

/**
 * Record a string value and invalidate tags if it changes.
 * Useful for "balance changed => invalidate tx history" policies.
 */
export function observeValueAndInvalidate(options: {
  key: string
  value: string
  invalidateTags: string[]
}): void {
  const previous = observedValues.get(options.key)
  observedValues.set(options.key, options.value)

  if (previous !== undefined && previous !== options.value) {
    invalidateTags(options.invalidateTags)
  }
}

export async function fetchJson<T>(url: string, init?: RequestInit, options?: FetchJsonOptions): Promise<T> {
  const ttlMs = options?.ttlMs ?? 0
  const cacheKey = options?.cacheKey ?? buildDefaultKey(url, init)

  if (ttlMs > 0) {
    const cached = jsonCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T
    }
  }

  const inflight = inFlight.get(cacheKey)
  if (inflight) {
    return (await inflight) as T
  }

  const task = (async () => {
    const response = await fetch(url, init)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return (await response.json()) as unknown
  })()

  inFlight.set(cacheKey, task)

  try {
    const value = await task
    if (ttlMs > 0) {
      jsonCache.set(cacheKey, { value, expiresAt: Date.now() + ttlMs })
      if (options?.tags?.length) {
        addTags(cacheKey, options.tags)
      }
    }
    return value as T
  } finally {
    inFlight.delete(cacheKey)
  }
}

export function resetFetchJsonForTests(): void {
  inFlight.clear()
  jsonCache.clear()
  tagIndex.clear()
  observedValues.clear()
}
