/**
 * Key-Fetch React Hooks
 * 
 * React 集成，提供响应式数据获取
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { keyFetch } from './index'
import type { KeyFetchOptions } from './types'

export interface UseKeyFetchResult<T> {
  /** 数据 */
  data: T | undefined
  /** 是否正在加载 */
  isLoading: boolean
  /** 错误信息 */
  error: Error | undefined
  /** 手动刷新 */
  refetch: () => Promise<void>
}

/**
 * 响应式数据获取 Hook
 * 
 * 自动订阅 URL 的数据变化，当数据更新时自动重新渲染
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
 * ```
 */
export function useKeyFetch<T>(
  url: string | null | undefined,
  options?: KeyFetchOptions
): UseKeyFetchResult<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)
  
  const optionsRef = useRef(options)
  optionsRef.current = options

  const refetch = useCallback(async () => {
    if (!url) return
    
    setIsLoading(true)
    setError(undefined)
    
    try {
      const result = await keyFetch<T>(url, { ...optionsRef.current, skipCache: true })
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (!url) {
      setData(undefined)
      setIsLoading(false)
      setError(undefined)
      return
    }

    setIsLoading(true)
    setError(undefined)

    // 订阅数据变化
    const unsubscribe = keyFetch.subscribe<T>(
      url,
      (newData, event) => {
        setData(newData)
        setIsLoading(false)
        setError(undefined)
      },
      optionsRef.current
    )

    return () => {
      unsubscribe()
    }
  }, [url])

  return { data, isLoading, error, refetch }
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
