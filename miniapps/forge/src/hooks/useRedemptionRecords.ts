/**
 * Hook for fetching redemption records
 * 赎回记录查询
 */

import { useState, useCallback } from 'react'
import { redemptionApi } from '@/api'
import type {
  RedemptionRecord,
  RedemptionRecordDetailResDto,
} from '@/api/types'

export interface RedemptionRecordsState {
  records: RedemptionRecord[]
  total: number
  isLoading: boolean
  error: string | null
}

export interface FetchRedemptionRecordsParams {
  page?: number
  pageSize?: number
  internalChain?: string
  internalAddress?: string
}

export function useRedemptionRecords() {
  const [state, setState] = useState<RedemptionRecordsState>({
    records: [],
    total: 0,
    isLoading: false,
    error: null,
  })

  const fetchRecords = useCallback(async (params: FetchRedemptionRecordsParams = {}) => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const res = await redemptionApi.getRecords({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        internalChain: params.internalChain,
        internalAddress: params.internalAddress,
      })
      setState({
        records: res.list,
        total: res.total,
        isLoading: false,
        error: null,
      })
    } catch (err) {
      setState({
        records: [],
        total: 0,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load records',
      })
    }
  }, [])

  return {
    ...state,
    fetchRecords,
  }
}

export interface RedemptionRecordDetailState {
  detail: RedemptionRecordDetailResDto | null
  isLoading: boolean
  error: string | null
}

export function useRedemptionRecordDetail() {
  const [state, setState] = useState<RedemptionRecordDetailState>({
    detail: null,
    isLoading: false,
    error: null,
  })

  const fetchDetail = useCallback(async (orderId: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const res = await redemptionApi.getRecordDetail({ orderId })
      setState({ detail: res, isLoading: false, error: null })
    } catch (err) {
      setState({
        detail: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load detail',
      })
    }
  }, [])

  const retryInternal = useCallback(async (orderId: string) => {
    try {
      await redemptionApi.retryInternal({ orderId })
      await fetchDetail(orderId)
      return true
    } catch {
      return false
    }
  }, [fetchDetail])

  const retryExternal = useCallback(async (orderId: string) => {
    try {
      await redemptionApi.retryExternal({ orderId })
      await fetchDetail(orderId)
      return true
    } catch {
      return false
    }
  }, [fetchDetail])

  return {
    ...state,
    fetchDetail,
    retryInternal,
    retryExternal,
  }
}
