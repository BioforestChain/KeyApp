/**
 * Hook for fetching contract pool statistics
 */

import { useState, useEffect, useCallback } from 'react'
import { rechargeApi } from '@/api'
import type { InternalChainName, RechargeContractPoolItem } from '@/api/types'

export interface ContractPoolState {
  poolInfo: RechargeContractPoolItem[]
  isLoading: boolean
  error: string | null
}

export function useContractPool(internalChainName?: InternalChainName) {
  const [state, setState] = useState<ContractPoolState>({
    poolInfo: [],
    isLoading: false,
    error: null,
  })

  const fetchPoolInfo = useCallback(async () => {
    if (!internalChainName) return

    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const res = await rechargeApi.getContractPoolInfo({ internalChainName })
      setState({ poolInfo: res.poolInfo, isLoading: false, error: null })
    } catch (err) {
      setState({
        poolInfo: [],
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load pool info',
      })
    }
  }, [internalChainName])

  useEffect(() => {
    fetchPoolInfo()
  }, [fetchPoolInfo])

  return {
    ...state,
    refetch: fetchPoolInfo,
  }
}
