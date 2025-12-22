import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import type { ChainType } from '@/stores'
import type { TransactionInfo } from '@/components/transaction/transaction-item'
import type { Amount } from '@/types/amount'
import {
  transactionService,
  type TransactionRecord as ServiceTransactionRecord,
  type TransactionFilter as ServiceFilter,
} from '@/services/transaction'

/** 交易历史过滤器 */
export interface TransactionFilter {
  chain?: ChainType | 'all' | undefined
  period?: '7d' | '30d' | '90d' | 'all' | undefined
}

/** 扩展的交易信息（包含链类型）- 保持与组件兼容 */
export interface TransactionRecord extends TransactionInfo {
  chain: ChainType
  fee: Amount | undefined
  feeSymbol: string | undefined
  blockNumber: number | undefined
  confirmations: number | undefined
}

/**
 * Transaction History Query Keys
 */
export const transactionHistoryKeys = {
  all: ['transactionHistory'] as const,
  wallet: (walletId: string) => ['transactionHistory', walletId] as const,
  filtered: (walletId: string, filter: TransactionFilter) =>
    ['transactionHistory', walletId, filter] as const,
}

/** 将 Service 记录转换为组件兼容格式 */
function convertToComponentFormat(record: ServiceTransactionRecord): TransactionRecord {
  return {
    id: record.id,
    type: record.type,
    status: record.status,
    amount: record.amount,
    symbol: record.symbol,
    address: record.address,
    timestamp: record.timestamp,
    hash: record.hash,
    chain: record.chain,
    fee: record.fee,
    feeSymbol: record.feeSymbol,
    blockNumber: record.blockNumber,
    confirmations: record.confirmations,
  }
}

/**
 * Transaction History Query Hook
 *
 * 特性：
 * - 30s staleTime：Tab 切换不重复请求
 * - 支持按链/时间筛选
 * - 共享缓存：多个组件使用同一 key 时共享数据
 * - 自动请求去重
 */
export function useTransactionHistoryQuery(walletId?: string) {
  const [filter, setFilter] = useState<TransactionFilter>({ chain: 'all', period: 'all' })
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: transactionHistoryKeys.filtered(walletId ?? '', filter),
    queryFn: async (): Promise<TransactionRecord[]> => {
      if (!walletId) return []

      const serviceFilter: ServiceFilter = {
        chain: filter.chain ?? 'all',
        period: filter.period ?? 'all',
        type: undefined,
        status: undefined,
      }

      const records = await transactionService.getHistory({ walletId, filter: serviceFilter })
      return records.map(convertToComponentFormat)
    },
    enabled: !!walletId,
    staleTime: 30 * 1000, // 30 秒内认为数据新鲜
    gcTime: 5 * 60 * 1000, // 5 分钟缓存
    refetchOnWindowFocus: true,
  })

  const refresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: transactionHistoryKeys.wallet(walletId ?? ''),
    })
  }

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message,
    filter,
    setFilter,
    refresh,
  }
}

/**
 * 手动刷新交易历史
 */
export function useRefreshTransactionHistory() {
  const queryClient = useQueryClient()

  return {
    refresh: async (walletId: string) => {
      await queryClient.invalidateQueries({
        queryKey: transactionHistoryKeys.wallet(walletId),
      })
    },
    refreshAll: async () => {
      await queryClient.invalidateQueries({
        queryKey: transactionHistoryKeys.all,
      })
    },
  }
}
