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

// ==================== Plugin Types ====================

/** 插件上下文 - 规则定义时传入 */
export interface PluginContext<S extends AnyZodSchema = AnyZodSchema> {
  /** KeyFetch 实例 */
  kf: KeyFetchInstance<S>
  /** 缓存存储 */
  cache: CacheStore
  /** 全局注册表 */
  registry: KeyFetchRegistry
  /** 通知所有订阅者 */
  notifySubscribers: (data: InferOutput<S>) => void
}

/** 请求上下文 */
export interface RequestContext<S extends AnyZodSchema = AnyZodSchema> {
  /** 完整 URL */
  url: string
  /** 请求参数 */
  params: Record<string, unknown>
  /** fetch init */
  init?: RequestInit
  /** 缓存存储 */
  cache: CacheStore
  /** KeyFetch 实例 */
  kf: KeyFetchInstance<S>
}

/** 响应上下文 */
export interface ResponseContext<S extends AnyZodSchema = AnyZodSchema> {
  /** 完整 URL */
  url: string
  /** 已验证的数据 */
  data: InferOutput<S>
  /** 原始 Response */
  response: Response
  /** 缓存存储 */
  cache: CacheStore
  /** KeyFetch 实例 */
  kf: KeyFetchInstance<S>
}

/** 订阅上下文 */
export interface SubscribeContext<S extends AnyZodSchema = AnyZodSchema> {
  /** 完整 URL */
  url: string
  /** 请求参数 */
  params: Record<string, unknown>
  /** 缓存存储 */
  cache: CacheStore
  /** KeyFetch 实例 */
  kf: KeyFetchInstance<S>
  /** 通知订阅者 */
  notify: (data: InferOutput<S>) => void
}

/** 缓存插件接口 */
export interface CachePlugin<S extends AnyZodSchema = AnyZodSchema> {
  /** 插件名称 */
  name: string
  
  /** 
   * 初始化：KeyFetch 创建时调用
   * 返回清理函数（可选）
   */
  setup?(ctx: PluginContext<S>): (() => void) | void
  
  /**
   * 请求前：决定是否使用缓存
   * 返回 cached data 或 undefined（继续请求）
   */
  onRequest?(ctx: RequestContext<S>): Promise<InferOutput<S> | undefined> | InferOutput<S> | undefined
  
  /**
   * 响应后：处理缓存存储
   */
  onResponse?(ctx: ResponseContext<S>): Promise<void> | void
  
  /**
   * 订阅时：启动数据源（如轮询）
   * 返回清理函数
   */
  onSubscribe?(ctx: SubscribeContext<S>): () => void
}

// ==================== KeyFetch Instance Types ====================

/** KeyFetch 定义选项 */
export interface KeyFetchDefineOptions<S extends AnyZodSchema> {
  /** 唯一名称 */
  name: string
  /** Zod Schema（必选） */
  schema: S
  /** 基础 URL 模板，支持 :param 占位符 */
  url?: string
  /** HTTP 方法 */
  method?: 'GET' | 'POST'
  /** 插件列表 */
  use?: CachePlugin<S>[]
}

/** 请求参数 */
export interface FetchParams {
  [key: string]: string | number | boolean | undefined
}

/** 订阅回调 */
export type SubscribeCallback<T> = (data: T, event: 'initial' | 'update') => void

/** KeyFetch 实例 - 工厂函数返回的对象 */
export interface KeyFetchInstance<S extends AnyZodSchema> {
  /** 实例名称 */
  readonly name: string
  /** Schema */
  readonly schema: S
  /** 输出类型（用于类型推断） */
  readonly _output: InferOutput<S>
  
  /**
   * 执行请求
   * @param params URL 参数
   * @param options 额外选项
   */
  fetch(params?: FetchParams, options?: { skipCache?: boolean }): Promise<InferOutput<S>>
  
  /**
   * 订阅数据变化
   * @param params URL 参数
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  subscribe(
    params: FetchParams | undefined,
    callback: SubscribeCallback<InferOutput<S>>
  ): () => void
  
  /**
   * 手动失效缓存
   */
  invalidate(): void
  
  /**
   * 获取当前缓存的数据（如果有）
   */
  getCached(params?: FetchParams): InferOutput<S> | undefined
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
