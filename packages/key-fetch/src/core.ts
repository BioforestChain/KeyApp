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
  FetchPlugin,
  MiddlewareContext,
  SubscribeContext,
} from './types'
import { globalCache, globalRegistry } from './registry'
import superjson from 'superjson'

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
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]: [string, string | number | boolean | undefined]) => `${k}=${v}`)
    .join('&')
  return sortedParams ? `${name}?${sortedParams}` : name
}

/** KeyFetch 实例实现 */
class KeyFetchInstanceImpl<
  S extends AnyZodSchema,
  P extends AnyZodSchema = AnyZodSchema
> implements KeyFetchInstance<S, P> {
  readonly name: string
  readonly schema: S
  readonly paramsSchema: P | undefined
  readonly _output!: InferOutput<S>
  readonly _params!: InferOutput<P>

  private urlTemplate: string
  private method: 'GET' | 'POST'
  private plugins: FetchPlugin[]
  private subscribers = new Map<string, Set<SubscribeCallback<InferOutput<S>>>>()
  private subscriptionCleanups = new Map<string, (() => void)[]>()
  private inFlight = new Map<string, Promise<InferOutput<S>>>()

  constructor(options: KeyFetchDefineOptions<S, P>) {
    this.name = options.name
    this.schema = options.schema
    this.paramsSchema = options.paramsSchema
    this.urlTemplate = options.url ?? ''
    this.method = options.method ?? 'GET'
    this.plugins = options.use ?? []

    // 注册到全局
    globalRegistry.register(this as unknown as KeyFetchInstance<AnyZodSchema>)
  }

  async fetch(params: InferOutput<P>, options?: { skipCache?: boolean }): Promise<InferOutput<S>> {
    const cacheKey = buildCacheKey(this.name, params as FetchParams)

    // 检查进行中的请求（去重）
    const pending = this.inFlight.get(cacheKey)
    if (pending) {
      return pending
    }

    // 发起请求（通过中间件链）
    const task = this.doFetch((params ?? {}) as FetchParams, options)
    this.inFlight.set(cacheKey, task)

    try {
      return await task
    } finally {
      this.inFlight.delete(cacheKey)
    }
  }

  private async doFetch(params: FetchParams, options?: { skipCache?: boolean }): Promise<InferOutput<S>> {
    // 创建基础 Request（只有 URL 模板，不做任何修改）
    const baseRequest = new Request(this.urlTemplate, {
      method: this.method,
      headers: { 'Content-Type': 'application/json' },
    })

    // 中间件上下文（包含 superjson 工具）
    const middlewareContext: MiddlewareContext = {
      name: this.name,
      params,
      skipCache: options?.skipCache ?? false,
      // 直接暴露 superjson 库
      superjson,
      // 创建带 X-Superjson 头的 Response
      createResponse: <T>(data: T, init?: ResponseInit) => {
        return new Response(superjson.stringify(data), {
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
        return new Request(url ?? baseRequest.url, {
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
      body: async <T>(input: Request | Response): Promise<T> => {
        const text = await input.text()
        // 防护性检查：某些 mock 的 Response 可能没有 headers
        const isSuperjson = input.headers?.get?.('X-Superjson') === 'true'
        if (isSuperjson) {
          return superjson.parse(text) as T
        }
        return JSON.parse(text) as T
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
      throw new Error(
        `[${this.name}] HTTP ${response.status}: ${response.statusText}` +
        (errorText ? `\n响应内容: ${errorText.slice(0, 200)}` : '')
      )
    }

    // 使用统一的 body 函数解析中间件链返回的响应
    // 这样 unwrap 等插件修改的响应内容能被正确处理
    const json = await middlewareContext.body<unknown>(response)

    // Schema 验证（核心！）
    try {
      const result = this.schema.parse(json) as InferOutput<S>

      // 通知 registry 更新
      globalRegistry.emitUpdate(this.name)

      return result
    } catch (err) {
      // 包装 ZodError 为更可读的错误
      if (err && typeof err === 'object' && 'issues' in err) {
        const zodErr = err as { issues: Array<{ path: (string | number)[]; message: string }> }
        const issuesSummary = zodErr.issues
          .slice(0, 3)
          .map(i => `  - ${i.path.join('.')}: ${i.message}`)
          .join('\n')
        throw new Error(
          `[${this.name}] Schema 验证失败:\n${issuesSummary}` +
          (zodErr.issues.length > 3 ? `\n  ... 还有 ${zodErr.issues.length - 3} 个错误` : '') +
          `\n\n原始数据预览: ${JSON.stringify(json).slice(0, 300)}...`
        )
      }
      throw err
    }
  }

  subscribe(
    params: InferOutput<P>,
    callback: SubscribeCallback<InferOutput<S>>
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

      const subscribeCtx: SubscribeContext = {
        name: this.name,
        url,
        params: params ?? {},
        refetch: async () => {
          const data = await this.fetch(params, { skipCache: true })
          this.notify(cacheKey, data)
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

  getCached(params?: InferOutput<P>): InferOutput<S> | undefined {
    const cacheKey = buildCacheKey(this.name, params as FetchParams)
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

  /**
   * React Hook - 由 react.ts 模块注入实现
   * 如果直接调用而没有导入 react 模块，会抛出错误
   */
  useState(
    _params?: InferOutput<P>,
    _options?: { enabled?: boolean }
  ): { data: InferOutput<S> | undefined; isLoading: boolean; isFetching: boolean; error: Error | undefined; refetch: () => Promise<void> } {
    throw new Error(
      `[key-fetch] useState() requires React. Import from '@biochain/key-fetch' to enable React support.`
    )
  }
}

// ==================== React 注入机制 ====================

/** 存储 useState 实现（由 react.ts 注入） */
let useStateImpl: (<S extends AnyZodSchema>(
  kf: KeyFetchInstance<S>,
  params?: FetchParams,
  options?: { enabled?: boolean }
) => { data: InferOutput<S> | undefined; isLoading: boolean; isFetching: boolean; error: Error | undefined; refetch: () => Promise<void> }) | null = null

/**
 * 注入 React useState 实现
 * @internal
 */
export function injectUseState(impl: typeof useStateImpl): void {
  useStateImpl = impl
    // 使用 unknown 绕过类型检查，因为注入是内部实现细节
    ; (KeyFetchInstanceImpl.prototype as unknown as Record<string, unknown>).useState = function (
      this: KeyFetchInstance<AnyZodSchema>,
      params?: FetchParams,
      options?: { enabled?: boolean }
    ) {
      if (!useStateImpl) {
        throw new Error('[key-fetch] useState implementation not injected')
      }
      return useStateImpl(this, params, options)
    }
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
export function create<S extends AnyZodSchema, P extends AnyZodSchema = AnyZodSchema>(
  options: KeyFetchDefineOptions<S, P>
): KeyFetchInstance<S, P> {
  return new KeyFetchInstanceImpl(options) as unknown as KeyFetchInstance<S, P>
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
