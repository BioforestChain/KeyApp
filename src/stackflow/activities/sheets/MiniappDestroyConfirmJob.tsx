/**
 * MiniappDestroyConfirmJob - 小程序销毁资产确认对话框
 * 用于小程序请求销毁资产时显示
 */

import { useState, useCallback, useMemo } from 'react';
import type { ActivityComponentType } from '@stackflow/react';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { IconFlame, IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import { useFlow } from '../../stackflow';
import { ActivityParamsProvider, useActivityParams } from '../../hooks';
import { setWalletLockConfirmCallback } from './WalletLockConfirmJob';
import { useChainConfigState, chainConfigSelectors } from '@/stores';
import { submitBioforestBurn } from '@/hooks/use-burn.bioforest';
import { Amount } from '@/types/amount';
import { AmountDisplay } from '@/components/common/amount-display';
import { MiniappSheetHeader } from '@/components/ecosystem';
import { ChainBadge } from '@/components/wallet/chain-icon';
import { ChainAddressDisplay } from '@/components/wallet/chain-address-display';
import { findMiniappWalletByAddress, resolveMiniappChainId } from './miniapp-wallet';

type MiniappDestroyConfirmJobParams = {
  /** 请求标识（用于 FIFO 事件隔离） */
  requestId?: string;
  /** 来源小程序名称 */
  appName: string;
  /** 来源小程序图标 */
  appIcon?: string;
  /** 发送地址 */
  from: string;
  /** 金额 */
  amount: string;
  /** 链 ID */
  chain: string;
  /** 资产类型 */
  asset: string;
  /** 业务备注（透传到交易体） */
  remark?: Record<string, string>;
};

type MiniappDestroyResultDetail = {
  requestId?: string;
  confirmed: boolean;
  txHash?: string;
  txId?: string;
  transaction?: Record<string, unknown>;
};

type MiniappDestroySheetClosedDetail = {
  requestId?: string;
  reason: 'cancel' | 'confirmed';
};

function MiniappDestroyConfirmJobContent() {
  const { t } = useTranslation(['common', 'transaction']);
  const { pop, push } = useFlow();
  const params = useActivityParams<MiniappDestroyConfirmJobParams>();
  const { requestId, appName, appIcon, from, amount, chain, asset, remark } = params;
  const chainConfigState = useChainConfigState();

  const resolvedChainId = useMemo(() => resolveMiniappChainId(chain), [chain]);
  const walletMatch = useMemo(() => findMiniappWalletByAddress(resolvedChainId, from), [resolvedChainId, from]);
  const targetWallet = walletMatch?.wallet;

  const chainConfig = chainConfigState.snapshot
    ? chainConfigSelectors.getChainById(chainConfigState, resolvedChainId)
    : null;

  const [isConfirming, setIsConfirming] = useState(false);

  const emitDestroyResult = useCallback((detail: MiniappDestroyResultDetail) => {
    if (typeof window === 'undefined') return;
    const payload: MiniappDestroyResultDetail = {
      requestId,
      ...detail,
    };
    window.dispatchEvent(new CustomEvent('miniapp-destroy-confirm', { detail: payload }));
  }, [requestId]);

  const emitSheetClosed = useCallback((reason: MiniappDestroySheetClosedDetail['reason']) => {
    if (typeof window === 'undefined') return;
    const payload: MiniappDestroySheetClosedDetail = {
      requestId,
      reason,
    };
    window.dispatchEvent(new CustomEvent('miniapp-destroy-sheet-closed', { detail: payload }));
  }, [requestId]);

  const walletName = targetWallet?.name || t('common:unknownWallet');
  const lockDescription = `${appName || t('common:unknownDApp')} ${t('common:requestsDestroy')}`;
  const parsedAmount = useMemo(() => {
    if (!chainConfig) return null;
    try {
      return Amount.fromRaw(amount, chainConfig.decimals, asset);
    } catch {
      return null;
    }
  }, [amount, asset, chainConfig]);

  const displayAmount = useMemo(() => parsedAmount?.toFormatted({ trimTrailingZeros: false }) ?? amount, [amount, parsedAmount]);
  const displayDecimals = chainConfig?.decimals ?? 8;
  const amountInvalidMessage = useMemo(() => {
    if (!chainConfig) return null;
    return parsedAmount ? null : t('transaction:broadcast.invalidParams');
  }, [chainConfig, parsedAmount, t]);

  const handleConfirm = useCallback(() => {
    if (isConfirming) return;

    // 设置钱包锁验证回调
    setWalletLockConfirmCallback(async (password: string) => {
      setIsConfirming(true);

      try {
        if (!targetWallet?.id || !chainConfig) {
          throw new Error(t('common:signingAddressNotFound'));
        }

        // 获取 applyAddress
        const { fetchAssetApplyAddress } = await import('@/hooks/use-burn.bioforest');
        const applyAddress = await fetchAssetApplyAddress(chainConfig, asset, from);

        if (!applyAddress) {
          return false;
        }

        // 执行销毁
        if (!parsedAmount) {
          throw new Error('Invalid miniapp destroy amount');
        }

        const amountObj = parsedAmount;

        const result = await submitBioforestBurn({
          chainConfig,
          walletId: targetWallet.id,
          password,
          fromAddress: from,
          recipientAddress: applyAddress,
          assetType: asset,
          amount: amountObj,
          ...(remark ? { remark } : {}),
        });

        if (result.status === 'password') {
          return false;
        }

        if (result.status === 'error') {
          return false;
        }

        // 发送成功事件
        const event = new CustomEvent('miniapp-destroy-confirm', {
          detail: {
            requestId,
            confirmed: true,
            txHash: result.status === 'ok' ? result.txHash : undefined,
            txId: result.status === 'ok' ? result.txId : undefined,
            transaction: result.status === 'ok' ? result.transaction : undefined,
          } satisfies MiniappDestroyResultDetail,
        });
        window.dispatchEvent(event);
        emitSheetClosed('confirmed');

        pop();
        return true;
      } catch {
        return false;
      } finally {
        setIsConfirming(false);
      }
    });

    // 打开钱包锁验证
    push('WalletLockConfirmJob', {
      title: t('transaction:destroyPage.title'),
      description: lockDescription,
      miniappName: appName,
      miniappIcon: appIcon,
      walletName,
      walletAddress: from,
      walletChainId: resolvedChainId,
    });
  }, [isConfirming, targetWallet, chainConfig, asset, from, amount, parsedAmount, pop, push, t, lockDescription, appName, appIcon, walletName, resolvedChainId, remark, requestId, emitSheetClosed]);

  const handleCancel = useCallback(() => {
    emitDestroyResult({ confirmed: false });
    emitSheetClosed('cancel');
    pop();
  }, [emitDestroyResult, emitSheetClosed, pop]);

  return (
    <BottomSheet onCancel={handleCancel}>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        {/* Header */}
        <MiniappSheetHeader
          title={t('transaction:destroyPage.title')}
          description={lockDescription}
          appName={appName}
          appIcon={appIcon}
          walletInfo={{
            name: walletName,
            address: from,
            chainId: resolvedChainId,
          }}
        />

        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Amount */}
          <div className="bg-destructive/5 rounded-xl p-4 text-center">
            <AmountDisplay value={displayAmount} symbol={asset} size="xl" weight="bold" decimals={displayDecimals} fixedDecimals={true} />
          </div>

          {/* From address */}
          <div className="bg-muted/50 space-y-3 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-10 shrink-0 text-xs"> {t('common:from')}</span>
              <ChainAddressDisplay chainId={resolvedChainId} address={from} copyable size="sm" />
            </div>
          </div>

          {amountInvalidMessage && (
            <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">
              {amountInvalidMessage}
            </div>
          )}

          {/* Chain & Asset */}
          <div className="bg-muted/50 flex items-center justify-between rounded-xl p-3">
            <span className="text-muted-foreground text-sm"> {t('common:network')}</span>
            <ChainBadge chainId={resolvedChainId} />
          </div>

          {/* Warning */}
          <div className="bg-destructive/10 flex items-start gap-2 rounded-xl p-3">
            <IconAlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" />
            <p className="text-destructive text-sm">{t('transaction:destroyPage.warning')}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4">
          <button
            onClick={handleCancel}
            disabled={isConfirming}
            className="bg-muted hover:bg-muted/80 flex-1 rounded-xl py-3 font-medium transition-colors disabled:opacity-50"
          >
            {t('common:cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming || !targetWallet?.id || !chainConfig || !parsedAmount}
            className={cn(
              'flex-1 rounded-xl py-3 font-medium transition-colors',
              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
              'flex items-center justify-center gap-2 disabled:opacity-50',
            )}
          >
            {isConfirming ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                {t('common:confirming')}
              </>
            ) : (
              <>
                <IconFlame className="size-4" />
                {t('transaction:destroyPage.confirm')}
              </>
            )}
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const MiniappDestroyConfirmJob: ActivityComponentType<MiniappDestroyConfirmJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <MiniappDestroyConfirmJobContent />
    </ActivityParamsProvider>
  );
};
