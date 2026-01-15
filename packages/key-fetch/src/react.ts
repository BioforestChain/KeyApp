/**
 * Key-Fetch React Hooks
 * 
 * 基于工厂模式的 React 集成
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { injectUseState } from './core'
import type {
  KeyFetchInstance,
  AnyZodSchema,
  InferOutput,
  FetchParams,
  UseKeyFetchResult,
  UseKeyFetchOptions,
} from './types'

/**
 * 稳定化 params 对象，避免每次渲染产生新引用
 * 使用 JSON.stringify 作为比较依据
 */
function useStableParams(params: FetchParams | undefined): FetchParams | undefined {
  const paramsStringRef = useRef<string>('')
  const stableParamsRef = useRef<FetchParams | undefined>(params)

  const paramsString = JSON.stringify(params ?? {})

  if (paramsString !== paramsStringRef.current) {
    paramsStringRef.current = paramsString
    stableParamsRef.current = params
  }

  return stableParamsRef.current
}

/**
 * 响应式数据获取 Hook
 * 
 * 订阅 KeyFetch 实例的数据变化，当数据更新时自动重新渲染
 * 
 * @example
 * ```tsx
 * // 在 chain-provider 中定义
 * const lastBlockFetch = keyFetch.create({
 *   name: 'bfmeta.lastblock',
 *   schema: LastBlockSchema,
 *   url: 'https://api.bfmeta.info/wallet/:chainId/lastblock',
 *   use: [interval(15_000)],
 * })
 * 
 * // 在组件中使用
 * function BlockHeight() {
 *   const { data, isLoading } = useKeyFetch(lastBlockFetch, { chainId: 'bfmeta' })
 *   
 *   if (isLoading) return <div>Loading...</div>
 *   return <div>Height: {data?.result.height}</div>
 * }
 * ```
 */
export function useKeyFetch<S extends AnyZodSchema>(
  kf: KeyFetchInstance<S>,
  params?: FetchParams,
  options?: UseKeyFetchOptions
): UseKeyFetchResult<InferOutput<S>> {
  type T = InferOutput<S>

  const [data, setData] = useState<T | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)

  // 稳定化 params，避免每次渲染产生新引用导致无限循环
  const stableParams = useStableParams(params)
  const paramsRef = useRef(stableParams)
  paramsRef.current = stableParams

  const enabled = options?.enabled !== false

  // 错误退避：连续错误时延迟重试
  const errorCountRef = useRef(0)
  const lastFetchTimeRef = useRef(0)

  const refetch = useCallback(async () => {
    if (!enabled) return

    setIsFetching(true)
    setError(undefined)

    try {
      const result = await kf.fetch(paramsRef.current ?? {}, { skipCache: true })
      setData(result)
      errorCountRef.current = 0 // 成功时重置错误计数
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      errorCountRef.current++
    } finally {
      setIsFetching(false)
      setIsLoading(false)
    }
  }, [kf, enabled])

  // 使用 stableParams 的字符串表示作为依赖
  const paramsKey = useMemo(() => JSON.stringify(stableParams ?? {}), [stableParams])

  useEffect(() => {
    if (!enabled) {
      setData(undefined)
      setIsLoading(false)
      setIsFetching(false)
      setError(undefined)
      return
    }

    // 防抖：如果距离上次请求太近，跳过
    const now = Date.now()
    const timeSinceLastFetch = now - lastFetchTimeRef.current
    if (timeSinceLastFetch < 100 && errorCountRef.current > 0) {
      // 在错误状态下，短时间内不重复请求
      return
    }
    lastFetchTimeRef.current = now

    // 捕获当前 params（避免闭包问题）
    const currentParams = paramsRef.current ?? {}

    setIsLoading(true)
    setIsFetching(true)
    setError(undefined)

    let isCancelled = false

    // 初始获取数据（带错误处理）
    kf.fetch(currentParams)
      .then((result) => {
        if (isCancelled) return
        setData(result)
        setIsLoading(false)
        setIsFetching(false)
        errorCountRef.current = 0
      })
      .catch((err) => {
        if (isCancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsLoading(false)
        setIsFetching(false)
        errorCountRef.current++
      })

    // 订阅后续更新（带错误处理）
    const unsubscribe = kf.subscribe(currentParams, (newData, _event) => {
      if (isCancelled) return
      try {
        setData(newData)
        setIsLoading(false)
        setIsFetching(false)
        setError(undefined)
        errorCountRef.current = 0
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    })

    return () => {
      isCancelled = true
      unsubscribe()
    }
    // 只依赖 paramsKey（string），避免对象引用变化导致重复执行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kf, enabled, paramsKey])

  return { data, isLoading, isFetching, error, refetch }
}

/**
 * 订阅 Hook（不返回数据，只订阅）
 * 
 * 用于需要监听数据变化但不需要渲染数据的场景
 * 
 * @example
 * ```tsx
 * function PendingTxWatcher() {
 *   useKeyFetchSubscribe(lastBlockFetch, { chainId: 'bfmeta' }, (data) => {
 *     // 区块更新时检查 pending 交易
 *     checkPendingTransactions(data.result.height)
 *   })
 *   
 *   return null
 * }
 * ```
 */
export function useKeyFetchSubscribe<S extends AnyZodSchema>(
  kf: KeyFetchInstance<S>,
  params: FetchParams | undefined,
  callback: (data: InferOutput<S>, event: 'initial' | 'update') => void
): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  // 稳定化 params
  const stableParams = useStableParams(params)
  const paramsRef = useRef(stableParams)
  paramsRef.current = stableParams
  const paramsKey = useMemo(() => JSON.stringify(stableParams ?? {}), [stableParams])

  useEffect(() => {
    const currentParams = paramsRef.current ?? {}
    const unsubscribe = kf.subscribe(currentParams, (data, event) => {
      callbackRef.current(data, event)
    })

    return () => {
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kf, paramsKey])
}

// ==================== 注入 useState 实现 ====================

/**
 * 内部 useState 实现
 * 复用 useKeyFetch 逻辑，供 KeyFetchInstance.useState() 调用
 */
function useStateImpl<S extends AnyZodSchema>(
  kf: KeyFetchInstance<S>,
  params?: FetchParams,
  options?: { enabled?: boolean }
): UseKeyFetchResult<InferOutput<S>> {
  return useKeyFetch(kf, params, options)
}

// 注入到 KeyFetchInstance.prototype
injectUseState(useStateImpl)
