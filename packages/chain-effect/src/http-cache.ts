/**
 * HTTP 缓存层
 * 
 * 使用浏览器 Cache API 实现智能缓存：
 * - 始终先返回缓存值（stale-while-revalidate）
 * - 成功响应才更新缓存
 * - 失败不影响已有缓存
 */

import { Effect, Option } from "effect"

// ==================== 类型定义 ====================

export interface CachedResponse<T> {
  data: T
  timestamp: number
  fromCache: boolean
}

export interface HttpCacheOptions {
  /** 缓存名称 */
  cacheName?: string
  /** 是否强制刷新（忽略缓存发起请求，但成功才更新） */
  forceRefresh?: boolean
}

// ==================== Cache API 封装 ====================

const DEFAULT_CACHE_NAME = "chain-effect-http-cache"

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null
}

function toStableJson(value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString()
  }
  if (!isRecord(value)) {
    if (Array.isArray(value)) {
      return value.map(toStableJson)
    }
    return value
  }
  if (Array.isArray(value)) {
    return value.map(toStableJson)
  }
  const sorted: UnknownRecord = {}
  for (const key of Object.keys(value).sort()) {
    sorted[key] = toStableJson(value[key])
  }
  return sorted
}

function stableStringify(value: unknown): string {
  return JSON.stringify(toStableJson(value))
}

/**
 * 将 POST 请求转换为可缓存的 GET 请求
 * Cache API 只能缓存 GET 请求，所以需要将 body 编码到 URL 中
 */
function makeCacheKey(url: string, body?: unknown): string {
  if (!body) return url
  const bodyHash = btoa(stableStringify(body)).replace(/[+/=]/g, (c) => 
    c === '+' ? '-' : c === '/' ? '_' : ''
  )
  return `${url}?__body=${bodyHash}`
}

function makeFakeGetRequest(cacheKey: string): Request {
  return new Request(cacheKey, { method: "GET" })
}

/**
 * 从缓存获取响应
 */
export const getFromCache = <T>(
  url: string,
  body?: unknown,
  options?: HttpCacheOptions
): Effect.Effect<Option.Option<CachedResponse<T>>> =>
  Effect.tryPromise({
    try: async () => {
      const cacheName = options?.cacheName ?? DEFAULT_CACHE_NAME
      const cache = await caches.open(cacheName)
      const cacheKey = makeCacheKey(url, body)
      const request = makeFakeGetRequest(cacheKey)
      
      const response = await cache.match(request)
      if (!response) return Option.none<CachedResponse<T>>()
      
      const cached = await response.json() as { data: T; timestamp: number }
      return Option.some({
        data: cached.data,
        timestamp: cached.timestamp,
        fromCache: true,
      })
    },
    catch: () => new Error("Cache read failed"),
  }).pipe(
    Effect.catchAll(() => Effect.succeed(Option.none<CachedResponse<T>>()))
  )

/**
 * 将响应存入缓存
 */
export const putToCache = <T>(
  url: string,
  body: unknown | undefined,
  data: T,
  options?: HttpCacheOptions
): Effect.Effect<void> =>
  Effect.tryPromise({
    try: async () => {
      const cacheName = options?.cacheName ?? DEFAULT_CACHE_NAME
      const cache = await caches.open(cacheName)
      const cacheKey = makeCacheKey(url, body)
      const request = makeFakeGetRequest(cacheKey)
      
      const cacheData = {
        data,
        timestamp: Date.now(),
      }
      
      const response = new Response(JSON.stringify(cacheData), {
        headers: {
          "Content-Type": "application/json",
          "X-Cache-Timestamp": String(cacheData.timestamp),
        },
      })
      
      await cache.put(request, response)
    },
    catch: () => new Error("Cache write failed"),
  }).pipe(
    Effect.catchAll(() => Effect.void)
  )

/**
 * 删除缓存条目
 */
export const deleteFromCache = (
  url: string,
  body?: unknown,
  options?: HttpCacheOptions
): Effect.Effect<boolean> =>
  Effect.tryPromise({
    try: async () => {
      const cacheName = options?.cacheName ?? DEFAULT_CACHE_NAME
      const cache = await caches.open(cacheName)
      const cacheKey = makeCacheKey(url, body)
      const request = makeFakeGetRequest(cacheKey)
      
      return cache.delete(request)
    },
    catch: () => new Error("Cache delete failed"),
  }).pipe(
    Effect.catchAll(() => Effect.succeed(false))
  )

/**
 * 清空整个缓存
 */
export const clearCache = (
  options?: HttpCacheOptions
): Effect.Effect<boolean> =>
  Effect.tryPromise({
    try: async () => {
      const cacheName = options?.cacheName ?? DEFAULT_CACHE_NAME
      return caches.delete(cacheName)
    },
    catch: () => new Error("Cache clear failed"),
  }).pipe(
    Effect.catchAll(() => Effect.succeed(false))
  )

/**
 * 生成缓存 key（供外部使用）
 */
export function makeCacheKeyFromRequest(url: string, body?: unknown): string {
  return makeCacheKey(url, body)
}
