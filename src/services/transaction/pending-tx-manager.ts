/**
 * Pending Transaction Manager
 * 
 * 系统性管理未上链交易：
 * 1. 自动重试失败的广播
 * 2. 同步 broadcasted 交易的上链状态
 * 3. 提供订阅机制供 UI 更新
 */

import { pendingTxService, type PendingTx, type PendingTxStatus } from './pending-tx'
import { broadcastTransaction } from '@/services/bioforest-sdk'
import { BroadcastError, translateBroadcastError } from '@/services/bioforest-sdk/errors'
import { chainConfigSelectors, useChainConfigState } from '@/stores'

// ==================== 配置 ====================

const CONFIG = {
  /** 自动重试最大次数 */
  MAX_AUTO_RETRY: 3,
  /** 重试间隔 (ms) */
  RETRY_INTERVAL: 5000,
  /** 状态同步间隔 (ms) */
  SYNC_INTERVAL: 15000,
  /** 交易确认超时 (ms) - 超过此时间仍未确认则标记为需要检查 */
  CONFIRM_TIMEOUT: 5 * 60 * 1000, // 5 分钟
}

// ==================== 类型 ====================

type StatusChangeCallback = (tx: PendingTx) => void

interface PendingTxManagerState {
  isRunning: boolean
  syncTimer: ReturnType<typeof setInterval> | null
  subscribers: Set<StatusChangeCallback>
}

// ==================== Manager 实现 ====================

class PendingTxManagerImpl {
  private state: PendingTxManagerState = {
    isRunning: false,
    syncTimer: null,
    subscribers: new Set(),
  }

  /**
   * 启动 Manager
   */
  start() {
    if (this.state.isRunning) return
    
    this.state.isRunning = true
    console.log('[PendingTxManager] Started')
    
    // 启动定时同步
    this.state.syncTimer = setInterval(() => {
      this.syncAllPendingTransactions()
    }, CONFIG.SYNC_INTERVAL)
    
    // 立即执行一次同步
    this.syncAllPendingTransactions()
  }

  /**
   * 停止 Manager
   */
  stop() {
    if (!this.state.isRunning) return
    
    this.state.isRunning = false
    
    if (this.state.syncTimer) {
      clearInterval(this.state.syncTimer)
      this.state.syncTimer = null
    }
    
    console.log('[PendingTxManager] Stopped')
  }

  /**
   * 订阅状态变化
   */
  subscribe(callback: StatusChangeCallback): () => void {
    this.state.subscribers.add(callback)
    return () => {
      this.state.subscribers.delete(callback)
    }
  }

  /**
   * 通知所有订阅者
   */
  private notifySubscribers(tx: PendingTx) {
    this.state.subscribers.forEach((callback) => {
      try {
        callback(tx)
      } catch (error) {
        console.error('[PendingTxManager] Subscriber error:', error)
      }
    })
  }

  /**
   * 同步所有钱包的 pending 交易
   */
  private async syncAllPendingTransactions() {
    // 获取所有钱包的 pending 交易需要知道 walletIds
    // 这里简化处理：从 IndexedDB 获取所有非 confirmed 状态的交易
    try {
      // 由于我们不知道所有 walletId，这里需要一个 getAllPending 方法
      // 暂时跳过，等待 UI 层提供 walletId
      console.log('[PendingTxManager] Sync cycle (waiting for walletId)')
    } catch (error) {
      console.error('[PendingTxManager] Sync error:', error)
    }
  }

  /**
   * 同步指定钱包的 pending 交易
   */
  async syncWalletPendingTransactions(walletId: string, chainConfigState: ReturnType<typeof useChainConfigState>) {
    try {
      const pendingTxs = await pendingTxService.getPending({ walletId })
      
      for (const tx of pendingTxs) {
        await this.processPendingTransaction(tx, chainConfigState)
      }
    } catch (error) {
      console.error('[PendingTxManager] Sync wallet error:', error)
    }
  }

