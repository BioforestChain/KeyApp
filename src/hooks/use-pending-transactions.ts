/**
 * usePendingTransactions Hook
 * 
 * 获取当前钱包的未上链交易列表，并订阅状态变化
 * 使用 keyFetch 订阅区块高度变化，实现响应式交易确认检查
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { pendingTxService, pendingTxManager, type PendingTx } from '@/services/transaction'
import { useChainConfigState, chainConfigSelectors } from '@/stores'
import { keyFetch } from '@biochain/key-fetch'
import { setForgeInterval } from '@/services/key-fetch-rules'
import type { GenesisInfo } from '@/services/bioforest-api/types'

// 已初始化 forgeInterval 的链
const initializedChains = new Set<string>()

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

  // 订阅区块高度变化，当有 broadcasted 状态的交易时检查确认
  useEffect(() => {
    const broadcastedTxs = transactions.filter(tx => tx.status === 'broadcasted')
    if (broadcastedTxs.length === 0 || !walletId) return

    // 获取需要监控的链列表
    const chainIds = [...new Set(broadcastedTxs.map(tx => tx.chainId))]
    const unsubscribes: (() => void)[] = []

    // 初始化链的 forgeInterval 并订阅区块高度
    const initAndSubscribe = async () => {
      for (const chainId of chainIds) {
        const chainConfig = chainConfigSelectors.getChainById(chainConfigState, chainId)
        if (!chainConfig) continue

        const biowallet = chainConfig.apis.find(p => p.type === 'biowallet-v1')
        if (!biowallet?.endpoint) continue

        // 如果该链还未初始化 forgeInterval，先获取 genesis block
        if (!initializedChains.has(chainId)) {
          try {
            const genesisUrl = `${biowallet.endpoint}/block/1`
            const response = await fetch(genesisUrl)
            if (response.ok) {
              const data = await response.json()
              // Genesis block 的 asset.genesisAsset.forgeInterval
              const forgeInterval = data?.result?.asset?.genesisAsset?.forgeInterval
              if (forgeInterval && typeof forgeInterval === 'number') {
                setForgeInterval(chainId, forgeInterval)
                initializedChains.add(chainId)
                console.log(`[usePendingTransactions] Initialized forgeInterval for ${chainId}: ${forgeInterval}s`)
              }
            }
          } catch (error) {
            console.error(`[usePendingTransactions] Failed to get genesis block for ${chainId}:`, error)
          }
        }

        const lastblockUrl = `${biowallet.endpoint}/lastblock`

        // 订阅区块高度变化
        const unsubscribe = keyFetch.subscribe<{ height: number }>(
          lastblockUrl,
          (_block, event) => {
            if (event === 'update') {
              // 区块高度更新时，同步该链的交易状态
              console.log(`[usePendingTransactions] Block updated for ${chainId}, syncing transactions...`)
              pendingTxManager.syncWalletPendingTransactions(walletId, chainConfigState)
            }
          }
        )
        unsubscribes.push(unsubscribe)
      }
    }

    initAndSubscribe()

    return () => {
      unsubscribes.forEach(fn => fn())
    }
  }, [transactions, walletId, chainConfigState])

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
