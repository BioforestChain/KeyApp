/**
 * React 桥接层
 * 
 * 将 Effect 的 SubscriptionRef 桥接到 React Hook
 */

import { Effect, Stream, Fiber } from "effect"
import type { FetchError } from "./http"
import type { DataSource } from "./source"

/** 兼容旧 API 的 StreamInstance 接口 */
export interface StreamInstance<TInput, TOutput> {
  readonly name: string
  fetch(input: TInput): Promise<TOutput>
  subscribe(input: TInput, callback: (data: TOutput, event: "initial" | "update") => void): () => void
  useState(
    input: TInput,
    options?: { enabled?: boolean }
  ): {
    data: TOutput | undefined
    isLoading: boolean
    isFetching: boolean
    error: Error | undefined
    refetch: () => Promise<void>
  }
  invalidate(): void
}

/**
 * 从 DataSource 创建 StreamInstance（兼容层）
 * 
 * 用于将 Effect 的 DataSource 桥接到现有的 React 组件
 */
export function createStreamInstanceFromSource<TInput, TOutput>(
  name: string,
  createSource: (input: TInput) => Effect.Effect<DataSource<TOutput>>
): StreamInstance<TInput, TOutput> {
  // 缓存已创建的 sources（按 inputKey）
  const sources = new Map<string, {
    source: DataSource<TOutput>
    refCount: number
  }>()

  const getInputKey = (input: TInput): string => {
    if (input === undefined || input === null) return "__empty__"
    return JSON.stringify(input)
  }

  const getOrCreateSource = async (input: TInput): Promise<DataSource<TOutput>> => {
    const key = getInputKey(input)
    const cached = sources.get(key)
    if (cached) {
      cached.refCount++
      return cached.source
    }

    const source = await Effect.runPromise(createSource(input))
    sources.set(key, { source, refCount: 1 })
    return source
  }

  const releaseSource = (input: TInput): void => {
    const key = getInputKey(input)
    const cached = sources.get(key)
    if (!cached) return

    cached.refCount--
    if (cached.refCount <= 0) {
      Effect.runFork(cached.source.stop)
      sources.delete(key)
    }
  }

  return {
    name,

    async fetch(input: TInput): Promise<TOutput> {
      const source = await getOrCreateSource(input)
      const value = await Effect.runPromise(source.get)
      if (value === null) {
        // 强制刷新获取
        return Effect.runPromise(source.refresh)
      }
      return value
    },

    subscribe(
      input: TInput,
      callback: (data: TOutput, event: "initial" | "update") => void
    ): () => void {
      let cancelled = false
      let cleanup: (() => void) | null = null

      getOrCreateSource(input).then((source) => {
        if (cancelled) {
          releaseSource(input)
          return
        }

        let isFirst = true
        const program = Stream.runForEach(source.changes, (value) =>
          Effect.sync(() => {
            if (cancelled) return
            callback(value, isFirst ? "initial" : "update")
            isFirst = false
          })
        )

        const fiber = Effect.runFork(program)

        cleanup = () => {
          Effect.runFork(Fiber.interrupt(fiber))
          releaseSource(input)
        }
      })

      return () => {
        cancelled = true
        cleanup?.()
      }
    },

    useState(input: TInput, options?: { enabled?: boolean }) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const React = require("react") as typeof import("react")
      const { useState, useEffect, useCallback, useRef, useMemo } = React

      const [data, setData] = useState<TOutput | undefined>(undefined)
      const [isLoading, setIsLoading] = useState(true)
      const [isFetching, setIsFetching] = useState(false)
      const [error, setError] = useState<Error | undefined>(undefined)

      const inputKey = useMemo(() => getInputKey(input), [input])
      const inputRef = useRef(input)
      inputRef.current = input

      const enabled = options?.enabled !== false
      const instanceRef = useRef(this)

      const refetch = useCallback(async () => {
        if (!enabled) return
        setIsFetching(true)
        setError(undefined)
        try {
          const source = await getOrCreateSource(inputRef.current)
          const result = await Effect.runPromise(source.refresh)
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
        const unsubscribe = instanceRef.current.subscribe(
          inputRef.current,
          (newData: TOutput, _event: "initial" | "update") => {
            if (isCancelled) return
            setData(newData)
            setIsLoading(false)
            setIsFetching(false)
            setError(undefined)
          }
        )

        return () => {
          isCancelled = true
          unsubscribe()
        }
      }, [enabled, inputKey])

      return { data, isLoading, isFetching, error, refetch }
    },

    invalidate(): void {
      // 停止所有 sources，下次订阅时会重新创建
      for (const [_key, cached] of sources) {
        Effect.runFork(cached.source.stop)
      }
      sources.clear()
    },
  }
}