  /**
   * 处理单个 pending 交易
   */
  private async processPendingTransaction(
    tx: PendingTx, 
    chainConfigState: ReturnType<typeof useChainConfigState>
  ) {
    switch (tx.status) {
      case 'created':
        // 尚未广播，尝试广播
        await this.tryBroadcast(tx, chainConfigState)
        break
        
      case 'failed':
        // 广播失败，检查是否可以自动重试
        if (tx.retryCount < CONFIG.MAX_AUTO_RETRY) {
          await this.tryBroadcast(tx, chainConfigState)
        }
        break
        
      case 'broadcasted':
        // 已广播，检查是否已上链
        await this.checkConfirmation(tx, chainConfigState)
        break
        
      case 'broadcasting':
        // 广播中，检查是否卡住了
        const elapsed = Date.now() - tx.updatedAt
        if (elapsed > 30000) {
          // 超过 30 秒仍在 broadcasting，可能是卡住了，重置为 failed
          const updated = await pendingTxService.updateStatus({
            id: tx.id,
            status: 'failed',
            errorMessage: '广播超时，请重试',
          })
          this.notifySubscribers(updated)
        }
        break
    }
  }

  /**
   * 尝试广播交易
   */
  private async tryBroadcast(
    tx: PendingTx, 
    chainConfigState: ReturnType<typeof useChainConfigState>
  ) {
    const chainConfig = chainConfigSelectors.getChainById(chainConfigState, tx.chainId)
    if (!chainConfig) {
      console.warn('[PendingTxManager] Chain config not found:', tx.chainId)
      return
    }

    const biowallet = chainConfig.apis.find((p) => p.type === 'biowallet-v1')
    const apiUrl = biowallet?.endpoint
    if (!apiUrl) {
      console.warn('[PendingTxManager] API URL not found for chain:', tx.chainId)
      return
    }

    try {
      // 更新状态为 broadcasting
      await pendingTxService.updateStatus({ id: tx.id, status: 'broadcasting' })
      await pendingTxService.incrementRetry({ id: tx.id })

      // 广播
      const txHash = await broadcastTransaction(apiUrl, tx.rawTx as BFChainCore.TransactionJSON)

      // 成功
      const updated = await pendingTxService.updateStatus({
        id: tx.id,
        status: 'broadcasted',
        txHash,
      })
      this.notifySubscribers(updated)
      console.log('[PendingTxManager] Broadcast success:', txHash.slice(0, 16))
    } catch (error) {
      console.error('[PendingTxManager] Broadcast failed:', error)

      const errorMessage = error instanceof BroadcastError
        ? translateBroadcastError(error)
        : (error instanceof Error ? error.message : '广播失败')
      const errorCode = error instanceof BroadcastError ? error.code : undefined

      const updated = await pendingTxService.updateStatus({
        id: tx.id,
        status: 'failed',
        errorCode,
        errorMessage,
      })
      this.notifySubscribers(updated)
    }
  }

  /**
   * 检查交易是否已上链
   */
  private async checkConfirmation(
    tx: PendingTx,
    chainConfigState: ReturnType<typeof useChainConfigState>
  ) {
    if (!tx.txHash) return

    const chainConfig = chainConfigSelectors.getChainById(chainConfigState, tx.chainId)
    if (!chainConfig) return

    const biowallet = chainConfig.apis.find((p) => p.type === 'biowallet-v1')
    const apiUrl = biowallet?.endpoint
    if (!apiUrl) return

    try {
      // 查询交易状态
      const response = await fetch(`${apiUrl}/transactions/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: tx.txHash,
          page: 1,
          pageSize: 1,
          maxHeight: Number.MAX_SAFE_INTEGER,
        }),
      })

      const json = await response.json() as { success: boolean; result?: { count: number } }

      if (json.success && json.result && json.result.count > 0) {
        // 交易已上链
        const updated = await pendingTxService.updateStatus({
          id: tx.id,
          status: 'confirmed',
        })
        this.notifySubscribers(updated)
        console.log('[PendingTxManager] Transaction confirmed:', tx.txHash.slice(0, 16))
      } else {
        // 检查是否超时
        const elapsed = Date.now() - tx.updatedAt
        if (elapsed > CONFIG.CONFIRM_TIMEOUT) {
          console.warn('[PendingTxManager] Transaction confirmation timeout:', tx.txHash.slice(0, 16))
          // 不自动标记失败，只记录日志，让用户决定
        }
      }
    } catch (error) {
      console.error('[PendingTxManager] Check confirmation error:', error)
    }
  }

  /**
   * 手动重试广播
   */
  async retryBroadcast(
    txId: string,
    chainConfigState: ReturnType<typeof useChainConfigState>
  ): Promise<PendingTx | null> {
    const tx = await pendingTxService.getById({ id: txId })
    if (!tx) return null

    await this.tryBroadcast(tx, chainConfigState)
    return pendingTxService.getById({ id: txId })
  }
}

/** 单例 */
export const pendingTxManager = new PendingTxManagerImpl()
