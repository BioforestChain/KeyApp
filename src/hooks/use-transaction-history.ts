import { useState, useCallback, useEffect } from 'react'
import type { ChainType } from '@/stores'
import type { TransactionInfo } from '@/components/transaction/transaction-item'
import { Amount } from '@/types/amount'
import { transactionService, type TransactionRecord as ServiceTransactionRecord, type TransactionFilter as ServiceFilter } from '@/services/transaction'

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

/** Hook 返回类型 */
export interface UseTransactionHistoryResult {
  transactions: TransactionRecord[]
  isLoading: boolean
  error: string | undefined
  filter: TransactionFilter
  setFilter: (filter: TransactionFilter) => void
  refresh: () => Promise<void>
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

/** 交易历史 Hook */
export function useTransactionHistory(walletId?: string): UseTransactionHistoryResult {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [filter, setFilter] = useState<TransactionFilter>({ chain: 'all', period: 'all' })

  // 获取交易历史
  const fetchTransactions = useCallback(async () => {
    if (!walletId) {
      setTransactions([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(undefined)

    try {
      const serviceFilter: ServiceFilter = {
        chain: filter.chain ?? 'all',
        period: filter.period ?? 'all',
        type: undefined,
        status: undefined,
      }
      const rawRecords = await transactionService.getHistory({ walletId, filter: serviceFilter })
      // Convert raw API data (string amounts) to Amount objects
      const records: ServiceTransactionRecord[] = rawRecords.map((r) => ({
        ...r,
        amount: Amount.fromRaw(r.amount as unknown as string, r.decimals, r.symbol),
        fee: r.fee ? Amount.fromRaw(r.fee as unknown as string, r.feeDecimals ?? r.decimals, r.feeSymbol) : undefined,
      }))
      setTransactions(records.map(convertToComponentFormat))
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载交易历史失败')
    } finally {
      setIsLoading(false)
    }
  }, [walletId, filter])

  // 初始加载和过滤器变化时重新获取
  useEffect(() => {
    void fetchTransactions()
  }, [fetchTransactions])

  // 刷新
  const refresh = useCallback(async () => {
    await fetchTransactions()
  }, [fetchTransactions])

  return {
    transactions,
    isLoading,
    error,
    filter,
    setFilter,
    refresh,
  }
}
