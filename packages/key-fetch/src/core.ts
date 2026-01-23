/**
 * Key-Fetch v2 Core
 * 
 * 极简主义核心实现
 * - 不包含 HTTP/轮询/缓存逻辑，全部插件化
 * - Schema First：inputSchema + outputSchema 是一等公民
 * - Lifecycle Driven：onInit → onSubscribe → onFetch
 */

import type {
  Context,
  Plugin,
  KeyFetchDefineOptions,
  KeyFetchInstance,
  SubscribeCallback,
  UseStateOptions,
  UseStateResult,
} from './types'
import { SuperJSON } from 'superjson'

export const superjson = new SuperJSON({ dedupe: true })

// ==================== 内部工具 ====================

/** 构建缓存 key */
function buildCacheKey(name: string, input: unknown): string {
  if (input === undefined || input === null) {
    return name
  }
  if (typeof input === 'object') {
    const sorted = Object.entries(input as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&')
    return sorted ? `${name}?${sorted}` : name
  }
  return `${name}#${JSON.stringify(input)}`
}

// ==================== KeyFetch 实例实现 ====================

class KeyFetchInstanceImpl<TInput, TOutput> implements KeyFetchInstance<TInput, TOutput> {
  readonly name: string
  readonly inputSchema: import('zod').ZodType<TInput> | undefined
  readonly outputSchema: import('zod').ZodType<TOutput>

  private plugins: Plugin<TInput, TOutput>[]
  private initCleanups: (() => void)[] = []
  private subscribers = new Map<string, Set<SubscribeCallback<TOutput>>>()
  private subscriptionCleanups = new Map<string, (() => void)[]>()
  private inFlight = new Map<string, Promise<TOutput>>()

  constructor(options: KeyFetchDefineOptions<TInput, TOutput>) {
    this.name = options.name
    this.inputSchema = options.inputSchema
    this.outputSchema = options.outputSchema
    this.plugins = options.use ?? []

    // 阶段 1: 执行所有插件的 onInit
    for (const plugin of this.plugins) {
      if (plugin.onInit) {
        const cleanup = plugin.onInit(this)
        if (cleanup) {
          this.initCleanups.push(cleanup)
        }
      }
    }
  }

  async fetch(input: TInput): Promise<TOutput> {
    const cacheKey = buildCacheKey(this.name, input)

    // 检查进行中的请求（基础去重）
    const pending = this.inFlight.get(cacheKey)
    if (pending) {
      return pending
    }

    const task = this.doFetch(input)
    this.inFlight.set(cacheKey, task)

    try {
      return await task
    } finally {
      this.inFlight.delete(cacheKey)
    }
  }

  private async doFetch(input: TInput): Promise<TOutput> {
    // 验证输入
    if (this.inputSchema) {
      this.inputSchema.parse(input)
    }

    // 创建基础 Request（空 URL，由插件填充）
    const baseRequest = new Request('about:blank', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    // 创建 Context
    const ctx: Context<TInput, TOutput> = {
      input,
      req: baseRequest,
      superjson,
      self: this,
      state: new Map(),
      name: this.name,
    }

    // 构建洋葱模型中间件链
    // 最内层是默认的 fetch（如果没有插件处理）
    const baseFetch = async (): Promise<Response> => {
      // 如果 URL 仍是 about:blank，说明没有 http 插件
      if (ctx.req.url === 'about:blank') {
        throw new Error(`[${this.name}] No HTTP plugin configured. Use useHttp() plugin.`)
      }
      return fetch(ctx.req)
    }

    // 从后往前包装中间件
    let next = baseFetch
    for (let i = this.plugins.length - 1; i >= 0; i--) {
      const plugin = this.plugins[i]
      if (plugin.onFetch) {
        const currentNext = next
        const pluginFn = plugin.onFetch
        next = async () => pluginFn(ctx, currentNext)
      }
    }

    // 执行中间件链
    const response = await next()

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(
        `[${this.name}] HTTP ${response.status}: ${response.statusText}` +
        (errorText ? `\n${errorText.slice(0, 200)}` : '')
      )
    }

    // 解析响应
    const text = await response.text()
    const isSuperjson = response.headers.get('X-Superjson') === 'true'
    const json = isSuperjson ? superjson.parse(text) : JSON.parse(text)

    // Schema 验证
    const result = this.outputSchema.parse(json) as TOutput
    return result
  }

  subscribe(input: TInput, callback: SubscribeCallback<TOutput>): () => void {
    const cacheKey = buildCacheKey(this.name, input)

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

      // 创建订阅 Context
      const ctx: Context<TInput, TOutput> = {
        input,
        req: new Request('about:blank'),
        superjson,
        self: this,
        state: new Map(),
        name: this.name,
      }

      // emit 函数：通知所有订阅者
      const emit = (data: TOutput) => {
        this.notify(cacheKey, data, 'update')
      }

      // 阶段 2: 执行所有插件的 onSubscribe
      for (const plugin of this.plugins) {
        if (plugin.onSubscribe) {
          const cleanup = plugin.onSubscribe(ctx, emit)
          if (cleanup) {
            cleanups.push(cleanup)
          }
        }
      }

      this.subscriptionCleanups.set(cacheKey, cleanups)
    }

    // 立即获取一次
    this.fetch(input)
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

  /** 通知特定 key 的订阅者 */
  private notify(cacheKey: string, data: TOutput, event: 'initial' | 'update'): void {
    const subs = this.subscribers.get(cacheKey)
    if (subs) {
      subs.forEach(cb => cb(data, event))
    }
  }

  /**
   * React Hook - useState
   * 内部判断 React 环境
   */
  useState(input: TInput, options?: UseStateOptions): UseStateResult<TOutput> {
    // 尝试动态导入 React hooks
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const React = require('react') as any
    
    const { useState, useEffect, useCallback, useRef, useMemo } = React

    const [data, setData] = useState(undefined as TOutput | undefined)
    const [isLoading, setIsLoading] = useState(true)
    const [isFetching, setIsFetching] = useState(false)
    const [error, setError] = useState(undefined as Error | undefined)

    const inputKey = useMemo(() => JSON.stringify(input ?? {}), [input])
    const inputRef = useRef(input)
    inputRef.current = input

    const enabled = options?.enabled !== false

    const refetch = useCallback(async () => {
      if (!enabled) return

      setIsFetching(true)
      setError(undefined)

      try {
        const result = await this.fetch(inputRef.current)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsFetching(false)
        setIsLoading(false)
      }
    }, [enabled])

    useEffect(() => {
      if (!enabled) {
        setData(undefined)
        setIsLoading(false)
        setIsFetching(false)
        setError(undefined)
        return
      }

      setIsLoading(true)
      setIsFetching(true)
      setError(undefined)

      let isCancelled = false

      // 订阅更新
      const unsubscribe = this.subscribe(inputRef.current, (newData, _event) => {
        if (isCancelled) return
        setData(newData)
        setIsLoading(false)
        setIsFetching(false)
        setError(undefined)
      })

      return () => {
        isCancelled = true
        unsubscribe()
      }
    }, [enabled, inputKey])

    return { data, isLoading, isFetching, error, refetch }
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建 KeyFetch 实例
 */
export function create<TInput, TOutput>(
  options: KeyFetchDefineOptions<TInput, TOutput>
): KeyFetchInstance<TInput, TOutput> {
  return new KeyFetchInstanceImpl(options)
}
