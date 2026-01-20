/**
 * MiniappTransferConfirmJob - 小程序转账确认对话框
 * 用于小程序请求发送转账时显示
 */

import { useState, useCallback } from 'react';
import type { ActivityComponentType } from '@stackflow/react';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { IconArrowDown, IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import { useFlow } from '../../stackflow';
import { ActivityParamsProvider, useActivityParams } from '../../hooks';
import { setWalletLockConfirmCallback } from './WalletLockConfirmJob';
import { useCurrentWallet, walletStore } from '@/stores';
import { SignatureAuthService, plaocAdapter } from '@/services/authorize';
import { AddressDisplay } from '@/components/wallet/address-display';
import { AmountDisplay } from '@/components/common/amount-display';
import { MiniappSheetHeader } from '@/components/ecosystem';
import { ChainBadge } from '@/components/wallet/chain-icon';

type MiniappTransferConfirmJobParams = {
  /** 来源小程序名称 */
  appName: string;
  /** 来源小程序图标 */
  appIcon?: string;
  /** 发送地址 */
  from: string;
  /** 接收地址 */
  to: string;
  /** 金额 */
  amount: string;
  /** 链 ID */
  chain: string;
  /** 代币 (可选) */
  asset?: string;
};

function MiniappTransferConfirmJobContent() {
  const { t } = useTranslation('common');
  const { pop, push } = useFlow();
  const params = useActivityParams<MiniappTransferConfirmJobParams>();
  const { appName, appIcon, from, to, amount, chain, asset } = params;
  const currentWallet = useCurrentWallet();

  const [isConfirming, setIsConfirming] = useState(false);

  // 查找使用该地址的钱包
  const targetWallet = walletStore.state.wallets.find((w) => w.chainAddresses.some((ca) => ca.address === from));
  const walletName = targetWallet?.name || t('unknownWallet');

  const handleConfirm = useCallback(() => {
    if (isConfirming) return;

    // 设置钱包锁验证回调
    setWalletLockConfirmCallback(async (password: string) => {
      setIsConfirming(true);

      try {
        const encryptedSecret = currentWallet?.encryptedMnemonic;
        if (!encryptedSecret) {
          return false;
        }

        // 创建签名服务
        const eventId = `miniapp_transfer_${Date.now()}`;
        const authService = new SignatureAuthService(plaocAdapter, eventId);

        // 执行转账签名
        const transferPayload: {
          chainName: string;
          senderAddress: string;
          receiveAddress: string;
          balance: string;
          assetType?: string;
        } = {
          chainName: chain,
          senderAddress: from,
          receiveAddress: to,
          balance: amount,
        };
        if (asset) {
          transferPayload.assetType = asset;
        }

        const signature = await authService.handleTransferSign(transferPayload, encryptedSecret, password);

        // TODO: 广播交易到链上 (需要调用 chain adapter 的 broadcastTransaction)
        // 目前先返回签名作为 txHash 的占位符
        const txHash = signature;

        // 发送成功事件
        const event = new CustomEvent('miniapp-transfer-confirm', {
          detail: {
            confirmed: true,
            txHash,
          },
        });
        window.dispatchEvent(event);

        pop();
        return true;
      } catch (error) {
        return false;
      } finally {
        setIsConfirming(false);
      }
    });

    // 打开钱包锁验证
    push('WalletLockConfirmJob', {
      title: t('confirmTransfer'),
    });
  }, [isConfirming, currentWallet, chain, from, to, amount, asset, pop, push, t]);

  const handleCancel = useCallback(() => {
    const event = new CustomEvent('miniapp-transfer-confirm', {
      detail: { confirmed: false },
    });
    window.dispatchEvent(event);
    pop();
  }, [pop]);

  const displayAsset = asset || chain.toUpperCase();

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        {/* Header */}
        <MiniappSheetHeader
          title={t('confirmTransfer')}
          description={`${appName || t('unknownDApp')} ${t('requestsTransfer')}`}
          appName={appName}
          appIcon={appIcon}
          walletInfo={{
            name: walletName,
            address: from,
            chainId: chain,
          }}
        />

        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Amount */}
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <AmountDisplay
              value={amount}
              symbol={displayAsset}
              size="xl"
              weight="bold"
              decimals={8}
              fixedDecimals={true}
            />
          </div>

          {/* From -> To */}
          <div className="bg-muted/50 space-y-3 rounded-xl p-4">
            {/* From */}
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-10 shrink-0 text-xs"> {t('from')}</span>
              <AddressDisplay address={from} copyable className="flex-1 text-sm" />
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <IconArrowDown className="text-muted-foreground size-4" />
            </div>

            {/* To */}
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-10 shrink-0 text-xs"> {t('to')}</span>
              <AddressDisplay address={to} copyable className="flex-1 text-sm" />
            </div>
          </div>

          {/* Chain */}
          <div className="bg-muted/50 flex items-center justify-between rounded-xl p-3">
            <span className="text-muted-foreground text-sm"> {t('network')}</span>
            <ChainBadge chainId={chain} />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
            <IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800 dark:text-amber-200">{t('transferWarning')}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4">
          <button
            onClick={handleCancel}
            disabled={isConfirming}
            className="bg-muted hover:bg-muted/80 flex-1 rounded-xl py-3 font-medium transition-colors disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className={cn(
              'flex-1 rounded-xl py-3 font-medium transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'flex items-center justify-center gap-2 disabled:opacity-50',
            )}
          >
            {isConfirming ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                {t('confirming')}
              </>
            ) : (
              t('confirm')
            )}
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const MiniappTransferConfirmJob: ActivityComponentType<MiniappTransferConfirmJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <MiniappTransferConfirmJobContent />
    </ActivityParamsProvider>
  );
};
