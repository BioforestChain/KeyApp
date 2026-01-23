/**
 * usePendingTransactions Hook
 * 
 * 获取当前钱包的未上链交易列表
 * 使用 Effect 数据源，依赖 blockHeight 自动刷新
 */

import { useCallback, useMemo, useState, useEffect } from 'react'
import { Effect } from 'effect'
import { pendingTxService, pendingTxManager, getPendingTxSource, type PendingTx } from '@/services/transaction'
import { useChainConfigState } from '@/stores'

export function usePendingTransactions(walletId: string | undefined, chainId?: string) {
  const chainConfigState = useChainConfigState()

  // 手动管理状态
  const [transactions, setTransactions] = useState<PendingTx[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!walletId || !chainId) {
      setTransactions([])
      setIsLoading(false)
      return
    }

    const sourceEffect = getPendingTxSource(chainId, walletId)
    if (!sourceEffect) {
      // 如果链不支持 blockHeight，回退到直接查询
      pendingTxService.getPending({ walletId }).then(setTransactions)
      return
    }

    setIsLoading(true)

    // 运行 Effect 获取数据源并订阅变化
    let cleanup: (() => void) | undefined

    Effect.runPromise(sourceEffect).then((source) => {
      // 获取初始值
      Effect.runPromise(source.get).then((result) => {
        if (result) setTransactions(result)
        setIsLoading(false)
      })

      // 订阅变化流
      const fiber = Effect.runFork(
        source.changes.pipe(
          Effect.tap((newData) => Effect.sync(() => setTransactions(newData)))
        )
      )

      cleanup = () => {
        Effect.runPromise(Effect.fiberId.pipe(Effect.flatMap(() => source.stop)))
      }
    }).catch(() => {
      setIsLoading(false)
    })

    return () => cleanup?.()
  }, [walletId, chainId])

  // 订阅 pendingTxService 的变化（用于即时更新）
  useEffect(() => {
    if (!walletId) return

    const unsubscribe = pendingTxService.subscribe((tx, event) => {
      if (tx.walletId !== walletId) return
      
      if (event === 'created') {
        setTransactions(prev => [tx, ...prev])
      } else if (event === 'updated') {
        setTransactions(prev => prev.map(t => t.id === tx.id ? tx : t))
      } else if (event === 'deleted') {
        setTransactions(prev => prev.filter(t => t.id !== tx.id))
      }
    })

    return unsubscribe
  }, [walletId])

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
