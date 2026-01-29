import { useEffect, useMemo, useRef, useState } from 'react'
import { rechargeApi } from '@/api'
import type { ContractTokenInfo } from '@/api/types'

export interface TokenInfoTarget {
  chain: string
  address?: string | null
}

export function getTokenInfoKey(chain: string, address: string): string {
  return `${chain}:${address.toLowerCase()}`
}

export function useTokenInfoMap(targets: TokenInfoTarget[]) {
  const [tokenInfoMap, setTokenInfoMap] = useState<Record<string, ContractTokenInfo>>({})
  const [loadingMap, setLoadingMap] = useState<Record<string, true>>({})
  const tokenInfoRef = useRef(tokenInfoMap)
  const loadingRef = useRef(new Set<string>())
  const mountedRef = useRef(true)

  useEffect(() => {
    tokenInfoRef.current = tokenInfoMap
  }, [tokenInfoMap])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const targetKeys = useMemo(() => {
    return targets
      .map((target) => {
        const address = target.address?.trim()
        if (!address) return null
        return getTokenInfoKey(target.chain, address)
      })
      .filter((key): key is string => Boolean(key))
      .sort()
      .join('|')
  }, [targets])

  useEffect(() => {
    let cancelled = false

    const toFetch = targets
      .map((target) => {
        const address = target.address?.trim()
        if (!address) return null
        const key = getTokenInfoKey(target.chain, address)
        return { key, chain: target.chain, address }
      })
      .filter((entry): entry is { key: string; chain: string; address: string } => Boolean(entry))
      .filter((entry) => !tokenInfoRef.current[entry.key] && !loadingRef.current.has(entry.key))

    if (toFetch.length === 0) return

    const toFetchKeys = new Set(toFetch.map((entry) => entry.key))

    const clearLoading = () => {
      loadingRef.current = new Set([...loadingRef.current].filter((key) => !toFetchKeys.has(key)))
      if (!mountedRef.current) return
      setLoadingMap((prev) => {
        const next = { ...prev }
        toFetch.forEach((entry) => {
          delete next[entry.key]
        })
        return next
      })
    }

    toFetch.forEach((entry) => loadingRef.current.add(entry.key))
    setLoadingMap((prev) => {
      const next = { ...prev }
      toFetch.forEach((entry) => {
        next[entry.key] = true
      })
      return next
    })

    Promise.all(
      toFetch.map(async (entry) => {
        try {
          const info = await rechargeApi.getTokenInfo({
            contractAddress: entry.address,
            chainName: entry.chain,
          })
          return { key: entry.key, info }
        } catch {
          return null
        }
      }),
    )
      .then((results) => {
        if (cancelled) return
        setTokenInfoMap((prev) => {
          const next = { ...prev }
          results.forEach((result) => {
            if (result) {
              next[result.key] = result.info
            }
          })
          return next
        })
      })
      .finally(() => {
        clearLoading()
      })

    return () => {
      cancelled = true
      clearLoading()
    }
  }, [targets, targetKeys])

  return { tokenInfoMap, loadingMap }
}
