/**
 * usePendingTransactions Hook
 * 
 * 获取当前钱包的未上链交易列表
 * 使用 Effect 数据源，依赖 blockHeight 自动刷新
 */

import { useCallback, useState, useEffect, useMemo } from 'react'
import { Effect, Stream, Fiber } from 'effect'
import { pendingTxService, pendingTxManager, getPendingTxSource, getPendingTxWalletKey, type PendingTx } from '@/services/transaction'
import { useChainConfigState } from '@/stores'
import type { Transaction } from '@/services/chain-adapter/providers'
import { isChainDebugEnabled } from '@/services/chain-adapter/debug'

function pendingTxDebugLog(...args: Array<string | number | boolean>): void {
  const message = `[chain-effect] pending-tx ${args.join(' ')}`
  if (!isChainDebugEnabled(message)) return
  console.log('[chain-effect]', 'pending-tx', ...args)
}

export function usePendingTransactions(
  walletId: string | undefined,
  chainId?: string,
  address?: string,
  txHistory?: ReadonlyArray<Transaction>,
) {
  const chainConfigState = useChainConfigState()
  const walletKey = chainId && address ? getPendingTxWalletKey(chainId, address) : walletId
  const legacyWalletId = walletId && walletId !== walletKey ? walletId : undefined
  const confirmedTxHashes = useMemo(() => {
    if (!txHistory?.length) return []
    const set = new Set<string>()
    for (const tx of txHistory) {
      if (tx?.hash) {
        set.add(tx.hash.toLowerCase())
      }
    }
    return Array.from(set).sort()
  }, [txHistory])
  const confirmedTxHashKey = useMemo(() => confirmedTxHashes.join('|'), [confirmedTxHashes])

  // 手动管理状态
  const [transactions, setTransactions] = useState<PendingTx[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadPendingSnapshot = useCallback(async () => {
    if (!walletKey) return []
    const walletIds = new Set<string>([walletKey])
    if (legacyWalletId) {
      walletIds.add(legacyWalletId)
    }
    const lists = await Promise.all(
      Array.from(walletIds).map((id) => pendingTxService.getPending({ walletId: id }))
    )
    const map = new Map<string, PendingTx>()
    for (const list of lists) {
      for (const item of list) {
        map.set(item.id, item)
      }
    }
    const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt)
    pendingTxDebugLog('snapshot', walletKey ?? 'none', `len=${merged.length}`)
    return merged
  }, [walletKey, legacyWalletId])

  useEffect(() => {
    if (!walletKey) {
      setTransactions([])
      setIsLoading(false)
      return
    }

    let mounted = true
    setIsLoading(true)

    // 先读取本地 DB，避免进入页面时“慢一拍”
    void (async () => {
      try {
        const list = await loadPendingSnapshot()
        if (!mounted) return
        setTransactions(list)
      } finally {
        if (!mounted) return
        setIsLoading(false)
      }
    })()

    // 再修正 walletKey 并清理 confirmed，最后刷新一次列表
    const normalizeAndRefresh = async () => {
      if (chainId && address) {
        await pendingTxService.normalizeWalletKeyByAddress({
          chainId,
          address,
          walletId: walletKey,
        })
      }
      await pendingTxService.deleteConfirmed({ walletId: walletKey })
      if (legacyWalletId) {
        await pendingTxService.deleteConfirmed({ walletId: legacyWalletId })
      }
      const list = await loadPendingSnapshot()
      if (!mounted) return
      setTransactions(list)
    }

    void normalizeAndRefresh().catch(() => {
      // ignore
    })

    // 无 chainId 时仅展示本地数据，不启动轮询/确认检查
    if (!chainId) {
      return () => {
        mounted = false
      }
    }

    const sourceEffect = getPendingTxSource(chainId, walletKey, legacyWalletId)
    if (!sourceEffect) {
      return () => {
        mounted = false
      }
    }

    // 运行 Effect 获取数据源并订阅变化
    let cleanup: (() => void) | undefined

    Effect.runPromise(sourceEffect).then((source) => {
      const startStream = () => {
        const fiber = Effect.runFork(
          source.changes.pipe(
            Stream.runForEach((newData) =>
              Effect.promise(async () => {
                if (!mounted) return
                pendingTxDebugLog('changes', walletKey ?? 'none', `len=${newData.length}`)
                const list = await loadPendingSnapshot()
                if (!mounted) return
                setTransactions(list)
              })
            )
          )
        )

        cleanup = () => {
          Effect.runFork(Fiber.interrupt(fiber))
          Effect.runFork(source.stop)
        }
      }

      // 强制刷新一次，避免旧的空快照覆盖本地 snapshot
      Effect.runPromise(source.refresh)
        .then(async (result) => {
          if (!mounted) return
          pendingTxDebugLog('refresh', walletKey ?? 'none', `len=${result.length}`)
          const list = await loadPendingSnapshot()
          if (!mounted) return
          setTransactions(list)
        })
        .finally(() => {
          if (!mounted) return
          startStream()
        })
    }).catch(() => {
      if (!mounted) return
    })

    return () => {
      mounted = false
      cleanup?.()
    }
  }, [walletKey, chainId, address, legacyWalletId, loadPendingSnapshot])

  useEffect(() => {
    if (!walletKey) return
    void pendingTxManager.syncWalletPendingTransactions(walletKey, chainConfigState)
    if (legacyWalletId) {
      void pendingTxManager.syncWalletPendingTransactions(legacyWalletId, chainConfigState)
    }
  }, [walletKey, legacyWalletId, chainConfigState])

  useEffect(() => {
    if (!walletKey || confirmedTxHashes.length === 0) return
    void (async () => {
      await pendingTxService.deleteByTxHash({ walletId: walletKey, txHashes: confirmedTxHashes })
      if (legacyWalletId) {
        await pendingTxService.deleteByTxHash({ walletId: legacyWalletId, txHashes: confirmedTxHashes })
      }
    })()
  }, [walletKey, legacyWalletId, confirmedTxHashKey])

  // 订阅 pendingTxService 的变化（用于即时更新）
  useEffect(() => {
    if (!walletKey) return

    const unsubscribe = pendingTxService.subscribe((tx, event) => {
      if (tx.walletId !== walletKey && tx.walletId !== legacyWalletId) return

      if (event === 'created') {
        if (tx.status === 'confirmed') return
        setTransactions((prev) => {
          const map = new Map<string, PendingTx>()
          for (const item of prev) map.set(item.id, item)
          map.set(tx.id, tx)
          return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt)
        })
      } else if (event === 'updated') {
        setTransactions((prev) => {
          if (tx.status === 'confirmed') {
            return prev.filter((t) => t.id !== tx.id)
          }
          const map = new Map<string, PendingTx>()
          for (const item of prev) map.set(item.id, item)
          map.set(tx.id, tx)
          return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt)
        })
      } else if (event === 'deleted') {
        setTransactions((prev) => prev.filter((t) => t.id !== tx.id))
      }
    })

    return unsubscribe
  }, [walletKey, legacyWalletId])

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
