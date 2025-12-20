/**
 * Mock Service 定义工具
 * 提供类型安全的 mock service 定义和注册
 */

import { z } from 'zod'
import type {
  MockMethodMeta,
  MockServiceMeta,
  RequestLogEntry,
  InterceptRule,
  PausedRequest,
  MockRegistryState,
  RegisteredMockService,
} from './types'

// ==================== Mock Registry (全局状态) ====================

const state: MockRegistryState = {
  services: new Map(),
  logs: [],
  interceptRules: [],
  pausedRequests: new Map(),
  globalDelay: 0,
  globalError: null,
  interceptEnabled: false,
}

/** 最大日志数量 */
const MAX_LOGS = 500

/** 生成唯一 ID */
let idCounter = 0
function generateId(): string {
  return `${Date.now()}-${++idCounter}`
}

// ==================== 事件系统 ====================

type EventType = 'log' | 'pause' | 'resume' | 'register' | 'state-change'
type EventListener = (data: unknown) => void

const listeners = new Map<EventType, Set<EventListener>>()

/** 订阅事件 */
export function subscribe(event: EventType, listener: EventListener): () => void {
  if (!listeners.has(event)) {
    listeners.set(event, new Set())
  }
  listeners.get(event)!.add(listener)
  return () => listeners.get(event)?.delete(listener)
}

/** 触发事件 */
function emit(event: EventType, data: unknown): void {
  listeners.get(event)?.forEach((fn) => fn(data))
}

// ==================== 定义 Mock Method (传统 API) ====================

/** 定义单个 Mock 方法 */
export function defineMethod<
  TInput extends z.ZodType,
  TOutput extends z.ZodType,
>(config: {
  name: string
  description: string
  input: TInput
  output: TOutput
  delay?: number
  canSimulateError?: boolean
}): MockMethodMeta<TInput, TOutput> {
  return {
    name: config.name,
    description: config.description,
    input: config.input,
    output: config.output,
    delay: config.delay ?? 100,
    canSimulateError: config.canSimulateError ?? true,
  }
}

// ==================== Builder 模式 API ====================

/** 单个方法的 Builder */
class MethodBuilder<
  TInput extends z.ZodType = z.ZodUndefined,
  TOutput extends z.ZodType = z.ZodUndefined,
> {
  private _name: string
  private _description = ''
  private _input: TInput = z.undefined() as unknown as TInput
  private _output: TOutput = z.undefined() as unknown as TOutput
  private _delay = 100
  private _canSimulateError = true

  constructor(name: string) {
    this._name = name
  }

  description(desc: string): this {
    this._description = desc
    return this
  }

  input<T extends z.ZodType>(schema: T): MethodBuilder<T, TOutput> {
    this._input = schema as unknown as TInput
    return this as unknown as MethodBuilder<T, TOutput>
  }

  output<T extends z.ZodType>(schema: T): MethodBuilder<TInput, T> {
    this._output = schema as unknown as TOutput
    return this as unknown as MethodBuilder<TInput, T>
  }

  delay(ms: number): this {
    this._delay = ms
    return this
  }

  canSimulateError(enabled: boolean): this {
    this._canSimulateError = enabled
    return this
  }

  /** @internal */
  _build(): MockMethodMeta<TInput, TOutput> {
    return {
      name: this._name,
      description: this._description,
      input: this._input,
      output: this._output,
      delay: this._delay,
      canSimulateError: this._canSimulateError,
    }
  }
}

/** 方法集合的 Builder */
class MethodsBuilder<TMethods extends Record<string, MockMethodMeta> = Record<string, never>> {
  private _methods: TMethods = {} as TMethods

  method<
    TName extends string,
    TInput extends z.ZodType,
    TOutput extends z.ZodType,
  >(
    name: TName,
    configure: (builder: MethodBuilder) => MethodBuilder<TInput, TOutput>,
  ): MethodsBuilder<TMethods & Record<TName, MockMethodMeta<TInput, TOutput>>> {
    const builder = new MethodBuilder(name)
    const configured = configure(builder)
    ;(this._methods as Record<string, MockMethodMeta>)[name] = configured._build()
    return this as unknown as MethodsBuilder<TMethods & Record<TName, MockMethodMeta<TInput, TOutput>>>
  }

