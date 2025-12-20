/**
 * Mock Service 元信息类型定义
 * 使用 Zod v4 进行类型约束和运行时验证
 */

import { z } from 'zod'

// ==================== 基础类型 ====================

/** Mock 方法元信息 */
export interface MockMethodMeta<
  TInput extends z.ZodType = z.ZodType,
  TOutput extends z.ZodType = z.ZodType,
> {
  /** 方法名称 */
  name: string
  /** 方法描述 */
  description: string
  /** 输入参数 Schema */
  input: TInput
  /** 输出结果 Schema */
  output: TOutput
  /** 默认延迟 (ms) */
  delay?: number
  /** 是否可以模拟错误 */
  canSimulateError?: boolean
}

/** Mock Service 元信息 */
export interface MockServiceMeta<
  TMethods extends Record<string, MockMethodMeta> = Record<string, MockMethodMeta>,
> {
  /** 服务名称 */
  name: string
  /** 服务描述 */
  description: string
  /** 服务图标 (tabler icon name) */
  icon: string | undefined
  /** 方法列表 */
  methods: TMethods
  /** Mock 数据 Schema（用于 GUI 编辑） */
  dataSchema: z.ZodType | undefined
  /** 获取当前 Mock 数据 */
  getData: (() => unknown) | undefined
  /** 设置 Mock 数据 */
  setData: ((data: unknown) => void) | undefined
  /** 重置数据 */
  resetData: (() => void) | undefined
}

// ==================== 请求日志 ====================

/** 请求状态 */
export type RequestStatus = 'pending' | 'success' | 'error' | 'intercepted'

/** 请求日志项 */
export interface RequestLogEntry {
  /** 唯一 ID */
  id: string
  /** 时间戳 */
  timestamp: Date
  /** 服务名称 */
  service: string
  /** 方法名称 */
  method: string
  /** 输入参数 */
  input: unknown
  /** 输出结果 */
  output: unknown | undefined
  /** 错误信息 */
  error: string | undefined
  /** 状态 */
  status: RequestStatus
  /** 耗时 (ms) */
  duration: number | undefined
  /** 是否被拦截修改 */
  intercepted: boolean
  /** 原始输入（如果被修改） */
  originalInput: unknown | undefined
  /** 原始输出（如果被修改） */
  originalOutput: unknown | undefined
}

// ==================== 拦截器 ====================

/** 拦截点 */
export type InterceptPoint = 'before' | 'after'

/** 拦截规则 */
export interface InterceptRule {
  /** 规则 ID */
  id: string
  /** 是否启用 */
  enabled: boolean
  /** 服务名称（* 匹配所有） */
  service: string
  /** 方法名称（* 匹配所有） */
  method: string
  /** 拦截点 */
  point: InterceptPoint
  /** 拦截动作 */
  action: InterceptAction
}

/** 拦截动作 */
export type InterceptAction =
  | { type: 'pause' } // 暂停，等待手动继续
  | { type: 'delay'; ms: number } // 延迟
  | { type: 'modify-input'; transform: string } // 修改输入 (JS 表达式)
  | { type: 'modify-output'; transform: string } // 修改输出 (JS 表达式)
  | { type: 'throw-error'; message: string } // 抛出错误
  | { type: 'return-value'; value: string } // 直接返回值 (JSON)

/** 暂停的请求 */
export interface PausedRequest {
  /** 请求 ID */
  id: string
  /** 日志项 */
  logEntry: RequestLogEntry
  /** 继续执行 */
  resume: (modifiedInput?: unknown) => void
  /** 中止执行 */
  abort: (error?: Error) => void
  /** 修改输出后继续 */
  resumeWithOutput: (output: unknown) => void
}

// ==================== Mock Registry ====================

/** 已注册的 Mock Service */
export interface RegisteredMockService {
  /** 元信息 */
  meta: MockServiceMeta
  /** 服务实例 */
  instance: unknown
}

/** Mock Registry 状态 */
export interface MockRegistryState {
  /** 已注册的服务 */
  services: Map<string, RegisteredMockService>
  /** 请求日志 */
  logs: RequestLogEntry[]
  /** 拦截规则 */
  interceptRules: InterceptRule[]
  /** 暂停的请求 */
  pausedRequests: Map<string, PausedRequest>
  /** 全局延迟 (ms) */
  globalDelay: number
  /** 全局错误模拟 */
  globalError: Error | null
  /** 是否启用拦截 */
  interceptEnabled: boolean
}

// ==================== 辅助类型 ====================

/** 从 MockMethodMeta 推断输入类型 */
export type InferMethodInput<T extends MockMethodMeta> = z.infer<T['input']>

/** 从 MockMethodMeta 推断输出类型 */
export type InferMethodOutput<T extends MockMethodMeta> = z.infer<T['output']>

/** 从 MockServiceMeta 推断方法签名 */
export type InferServiceMethods<T extends MockServiceMeta> = {
  [K in keyof T['methods']]: (
    input: InferMethodInput<T['methods'][K]>,
  ) => Promise<InferMethodOutput<T['methods'][K]>>
}
