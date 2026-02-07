/**
 * MiniappSignTransactionJob - 小程序交易签名确认对话框
 * 用于小程序请求 `bio_signTransaction` 时显示
 */

import { useState, useCallback, useMemo } from 'react';
import type { ActivityComponentType } from '@stackflow/react';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import { useFlow } from '../../stackflow';
import { ActivityParamsProvider, useActivityParams } from '../../hooks';
import { setWalletLockConfirmCallback } from './WalletLockConfirmJob';
import { walletStore } from '@/stores';
import { findMiniappWalletIdByAddress, resolveMiniappChainId } from './miniapp-wallet';
import type { UnsignedTransaction } from '@/services/ecosystem';
import { superjson } from '@biochain/chain-effect';
import { signUnsignedTransaction } from '@/services/ecosystem/handlers';
import { MiniappSheetHeader } from '@/components/ecosystem';
import { ChainBadge } from '@/components/wallet/chain-icon';
import { ChainAddressDisplay } from '@/components/wallet/chain-address-display';

type MiniappSignTransactionJobParams = {
  /** 来源小程序名称 */
  appName: string;
  /** 来源小程序图标 */
  appIcon?: string;
  /** 签名地址 */
  from: string;
  /** 链 ID */
  chain: string;
  /** 未签名交易（superjson 字符串） */
  unsignedTx: string;
};

function MiniappSignTransactionJobContent() {
  const { t } = useTranslation('common');
  const { pop, push } = useFlow();
  const params = useActivityParams<MiniappSignTransactionJobParams>();
  const { appName, appIcon, from, chain, unsignedTx: unsignedTxJson } = params;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const unsignedTx = useMemo((): UnsignedTransaction | null => {
    try {
      return superjson.parse<UnsignedTransaction>(unsignedTxJson);
    } catch {
      return null;
    }
  }, [unsignedTxJson]);

  const resolvedChainId = useMemo(() => resolveMiniappChainId(chain), [chain]);

  const walletId = useMemo(() => {
    return findMiniappWalletIdByAddress(resolvedChainId, from);
  }, [resolvedChainId, from]);

  const targetWallet = walletStore.state.wallets.find((w) => w.id === walletId);
  const walletName = targetWallet?.name || t('unknownWallet');

  const handleConfirm = useCallback(() => {
    if (isSubmitting) return;
    if (!unsignedTx) return;
    if (!walletId) return;

    setWalletLockConfirmCallback(async (password: string) => {
      setIsSubmitting(true);
      try {
        const signedTx = await signUnsignedTransaction({
          walletId,
          password,
          from,
          chainId: resolvedChainId,
          unsignedTx,
        });

        const event = new CustomEvent('miniapp-sign-transaction-confirm', {
          detail: {
            confirmed: true,
            signedTx,
          },
        });
        window.dispatchEvent(event);

        pop();
        return true;
      } catch (error) {
        console.error("[miniapp-sign-transaction]", error);
        throw error instanceof Error ? error : new Error("Sign transaction failed");
      } finally {
        setIsSubmitting(false);
      }
    });

    push('WalletLockConfirmJob', {
      title: t('signTransaction'),
      description: appName || t('unknownDApp'),
      miniappName: appName,
      miniappIcon: appIcon,
      walletName,
      walletAddress: from,
      walletChainId: resolvedChainId,
    });
  }, [appIcon, appName, from, isSubmitting, pop, push, resolvedChainId, t, unsignedTx, walletId, walletName]);

  const handleCancel = useCallback(() => {
    const event = new CustomEvent('miniapp-sign-transaction-confirm', {
      detail: { confirmed: false },
    });
    window.dispatchEvent(event);
    pop();
  }, [pop]);

  const rawPreview = useMemo(() => {
    if (!unsignedTx) return '';
    try {
      return JSON.stringify(unsignedTx.data, null, 2);
    } catch {
      return String(unsignedTx.data);
    }
  }, [unsignedTx]);

  return (
    <BottomSheet onCancel={handleCancel}>
      <div className="bg-background rounded-t-2xl">
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        <MiniappSheetHeader
          title={t('signTransaction')}
          description={appName || t('unknownDApp')}
          appName={appName}
          appIcon={appIcon}
          walletInfo={{
            name: walletName,
            address: from,
            chainId: resolvedChainId,
          }}
        />

        <div className="space-y-4 p-4">
          {!unsignedTx && (
            <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">{t('invalidTransaction')}</div>
          )}

          {unsignedTx && !walletId && (
            <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              {t('signingAddressNotFound')}
            </div>
          )}

          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground mb-1 text-xs">{t('network')}</p>
            <ChainBadge chainId={resolvedChainId} />
          </div>

          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground mb-1 text-xs">{t('signingAddress')}</p>
            <ChainAddressDisplay chainId={resolvedChainId} address={from} copyable={false} size="sm" />
          </div>

          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-muted-foreground mb-1 text-xs">{t('transaction')}</p>
            <div className="max-h-44 overflow-y-auto">
              <pre className="font-mono text-xs break-all whitespace-pre-wrap">{rawPreview}</pre>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
            <IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800 dark:text-amber-200">{t('signTxWarning')}</p>
          </div>
        </div>

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
            disabled={isSubmitting || !unsignedTx || !walletId}
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

        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const MiniappSignTransactionJob: ActivityComponentType<MiniappSignTransactionJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <MiniappSignTransactionJobContent />
    </ActivityParamsProvider>
  );
};
