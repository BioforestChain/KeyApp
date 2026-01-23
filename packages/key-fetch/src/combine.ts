/**
 * Combine - 组合多个 KeyFetchInstance
 * 
 * 核心功能：
 * 1. 订阅 sources 作为触发器（任一 source 更新触发重新获取）
 * 2. 通过 use 插件（如 useHttp）发起 HTTP 请求
 * 3. 在 transform 中做数据转换
 */

import type { z } from 'zod'
import type {
  Context,
  KeyFetchInstance,
  Plugin,
  SubscribeCallback,
  UseStateOptions,
  UseStateResult,
} from './types'
import { superjson } from './core'

/** Combine 源配置 */
export interface CombineSourceConfig<TInput, TSourceOutput> {
  source: KeyFetchInstance<unknown, TSourceOutput>
  params: (input: TInput) => unknown
  key?: string
}

/** Combine 选项 */
export interface CombineOptions<TInput, TOutput> {
  name: string
  outputSchema: z.ZodType<TOutput>
  inputSchema?: z.ZodType<TInput>
  /** 触发源（可选，为空时直接执行 use 插件） */
  sources?: CombineSourceConfig<TInput, unknown>[]
  /** 插件列表（如 useHttp） */
  use?: Plugin<TInput, TOutput>[]
  /** 转换函数（处理 HTTP 响应或 sources 数据） */
  transform?: (data: unknown, input: TInput) => TOutput | Promise<TOutput>
}

export function combine<TInput, TOutput>(
  options: CombineOptions<TInput, TOutput>
): KeyFetchInstance<TInput, TOutput> {
  const { name, outputSchema, inputSchema, sources = [], use = [], transform } = options

  const sourceKeys = sources.map((s, i) => s.key ?? s.source.name ?? `source_${i}`)
  const subscribers = new Map<string, Set<SubscribeCallback<TOutput>>>()
  const subscriptionCleanups = new Map<string, (() => void)[]>()

  const buildCacheKey = (input: TInput): string => `${name}::${JSON.stringify(input)}`

  // 执行插件链获取数据
  async function executePlugins(input: TInput): Promise<TOutput> {
    // 创建 Context
    const ctx: Context<TInput, TOutput> = {
      input,
      req: new Request('about:blank'),
      superjson,
      self: instance,
      state: new Map(),
      name,
    }

    // 构建洋葱模型中间件链
    const baseFetch = async (): Promise<Response> => {
      if (ctx.req.url === 'about:blank') {
        // 没有 HTTP 插件，返回空响应（用于纯 sources 模式）
        return new Response('{}', { headers: { 'Content-Type': 'application/json' } })
      }
      return fetch(ctx.req)
    }

    let next = baseFetch
    for (let i = use.length - 1; i >= 0; i--) {
      const plugin = use[i]
      if (plugin.onFetch) {
        const currentNext = next
        const pluginFn = plugin.onFetch
        next = async () => pluginFn(ctx, currentNext)
      }
    }

    const response = await next()

    if (!response.ok && ctx.req.url !== 'about:blank') {
      const errorText = await response.text().catch(() => '')
      throw new Error(`[${name}] HTTP ${response.status}: ${response.statusText}${errorText ? `\n${errorText.slice(0, 200)}` : ''}`)
    }

    // 解析响应
    const text = await response.text()
    const isSuperjson = response.headers.get('X-Superjson') === 'true'
    const json = text ? (isSuperjson ? superjson.parse(text) : JSON.parse(text)) : {}

    // 应用 transform
    const result = transform ? await transform(json, input) : json as TOutput

    return outputSchema.parse(result) as TOutput
  }

  const instance: KeyFetchInstance<TInput, TOutput> = {
    name,
    inputSchema,
    outputSchema,

    async fetch(input: TInput): Promise<TOutput> {
      if (inputSchema) inputSchema.parse(input)

      // 如果有 sources，先获取它们的数据（但不使用，只作为触发条件）
      if (sources.length > 0) {
        await Promise.all(sources.map(s => s.source.fetch(s.params(input))))
      }

      return executePlugins(input)
    },

    subscribe(input: TInput, callback: SubscribeCallback<TOutput>): () => void {
      const cacheKey = buildCacheKey(input)

      let subs = subscribers.get(cacheKey)
      if (!subs) {
        subs = new Set()
        subscribers.set(cacheKey, subs)
      }
      subs.add(callback)

      if (subs.size === 1) {
        const cleanups: (() => void)[] = []

        const refetch = async () => {
          try {
            const data = await executePlugins(input)
            const currentSubs = subscribers.get(cacheKey)
            if (currentSubs) {
              currentSubs.forEach(cb => cb(data, 'update'))
            }
          } catch (error) {
            console.error(`[combine] Error fetching ${name}:`, error)
          }
        }

        // 订阅所有 sources，任一更新时重新获取
        sources.forEach((sourceConfig) => {
          const unsub = sourceConfig.source.subscribe(sourceConfig.params(input), () => {
            refetch()
          })
          cleanups.push(unsub)
        })

        // 执行插件的 onSubscribe
        const ctx: Context<TInput, TOutput> = {
          input,
          req: new Request('about:blank'),
          superjson,
          self: instance,
          state: new Map(),
          name,
        }

        for (const plugin of use) {
          if (plugin.onSubscribe) {
            const cleanup = plugin.onSubscribe(ctx, (data) => {
              const currentSubs = subscribers.get(cacheKey)
              if (currentSubs) {
                currentSubs.forEach(cb => cb(data, 'update'))
              }
            })
            if (cleanup) cleanups.push(cleanup)
          }
        }

        subscriptionCleanups.set(cacheKey, cleanups)
      }

      // 立即获取一次
      executePlugins(input)
        .then(data => callback(data, 'initial'))
        .catch(error => console.error(`[combine] Error fetching ${name}:`, error))

      return () => {
        subs?.delete(callback)
        if (subs?.size === 0) {
          subscribers.delete(cacheKey)
          subscriptionCleanups.get(cacheKey)?.forEach(fn => fn())
          subscriptionCleanups.delete(cacheKey)
        }
      }
    },

    useState(input: TInput, options?: UseStateOptions): UseStateResult<TOutput> {
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
          const result = await instance.fetch(inputRef.current)
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
        const unsubscribe = instance.subscribe(inputRef.current, (newData) => {
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
    },
  }

  return instance
}
