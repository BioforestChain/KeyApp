/**
 * usePendingTransactions Hook
 * 
 * 获取当前钱包的未上链交易列表，并订阅状态变化
 */

import { useEffect, useState, useCallback } from 'react'
import { pendingTxService, pendingTxManager, type PendingTx } from '@/services/transaction'
import { useChainConfigState } from '@/stores'

export function usePendingTransactions(walletId: string | undefined) {
  const [transactions, setTransactions] = useState<PendingTx[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const chainConfigState = useChainConfigState()

  const refresh = useCallback(async () => {
    if (!walletId) {
      setTransactions([])
      setIsLoading(false)
      return
    }

    try {
      const pending = await pendingTxService.getPending({ walletId })
      setTransactions(pending)
    } catch (error) {
      console.error('[usePendingTransactions] Failed to fetch:', error)
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [walletId])

  // 初始加载和订阅状态变化
  useEffect(() => {
    refresh()

    // 订阅 pendingTxService 的状态变化（create/update/delete 时立即触发）
    const unsubscribe = pendingTxService.subscribe((updatedTx) => {
      if (updatedTx.walletId === walletId) {
        refresh()
      }
    })

    return () => {
      unsubscribe()
    }
  }, [refresh, walletId])

  // 启动/停止 manager（当有 pending tx 时启动）
  useEffect(() => {
    if (transactions.length > 0) {
      pendingTxManager.start()
    }
  }, [transactions.length])

  // 同步钱包的 pending 交易状态
  useEffect(() => {
    if (walletId && transactions.length > 0) {
      pendingTxManager.syncWalletPendingTransactions(walletId, chainConfigState)
    }
  }, [walletId, chainConfigState, transactions.length])

  const deleteTransaction = useCallback(async (tx: PendingTx) => {
    await pendingTxService.delete({ id: tx.id })
    await refresh()
  }, [refresh])

  const retryTransaction = useCallback(async (tx: PendingTx) => {
    const updated = await pendingTxManager.retryBroadcast(tx.id, chainConfigState)
    await refresh()
    return updated
  }, [refresh, chainConfigState])

  const clearAllFailed = useCallback(async () => {
    const failedTxs = transactions.filter(tx => tx.status === 'failed')
    for (const tx of failedTxs) {
      await pendingTxService.delete({ id: tx.id })
    }
    await refresh()
  }, [transactions, refresh])

  return {
    transactions,
    isLoading,
    refresh,
    deleteTransaction,
    retryTransaction,
    clearAllFailed,
  }
}
