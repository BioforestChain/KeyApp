import { useState, useCallback, useMemo } from 'react'
import type { ChainType } from '@/stores'
import type { TransactionInfo, TransactionType, TransactionStatus } from '@/components/transaction/transaction-item'

/** 交易历史过滤器 */
export interface TransactionFilter {
  chain?: ChainType | 'all' | undefined
  period?: '7d' | '30d' | '90d' | 'all' | undefined
}

/** 扩展的交易信息（包含链类型） */
export interface TransactionRecord extends TransactionInfo {
  chain: ChainType
  fee?: string
  feeSymbol?: string
  blockNumber?: number
  confirmations?: number
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

/** 生成随机地址 */
function randomAddress(): string {
  const chars = '0123456789abcdef'
  let addr = '0x'
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)]
  }
  return addr
}

/** 生成随机交易哈希 */
function randomHash(): string {
  const chars = '0123456789abcdef'
  let hash = '0x'
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

/** 生成 mock 交易数据 */
function generateMockTransactions(count: number = 20): TransactionRecord[] {
  const types: TransactionType[] = ['send', 'receive', 'swap', 'stake', 'unstake']
  const statuses: TransactionStatus[] = ['confirmed', 'confirmed', 'confirmed', 'pending', 'failed']
  const chains: ChainType[] = ['ethereum', 'tron', 'bitcoin', 'binance']
  const symbols: Record<ChainType, string[]> = {
    ethereum: ['ETH', 'USDT', 'USDC'],
    tron: ['TRX', 'USDT'],
    bitcoin: ['BTC'],
    binance: ['BNB', 'BUSD'],
    bfmeta: ['BFM'],
    bfchainv2: ['BFC'],
    ccchain: ['CC'],
    pmchain: ['PM'],
    btgmeta: ['BTG'],
    biwmeta: ['BIW'],
    ethmeta: ['ETHM'],
    malibu: ['MAL'],
  }

  const now = Date.now()
  const transactions: TransactionRecord[] = []

  for (let i = 0; i < count; i++) {
    const chain = chains[Math.floor(Math.random() * chains.length)]!
    const chainSymbols = symbols[chain] || ['TOKEN']
    const type = types[Math.floor(Math.random() * types.length)]!
    const status = statuses[Math.floor(Math.random() * statuses.length)]!
    const symbol = chainSymbols[Math.floor(Math.random() * chainSymbols.length)]!

    // 随机时间（过去90天内）
    const daysAgo = Math.floor(Math.random() * 90)
    const timestamp = new Date(now - daysAgo * 24 * 60 * 60 * 1000)

    transactions.push({
      id: `tx-${i}-${Date.now()}`,
      type,
      status,
      amount: (Math.random() * 100).toFixed(type === 'swap' ? 2 : 4),
      symbol,
      address: randomAddress(),
      timestamp,
      hash: randomHash(),
      chain,
      fee: (Math.random() * 0.01).toFixed(6),
      feeSymbol: chain === 'ethereum' ? 'ETH' : chain === 'tron' ? 'TRX' : symbol,
      blockNumber: status === 'confirmed' ? Math.floor(Math.random() * 1000000) + 18000000 : undefined,
      confirmations: status === 'confirmed' ? Math.floor(Math.random() * 100) + 1 : 0,
    } as TransactionRecord)
  }

  // 按时间排序（最新的在前）
  return transactions.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}

/** 根据时间段过滤 */
function filterByPeriod(transactions: TransactionRecord[], period: string): TransactionRecord[] {
  if (period === 'all') return transactions

  const now = Date.now()
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const cutoff = now - days * 24 * 60 * 60 * 1000

  return transactions.filter(tx => new Date(tx.timestamp).getTime() >= cutoff)
}

/** 根据链过滤 */
function filterByChain(transactions: TransactionRecord[], chain: ChainType | 'all'): TransactionRecord[] {
  if (chain === 'all') return transactions
  return transactions.filter(tx => tx.chain === chain)
}

/** 交易历史 Hook */
export function useTransactionHistory(_walletId?: string): UseTransactionHistoryResult {
  const [allTransactions] = useState<TransactionRecord[]>(() => generateMockTransactions(30))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [filter, setFilter] = useState<TransactionFilter>({ chain: 'all', period: 'all' })

  // 过滤后的交易列表
  const transactions = useMemo(() => {
    let result = allTransactions

    if (filter.chain && filter.chain !== 'all') {
      result = filterByChain(result, filter.chain)
    }

    if (filter.period && filter.period !== 'all') {
      result = filterByPeriod(result, filter.period)
    }

    return result
  }, [allTransactions, filter])

  // 刷新（模拟加载）
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(undefined)

    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      // TODO: 实际实现时从链上获取数据
    } catch (e) {
      setError('加载交易历史失败')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    transactions,
    isLoading,
    error,
    filter,
    setFilter,
    refresh,
  }
}
