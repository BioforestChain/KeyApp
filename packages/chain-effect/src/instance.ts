/**
 * React 桥接层
 * 
 * 将 Effect 的 SubscriptionRef 桥接到 React Hook
 * 
 * @see https://context7.com/effect-ts/effect/llms.txt - Effect Stream 官方文档
 * @see https://context7.com/tim-smart/effect-atom/llms.txt - Effect Atom React 集成参考
 * @see https://react.dev/reference/react/useSyncExternalStore - React 18 外部订阅最佳实践
 */

import { useState, useEffect, useCallback, useRef, useMemo, useSyncExternalStore } from "react"
import { Effect, Stream, Fiber } from "effect"
import type { FetchError } from "./http"
import { formatChainEffectError, logChainEffectDebug } from "./debug"
import type { DataSource } from "./source"

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null
}

function toStableJson(value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString()
  }
  if (!isRecord(value)) {
    if (Array.isArray(value)) {
      return value.map(toStableJson)
    }
    return value
  }
  if (Array.isArray(value)) {
    return value.map(toStableJson)
  }
  const sorted: UnknownRecord = {}
  for (const key of Object.keys(value).toSorted()) {
    sorted[key] = toStableJson(value[key])
  }
  return sorted
}

function stableStringify(value: unknown): string {
  return JSON.stringify(toStableJson(value))
}

function summarizeValue(value: unknown): string {
  if (Array.isArray(value)) {
    const first = value[0]
    if (isRecord(first) && "hash" in first) {
      const hash = typeof first.hash === "string" ? first.hash : String(first.hash)
      return `array(len=${value.length}, firstHash=${hash})`
    }
    return `array(len=${value.length})`
  }
  if (isRecord(value)) {
    if ("hash" in value) {
      const hash = typeof value.hash === "string" ? value.hash : String(value.hash)
      return `object(hash=${hash})`
    }
    if ("symbol" in value) {
      const symbol = typeof value.symbol === "string" ? value.symbol : String(value.symbol)
      return `object(symbol=${symbol})`
    }
    return "object"
  }
  return String(value)
}

function debugLog(message: string, ...args: Array<string | number | boolean>): void {
  logChainEffectDebug(message, ...args)
}

