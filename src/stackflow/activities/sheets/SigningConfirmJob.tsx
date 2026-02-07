/**
 * SigningConfirmJob - 签名确认对话框
 * 用于小程序请求用户签名消息
 */

import { useCallback, useMemo, useState } from 'react';
import type { ActivityComponentType } from '@stackflow/react';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import { useFlow } from '../../stackflow';
import { ActivityParamsProvider, useActivityParams } from '../../hooks';
import { setWalletLockConfirmCallback } from './WalletLockConfirmJob';
import { SignatureAuthService, plaocAdapter } from '@/services/authorize';
import { MiniappSheetHeader } from '@/components/ecosystem';
import { findMiniappWalletByAddress, resolveMiniappChainId } from './miniapp-wallet';

type SigningConfirmJobParams = {
  /** 要签名的消息 */
  message: string;
  /** 签名地址 */
  address: string;
  /** 签名链 */
  chainName: string;
  /** 请求来源小程序名称 */
  appName?: string;
  /** 请求来源小程序图标 */
  appIcon?: string;
};

function SigningConfirmJobContent() {
  const { t } = useTranslation('common');
  const { pop, push } = useFlow();
  const { message, address, appName, appIcon, chainName } = useActivityParams<SigningConfirmJobParams>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestedChainId = useMemo(() => resolveMiniappChainId(chainName), [chainName]);

  const walletMatch = useMemo(
    () => findMiniappWalletByAddress(requestedChainId, address),
    [requestedChainId, address],
  );

  const targetWallet = walletMatch?.wallet;
  const resolvedChainId = walletMatch?.chainAddress.chain;
  const hasSigningWallet = Boolean(targetWallet?.encryptedMnemonic && resolvedChainId);
  const walletName = targetWallet?.name || t('unknownWallet');
  const displayChainId = resolvedChainId ?? requestedChainId;

  const handleConfirm = useCallback(() => {
    if (isSubmitting || !hasSigningWallet) return;

    // 设置钱包锁验证回调
    setWalletLockConfirmCallback(async (password: string) => {
      setIsSubmitting(true);

      try {
        if (!targetWallet || !targetWallet.encryptedMnemonic || !resolvedChainId) {
          throw new Error(t('signingAddressNotFound'));
        }

        // 创建签名服务 (使用临时 eventId)
        const eventId = `miniapp_sign_${Date.now()}`;
        const authService = new SignatureAuthService(plaocAdapter, eventId);

        // 执行真实签名（返回 { signature, publicKey }）
        const signResult = await authService.handleMessageSign(
          {
            chainName: resolvedChainId,
            senderAddress: address,
            message,
          },
          targetWallet.encryptedMnemonic,
          password,
        );

        // 发送成功事件（包含 signature 和 publicKey）
        const event = new CustomEvent('signing-confirm', {
          detail: {
            confirmed: true,
            signature: signResult.signature,
            publicKey: signResult.publicKey,
          },
        });
        window.dispatchEvent(event);

        pop();
        return true;
      } catch (error) {
        throw error instanceof Error ? error : new Error(t('walletLock.error'));
      } finally {
        setIsSubmitting(false);
      }
    });

    // 打开钱包锁验证
    push('WalletLockConfirmJob', {
      title: t('signMessage'),
      description: appName || t('unknownDApp'),
      miniappName: appName,
      miniappIcon: appIcon,
      walletName,
      walletAddress: address,
      walletChainId: displayChainId,
    });
  }, [isSubmitting, hasSigningWallet, address, message, pop, push, resolvedChainId, t, targetWallet, appName, appIcon, walletName, displayChainId]);

  const handleCancel = useCallback(() => {
    const event = new CustomEvent('signing-confirm', {
      detail: { confirmed: false },
    });
    window.dispatchEvent(event);
    pop();
  }, [pop]);

  // Check if message looks like hex data (potential risk)
  const isHexData = message.startsWith('0x') && /^0x[0-9a-fA-F]+$/.test(message);

  return (
    <BottomSheet onCancel={handleCancel}>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        {/* Header */}
        <MiniappSheetHeader
          title={t('signMessage')}
          description={appName || t('unknownDApp')}
          appName={appName}
          appIcon={appIcon}
          walletInfo={{
            name: walletName,
            address,
            chainId: displayChainId,
          }}
        />

        {/* Content */}
        <div className="space-y-4 p-4">
          {!hasSigningWallet && (
            <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              {t('signingAddressNotFound')}
            </div>
          )}

          {/* Message */}
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground mb-1 text-xs"> {t('message')}</p>
            <div className="max-h-40 overflow-y-auto">
              <pre className="font-mono text-sm break-all whitespace-pre-wrap">{message}</pre>
            </div>
          </div>

          {/* Warning for hex data */}
          {isHexData && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
              <IconAlertTriangle className="size-5 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800 dark:text-amber-200">{t('hexDataWarning')}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="bg-muted hover:bg-muted/80 flex-1 rounded-xl py-3 font-medium transition-colors disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !hasSigningWallet}
            className={cn(
              'flex-1 rounded-xl py-3 font-medium transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'flex items-center justify-center gap-2 disabled:opacity-50',
            )}
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                {t('signing')}
              </>
            ) : (
              t('sign')
            )}
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const SigningConfirmJob: ActivityComponentType<SigningConfirmJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <SigningConfirmJobContent />
    </ActivityParamsProvider>
  );
};
