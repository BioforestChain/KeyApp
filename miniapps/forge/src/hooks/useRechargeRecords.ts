/**
 * Hook for fetching recharge records
 */

import { useState, useCallback } from 'react'
import { rechargeApi } from '@/api'
import type {
  InternalChainName,
  RECHARGE_RECORD_STATE,
  RechargeRecord,
  RechargeRecordDetailResDto,
} from '@/api/types'

export interface RechargeRecordsState {
  records: RechargeRecord[]
  total: number
  isLoading: boolean
  error: string | null
}

export interface FetchRecordsParams {
  page?: number
  pageSize?: number
  internalChain?: InternalChainName
  internalAddress?: string
  recordState?: RECHARGE_RECORD_STATE
}

export function useRechargeRecords() {
  const [state, setState] = useState<RechargeRecordsState>({
    records: [],
    total: 0,
    isLoading: false,
    error: null,
  })

  const fetchRecords = useCallback(async (params: FetchRecordsParams = {}) => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const res = await rechargeApi.getRecords({
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        internalChain: params.internalChain,
        internalAddress: params.internalAddress,
        recordState: params.recordState,
      })
      setState({
        records: res.dataList,
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

export interface RecordDetailState {
  detail: RechargeRecordDetailResDto | null
  isLoading: boolean
  error: string | null
}

export function useRechargeRecordDetail() {
  const [state, setState] = useState<RecordDetailState>({
    detail: null,
    isLoading: false,
    error: null,
  })

  const fetchDetail = useCallback(async (orderId: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const res = await rechargeApi.getRecordDetail({ orderId })
      setState({ detail: res, isLoading: false, error: null })
    } catch (err) {
      setState({
        detail: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load detail',
      })
    }
  }, [])

  const retryExternal = useCallback(async (orderId: string) => {
    try {
      await rechargeApi.retryExternal({ orderId })
      await fetchDetail(orderId)
      return true
    } catch {
      return false
    }
  }, [fetchDetail])

  const retryInternal = useCallback(async (orderId: string) => {
    try {
      await rechargeApi.retryInternal({ orderId })
      await fetchDetail(orderId)
      return true
    } catch {
      return false
    }
  }, [fetchDetail])

  return {
    ...state,
    fetchDetail,
    retryExternal,
    retryInternal,
  }
}