/** 兼容旧 API 的 StreamInstance 接口 */
export interface StreamInstance<TInput, TOutput> {
  readonly name: string
  fetch(input: TInput): Promise<TOutput>
  subscribe(
    input: TInput,
    callback: (data: TOutput, event: "initial" | "update") => void,
    onError?: (error: unknown) => void
  ): () => void
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
    return stableStringify(input)
  }

  const getOrCreateSource = async (input: TInput): Promise<DataSource<TOutput>> => {
    const key = getInputKey(input)
    const cached = sources.get(key)
    if (cached) {
      cached.refCount++
      debugLog(`${name} reuse source`, key, `refs=${cached.refCount}`)
      return cached.source
    }

    debugLog(`${name} create source`, key)
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
      try {
        const value = await Effect.runPromise(source.get)
        if (value === null) {
          // 强制刷新获取
          return Effect.runPromise(source.refresh)
        }
        return value
      } finally {
        releaseSource(input)
      }
    },

    subscribe(
      input: TInput,
      callback: (data: TOutput, event: "initial" | "update") => void,
      onError?: (error: unknown) => void
    ): () => void {
      let cancelled = false
      let cleanup: (() => void) | null = null

      debugLog(`${name} subscribe`, getInputKey(input))
      getOrCreateSource(input).then((source) => {
        if (cancelled) {
          releaseSource(input)
          return
        }

        let isFirst = true
        const program = Stream.runForEach(source.changes, (value) =>
          Effect.sync(() => {
            if (cancelled) return
            debugLog(
              `${name} emit`,
              isFirst ? "initial" : "update",
              summarizeValue(value)
            )
            callback(value, isFirst ? "initial" : "update")
            isFirst = false
          })
        ).pipe(
          Effect.catchAllCause((cause) =>
            Effect.sync(() => {
              if (cancelled) return
              debugLog(`${name} changes stream failed`, formatChainEffectError(cause))
              onError?.(cause)
            })
          )
        )

        const fiber = Effect.runFork(program)

        cleanup = () => {
          Effect.runFork(Fiber.interrupt(fiber))
          releaseSource(input)
        }
      }).catch((err) => {
        debugLog(`${name} getOrCreateSource failed`, formatChainEffectError(err))
        onError?.(err)
      })

      return () => {
        cancelled = true
        cleanup?.()
      }
    },

    useState(input: TInput, options?: { enabled?: boolean }) {
      const [isLoading, setIsLoading] = useState(true)
      const [isFetching, setIsFetching] = useState(false)
      const [error, setError] = useState<Error | undefined>(undefined)

      const inputKey = useMemo(() => getInputKey(input), [input])
      const inputRef = useRef(input)
      inputRef.current = input

      const enabled = options?.enabled !== false
      const instanceRef = useRef(this)
      
      // 使用 ref 存储最新值供 useSyncExternalStore 使用
      const snapshotRef = useRef<TOutput | undefined>(undefined)

      // useSyncExternalStore 订阅函数
      const subscribe = useCallback((onStoreChange: () => void) => {
        if (!enabled) {
          snapshotRef.current = undefined
          return () => {}
        }
        
        setIsLoading(true)
        setIsFetching(true)
        setError(undefined)

        debugLog(`${name} subscribe`, inputKey)
        debugLog(`${name} subscribe`, inputKey)
        const unsubscribe = instanceRef.current.subscribe(
          inputRef.current,
          (newData: TOutput) => {
            snapshotRef.current = newData
            setIsLoading(false)
            setIsFetching(false)
            setError(undefined)
            debugLog(`${name} storeChange`, summarizeValue(newData))
            onStoreChange()
          }
        )

        return unsubscribe
      }, [enabled, inputKey])

      const getSnapshot = useCallback(() => snapshotRef.current, [])

      // 使用 useSyncExternalStore 订阅外部状态 (React 18+ 推荐)
      const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

      const refetch = useCallback(async () => {
        if (!enabled) return
        setIsFetching(true)
        setError(undefined)
        try {
          const source = await getOrCreateSource(inputRef.current)
          const result = await Effect.runPromise(source.refresh)
          snapshotRef.current = result
        } catch (err) {
          setError(err instanceof Error ? err : new Error(String(err)))
        } finally {
          setIsFetching(false)
          setIsLoading(false)
        }
      }, [enabled])

      // 处理 disabled 状态
      useEffect(() => {
        if (!enabled) {
          snapshotRef.current = undefined
          setIsLoading(false)
          setIsFetching(false)
          setError(undefined)
        }
      }, [enabled])

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
    return stableStringify(input)
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
        Effect.runFork(Fiber.interrupt(fiber))
      }
    },

    useState(input: TInput, options?: { enabled?: boolean }) {
      const [isLoading, setIsLoading] = useState(true)
      const [isFetching, setIsFetching] = useState(false)
      const [error, setError] = useState<Error | undefined>(undefined)

      const inputKey = useMemo(() => getInputKey(input), [input])
      const inputRef = useRef(input)
      inputRef.current = input

      const enabled = options?.enabled !== false
      const instanceRef = useRef(this)
      
      // 使用 ref 存储最新值供 useSyncExternalStore 使用
      const snapshotRef = useRef<TOutput | undefined>(undefined)

      // useSyncExternalStore 订阅函数
      const subscribe = useCallback((onStoreChange: () => void) => {
        if (!enabled) {
          snapshotRef.current = undefined
          return () => {}
        }

        // 检查缓存
        const key = inputKey
        const cached = cache.get(key)
        if (cached && Date.now() - cached.timestamp < ttl) {
          snapshotRef.current = cached.value
          setIsLoading(false)
        } else {
          setIsLoading(true)
        }
        setIsFetching(true)
        setError(undefined)

        const unsubscribe = instanceRef.current.subscribe(
          inputRef.current,
          (newData: TOutput) => {
            snapshotRef.current = newData
            setIsLoading(false)
            setIsFetching(false)
            setError(undefined)
            onStoreChange()
          }
        )

        return unsubscribe
      }, [enabled, inputKey])

      const getSnapshot = useCallback(() => snapshotRef.current, [])

      // 使用 useSyncExternalStore 订阅外部状态 (React 18+ 推荐)
      const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

      const refetch = useCallback(async () => {
        if (!enabled) return
        setIsFetching(true)
        setError(undefined)
        try {
          cache.delete(getInputKey(inputRef.current))
          const result = await instanceRef.current.fetch(inputRef.current)
          snapshotRef.current = result
        } catch (err) {
          setError(err instanceof Error ? err : new Error(String(err)))
        } finally {
          setIsFetching(false)
          setIsLoading(false)
        }
      }, [enabled])

      // 处理 disabled 状态
      useEffect(() => {
        if (!enabled) {
          snapshotRef.current = undefined
          setIsLoading(false)
          setIsFetching(false)
          setError(undefined)
        }
      }, [enabled])

      return { data, isLoading, isFetching, error, refetch }
    },

    invalidate(): void {
      cache.clear()
    },
  }
}
