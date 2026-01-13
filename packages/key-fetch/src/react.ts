/**
 * Key-Fetch React Hooks
 * 
 * React 集成，提供响应式数据获取，完全替代 React Query
 */

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'
import { keyFetch } from './index'
import type { KeyFetchOptions } from './types'

export interface UseKeyFetchResult<T> {
  /** 数据 */
  data: T | undefined
  /** 是否正在加载（首次加载） */
  isLoading: boolean
  /** 是否正在获取（包括后台刷新） */
  isFetching: boolean
  /** 错误信息 */
  error: Error | undefined
  /** 手动刷新 */
  refetch: () => Promise<void>
}

export interface UseKeyFetchOptions extends KeyFetchOptions {
  /** 是否启用查询（默认 true） */
  enabled?: boolean
}

/**
 * 响应式数据获取 Hook
 * 
 * 自动订阅 URL 的数据变化，当数据更新时自动重新渲染
 * 完全替代 React Query 的 useQuery
 * 
 * @example
 * ```tsx
 * function BlockHeight({ chainId }: { chainId: string }) {
 *   const { data: block, isLoading } = useKeyFetch<BlockInfo>(
 *     `https://walletapi.bfmeta.info/wallet/${chainId}/lastblock`
 *   )
 *   
 *   if (isLoading) return <div>Loading...</div>
 *   return <div>Height: {block?.height}</div>
 * }
 * 
 * // 条件查询（类似 React Query 的 enabled）
 * function Balance({ chainId, address }: { chainId?: string; address?: string }) {
 *   const { data } = useKeyFetch<BalanceInfo>(
 *     chainId && address ? `${API}/${chainId}/balance/${address}` : null,
 *     { enabled: !!chainId && !!address }
 *   )
 * }
 * ```
 */
export function useKeyFetch<T>(
  url: string | null | undefined,
  options?: UseKeyFetchOptions
): UseKeyFetchResult<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)
  
  const optionsRef = useRef(options)
  optionsRef.current = options
  
  // enabled 默认为 true
  const enabled = options?.enabled !== false

  const refetch = useCallback(async () => {
    if (!url || !enabled) return
    
    setIsFetching(true)
    setError(undefined)
    
    try {
      const result = await keyFetch<T>(url, { ...optionsRef.current, skipCache: true })
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsFetching(false)
      setIsLoading(false)
    }
  }, [url, enabled])

  useEffect(() => {
    // 如果 url 为空或 enabled 为 false，重置状态
    if (!url || !enabled) {
      setData(undefined)
      setIsLoading(false)
      setIsFetching(false)
      setError(undefined)
      return
    }

    setIsLoading(true)
    setIsFetching(true)
    setError(undefined)

    // 订阅数据变化
    const unsubscribe = keyFetch.subscribe<T>(
      url,
      (newData, event) => {
        setData(newData)
        setIsLoading(false)
        setIsFetching(false)
        setError(undefined)
      },
      optionsRef.current
    )

    return () => {
      unsubscribe()
    }
  }, [url, enabled])

  return { data, isLoading, isFetching, error, refetch }
}

/**
 * 订阅 Hook（不返回数据，只订阅）
 * 
 * 用于需要监听数据变化但不需要渲染数据的场景
 */
export function useKeyFetchSubscribe<T>(
  url: string | null | undefined,
  callback: (data: T, event: 'initial' | 'update') => void,
  options?: KeyFetchOptions
): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    if (!url) return

    const unsubscribe = keyFetch.subscribe<T>(
      url,
      (data, event) => {
        callbackRef.current(data, event)
      },
      optionsRef.current
    )

    return () => {
      unsubscribe()
    }
  }, [url])
}
