/**
 * Key-Fetch React Hooks
 * 
 * 基于工厂模式的 React 集成
 */

import { useState, useEffect, useCallback, useRef } from 'react'
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

  const paramsRef = useRef(params)
  paramsRef.current = params

  const enabled = options?.enabled !== false

  const refetch = useCallback(async () => {
    if (!enabled) return

    setIsFetching(true)
    setError(undefined)

    try {
      const result = await kf.fetch(paramsRef.current ?? {}, { skipCache: true })
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsFetching(false)
      setIsLoading(false)
    }
  }, [kf, enabled])

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

    const unsubscribe = kf.subscribe(params ?? {}, (newData, _event) => {
      setData(newData)
      setIsLoading(false)
      setIsFetching(false)
      setError(undefined)
    })

    return () => {
      unsubscribe()
    }
  }, [kf, enabled, JSON.stringify(params)])

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

  useEffect(() => {
    const unsubscribe = kf.subscribe(params ?? {}, (data, event) => {
      callbackRef.current(data, event)
    })

    return () => {
      unsubscribe()
    }
  }, [kf, JSON.stringify(params)])
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

