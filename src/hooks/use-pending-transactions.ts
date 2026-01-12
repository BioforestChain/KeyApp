/**
 * usePendingTransactions Hook
 * 
 * 获取当前钱包的未上链交易列表
 */

import { useEffect, useState, useCallback } from 'react'
import { pendingTxService, type PendingTx } from '@/services/transaction'

export function usePendingTransactions(walletId: string | undefined) {
  const [transactions, setTransactions] = useState<PendingTx[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => {
    refresh()
  }, [refresh])

  const deleteTransaction = useCallback(async (tx: PendingTx) => {
    await pendingTxService.delete({ id: tx.id })
    await refresh()
  }, [refresh])

  const retryTransaction = useCallback(async (tx: PendingTx) => {
    // 重试逻辑需要调用方提供，这里只增加重试计数
    await pendingTxService.incrementRetry({ id: tx.id })
    await pendingTxService.updateStatus({ id: tx.id, status: 'created' })
    await refresh()
    return tx
  }, [refresh])

  return {
    transactions,
    isLoading,
    refresh,
    deleteTransaction,
    retryTransaction,
  }
}
