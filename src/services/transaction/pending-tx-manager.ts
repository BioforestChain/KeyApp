/**
 * Pending Transaction Manager
 *
 * 系统性管理未上链交易：
 * 1. 自动重试失败的广播
 * 2. 同步 broadcasted 交易的上链状态
 * 3. 提供订阅机制供 UI 更新
 * 4. 发送通知提醒用户交易状态变化
 */

import { pendingTxService, type PendingTx } from './pending-tx';
import { getChainProvider } from '@/services/chain-adapter/providers';
import { ChainServiceError } from '@/services/chain-adapter/types';
import { chainConfigSelectors, useChainConfigState } from '@/stores';
import { notificationActions } from '@/stores/notification';

import i18n from '@/i18n';

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
  /** 过期交易清理时间 (ms) - 已确认/失败的交易超过此时间后自动清理 */
  CLEANUP_MAX_AGE: 24 * 60 * 60 * 1000, // 24 小时
};

// ==================== 类型 ====================

type StatusChangeCallback = (tx: PendingTx) => void;

interface PendingTxManagerState {
  isRunning: boolean;
  syncTimer: ReturnType<typeof setInterval> | null;
  subscribers: Set<StatusChangeCallback>;
}

// ==================== Manager 实现 ====================

class PendingTxManagerImpl {
  private state: PendingTxManagerState = {
    isRunning: false,
    syncTimer: null,
    subscribers: new Set(),
  };

  /**
   * 启动 Manager
   */
  start() {
    if (this.state.isRunning) return;

    this.state.isRunning = true;


    // 启动定时同步
    this.state.syncTimer = setInterval(() => {
      this.syncAllPendingTransactions();
    }, CONFIG.SYNC_INTERVAL);

    // 立即执行一次同步
    this.syncAllPendingTransactions();
  }

  /**
   * 停止 Manager
   */
  stop() {
    if (!this.state.isRunning) return;

    this.state.isRunning = false;

    if (this.state.syncTimer) {
      clearInterval(this.state.syncTimer);
      this.state.syncTimer = null;
    }


  }

  /**
   * 订阅状态变化
   */
  subscribe(callback: StatusChangeCallback): () => void {
    this.state.subscribers.add(callback);
    return () => {
      this.state.subscribers.delete(callback);
    };
  }

