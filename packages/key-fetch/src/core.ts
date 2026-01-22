/**
 * Key-Fetch Core
 * 
 * Schema-first 工厂模式实现
 */

import type {
  ZodUnknowSchema,
  KeyFetchDefineOptions,
  KeyFetchInstance,
  FetchParams,
  SubscribeCallback,
  FetchPlugin,
  MiddlewareContext,
  SubscribeContext,
  KeyFetchOutput,
  KeyFetchInput,
} from './types'
import { globalCache, globalRegistry } from './registry'
import type z from 'zod'
import { SuperJSON } from 'superjson'
export const superjson = new SuperJSON({ dedupe: true })

/** 构建 URL，替换 :param 占位符 */
function buildUrl(template: string, params: FetchParams = {}): string {
  let url = template
  if (typeof params === 'object' && params !== null) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url = url.replace(`:${key}`, encodeURIComponent(String(value)))
      }
    }
  }
  return url
}

/** 构建缓存 key */
function buildCacheKey(name: string, params: FetchParams = {}): string {
  // eslint-disable-next-line unicorn/no-array-sort -- toSorted not available in ES2021 target
  const sortedParams = typeof params === 'object' && params !== null ? [...Object.entries(params)]
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]: [string, string | number | boolean | undefined]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&') : `#${JSON.stringify(params)}`
  return sortedParams ? `${name}?${sortedParams}` : name
}

/** KeyFetch 实例实现 */
class KeyFetchInstanceImpl<
  TOUT,
  TIN = unknown
