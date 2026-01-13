import { useState, useCallback, useEffect } from 'react'
import { useKeyFetch } from '@biochain/key-fetch'
import { walletStore, type ChainType } from '@/stores'
import { chainConfigService } from '@/services/chain-config'
import type { TransactionInfo } from '@/components/transaction/transaction-item'
import type { Amount } from '@/types/amount'
import { Amount as AmountClass } from '@/types/amount'
import {
  type TransactionRecord as ServiceTransactionRecord,
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
  feeDecimals: number | undefined
  blockNumber: number | undefined
  confirmations: number | undefined
  from: ServiceTransactionRecord['from']
  to: ServiceTransactionRecord['to']
  action: ServiceTransactionRecord['action']
  direction: ServiceTransactionRecord['direction']
  assets: ServiceTransactionRecord['assets']
  contract: ServiceTransactionRecord['contract']
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

/** API 响应类型 */
interface TransactionQueryResponse {
  success: boolean
  result?: {
    trs?: Array<{
      height: number
      signature: string
      tIndex: number
      transaction: {
        signature: string
        senderId: string
        recipientId?: string
        fee: string
        timestamp: number
        type: string
        asset?: {
          transferAsset?: {
            amount: string
            assetType: string
          }
        }
      }
    }>
    count?: number
  }
}

/**
 * 构建交易历史查询 URL
 */
function buildTransactionHistoryUrl(
  chain: ChainType | undefined,
  address: string | undefined
): string | null {
  if (!chain || !address) return null
  const baseUrl = chainConfigService.getApiUrl(chain)
  if (!baseUrl) return null
  // 使用 POST body 的参数作为 URL 的一部分来区分不同查询
  return `${baseUrl}/transactions/query?address=${address}&limit=50`
}

/**
 * Transaction History Query Hook
 *
 * 特性：
 * - 基于 keyFetch 的响应式订阅
 * - 按需订阅：默认只查询当前选中的链（而不是 'all'）
 * - 当 lastblock 更新时自动刷新
 * - 支持按链/时间筛选
 */
export function useTransactionHistoryQuery(walletId?: string) {
  // 获取当前选中的链
  const selectedChain = walletStore.state.selectedChain
  
  // 默认使用当前选中的链，而不是 'all'
  const [filter, setFilter] = useState<TransactionFilter>({ 
    chain: selectedChain, 
    period: 'all' 
  })
  
  // 当 selectedChain 变化时，更新 filter
  useEffect(() => {
    if (filter.chain !== 'all') {
      setFilter(prev => ({ ...prev, chain: selectedChain }))
    }
  }, [selectedChain, filter.chain])

  // 获取要查询的链（如果是 'all'，则使用当前选中的链）
  const targetChain = filter.chain === 'all' ? selectedChain : filter.chain
  
  // 获取当前链的地址
  const wallet = walletStore.state.wallets.find(w => w.id === walletId)
  const chainAddress = wallet?.chainAddresses.find(ca => ca.chain === targetChain)
  const address = chainAddress?.address

  // 构建订阅 URL
  const url = buildTransactionHistoryUrl(targetChain, address)

  // 使用 keyFetch 订阅交易历史
  const { data, isLoading, isFetching, error, refetch } = useKeyFetch<TransactionQueryResponse>(
    url,
    {
      enabled: !!walletId && !!targetChain && !!address,
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          page: 1,
          pageSize: 50,
          sort: -1,
        }),
      },
    }
  )

  // 将 API 响应转换为 TransactionRecord 格式
  const transactions: TransactionRecord[] = data?.success && data.result?.trs
    ? data.result.trs.map(item => {
        const tx = item.transaction
        const decimals = chainConfigService.getDecimals(targetChain!)
        const symbol = chainConfigService.getSymbol(targetChain!)
        const amountRaw = tx.asset?.transferAsset?.amount ?? '0'
        
        return {
          id: `${targetChain}--${tx.signature}`,
          type: 'send' as const,
          status: 'confirmed' as const,
          amount: AmountClass.fromRaw(amountRaw, decimals, symbol),
          symbol,
          address: tx.recipientId ?? tx.senderId,
          timestamp: new Date(tx.timestamp),
          hash: tx.signature,
          chain: targetChain!,
          fee: AmountClass.fromRaw(tx.fee, decimals, symbol),
          feeSymbol: symbol,
          feeDecimals: decimals,
          blockNumber: item.height,
          confirmations: 1,
          from: tx.senderId,
          to: tx.recipientId,
          action: 'transfer' as const,
          direction: 'out' as const,
          assets: [],
          contract: undefined,
        }
      })
    : []

  // 按时间过滤
  const filteredTransactions = filterByPeriod(transactions, filter.period)

  const refresh = useCallback(async () => {
    await refetch()
  }, [refetch])

  return {
    transactions: filteredTransactions,
    isLoading,
    isFetching,
    error: error?.message,
    filter,
    setFilter,
    refresh,
  }
}

/** 按时间过滤 */
function filterByPeriod(records: TransactionRecord[], period: TransactionFilter['period']): TransactionRecord[] {
  if (!period || period === 'all') return records
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return records.filter((tx) => tx.timestamp.getTime() >= cutoff)
}

/**
 * 手动刷新交易历史
 */
export function useRefreshTransactionHistory() {
  const refresh = useCallback(async (_walletId: string) => {
    // keyFetch 的 invalidate 会自动触发重新获取
    // 这里可以通过 keyFetch.invalidate 来实现
  }, [])

  const refreshAll = useCallback(async () => {
    // 刷新所有交易历史
  }, [])

  return { refresh, refreshAll }
}
