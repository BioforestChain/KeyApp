/**
 * Key-Fetch Core
 * 
 * Schema-first 工厂模式实现
 */

import type {
  AnyZodSchema,
  InferOutput,
  KeyFetchDefineOptions,
  KeyFetchInstance,
  FetchParams,
  SubscribeCallback,
  CachePlugin,
  PluginContext,
  RequestContext,
  ResponseContext,
  SubscribeContext,
} from './types'
import { globalCache, globalRegistry } from './registry'

/** 构建 URL，替换 :param 占位符 */
function buildUrl(template: string, params: FetchParams = {}): string {
  let url = template
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url = url.replace(`:${key}`, encodeURIComponent(String(value)))
    }
  }
  return url
}

/** 构建缓存 key */
function buildCacheKey(name: string, params: FetchParams = {}): string {
  const sortedParams = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  return sortedParams ? `${name}?${sortedParams}` : name
}

/** KeyFetch 实例实现 */
class KeyFetchInstanceImpl<S extends AnyZodSchema> implements KeyFetchInstance<S> {
  readonly name: string
  readonly schema: S
  readonly _output!: InferOutput<S>
  
  private urlTemplate: string
  private method: 'GET' | 'POST'
  private plugins: CachePlugin<S>[]
  private subscribers = new Map<string, Set<SubscribeCallback<InferOutput<S>>>>()
  private subscriptionCleanups = new Map<string, (() => void)[]>()
  private inFlight = new Map<string, Promise<InferOutput<S>>>()

  constructor(options: KeyFetchDefineOptions<S>) {
    this.name = options.name
    this.schema = options.schema
    this.urlTemplate = options.url ?? ''
    this.method = options.method ?? 'GET'
    this.plugins = options.use ?? []

    // 注册到全局
    globalRegistry.register(this)

    // 初始化插件
    const pluginCtx: PluginContext<S> = {
      kf: this,
      cache: globalCache,
      registry: globalRegistry,
      notifySubscribers: (data) => this.notifyAll(data),
    }

    for (const plugin of this.plugins) {
      if (plugin.setup) {
        plugin.setup(pluginCtx)
      }
    }
  }

  async fetch(params?: FetchParams, options?: { skipCache?: boolean }): Promise<InferOutput<S>> {
    const cacheKey = buildCacheKey(this.name, params)
    const url = buildUrl(this.urlTemplate, params)

    // 检查进行中的请求（去重）
    const pending = this.inFlight.get(cacheKey)
    if (pending) {
      return pending
    }

    // 检查插件缓存
    if (!options?.skipCache) {
      const requestCtx: RequestContext<S> = {
        url,
        params: params ?? {},
        cache: globalCache,
        kf: this,
      }

      for (const plugin of this.plugins) {
        if (plugin.onRequest) {
          const cached = await plugin.onRequest(requestCtx)
          if (cached !== undefined) {
            return cached
          }
        }
      }
    }

    // 发起请求
    const task = this.doFetch(url, params)
    this.inFlight.set(cacheKey, task)

    try {
      return await task
    } finally {
      this.inFlight.delete(cacheKey)
    }
  }

  private async doFetch(url: string, params?: FetchParams): Promise<InferOutput<S>> {
    const init: RequestInit = {
      method: this.method,
      headers: { 'Content-Type': 'application/json' },
    }

    if (this.method === 'POST' && params) {
      init.body = JSON.stringify(params)
    }

    const response = await fetch(url, init)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const json = await response.json()

    // Schema 验证（核心！）
    const result = this.schema.parse(json) as InferOutput<S>

    // 执行 onResponse 插件
    const responseCtx: ResponseContext<S> = {
      url,
      data: result,
      response,
      cache: globalCache,
      kf: this,
    }

    for (const plugin of this.plugins) {
      if (plugin.onResponse) {
        await plugin.onResponse(responseCtx)
      }
    }

    // 通知 registry 更新
    globalRegistry.emitUpdate(this.name)

    return result
  }