> implements KeyFetchInstance<TOUT, TIN> {
  readonly name: string
  readonly outputSchema: z.ZodType<TOUT>
  readonly inputSchema: z.ZodType<TIN> | undefined
  readonly _output!: TOUT
  readonly _params!: TIN

  private urlTemplate: string
  private method: 'GET' | 'POST'
  private plugins: FetchPlugin<TIN>[]
  private subscribers = new Map<string, Set<SubscribeCallback<TOUT>>>()
  private subscriptionCleanups = new Map<string, (() => void)[]>()
  private inFlight = new Map<string, Promise<TOUT>>()
  
  // Auto dedupe: time-based deduplication
  private lastFetchTime = new Map<string, number>()
  private lastResult = new Map<string, TOUT>()

  constructor(options: KeyFetchDefineOptions<TOUT, TIN>) {
    this.name = options.name
    this.outputSchema = options.outputSchema
    this.inputSchema = options.inputSchema
    this.urlTemplate = options.url ?? ''
    this.method = options.method ?? 'GET'
    this.plugins = options.use ?? []

    // 注册到全局
    globalRegistry.register(this as unknown as KeyFetchInstance<ZodUnknowSchema>)
  }

  async fetch(params: TIN, options?: { skipCache?: boolean }): Promise<TOUT> {
    const cacheKey = buildCacheKey(this.name, params)

    // 检查进行中的请求（基础去重）
    const pending = this.inFlight.get(cacheKey)
    if (pending) {
      return pending
    }

    // Auto dedupe: 基于插件计算去重间隔
    const dedupeInterval = this.calculateDedupeInterval()
    if (dedupeInterval > 0) {
      const lastTime = this.lastFetchTime.get(cacheKey)
      const lastData = this.lastResult.get(cacheKey)
      if (lastTime && lastData !== undefined) {
        const elapsed = Date.now() - lastTime
        if (elapsed < dedupeInterval) {
          return lastData
        }
      }
    }

    // 发起请求（通过中间件链）
    const task = this.doFetch(params, options)
    this.inFlight.set(cacheKey, task)

    try {
      const result = await task
      // Auto dedupe: 记录成功请求的时间和结果
      if (dedupeInterval > 0) {
        this.lastFetchTime.set(cacheKey, Date.now())
        this.lastResult.set(cacheKey, result)
      }
      return result
    } finally {
      this.inFlight.delete(cacheKey)
    }
  }

  /** 基于插件计算自动去重间隔 */
  private calculateDedupeInterval(): number {
    let intervalMs: number | undefined

    for (const plugin of this.plugins) {
      // 检查 interval 插件
      if ('_intervalMs' in plugin) {
        const ms = plugin._intervalMs as number | (() => number)
        const value = typeof ms === 'function' ? ms() : ms
        intervalMs = intervalMs !== undefined ? Math.min(intervalMs, value) : value
      }
      
      // 检查 deps 插件 - 取依赖源的最小间隔
      if ('_sources' in plugin) {
        const sources = plugin._sources as KeyFetchInstance[]
        for (const source of sources) {
          // 递归获取依赖的间隔（通过检查其插件）
          const sourceImpl = source as unknown as KeyFetchInstanceImpl<unknown, unknown>
          if (sourceImpl.calculateDedupeInterval) {
            const depInterval = sourceImpl.calculateDedupeInterval()
            if (depInterval > 0) {
              intervalMs = intervalMs !== undefined ? Math.min(intervalMs, depInterval) : depInterval
            }
          }
        }
      }
    }

    // 返回间隔的一半作为去重窗口（确保在下次轮询前不重复请求）
    return intervalMs !== undefined ? Math.floor(intervalMs / 2) : 0
  }

  private async doFetch(params: TIN, options?: { skipCache?: boolean }): Promise<TOUT> {
    // 创建基础 Request（只有 URL 模板，不做任何修改）
    const baseRequest = new Request(this.urlTemplate, {
      method: this.method,
      headers: { 'Content-Type': 'application/json' },
    })

    // 中间件上下文（包含 superjson 工具）
    const middlewareContext: MiddlewareContext<TIN> = {
      name: this.name,
      params,
      skipCache: options?.skipCache ?? false,
      // 直接暴露 superjson 库
      superjson,
      // 创建带 X-Superjson 头的 Response
      createResponse: <T>(data: T, init?: ResponseInit) => {
        return data instanceof Response ? data : new Response(superjson.stringify(data), {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            'X-Superjson': 'true',
            ...init?.headers,
          },
        })
      },
      // 创建带 X-Superjson 头的 Request
      createRequest: <T>(data: T, url?: string, init?: RequestInit) => {
        return data instanceof Request ? data : new Request(url ?? baseRequest.url, {
          ...init,
          method: init?.method ?? 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Superjson': 'true',
            ...init?.headers,
          },
          body: superjson.stringify(data),
        })
      },
      // 根据 X-Superjson 头自动选择解析方式
      body: async <T>(input: Request | Response,): Promise<T> => {
        const text = await input.text()
        // 防护性检查：某些 mock 的 Response 可能没有 headers
        const isSuperjson = input.headers?.get?.('X-Superjson') === 'true'
        return middlewareContext.parseBody<T>(text, isSuperjson)
      },
      parseBody: <T>(input: string, isSuperjson?: boolean): T => {
        if (isSuperjson) {
          return superjson.parse(input) as T
        }
        return JSON.parse(input) as T
      },
    }

    // 构建中间件链
    // 最内层是实际的 fetch
    const baseFetch = async (request: Request): Promise<Response> => {
      return fetch(request)
    }

    // 从后往前包装中间件
    let next = baseFetch
    for (let i = this.plugins.length - 1; i >= 0; i--) {
      const plugin = this.plugins[i]
      if (plugin.onFetch) {
        const currentNext = next
        const pluginFn = plugin.onFetch
        next = async (request: Request) => {
          return pluginFn(request, currentNext, middlewareContext)
        }
      }
    }

    // 执行中间件链
    const response = await next(baseRequest)

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      const error = new Error(
        `[${this.name}] HTTP ${response.status}: ${response.statusText}` +
        (errorText ? `\n响应内容: ${errorText.slice(0, 200)}` : '')
      )

      // 让插件有机会处理错误（如 throttleError 节流）
      for (const plugin of this.plugins) {
        if (plugin.onError?.(error, response, middlewareContext)) {
          ;(error as Error & { __errorHandled?: boolean }).__errorHandled = true
          break
        }
      }

      throw error
    }

    // 使用统一的 body 函数解析中间件链返回的响应
    // 这样 unwrap 等插件修改的响应内容能被正确处理
    const rawJson = await response.text()
    const isSuperjson = response.headers.get('X-Superjson') === 'true'
    const json = await middlewareContext.parseBody<unknown>(rawJson, isSuperjson)

    // Schema 验证（核心！）
    try {
      const result = this.outputSchema.parse(json) as TOUT

      // 通知 registry 更新
      globalRegistry.emitUpdate(this.name)

      return result
    } catch (err) {
      // 包装 ZodError 为更可读的错误
      let schemaError: Error
      if (err && typeof err === 'object' && 'issues' in err) {
        const zodErr = err as { issues: Array<{ path: (string | number)[]; message: string }> }
        const errorMessage = `[${this.name}] Schema 验证失败:\n${zodErr.issues
          .slice(0, 3)
          .map(i => `  - ${i.path.join('.')}: ${i.message}`)
          .join('\n')}` +
          (zodErr.issues.length > 3 ? `\n  ... 还有 ${zodErr.issues.length - 3} 个错误` : '') +
          `\n\nResponseJson: ${rawJson.slice(0, 300)}...` +
          `\nResponseHeaders: ${[...response.headers.entries()].map(item => item.join("=")).join("; ")}`
        schemaError = new Error(errorMessage)
      } else {
        schemaError = err instanceof Error ? err : new Error(String(err))
      }

      // 让插件有机会处理错误日志（如 throttleError 节流）
      let errorHandled = false
      for (const plugin of this.plugins) {
        if (plugin.onError?.(schemaError, response, middlewareContext)) {
          errorHandled = true
          ;(schemaError as Error & { __errorHandled?: boolean }).__errorHandled = true
          break
        }
      }

      // 未被插件处理时，输出完整日志便于调试
      if (!errorHandled) {
        console.error(this.name, err)
        console.error(json, this.outputSchema)
      }

      // 始终抛出错误（不吞掉）
      throw schemaError
    }
  }

  subscribe(
    params: TIN,
    callback: SubscribeCallback<TOUT>
  ): () => void {
    const cacheKey = buildCacheKey(this.name, params as FetchParams)
    const url = buildUrl(this.urlTemplate, params as FetchParams)

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

      const subscribeCtx: SubscribeContext<TIN> = {
        name: this.name,
        url,
        params: params,
        refetch: async () => {
          try {
            const data = await this.fetch(params, { skipCache: true })
            this.notify(cacheKey, data)
          } catch (error) {
            // 如果插件已处理错误（如 throttleError），静默
            if (!(error as Error & { __errorHandled?: boolean }).__errorHandled) {
              console.error(`[key-fetch] Error in refetch for ${this.name}:`, error)
            }
          }
        },
      }

      for (const plugin of this.plugins) {
        if (plugin.onSubscribe) {
          const cleanup = plugin.onSubscribe(subscribeCtx)
          if (cleanup) {
            cleanups.push(cleanup)
          }
        }
      }

      this.subscriptionCleanups.set(cacheKey, cleanups)

      // 监听 registry 更新
      const unsubRegistry = globalRegistry.onUpdate(this.name, async () => {
        try {
          const data = await this.fetch(params, { skipCache: true })
          this.notify(cacheKey, data)
        } catch (error) {
          // 如果插件已处理错误（如 throttleError），跳过默认日志
          if (!(error as Error & { __errorHandled?: boolean }).__errorHandled) {
            console.error(`[key-fetch] Error refetching ${this.name}:`, error)
          }
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
        // 如果插件已处理错误（如 throttleError），跳过默认日志
        if (!(error as Error & { __errorHandled?: boolean }).__errorHandled) {
          console.error(`[key-fetch] Error fetching ${this.name}:`, error)
        }
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

  getCached(params?: TIN): TOUT | undefined {
    const cacheKey = buildCacheKey(this.name, params as FetchParams)
    const entry = globalCache.get<TOUT>(cacheKey)
    return entry?.data
  }

  /** 通知特定 key 的订阅者 */
  private notify(cacheKey: string, data: TOUT): void {
    const subs = this.subscribers.get(cacheKey)
    if (subs) {
      subs.forEach(cb => cb(data, 'update'))
    }
  }

  /**
   * React Hook - 由 react.ts 模块注入实现
   * 如果直接调用而没有导入 react 模块，会抛出错误
   */
  useState(
    _params?: TIN,
    _options?: { enabled?: boolean }
  ): { data: TOUT | undefined; isLoading: boolean; isFetching: boolean; error: Error | undefined; refetch: () => Promise<void> } {
    throw new Error(
      `[key-fetch] useState() requires React. Import from '@biochain/key-fetch' to enable React support.`
    )
  }

  use(...plugins: FetchPlugin<TIN>[]): KeyFetchInstance<TOUT, TIN> {
    this.plugins.push(...plugins)
    return this
  }
}

// ==================== React 注入机制 ====================

/** 存储 useState 实现（由 react.ts 注入） */
let useStateImpl: (<KF extends KeyFetchInstance>(
  kf: KF,
  params: KeyFetchInput<KF>,
  options?: { enabled?: boolean }
) => { data: KeyFetchOutput<KF> | undefined; isLoading: boolean; isFetching: boolean; error: Error | undefined; refetch: () => Promise<void> }) | null = null

/**
 * 注入 React useState 实现
 * @internal
 */
export function injectUseState(impl: typeof useStateImpl): void {
  useStateImpl = impl
    // 使用 unknown 绕过类型检查，因为注入是内部实现细节
    ; Object.assign(KeyFetchInstanceImpl.prototype, {
      useState(
        this: KeyFetchInstance,
        params?: FetchParams,
        options?: { enabled?: boolean }
      ) {
        if (!useStateImpl) {
          throw new Error('[key-fetch] useState implementation not injected')
        }
        return useStateImpl(this, params, options)
      }
    })
}

/**
 * 获取 useState 实现（供 derive.ts 使用）
 * @internal
 */
export function getUseStateImpl() {
  return useStateImpl
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
export function create<TOUT, TIN extends unknown = unknown>(
  options: KeyFetchDefineOptions<TOUT, TIN>
): KeyFetchInstance<TOUT, TIN> {
  return new KeyFetchInstanceImpl(options)
}

// Builder removed in favor of instance.use() pattern

/** 获取已注册的实例 */
export function get<TOUT extends unknown, TIN extends unknown = unknown>(name: string): KeyFetchInstance<TOUT, TIN> | undefined {
  return globalRegistry.get(name) as unknown as KeyFetchInstance<TOUT, TIN> | undefined
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
