/**
 * usePendingTransactions Hook
 * 
 * 获取当前钱包的未上链交易列表
 * 使用 key-fetch 的 useState，依赖 blockHeight 自动刷新
 */

import { useCallback } from 'react'
import { getPendingTxFetcher, pendingTxService, pendingTxManager, type PendingTx } from '@/services/transaction'
import { useChainConfigState } from '@/stores'

export function usePendingTransactions(walletId: string | undefined, chainId?: string) {
  const chainConfigState = useChainConfigState()

  // 获取 key-fetch 实例
  const fetcher = walletId && chainId ? getPendingTxFetcher(chainId, walletId) : null

  // 使用 key-fetch 的 useState（自动订阅 blockHeight 变化）
  const { data, isLoading } = fetcher?.useState({}) ?? { data: undefined, isLoading: false }
  const transactions: PendingTx[] = (data as PendingTx[] | undefined) ?? []

  const deleteTransaction = useCallback(async (tx: PendingTx) => {
    await pendingTxService.delete({ id: tx.id })
  }, [])

  const retryTransaction = useCallback(async (tx: PendingTx) => {
    return await pendingTxManager.retryBroadcast(tx.id, chainConfigState)
  }, [chainConfigState])

  const clearAllFailed = useCallback(async () => {
    const failedTxs = transactions.filter((tx: PendingTx) => tx.status === 'failed')
    for (const tx of failedTxs) {
      await pendingTxService.delete({ id: tx.id })
    }
  }, [transactions])

  return {
    transactions,
    isLoading,
    deleteTransaction,
    retryTransaction,
    clearAllFailed,
  }
}
