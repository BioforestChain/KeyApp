/**
 * Key-Fetch Types
 * 
 * 插件化响应式 Fetch 的类型定义
 */

/** 缓存条目 */
export interface CacheEntry {
  data: unknown
  timestamp: number
  etag?: string
}

/** 缓存存储接口 */
export interface CacheStore {
  get(key: string): CacheEntry | undefined
  set(key: string, entry: CacheEntry): void
  delete(key: string): boolean
  has(key: string): boolean
  clear(): void
  keys(): IterableIterator<string>
}

/** 插件上下文 - 规则定义时传入 */
export interface PluginContext {
  /** 规则名称 */
  name: string
  /** URL 匹配模式 */
  pattern: RegExp
  /** 缓存存储 */
  cache: CacheStore
  /** 规则注册表 */
  registry: RuleRegistry
  /** 通知该规则的所有订阅者 */
  notifySubscribers: () => void
}

/** 请求上下文 */
export interface RequestContext {
  url: string
  init?: RequestInit
  cache: CacheStore
  ruleName: string
}

/** 响应上下文 */
export interface ResponseContext {
  url: string
  data: unknown
  response: Response
  cache: CacheStore
  ruleName: string
}

/** 订阅上下文 */
export interface SubscribeContext {
  url: string
  cache: CacheStore
  ruleName: string
  notify: (data: unknown) => void
}

/** 失效上下文 */
export interface InvalidateContext {
  ruleName: string
  invalidatedTags: Set<string>
}

/** 缓存插件接口 */
export interface CachePlugin {
  /** 插件名称 */
  name: string
  
  /** 
   * 初始化：规则定义时调用
   * 返回清理函数（可选）
   */
  setup?(ctx: PluginContext): (() => void) | void
  
  /**
   * 请求前：决定是否使用缓存
   * 返回 cached data 或 undefined（继续请求）
   */
  onRequest?(ctx: RequestContext): Promise<unknown | undefined> | unknown | undefined
  
  /**
   * 响应后：处理缓存存储
   */
  onResponse?(ctx: ResponseContext): Promise<void> | void
  
  /**
   * 失效检查：决定缓存是否应该失效
   * 返回 true 表示失效
   */
  shouldInvalidate?(ctx: InvalidateContext): boolean
  
  /**
   * 订阅时：启动数据源（如轮询）
   * 返回清理函数
   */
  onSubscribe?(ctx: SubscribeContext): () => void
}

/** 缓存规则定义 */
export interface CacheRule {
  /** 规则名称（唯一标识） */
  name: string
  /** URL 匹配模式 */
  pattern: RegExp | string
  /** 插件列表（按顺序执行） */
  use: CachePlugin[]
}

/** 规则注册表接口 */
export interface RuleRegistry {
  /** 添加标签 */
  addTag(tag: string, ruleName: string): void
  /** 获取标签下的规则 */
  getRulesByTag(tag: string): string[]
  /** 监听规则数据更新 */
  onRuleUpdate(ruleName: string, callback: () => void): () => void
  /** 触发规则更新通知 */
  emitRuleUpdate(ruleName: string): void
}

/** 订阅回调 */
export type SubscribeCallback<T> = (data: T, event: 'initial' | 'update') => void

/** keyFetch 选项 */
export interface KeyFetchOptions {
  /** 请求初始化选项 */
  init?: RequestInit
  /** 强制跳过缓存 */
  skipCache?: boolean
}
