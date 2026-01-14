/**
 * Key-Fetch Types
 * 
 * Schema-first 插件化响应式 Fetch 类型定义
 */

import type { z } from 'zod'

// ==================== Schema Types ====================

/** 任意 Zod Schema */
export type AnyZodSchema = z.ZodType<unknown>

/** 从 Schema 推断输出类型 */
export type InferOutput<S extends AnyZodSchema> = z.infer<S>

// ==================== Cache Types ====================

/** 缓存条目 */
export interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  etag?: string
}

/** 缓存存储接口 */
export interface CacheStore {
  get<T>(key: string): CacheEntry<T> | undefined
  set<T>(key: string, entry: CacheEntry<T>): void
  delete(key: string): boolean
  has(key: string): boolean
  clear(): void
  keys(): IterableIterator<string>
}

// ==================== Plugin Types (Middleware Pattern) ====================

/**
 * 中间件函数类型
 * 
 * 插件核心：接收 Request，调用 next() 获取 Response，可以修改两者
 * 
 * @example
 * ```ts
 * const myMiddleware: FetchMiddleware<{ address: string }> = async (request, next, context) => {
 *   // context.params.address 是强类型
 *   const url = new URL(request.url)
 *   url.searchParams.set('address', context.params.address)
 *   const modifiedRequest = new Request(url.toString(), request)
 *   return next(modifiedRequest)
 * }
 * ```
 */
export type FetchMiddleware<P extends FetchParams = FetchParams> = (
  request: Request,
  next: (request: Request) => Promise<Response>,
  context: MiddlewareContext<P>
) => Promise<Response>

/** 中间件上下文 - 提供额外信息和工具 */
export interface MiddlewareContext<P extends FetchParams = FetchParams> {
  /** KeyFetch 实例名称 */
  name: string
  /** 原始请求参数（强类型） */
  params: P
  /** 是否跳过缓存 */
  skipCache: boolean

  // ==================== SuperJSON 工具 (核心标准) ====================

  /** SuperJSON 库实例（支持 BigInt、Date 等特殊类型的序列化） */
  superjson: typeof import('superjson').default
  /** 创建包含序列化数据的 Response 对象（自动添加 X-Superjson: true 头） */
  createResponse: <T>(data: T, init?: ResponseInit) => Response
  /** 解析 Request/Response body（根据 X-Superjson 头自动选择 superjson.parse 或 JSON.parse） */
  body: <T>(input: Request | Response) => Promise<T>
}

/**
 * 插件接口
 * 
 * 使用 onFetch 中间件处理请求/响应
 */
export interface FetchPlugin<P extends FetchParams = FetchParams> {
  /** 插件名称（用于调试和错误追踪） */
  name: string

  /**
   * 中间件函数
   * 
   * 接收 Request 和 next 函数，返回 Response
   * - 可以修改 request 后传给 next()
   * - 可以修改 next() 返回的 response
   * - 可以不调用 next() 直接返回缓存的 response
   */
  onFetch: FetchMiddleware<P>

  /**
   * 订阅时调用（可选）
   * 用于启动轮询等后台任务
   * @returns 清理函数
   */
  onSubscribe?: (context: SubscribeContext<P>) => (() => void) | void
}

/** 订阅上下文 */
export interface SubscribeContext<P extends FetchParams = FetchParams> {
  /** KeyFetch 实例名称 */
  name: string
  /** 请求参数（强类型） */
  params: P
  /** 完整 URL */
  url: string
  /** 触发数据更新 */
  refetch: () => Promise<void>
}

// 向后兼容别名
/** @deprecated 使用 FetchPlugin 代替 */
export type CachePlugin<_S extends AnyZodSchema = AnyZodSchema> = FetchPlugin

// ==================== KeyFetch Instance Types ====================

/** 请求参数基础类型 */
export interface FetchParams {
  [key: string]: string | number | boolean | undefined
}

/** KeyFetch 定义选项 */
export interface KeyFetchDefineOptions<
  S extends AnyZodSchema,
  P extends AnyZodSchema = AnyZodSchema
> {
  /** 唯一名称 */
  name: string
  /** 输出 Zod Schema（必选） */
  schema: S
  /** 参数 Zod Schema（可选，用于类型推断和运行时验证） */
  paramsSchema?: P
  /** 基础 URL 模板，支持 :param 占位符 */
  url?: string
  /** HTTP 方法 */
  method?: 'GET' | 'POST'
  /** 插件列表 */
  use?: FetchPlugin[]
}

/** 订阅回调 */
export type SubscribeCallback<T> = (data: T, event: 'initial' | 'update') => void

/** KeyFetch 实例 - 工厂函数返回的对象 */
export interface KeyFetchInstance<
  S extends AnyZodSchema,
  P extends AnyZodSchema = AnyZodSchema
> {
  /** 实例名称 */
  readonly name: string
  /** 输出 Schema */
  readonly schema: S
  /** 参数 Schema */
  readonly paramsSchema: P | undefined
  /** 输出类型（用于类型推断） */
  readonly _output: InferOutput<S>
  /** 参数类型（用于类型推断） */
  readonly _params: InferOutput<P>

  /**
   * 执行请求
   * @param params 请求参数（强类型）
   * @param options 额外选项
   */
  fetch(params: InferOutput<P>, options?: { skipCache?: boolean }): Promise<InferOutput<S>>

  /**
   * 订阅数据变化
   * @param params 请求参数（强类型）
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  subscribe(
    params: InferOutput<P>,
    callback: SubscribeCallback<InferOutput<S>>
  ): () => void

  /**
   * 手动失效缓存
   */
  invalidate(): void

  /**
   * 获取当前缓存的数据（如果有）
   */
  getCached(params?: InferOutput<P>): InferOutput<S> | undefined

  /**
   * React Hook - 响应式数据绑定
   * 
   * @example
   * ```tsx
   * const { data, isLoading, error } = balanceFetcher.useState({ address })
   * if (isLoading) return <Loading />
   * if (error) return <Error error={error} />
   * return <Balance amount={data.amount} />
   * ```
   */
  useState(
    params: InferOutput<P>,
    options?: UseKeyFetchOptions
  ): UseKeyFetchResult<InferOutput<S>>
}

// ==================== Registry Types ====================

/** 全局注册表 */
export interface KeyFetchRegistry {
  /** 注册 KeyFetch 实例 */
  register<S extends AnyZodSchema>(kf: KeyFetchInstance<S>): void
  /** 获取实例 */
  get<S extends AnyZodSchema>(name: string): KeyFetchInstance<S> | undefined
  /** 按名称失效 */
  invalidate(name: string): void
  /** 监听实例更新 */
  onUpdate(name: string, callback: () => void): () => void
  /** 触发更新通知 */
  emitUpdate(name: string): void
  /** 添加依赖关系 */
  addDependency(dependent: string, dependency: string): void
  /** 清理所有 */
  clear(): void
}

// ==================== React Types ====================

/** useKeyFetch 返回值 */
export interface UseKeyFetchResult<T> {
  /** 数据 */
  data: T | undefined
  /** 是否正在加载（首次） */
  isLoading: boolean
  /** 是否正在获取（包括后台刷新） */
  isFetching: boolean
  /** 错误信息 */
  error: Error | undefined
  /** 手动刷新 */
  refetch: () => Promise<void>
}

/** useKeyFetch 选项 */
export interface UseKeyFetchOptions {
  /** 是否启用（默认 true） */
  enabled?: boolean
}
