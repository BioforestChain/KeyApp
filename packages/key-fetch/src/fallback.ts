/**
 * Fallback - 多源自动回退
 * 
 * 当第一个源失败时自动尝试下一个
 */

import type { z } from 'zod'
import type {
  KeyFetchInstance,
  SubscribeCallback,
  UseStateOptions,
  UseStateResult,
} from './types'

/** 自定义错误：不支持的能力 */
export class NoSupportError extends Error {
  readonly capability: string

  constructor(capability: string) {
    super(`No provider supports: ${capability}`)
    this.name = 'NoSupportError'
    this.capability = capability
  }
}

/** Fallback 选项 */
export interface FallbackOptions<TInput, TOutput> {
  /** 合并后的名称 */
  name: string
  /** 源 fetcher 数组（可以是空数组） */
  sources: KeyFetchInstance<TInput, TOutput>[]
  /** 当 sources 为空时调用，默认抛出 NoSupportError */
  onEmpty?: () => never
  /** 当所有 sources 都失败时调用，默认抛出 AggregateError */
  onAllFailed?: (errors: Error[]) => never
}

/**
 * fallback - 多源自动回退
 * 
 * @example
 * ```ts
 * const balanceFetcher = fallback({
 *   name: 'chain.balance',
 *   sources: [provider1.balance, provider2.balance],
 *   onEmpty: () => { throw new NoSupportError('nativeBalance') },
 * })
 * ```
 */
export function fallback<TInput, TOutput>(
  options: FallbackOptions<TInput, TOutput>
): KeyFetchInstance<TInput, TOutput> {
  const { name, sources, onEmpty, onAllFailed } = options

  const handleEmpty = onEmpty ?? (() => {
    throw new NoSupportError(name)
  })

  const handleAllFailed = onAllFailed ?? ((errors: Error[]) => {
    throw new AggregateError(errors, `All ${errors.length} provider(s) failed for: ${name}`)
  })

  // 空数组
  if (sources.length === 0) {
    return createEmptyFetcher(name, handleEmpty)
  }

  // 单个源
  if (sources.length === 1) {
    return sources[0]
  }

  // 多个源
  return createFallbackFetcher(name, sources, handleAllFailed)
}

function createEmptyFetcher<TInput, TOutput>(
  name: string,
  handleEmpty: () => never
): KeyFetchInstance<TInput, TOutput> {
  return {
    name,
    inputSchema: undefined,
    outputSchema: { parse: () => undefined } as unknown as import('zod').ZodType<TOutput>,

    async fetch(): Promise<TOutput> {
      handleEmpty()
    },

    subscribe(): () => void {
      return () => {}
    },

    useState(): UseStateResult<TOutput> {
      return {
        data: undefined,
        isLoading: false,
        isFetching: false,
        error: new NoSupportError(name),
        refetch: async () => {},
      }
    },
  }
}

function createFallbackFetcher<TInput, TOutput>(
  name: string,
  sources: KeyFetchInstance<TInput, TOutput>[],
  handleAllFailed: (errors: Error[]) => never
): KeyFetchInstance<TInput, TOutput> {
  const first = sources[0]
  
  // Cooldown: 记录失败源
  const COOLDOWN_MS = 60_000
  const failedSources = new Map<KeyFetchInstance<TInput, TOutput>, number>()

  const instance: KeyFetchInstance<TInput, TOutput> = {
    name,
    inputSchema: first.inputSchema,
    outputSchema: first.outputSchema,

    async fetch(input: TInput): Promise<TOutput> {
      const errors: Error[] = []
      const now = Date.now()

      for (const source of sources) {
        const cooldownEnd = failedSources.get(source)
        if (cooldownEnd && now < cooldownEnd) {
          continue
        }

        try {
          const result = await source.fetch(input)
          failedSources.delete(source)
          return result
        } catch (error) {
          errors.push(error instanceof Error ? error : new Error(String(error)))
          failedSources.set(source, now + COOLDOWN_MS)
        }
      }

      handleAllFailed(errors)
    },

    subscribe(input: TInput, callback: SubscribeCallback<TOutput>): () => void {
      return first.subscribe(input, callback)
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
          return
        }

        setIsLoading(true)
        setIsFetching(true)

        let isCancelled = false
        const unsubscribe = instance.subscribe(inputRef.current, (newData) => {
          if (isCancelled) return
          setData(newData)
          setIsLoading(false)
          setIsFetching(false)
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