  subscribe(
    params: FetchParams | undefined,
    callback: SubscribeCallback<InferOutput<S>>
  ): () => void {
    const cacheKey = buildCacheKey(this.name, params)
    const url = buildUrl(this.urlTemplate, params)

    // 添加订阅者
    let subs = this.subscribers.get(cacheKey)
    if (!subs) {
      subs = new Set()
      this.subscribers.set(cacheKey, subs)
    }
    subs.add(callback)

    // 首次订阅该 key，初始化插件
    if (subs.size === 1) {
      const cleanups: (() => void)[] = []

      const subscribeCtx: SubscribeContext<S> = {
        url,
        params: params ?? {},
        cache: globalCache,
        kf: this,
        notify: (data) => this.notify(cacheKey, data),
      }

      for (const plugin of this.plugins) {
        if (plugin.onSubscribe) {
          const cleanup = plugin.onSubscribe(subscribeCtx)
          cleanups.push(cleanup)
        }
      }

      this.subscriptionCleanups.set(cacheKey, cleanups)

      // 监听 registry 更新
      const unsubRegistry = globalRegistry.onUpdate(this.name, async () => {
        try {
          const data = await this.fetch(params, { skipCache: true })
          this.notify(cacheKey, data)
        } catch (error) {
          console.error(`[key-fetch] Error refetching ${this.name}:`, error)
        }
      })
      cleanups.push(unsubRegistry)
    }

    // 立即获取一次
    this.fetch(params)
      .then(data => {
        callback(data, 'initial')
      })
      .catch(error => {
        console.error(`[key-fetch] Error fetching ${this.name}:`, error)
      })

    // 返回取消订阅函数
    return () => {
      subs?.delete(callback)
      
      // 最后一个订阅者，清理资源
      if (subs?.size === 0) {
        this.subscribers.delete(cacheKey)
        const cleanups = this.subscriptionCleanups.get(cacheKey)
        if (cleanups) {
          cleanups.forEach(fn => fn())
          this.subscriptionCleanups.delete(cacheKey)
        }
      }
    }
  }

  invalidate(): void {
    // 清理所有相关缓存
    for (const key of globalCache.keys()) {
      if (key.startsWith(this.name)) {
        globalCache.delete(key)
      }
    }
  }

  getCached(params?: FetchParams): InferOutput<S> | undefined {
    const cacheKey = buildCacheKey(this.name, params)
    const entry = globalCache.get<InferOutput<S>>(cacheKey)
    return entry?.data
  }

  /** 通知特定 key 的订阅者 */
  private notify(cacheKey: string, data: InferOutput<S>): void {
    const subs = this.subscribers.get(cacheKey)
    if (subs) {
      subs.forEach(cb => cb(data, 'update'))
    }
  }

  /** 通知所有订阅者 */
  private notifyAll(data: InferOutput<S>): void {
    for (const subs of this.subscribers.values()) {
      subs.forEach(cb => cb(data, 'update'))
    }
  }
}

/**
 * 创建 KeyFetch 实例
 * 
 * @example
 * ```ts
 * import { z } from 'zod'
 * import { keyFetch, interval, deps } from '@biochain/key-fetch'
 * 
 * // 定义 Schema
 * const LastBlockSchema = z.object({
 *   success: z.boolean(),
 *   result: z.object({
 *     height: z.number(),
 *     timestamp: z.number(),
 *   }),
 * })
 * 
 * // 创建 KeyFetch 实例
 * const lastBlockFetch = keyFetch.create({
 *   name: 'bfmeta.lastblock',
 *   schema: LastBlockSchema,
 *   url: 'https://api.bfmeta.info/wallet/:chainId/lastblock',
 *   use: [interval(15_000)],
 * })
 * 
 * // 使用
 * const data = await lastBlockFetch.fetch({ chainId: 'bfmeta' })
 * // data 类型自动推断，且已通过 Schema 验证
 * ```
 */
export function create<S extends AnyZodSchema>(
  options: KeyFetchDefineOptions<S>
): KeyFetchInstance<S> {
  return new KeyFetchInstanceImpl(options)
}

/** 获取已注册的实例 */
export function get<S extends AnyZodSchema>(name: string): KeyFetchInstance<S> | undefined {
  return globalRegistry.get<S>(name)
}

/** 按名称失效 */
export function invalidate(name: string): void {
  globalRegistry.invalidate(name)
}

/** 清理所有（用于测试） */
export function clear(): void {
  globalRegistry.clear()
  globalCache.clear()
}