  /**
   * 通知所有订阅者
   */
  private notifySubscribers(tx: PendingTx) {
    this.state.subscribers.forEach((callback) => {
      try {
        callback(tx);
      } catch (error) {

      }
    });
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

    } catch (error) {

    }
  }

  /**
   * 同步指定钱包的 pending 交易
   */
  async syncWalletPendingTransactions(walletId: string, chainConfigState: ReturnType<typeof useChainConfigState>) {
    try {
      // 清理过期交易
      const cleanedCount = await pendingTxService.deleteExpired({
        walletId,
        maxAge: CONFIG.CLEANUP_MAX_AGE,
      });
      if (cleanedCount > 0) {

      }

      const pendingTxs = await pendingTxService.getPending({ walletId });

      for (const tx of pendingTxs) {
        await this.processPendingTransaction(tx, chainConfigState);
      }
    } catch (error) {

    }
  }

  /**
   * 处理单个 pending 交易
   */
  private async processPendingTransaction(tx: PendingTx, chainConfigState: ReturnType<typeof useChainConfigState>) {
    switch (tx.status) {
      case 'created':
        // 尚未广播，尝试广播
        await this.tryBroadcast(tx, chainConfigState);
        break;

      case 'failed':
        // 广播失败，检查是否可以自动重试
        if (tx.retryCount < CONFIG.MAX_AUTO_RETRY) {
          await this.tryBroadcast(tx, chainConfigState);
        }
        break;

      case 'broadcasted':
        // 已广播的确认检查由 pendingTx polling source 统一处理，避免重复查询
        break;

      case 'broadcasting':
        // 广播中，检查是否卡住了
        const elapsed = Date.now() - tx.updatedAt;
        if (elapsed > 30000) {
          // 超过 30 秒仍在 broadcasting，可能是卡住了，重置为 failed
          const updated = await pendingTxService.updateStatus({
            id: tx.id,
            status: 'failed',
            errorMessage: i18n.t('transaction:broadcast.timeout'),
          });
          this.notifySubscribers(updated);
        }
        break;
    }
  }

  /**
   * 尝试广播交易
   */
  private async tryBroadcast(tx: PendingTx, chainConfigState: ReturnType<typeof useChainConfigState>) {
    const chainConfig = chainConfigSelectors.getChainById(chainConfigState, tx.chainId);
    if (!chainConfig) {

      return;
    }

    // 使用 ChainProvider 标准接口
    const chainProvider = getChainProvider(tx.chainId);
    const broadcast = chainProvider?.broadcastTransaction;
    if (!broadcast) {

      return;
    }

    try {
      // 更新状态为 broadcasting
      await pendingTxService.updateStatus({ id: tx.id, status: 'broadcasting' });
      await pendingTxService.incrementRetry({ id: tx.id });

      // 使用 ChainProvider 标准格式广播（rawTx 已是 SignedTransaction 格式）
      const txHash = await broadcast(tx.rawTx);

      // 成功
      const updated = await pendingTxService.updateStatus({
        id: tx.id,
        status: 'broadcasted',
        txHash,
      });
      this.notifySubscribers(updated);

      // 发送广播成功通知
      this.sendNotification(updated, 'broadcasted');


    } catch (error) {


      const errorMessage =
        error instanceof ChainServiceError
          ? error.message
          : error instanceof Error
            ? error.message
            : i18n.t('transaction:broadcast.failed');
      const errorCode = error instanceof ChainServiceError ? error.code : undefined;

      const updated = await pendingTxService.updateStatus({
        id: tx.id,
        status: 'failed',
        errorCode,
        errorMessage,
      });
      this.notifySubscribers(updated);

      // 发送广播失败通知
      this.sendNotification(updated, 'failed');
    }
  }

  /**
   * 手动重试广播
   */
  async retryBroadcast(
    txId: string,
    chainConfigState: ReturnType<typeof useChainConfigState>,
  ): Promise<PendingTx | null> {
    const tx = await pendingTxService.getById({ id: txId });
    if (!tx) return null;

    await this.tryBroadcast(tx, chainConfigState);
    return pendingTxService.getById({ id: txId });
  }

  /**
   * 发送通知
   */
  private sendNotification(tx: PendingTx, event: 'broadcasted' | 'confirmed' | 'failed') {
    const displayAmount = tx.meta?.displayAmount ?? '';
    const displaySymbol = tx.meta?.displaySymbol ?? '';
    const displayType = tx.meta?.type ?? 'transfer';

    let title: string;
    let message: string;
    let status: 'pending' | 'success' | 'failed';

    switch (event) {
      case 'broadcasted':
        title = i18n.t('notification:pendingTx.broadcasted.title');
        message = displayAmount
          ? i18n.t('notification:pendingTx.broadcasted.message', {
            type: displayType,
            amount: displayAmount,
            symbol: displaySymbol,
          })
          : i18n.t('notification:pendingTx.broadcasted.messageSimple');
        status = 'pending';
        break;

      case 'confirmed':
        title = i18n.t('notification:pendingTx.confirmed.title');
        message = displayAmount
          ? i18n.t('notification:pendingTx.confirmed.message', {
            type: displayType,
            amount: displayAmount,
            symbol: displaySymbol,
          })
          : i18n.t('notification:pendingTx.confirmed.messageSimple');
        status = 'success';
        break;

      case 'failed':
        title = i18n.t('notification:pendingTx.failed.title');
        message = tx.errorMessage ?? i18n.t('notification:pendingTx.failed.message');
        status = 'failed';
        break;
    }

    notificationActions.add({
      type: 'transaction',
      title,
      message,
      data: {
        txHash: tx.txHash,
        walletId: tx.walletId,
        status,
        pendingTxId: tx.id,
      },
    });
  }


}

/** 单例 */
export const pendingTxManager = new PendingTxManagerImpl();
