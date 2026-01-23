/**
 * React Hooks for Effect Streams
 * 
 * 提供与现有 key-fetch useState 兼容的 API
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Effect, Stream, Fiber, Runtime, Exit } from "effect"

// ==================== Types ====================

export interface UseStreamOptions {
  /** 是否启用（默认 true）*/
  enabled?: boolean
}

export interface UseStreamResult<T, E = unknown> {
  /** 当前数据 */
  data: T | undefined
  /** 是否正在加载（首次）*/
  isLoading: boolean
  /** 是否正在获取（包括后台刷新）*/
  isFetching: boolean
  /** 错误信息 */
  error: E | undefined
  /** 手动刷新 */
  refetch: () => Promise<void>
}

export interface UseEffectOptions {
  enabled?: boolean
}

export interface UseEffectResult<T, E = unknown> {
  data: T | undefined
  isLoading: boolean
  error: E | undefined
  refetch: () => Promise<void>
}

// ==================== Runtime ====================

/** 全局 Runtime（可被覆盖）*/
let globalRuntime = Runtime.defaultRuntime

export function setGlobalRuntime(runtime: Runtime.Runtime<never>): void {
  globalRuntime = runtime
}

// ==================== Hooks ====================

/**
 * 订阅 Effect Stream，返回最新值
 * 
 * @example
 * ```tsx
 * const balance$ = createBalanceStream(address)
 * const { data, isLoading, error } = useStream(balance$)
 * ```
 */
export function useStream<T, E>(
  stream: Stream.Stream<T, E>,
  options?: UseStreamOptions
): UseStreamResult<T, E> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<E | undefined>(undefined)
  
  const fiberRef = useRef<Fiber.RuntimeFiber<void, E> | null>(null)
  const enabled = options?.enabled !== false

  const cleanup = useCallback(() => {
    if (fiberRef.current) {
      Runtime.runFork(globalRuntime)(Fiber.interrupt(fiberRef.current))
      fiberRef.current = null
    }
  }, [])

  const subscribe = useCallback(() => {
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

    const program = Stream.runForEach(stream, (value) =>
      Effect.sync(() => {
        setData(value)
        setIsLoading(false)
        setIsFetching(false)
        setError(undefined)
      })
    ).pipe(
      Effect.catchAll((e) =>
        Effect.sync(() => {
          setError(e)
          setIsLoading(false)
          setIsFetching(false)
        })
      )
    )

    fiberRef.current = Runtime.runFork(globalRuntime)(program)
  }, [stream, enabled])

  useEffect(() => {
    subscribe()
    return cleanup
  }, [subscribe, cleanup])

  const refetch = useCallback(async () => {
    cleanup()
    subscribe()
  }, [cleanup, subscribe])

  return { data, isLoading, isFetching, error, refetch }
}

/**
 * 执行单次 Effect，返回结果
 * 
 * @example
 * ```tsx
 * const fetchBalance = Effect.promise(() => fetch('/balance'))
 * const { data, isLoading, error } = useEffect(fetchBalance)
 * ```
 */
export function useEffectOnce<T, E>(
  effect: Effect.Effect<T, E>,
  deps: unknown[] = [],
  options?: UseEffectOptions
): UseEffectResult<T, E> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<E | undefined>(undefined)

  const enabled = options?.enabled !== false
  const depsKey = useMemo(() => JSON.stringify(deps), [deps])

  const run = useCallback(async () => {
    if (!enabled) {
      setData(undefined)
      setIsLoading(false)
      setError(undefined)
      return
    }

    setIsLoading(true)
    setError(undefined)

    const exit = await Runtime.runPromiseExit(globalRuntime)(effect)
    
    if (Exit.isSuccess(exit)) {
      setData(exit.value)
      setError(undefined)
    } else {
      const cause = exit.cause
      // 提取第一个错误
      const firstError = cause._tag === "Fail" ? cause.error : undefined
      setError(firstError as E)
    }
    setIsLoading(false)
  }, [effect, enabled])

  useEffect(() => {
    run()
  }, [depsKey, enabled])

  return { data, isLoading, error, refetch: run }
}

/**
 * 创建带参数的 Stream Hook 工厂
 * 
 * @example
 * ```tsx
 * const useBalance = createStreamHook((address: string) => 
 *   createBalanceStream(address)
 * )
 * 
 * // 在组件中使用
 * const { data } = useBalance('0x...')
 * ```
 */
export function createStreamHook<TParams, TOutput, TError = unknown>(
  factory: (params: TParams) => Stream.Stream<TOutput, TError>
) {
  return function useStreamHook(
    params: TParams,
    options?: UseStreamOptions
  ): UseStreamResult<TOutput, TError> {
    const paramsKey = useMemo(() => JSON.stringify(params), [params])
    const stream = useMemo(() => factory(params), [paramsKey])
    return useStream(stream, options)
  }
}
