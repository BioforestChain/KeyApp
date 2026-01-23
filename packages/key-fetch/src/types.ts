/**
 * Key-Fetch v2 Types
 * 
 * Schema-first 插件化响应式 Fetch 类型定义
 */

import type { z } from 'zod'
import type { SuperJSON } from 'superjson'

// ==================== Core Types ====================

/**
 * Context - 贯穿整个生命周期的核心对象
 * 
 * 严格类型化，无 options: any 模糊字段
 */
export interface Context<TInput, TOutput> {
  /** 当前输入参数（类型安全） */
  readonly input: TInput
  /** 标准 Request 对象（由插件构建/修改） */
  req: Request
  /** SuperJSON 库实例（核心标准） */
  readonly superjson: SuperJSON
  /** 允许插件反向操作实例 */
  readonly self: KeyFetchInstance<TInput, TOutput>
  /** 插件间共享状态 */
  readonly state: Map<string, unknown>
  /** KeyFetch 实例名称 */
  readonly name: string
}

/**
 * Plugin - 完整生命周期控制器
 */
export interface Plugin<TInput = unknown, TOutput = unknown> {
  /** 插件名称（用于调试） */
  name: string

  /**
   * 阶段 1: 实例创建时触发
   * 用于设置全局定时器、全局事件监听等
   * 极少使用，通常用于"没人订阅也要跑"的特殊热流
   * @returns cleanup 函数
   */
  onInit?: (self: KeyFetchInstance<TInput, TOutput>) => void | (() => void)

  /**
   * 阶段 2: 有人订阅时触发
   * 用于实现"热流"、轮询、依赖监听
   * @param ctx 上下文
   * @param emit 发射数据到订阅者
   * @returns cleanup 函数
   */
  onSubscribe?: (
    ctx: Context<TInput, TOutput>,
    emit: (data: TOutput) => void
  ) => void | (() => void)

  /**
   * 阶段 3: 执行 Fetch 时触发（洋葱模型中间件）
   * 负责构建 Request -> 执行(或Mock) -> 处理 Response
   * @param ctx 上下文
   * @param next 调用下一个中间件
   * @returns Response
   */
  onFetch?: (
    ctx: Context<TInput, TOutput>,
    next: () => Promise<Response>
  ) => Promise<Response>

  /**
   * 错误处理钩子（可选）
   * 在 HTTP 错误抛出前调用
   * @returns 返回 true 表示错误已处理
   */
  onError?: (error: Error, response: Response | undefined, ctx: Context<TInput, TOutput>) => boolean
}

// ==================== KeyFetch Instance ====================

/**
 * KeyFetch 定义选项
 */
export interface KeyFetchDefineOptions<TInput, TOutput> {
  /** 唯一名称 */
  name: string
  /** 输入参数 Zod Schema */
  inputSchema?: z.ZodType<TInput>
  /** 输出结果 Zod Schema（必选） */
  outputSchema: z.ZodType<TOutput>
  /** 插件列表 */
  use?: Plugin<TInput, TOutput>[]
}

/**
 * KeyFetch 实例 - 工厂函数返回的对象
 */
export interface KeyFetchInstance<TInput = unknown, TOutput = unknown> {
  /** 实例名称 */
  readonly name: string
  /** 输入 Schema */
  readonly inputSchema: z.ZodType<TInput> | undefined
  /** 输出 Schema */
  readonly outputSchema: z.ZodType<TOutput>

  /**
   * 冷流：单次请求
   * @param input 输入参数（类型安全）
   */
  fetch(input: TInput): Promise<TOutput>

  /**
   * 热流：订阅数据变化
   * @param input 输入参数
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  subscribe(
    input: TInput,
    callback: SubscribeCallback<TOutput>
  ): () => void

  /**
   * React Hook - 响应式数据绑定
   * 内部判断 React 环境，无需额外注入
   */
  useState(
    input: TInput,
    options?: UseStateOptions
  ): UseStateResult<TOutput>
}

// ==================== Subscribe Types ====================

/** 订阅回调 */
export type SubscribeCallback<T> = (data: T, event: 'initial' | 'update') => void

// ==================== React Types ====================

/** useState 选项 */
export interface UseStateOptions {
  /** 是否启用（默认 true） */
  enabled?: boolean
}

/** useState 返回值 */
export interface UseStateResult<T> {
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

// ==================== Utility Types ====================

/** 从 KeyFetchInstance 推断输出类型 */
export type InferOutput<T> = T extends KeyFetchInstance<unknown, infer O> ? O : never

/** 从 KeyFetchInstance 推断输入类型 */
export type InferInput<T> = T extends KeyFetchInstance<infer I, unknown> ? I : never

// ==================== 兼容类型（供旧插件使用）====================

/** @deprecated 使用 Plugin 代替 */
export type FetchPlugin<TInput = unknown> = Plugin<TInput, unknown>

/** 请求参数基础类型 */
export type FetchParams = Record<string, unknown>

/** 中间件上下文（兼容旧插件） */
export interface MiddlewareContext<TInput = unknown> {
  name: string
  params: TInput
  skipCache: boolean
  superjson: SuperJSON
  createResponse: <T>(data: T, init?: ResponseInit) => Response
  createRequest: <T>(data: T, url?: string, init?: RequestInit) => Request
  body: <T>(input: Request | Response) => Promise<T>
  parseBody: <T>(input: string, isSuperjson?: boolean) => T
}

// ==================== Combine Types ====================

/** Combine 源配置 */
export interface CombineSource<TInput, TSourceInput, TSourceOutput> {
  /** 源 KeyFetch 实例 */
  source: KeyFetchInstance<TSourceInput, TSourceOutput>
  /** 从外部 input 生成源的 params */
  params: (input: TInput) => TSourceInput
  /** 源的 key（用于 results 对象），默认使用 source.name */
  key?: string
}

/** Combine 选项（简化版） */
export interface CombineOptions<TInput, TOutput> {
  /** 合并后的名称 */
  name: string
  /** 输出 Schema */
  outputSchema: import('zod').ZodType<TOutput>
  /** 源配置数组 */
  sources: CombineSource<TInput, unknown, unknown>[]
  /** 转换函数：将所有源的结果转换为最终输出 */
  transform: (results: Record<string, unknown>, input: TInput) => TOutput
  /** 额外插件 */
  use?: Plugin<TInput, TOutput>[]
}

// ==================== Fallback Types ====================

/** Fallback 选项 */
export interface FallbackOptions<TInput, TOutput> {
  /** 合并后的名称 */
  name: string
  /** 源 fetcher 数组（可以是空数组） */
  sources: KeyFetchInstance<TInput, TOutput>[]
  /** 当 sources 为空时调用 */
  onEmpty?: () => never
  /** 当所有 sources 都失败时调用 */
  onAllFailed?: (errors: Error[]) => never
}
