/**
 * usePendingTransactions Hook
 * 
 * 获取当前钱包的未上链交易列表
 * 使用 key-fetch 的 useState，依赖 blockHeight 自动刷新
 */

import { useCallback, useMemo, useState, useEffect } from 'react'
import { getPendingTxFetcher, pendingTxService, pendingTxManager, type PendingTx } from '@/services/transaction'
import { useChainConfigState } from '@/stores'

export function usePendingTransactions(walletId: string | undefined, chainId?: string) {
  const chainConfigState = useChainConfigState()

  // 获取 key-fetch 实例（使用 useMemo 保持稳定引用）
  const fetcher = useMemo(() => {
    if (!walletId || !chainId) return null
    return getPendingTxFetcher(chainId, walletId)
  }, [walletId, chainId])

  // 手动管理状态，避免条件调用 Hook
  const [transactions, setTransactions] = useState<PendingTx[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!fetcher) {
      setTransactions([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // 初始获取
    fetcher.fetch({}).then((result) => {
      setTransactions(result as PendingTx[])
      setIsLoading(false)
    }).catch(() => {
      setIsLoading(false)
    })

    // 订阅更新
    const unsubscribe = fetcher.subscribe({}, (newData) => {
      setTransactions(newData as PendingTx[])
    })

    return unsubscribe
  }, [fetcher])

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