  /** @internal */
  _build(): TMethods {
    return this._methods
  }
}

/** 数据管理的 Builder */
class DataBuilder<TData = unknown> {
  private _schema: z.ZodType | undefined
  private _get: (() => TData) | undefined
  private _set: ((data: TData) => void) | undefined
  private _reset: (() => void) | undefined

  schema<T extends z.ZodType>(schema: T): DataBuilder<z.infer<T>> {
    this._schema = schema
    return this as unknown as DataBuilder<z.infer<T>>
  }

  get(fn: () => TData): this {
    this._get = fn
    return this
  }

  set(fn: (data: TData) => void): this {
    this._set = fn
    return this
  }

  reset(fn: () => void): this {
    this._reset = fn
    return this
  }

  /** @internal */
  _build(): {
    dataSchema: z.ZodType | undefined
    getData: (() => unknown) | undefined
    setData: ((data: unknown) => void) | undefined
    resetData: (() => void) | undefined
  } {
    return {
      dataSchema: this._schema,
      getData: this._get as (() => unknown) | undefined,
      setData: this._set as ((data: unknown) => void) | undefined,
      resetData: this._reset,
    }
  }
}

/** Mock Service 主 Builder */
class MockMetaBuilder<TMethods extends Record<string, MockMethodMeta> = Record<string, never>> {
  private _name = ''
  private _description = ''
  private _icon: string | undefined
  private _methods: TMethods = {} as TMethods
  private _dataSchema: z.ZodType | undefined
  private _getData: (() => unknown) | undefined
  private _setData: ((data: unknown) => void) | undefined
  private _resetData: (() => void) | undefined

  name(name: string): this {
    this._name = name
    return this
  }

  description(desc: string): this {
    this._description = desc
    return this
  }

  icon(icon: string): this {
    this._icon = icon
    return this
  }

  methods<TNewMethods extends Record<string, MockMethodMeta>>(
    configure: (builder: MethodsBuilder) => MethodsBuilder<TNewMethods>,
  ): MockMetaBuilder<TNewMethods> {
    const builder = new MethodsBuilder()
    const configured = configure(builder)
    this._methods = configured._build() as unknown as TMethods
    return this as unknown as MockMetaBuilder<TNewMethods>
  }

  data<TData>(configure: (builder: DataBuilder) => DataBuilder<TData>): this {
    const builder = new DataBuilder()
    const configured = configure(builder)
    const result = configured._build()
    this._dataSchema = result.dataSchema
    this._getData = result.getData
    this._setData = result.setData
    this._resetData = result.resetData
    return this
  }

  /** @internal */
  _build(): MockServiceMeta<TMethods> {
    return {
      name: this._name,
      description: this._description,
      icon: this._icon,
      methods: this._methods,
      dataSchema: this._dataSchema,
      getData: this._getData,
      setData: this._setData,
      resetData: this._resetData,
    }
  }
}

/** 使用 Builder 模式定义 Mock Service 元信息 */
export function defineMockMeta<TMethods extends Record<string, MockMethodMeta>>(
  configure: (builder: MockMetaBuilder) => MockMetaBuilder<TMethods>,
): MockServiceMeta<TMethods> {
  const builder = new MockMetaBuilder()
  const configured = configure(builder)
  return configured._build()
}

// ==================== 注册 Mock Service ====================

/** 注册 Mock Service */
export function registerMockService(
  meta: MockServiceMeta,
  instance: unknown,
): void {
  state.services.set(meta.name, { meta, instance })
  emit('register', { name: meta.name, meta })
}

/** 获取所有已注册的服务 */
export function getRegisteredServices(): RegisteredMockService[] {
  return Array.from(state.services.values())
}

/** 获取指定服务 */
export function getService(name: string): RegisteredMockService | undefined {
  return state.services.get(name)
}

// ==================== 请求日志 ====================