/**
 * 简单的 StreamInstance 创建函数（向后兼容）
 * 
 * 对于简单场景，直接包装一个 fetch 函数
 */
export function createStreamInstance<TInput, TOutput>(
  name: string,
  createStream: (input: TInput) => Stream.Stream<TOutput, FetchError>,
  options?: {
    ttl?: number
    minInterval?: number
  }
): StreamInstance<TInput, TOutput> {
  // 简单缓存
  const cache = new Map<string, { value: TOutput; timestamp: number }>()
  const ttl = options?.ttl ?? 30000

  const getInputKey = (input: TInput): string => {
    if (input === undefined || input === null) return "__empty__"
    return JSON.stringify(input)
  }

  return {
    name,

    async fetch(input: TInput): Promise<TOutput> {
      const key = getInputKey(input)
      const cached = cache.get(key)
      const now = Date.now()

      if (cached && now - cached.timestamp < ttl) {
        return cached.value
      }

      const stream = createStream(input)
      const result = await Effect.runPromise(
        Stream.runHead(stream).pipe(
          Effect.flatMap((option) =>
            option._tag === "Some"
              ? Effect.succeed(option.value)
              : Effect.fail(new Error("No data"))
          )
        )
      )

      cache.set(key, { value: result, timestamp: now })
      return result
    },

    subscribe(
      input: TInput,
      callback: (data: TOutput, event: "initial" | "update") => void
    ): () => void {
      let isFirst = true
      let cancelled = false

      const stream = createStream(input)
      const program = Stream.runForEach(stream, (value) =>
        Effect.sync(() => {
          if (cancelled) return
          
          // 更新缓存
          const key = getInputKey(input)
          cache.set(key, { value, timestamp: Date.now() })
          
          callback(value, isFirst ? "initial" : "update")
          isFirst = false
        })
      )

      const fiber = Effect.runFork(program)

      return () => {
        cancelled = true
        import("effect").then(({ Fiber }) => {
          Effect.runFork(Fiber.interrupt(fiber))
        })
      }
    },

    useState(input: TInput, options?: { enabled?: boolean }) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const React = require("react") as typeof import("react")
      const { useState, useEffect, useCallback, useRef, useMemo } = React

      const [data, setData] = useState<TOutput | undefined>(undefined)
      const [isLoading, setIsLoading] = useState(true)
      const [isFetching, setIsFetching] = useState(false)
      const [error, setError] = useState<Error | undefined>(undefined)

      const inputKey = useMemo(() => getInputKey(input), [input])
      const inputRef = useRef(input)
      inputRef.current = input

      const enabled = options?.enabled !== false
      const instanceRef = useRef(this)

      const refetch = useCallback(async () => {
        if (!enabled) return
        setIsFetching(true)
        setError(undefined)
        try {
          cache.delete(getInputKey(inputRef.current))
          const result = await instanceRef.current.fetch(inputRef.current)
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

        // 检查缓存
        const key = getInputKey(inputRef.current)
        const cached = cache.get(key)
        if (cached && Date.now() - cached.timestamp < ttl) {
          setData(cached.value)
          setIsLoading(false)
        } else {
          setIsLoading(true)
        }
        setIsFetching(true)
        setError(undefined)

        let isCancelled = false
        const unsubscribe = instanceRef.current.subscribe(
          inputRef.current,
          (newData: TOutput) => {
            if (isCancelled) return
            setData(newData)
            setIsLoading(false)
            setIsFetching(false)
            setError(undefined)
          }
        )

        return () => {
          isCancelled = true
          unsubscribe()
        }
      }, [enabled, inputKey])

      return { data, isLoading, isFetching, error, refetch }
    },

    invalidate(): void {
      cache.clear()
    },
  }
}