/** 添加请求日志 */
export function addLog(entry: Omit<RequestLogEntry, 'id'>): RequestLogEntry {
  const log: RequestLogEntry = {
    ...entry,
    id: generateId(),
  }
  state.logs.unshift(log)
  if (state.logs.length > MAX_LOGS) {
    state.logs = state.logs.slice(0, MAX_LOGS)
  }
  emit('log', log)
  return log
}

/** 更新请求日志 */
export function updateLog(id: string, updates: Partial<RequestLogEntry>): void {
  const index = state.logs.findIndex((l) => l.id === id)
  if (index !== -1) {
    state.logs[index] = { ...state.logs[index]!, ...updates }
    emit('log', state.logs[index])
  }
}

/** 获取请求日志 */
export function getLogs(): RequestLogEntry[] {
  return state.logs
}

/** 清除请求日志 */
export function clearLogs(): void {
  state.logs = []
  emit('state-change', { logs: [] })
}

// ==================== 拦截器 ====================

/** 添加拦截规则 */
export function addInterceptRule(
  rule: Omit<InterceptRule, 'id'>,
): InterceptRule {
  const newRule: InterceptRule = {
    ...rule,
    id: generateId(),
  }
  state.interceptRules.push(newRule)
  emit('state-change', { interceptRules: state.interceptRules })
  return newRule
}

/** 删除拦截规则 */
export function removeInterceptRule(id: string): void {
  state.interceptRules = state.interceptRules.filter((r) => r.id !== id)
  emit('state-change', { interceptRules: state.interceptRules })
}

/** 更新拦截规则 */
export function updateInterceptRule(
  id: string,
  updates: Partial<InterceptRule>,
): void {
  const index = state.interceptRules.findIndex((r) => r.id === id)
  if (index !== -1) {
    state.interceptRules[index] = { ...state.interceptRules[index]!, ...updates }
    emit('state-change', { interceptRules: state.interceptRules })
  }
}

/** 获取拦截规则 */
export function getInterceptRules(): InterceptRule[] {
  return state.interceptRules
}

/** 设置拦截启用状态 */
export function setInterceptEnabled(enabled: boolean): void {
  state.interceptEnabled = enabled
  emit('state-change', { interceptEnabled: enabled })
}

/** 获取拦截启用状态 */
export function isInterceptEnabled(): boolean {
  return state.interceptEnabled
}

/** 匹配拦截规则 */
export function matchInterceptRules(
  service: string,
  method: string,
  point: 'before' | 'after',
): InterceptRule[] {
  if (!state.interceptEnabled) return []
  return state.interceptRules.filter(
    (rule) =>
      rule.enabled &&
      rule.point === point &&
      (rule.service === '*' || rule.service === service) &&
      (rule.method === '*' || rule.method === method),
  )
}

// ==================== 暂停请求管理 ====================

/** 添加暂停的请求 */
export function addPausedRequest(request: PausedRequest): void {
  state.pausedRequests.set(request.id, request)
  emit('pause', request)
}

/** 获取暂停的请求 */
export function getPausedRequests(): PausedRequest[] {
  return Array.from(state.pausedRequests.values())
}

/** 移除暂停的请求 */
export function removePausedRequest(id: string): void {
  state.pausedRequests.delete(id)
  emit('resume', { id })
}

// ==================== 全局设置 ====================

/** 设置全局延迟 */
export function setGlobalDelay(ms: number): void {
  state.globalDelay = ms
  emit('state-change', { globalDelay: ms })
}

/** 获取全局延迟 */
export function getGlobalDelay(): number {
  return state.globalDelay
}

/** 设置全局错误 */
export function setGlobalError(error: Error | null): void {
  state.globalError = error
  emit('state-change', { globalError: error })
}

/** 获取全局错误 */
export function getGlobalError(): Error | null {
  return state.globalError
}

/** 重置所有服务数据 */
export function resetAllData(): void {
  state.services.forEach(({ meta }) => {
    meta.resetData?.()
  })
  emit('state-change', { reset: true })
}

/** 获取完整状态 */
export function getState(): MockRegistryState {
  return state
}
