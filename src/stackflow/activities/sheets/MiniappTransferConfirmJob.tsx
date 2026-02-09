/**
 * MiniappTransferConfirmJob - 小程序转账确认对话框
 * 用于小程序请求发送转账时显示
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { ActivityComponentType } from '@stackflow/react';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { IconArrowDown, IconAlertTriangle, IconLoader2 } from '@tabler/icons-react';
import { useFlow } from '../../stackflow';
import { ActivityParamsProvider, useActivityParams } from '../../hooks';
import { walletStore } from '@/stores';
import { AddressDisplay } from '@/components/wallet/address-display';
import { AmountDisplay } from '@/components/common/amount-display';
import { MiniappSheetHeader } from '@/components/ecosystem';
import { ChainBadge } from '@/components/wallet/chain-icon';
import { PatternLock, patternToString } from '@/components/security/pattern-lock';
import { PasswordInput } from '@/components/security/password-input';
import { getChainProvider } from '@/services/chain-adapter/providers';
import { Amount } from '@/types/amount';
import { signUnsignedTransaction } from '@/services/ecosystem/handlers';
import { chainConfigService } from '@/services/chain-config/service';
import { useToast } from '@/services';
import { findMiniappWalletIdByAddress, resolveMiniappChainId } from './miniapp-wallet';
import { createMiniappUnsupportedPipelineError, mapMiniappTransferErrorToMessage } from './miniapp-transfer-error';
import {
  isMiniappWalletLockError,
  isMiniappTwoStepSecretError,
  resolveMiniappTwoStepSecretRequired,
} from './miniapp-auth';
import { MiniappStepProgress } from './MiniappStepProgress';
import {
  deriveMiniappFlowProgress,
  deriveMiniappTransferFlowSteps,
  type MiniappTransferFlowStep,
} from './miniapp-step-flow';

type MiniappTransferConfirmJobParams = {
  /** 请求标识（用于 FIFO 事件隔离） */
  requestId?: string;
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

type TransferStep = MiniappTransferFlowStep;
type TransferInputStep = 'wallet_lock' | 'two_step_secret';
type TransferPhase = 'idle' | 'building' | 'broadcasting' | 'success';

type MiniappTransferResultDetail = {
  requestId?: string;
  confirmed: boolean;
  txHash?: string;
  txId?: string;
  transaction?: Record<string, unknown>;
};

type MiniappTransferSheetClosedDetail = {
  requestId?: string;
  reason: 'cancel' | 'confirmed' | 'background';
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function cloneTransactionRecord(record: Record<string, unknown>): Record<string, unknown> {
  if (typeof structuredClone === 'function') {
    try {
      const cloned = structuredClone(record);
      if (isRecord(cloned)) {
        return cloned;
      }
    } catch {
      // fallback to JSON clone
    }
  }

  try {
    const cloned = JSON.parse(JSON.stringify(record)) as unknown;
    if (isRecord(cloned)) {
      return cloned;
    }
  } catch {
    // fallback to shallow clone
  }

  return { ...record };
}

const SUCCESS_CLOSE_SECONDS = 3;
const pendingUnmountSettleTimers = new Map<string, number>();

function MiniappTransferConfirmJobContent() {
  const { t } = useTranslation(['common', 'transaction']);
  const { pop } = useFlow();
  const toast = useToast();
  const params = useActivityParams<MiniappTransferConfirmJobParams>();
  const { requestId, appName, appIcon, from, to, amount, chain, asset } = params;
  const fallbackRequestIdRef = useRef(requestId ?? `legacy-transfer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const effectiveRequestId = fallbackRequestIdRef.current;

  const [step, setStep] = useState<TransferStep>('review');
  const [pattern, setPattern] = useState<number[]>([]);
  const [twoStepSecret, setTwoStepSecret] = useState('');
  const [patternError, setPatternError] = useState(false);
  const [twoStepSecretError, setTwoStepSecretError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phase, setPhase] = useState<TransferPhase>('idle');
  const [successCountdown, setSuccessCountdown] = useState<number | null>(null);
  const [requiresTwoStepSecret, setRequiresTwoStepSecret] = useState(false);
  const [isResolvingTwoStepSecret, setIsResolvingTwoStepSecret] = useState(true);

  const isMountedRef = useRef(true);
  const isBackgroundBroadcastRef = useRef(false);
  const didDispatchResultRef = useRef(false);
  const didDispatchCloseRef = useRef(false);
  const transferInFlightRef = useRef(false);

  const resolvedChainId = useMemo(() => resolveMiniappChainId(chain), [chain]);
  const walletId = useMemo(() => findMiniappWalletIdByAddress(resolvedChainId, from), [resolvedChainId, from]);
  const targetWallet = walletStore.state.wallets.find((wallet) => wallet.id === walletId);
  const walletName = targetWallet?.name || t('unknownWallet');
  const lockDescription = `${appName || t('unknownDApp')} ${t('requestsTransfer')}`;
  const flowSteps = useMemo(() => deriveMiniappTransferFlowSteps(requiresTwoStepSecret), [requiresTwoStepSecret]);
  const flowProgress = useMemo(() => deriveMiniappFlowProgress(flowSteps, step), [flowSteps, step]);

  const displayAsset = useMemo(() => {
    if (asset) return asset;
    const chainSymbol = chainConfigService.getSymbol(resolvedChainId);
    return chainSymbol || resolvedChainId.toUpperCase();
  }, [asset, resolvedChainId]);

  const transferShortTitle = useMemo(
    () => t('transaction:miniappTransfer.shortTitle', { amount, asset: displayAsset }),
    [t, amount, displayAsset],
  );
  const isBuilding = phase === 'building';
  const isBroadcasting = phase === 'broadcasting';
  const isSuccess = phase === 'success';
  const isBusy = phase === 'building' || phase === 'broadcasting';

  const logTransferSheet = useCallback(
    (stage: string, payload: Record<string, unknown> = {}) => {
      console.log('[miniapp-transfer-sheet]', stage, {
        requestId: effectiveRequestId,
        appName,
        chain: resolvedChainId,
        ...payload,
      });
    },
    [appName, effectiveRequestId, resolvedChainId],
  );

  const resetWalletLockStepState = useCallback(() => {
    setPattern([]);
    setPatternError(false);
    setTwoStepSecret('');
    setTwoStepSecretError(false);
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    if (typeof window !== 'undefined') {
      const pendingTimer = pendingUnmountSettleTimers.get(effectiveRequestId);
      if (pendingTimer !== undefined) {
        window.clearTimeout(pendingTimer);
        pendingUnmountSettleTimers.delete(effectiveRequestId);
        logTransferSheet('sheet.unmount-settle.cancelled');
      }
    }

    logTransferSheet('sheet.mount', {
      from,
      to,
      amount,
      asset: asset ?? 'native',
    });

    if (!requestId) {
      logTransferSheet('sheet.request-id.fallback', {
        fallbackRequestId: effectiveRequestId,
      });
    }

    return () => {
      isMountedRef.current = false;
      logTransferSheet('sheet.unmount');

      if (typeof window === 'undefined' || !requestId) {
        return;
      }

      const settleTimer = window.setTimeout(() => {
        pendingUnmountSettleTimers.delete(effectiveRequestId);

        if (!didDispatchResultRef.current) {
          didDispatchResultRef.current = true;
          const resultPayload: MiniappTransferResultDetail = {
            requestId: effectiveRequestId,
            confirmed: false,
          };
          logTransferSheet('sheet.emit.on-unmount', { confirmed: false, hasTxHash: false, hasTransaction: false });
          window.dispatchEvent(
            new CustomEvent('miniapp-transfer-confirm', {
              detail: resultPayload,
            }),
          );
        }

        if (!didDispatchCloseRef.current) {
          didDispatchCloseRef.current = true;
          const closePayload: MiniappTransferSheetClosedDetail = {
            requestId: effectiveRequestId,
            reason: 'cancel',
          };
          logTransferSheet('sheet.closed.on-unmount', closePayload);
          window.dispatchEvent(
            new CustomEvent('miniapp-transfer-sheet-closed', {
              detail: closePayload,
            }),
          );
        }
      }, 0);

      pendingUnmountSettleTimers.set(effectiveRequestId, settleTimer);
    };
  }, [amount, asset, effectiveRequestId, from, logTransferSheet, requestId, to]);

  useEffect(() => {
    let mounted = true;

    setIsResolvingTwoStepSecret(true);
    resolveMiniappTwoStepSecretRequired(resolvedChainId, from)
      .then((required) => {
        if (!mounted) return;
        setRequiresTwoStepSecret(required);
      })
      .finally(() => {
        if (!mounted) return;
        setIsResolvingTwoStepSecret(false);
      });

    return () => {
      mounted = false;
    };
  }, [resolvedChainId, from]);


  const emitTransferResult = useCallback((detail: MiniappTransferResultDetail) => {
    if (didDispatchResultRef.current) {
      return;
    }

    didDispatchResultRef.current = true;
    if (typeof window === 'undefined') {
      return;
    }

    const payload: MiniappTransferResultDetail = {
      requestId: effectiveRequestId,
      ...detail,
    };

    logTransferSheet('sheet.emit', {
      confirmed: payload.confirmed,
      hasTxHash: Boolean(payload.txHash),
      hasTransaction: Boolean(payload.transaction),
      txId: payload.txId,
    });

    window.dispatchEvent(
      new CustomEvent('miniapp-transfer-confirm', {
        detail: payload,
      }),
    );
  }, [effectiveRequestId, logTransferSheet]);

  const emitSheetClosed = useCallback((reason: MiniappTransferSheetClosedDetail['reason']) => {
    if (didDispatchCloseRef.current) {
      return;
    }

    didDispatchCloseRef.current = true;
    if (typeof window === 'undefined') {
      return;
    }

    const payload: MiniappTransferSheetClosedDetail = {
      requestId: effectiveRequestId,
      reason,
    };

    logTransferSheet('sheet.closed', payload);
    window.dispatchEvent(
      new CustomEvent('miniapp-transfer-sheet-closed', {
        detail: payload,
      }),
    );
  }, [effectiveRequestId, logTransferSheet]);

  useEffect(() => {
    if (!isSuccess || successCountdown === null) {
      return;
    }

    if (successCountdown <= 0) {
      logTransferSheet('sheet.success.auto-close');
      emitSheetClosed('confirmed');
      pop();
      return;
    }

    const timer = window.setTimeout(() => {
      setSuccessCountdown((prev) => {
        if (prev === null) return null;
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [emitSheetClosed, isSuccess, logTransferSheet, pop, successCountdown]);

  const moveToBackgroundBroadcast = useCallback(() => {
    if (!isBroadcasting || isBackgroundBroadcastRef.current) {
      return;
    }

    isBackgroundBroadcastRef.current = true;
    logTransferSheet('sheet.background-broadcast');
    emitSheetClosed('background');
    void toast.show(
      t('transaction:miniappTransfer.toast.background', {
        title: transferShortTitle,
      }),
    );
    pop();
  }, [emitSheetClosed, isBroadcasting, logTransferSheet, pop, t, toast, transferShortTitle]);

  const handleEnterWalletLockStep = useCallback(() => {
    if (isBusy || !walletId) return;
    resetWalletLockStepState();
    setStep('wallet_lock');
  }, [isBusy, walletId, resetWalletLockStepState]);

  const handleBackToReview = useCallback(() => {
    if (isBusy) return;
    resetWalletLockStepState();
    setStep('review');
  }, [isBusy, resetWalletLockStepState]);

  const handlePatternChange = useCallback(
    (nextPattern: number[]) => {
      if (patternError || errorMessage || twoStepSecretError) {
        setPatternError(false);
        setTwoStepSecretError(false);
        setErrorMessage(null);
      }
      setPattern(nextPattern);
    },
    [patternError, errorMessage, twoStepSecretError],
  );

  const handleTwoStepSecretChange = useCallback(
    (value: string) => {
      if (twoStepSecretError || errorMessage) {
        setTwoStepSecretError(false);
        setErrorMessage(null);
      }
      setTwoStepSecret(value);
    },
    [twoStepSecretError, errorMessage],
  );

  const performTransfer = useCallback(
    async (password: string, paySecret?: string) => {
      if (!walletId) {
        throw new Error('missing walletId');
      }

      const provider = getChainProvider(resolvedChainId);
      if (
        !provider.supportsFullTransaction ||
        !provider.buildTransaction ||
        !provider.signTransaction ||
        !provider.broadcastTransaction
      ) {
        throw createMiniappUnsupportedPipelineError(resolvedChainId);
      }

      const decimals = chainConfigService.getDecimals(resolvedChainId);
      const chainSymbol = chainConfigService.getSymbol(resolvedChainId);
      const symbol = (asset ?? chainSymbol) || resolvedChainId.toUpperCase();
      const valueAmount = Amount.parse(amount, decimals, symbol);

      const unsignedTx = await provider.buildTransaction({
        type: 'transfer',
        from,
        to,
        amount: valueAmount,
        ...(asset ? { bioAssetType: asset } : {}),
      });

      const signedTx = await signUnsignedTransaction({
        walletId,
        password,
        from,
        chainId: resolvedChainId,
        unsignedTx,
        ...(paySecret ? { paySecret } : {}),
      });

      const signedTxForBroadcast = isRecord(signedTx.data)
        ? {
          ...signedTx,
          data: cloneTransactionRecord(signedTx.data),
        }
        : signedTx;

      if (isMountedRef.current) {
        setStep('broadcasting');
        setPhase('broadcasting');
      }

      const txHash = await provider.broadcastTransaction(signedTxForBroadcast);
      const transaction = isRecord(signedTxForBroadcast.data)
        ? cloneTransactionRecord(signedTxForBroadcast.data)
        : { data: signedTxForBroadcast.data };

      return { txHash, transaction };
    },
    [resolvedChainId, asset, amount, from, to, walletId],
  );

  const handleTransferFailure = useCallback(
    (error: unknown, inputStep: TransferInputStep) => {
      const mappedError = mapMiniappTransferErrorToMessage(t, error, resolvedChainId);
      if (isBackgroundBroadcastRef.current) {
        if (isMountedRef.current) {
          setStep(inputStep);
          setPhase('idle');
        }
        emitTransferResult({ confirmed: false });
        void toast.show(
          t('transaction:miniappTransfer.toast.failed', {
            title: transferShortTitle,
            reason: mappedError,
          }),
        );
        return;
      }

      if (!isMountedRef.current) {
        logTransferSheet('transfer.failed.after-unmount', {
          inputStep,
          message: mappedError,
        });
        return;
      }

      setPhase('idle');

      if (isMiniappWalletLockError(error)) {
        setPatternError(true);
        setTwoStepSecretError(false);
        setErrorMessage(t('walletLock.error'));
        setStep('wallet_lock');
        setPattern([]);
        return;
      }

      if (isMiniappTwoStepSecretError(error)) {
        setPatternError(false);
        setTwoStepSecretError(true);
        setErrorMessage(t('transaction:sendPage.twoStepSecretError'));
        setStep('two_step_secret');
        return;
      }

      setPatternError(false);
      setTwoStepSecretError(false);
      setErrorMessage(mappedError);
      setStep(inputStep);

      if (inputStep === 'wallet_lock') {
        setPattern([]);
      }
    },
    [emitTransferResult, logTransferSheet, resolvedChainId, t, toast, transferShortTitle],
  );

  const runTransfer = useCallback(
    async (password: string, inputStep: TransferInputStep, paySecret?: string) => {
      if (transferInFlightRef.current) {
        logTransferSheet('transfer.skip.in-flight', { inputStep });
        return;
      }

      let transferSucceeded = false;
      transferInFlightRef.current = true;
      logTransferSheet('transfer.start', {
        inputStep,
        hasPaySecret: Boolean(paySecret),
      });
      setPhase('building');
      setPatternError(false);
      setTwoStepSecretError(false);
      setErrorMessage(null);

      try {
        const { txHash, transaction } = await performTransfer(password, paySecret);
        transferSucceeded = true;
        logTransferSheet('transfer.broadcast.success', { txHash });

        if (isBackgroundBroadcastRef.current || !isMountedRef.current) {
          void toast.show(
            t('transaction:miniappTransfer.toast.success', {
              title: transferShortTitle,
            }),
          );
        }

        emitTransferResult({
          confirmed: true,
          txHash,
          txId: txHash,
          transaction,
        });

        if (!isBackgroundBroadcastRef.current && isMountedRef.current) {
          setStep('broadcasting');
          setPhase('success');
          setSuccessCountdown(SUCCESS_CLOSE_SECONDS);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logTransferSheet('transfer.failed', { inputStep, message });

        if (inputStep === 'two_step_secret') {
          console.error('[miniapp-transfer][two-step-secret]', error);
        } else {
          console.error('[miniapp-transfer]', error);
        }

        handleTransferFailure(error, inputStep);
      } finally {
        logTransferSheet('transfer.finally', {
          inputStep,
          backgrounded: isBackgroundBroadcastRef.current,
        });
        transferInFlightRef.current = false;
        if (isMountedRef.current && !isBackgroundBroadcastRef.current && !transferSucceeded) {
          setPhase('idle');
        }
      }
    },
    [emitTransferResult, handleTransferFailure, logTransferSheet, performTransfer, t, toast, transferShortTitle],
  );

  const handlePatternComplete = useCallback(
    async (nodes: number[]) => {
      if (nodes.length < 4 || isBusy || transferInFlightRef.current || !walletId) {
        return;
      }

      const password = patternToString(nodes);
      await runTransfer(password, 'wallet_lock');
    },
    [isBusy, walletId, runTransfer],
  );

  const handleTwoStepSecretSubmit = useCallback(async () => {
    if (!walletId || !pattern.length || !twoStepSecret.trim() || isBusy || transferInFlightRef.current) {
      return;
    }

    const password = patternToString(pattern);
    await runTransfer(password, 'two_step_secret', twoStepSecret.trim());
  }, [walletId, pattern, twoStepSecret, isBusy, runTransfer]);

  const handleTwoStepSecretConfirm = useCallback(() => {
    void handleTwoStepSecretSubmit();
  }, [handleTwoStepSecretSubmit]);

  const handleSuccessClose = useCallback(() => {
    logTransferSheet('sheet.success.manual-close', {
      countdown: successCountdown,
    });
    emitSheetClosed('confirmed');
    pop();
  }, [emitSheetClosed, logTransferSheet, pop, successCountdown]);

  const handleCancel = useCallback(() => {
    if (isSuccess) {
      handleSuccessClose();
      return;
    }

    if (isBroadcasting) {
      logTransferSheet('sheet.cancel.broadcasting');
      moveToBackgroundBroadcast();
      return;
    }

    if (isBuilding) {
      logTransferSheet('sheet.cancel.blocked-building');
      return;
    }

    logTransferSheet('sheet.cancel.idle');
    emitTransferResult({ confirmed: false });
    emitSheetClosed('cancel');
    pop();
  }, [emitSheetClosed, emitTransferResult, handleSuccessClose, isBroadcasting, isBuilding, isSuccess, logTransferSheet, moveToBackgroundBroadcast, pop]);

  return (
    <BottomSheet onCancel={handleCancel}>
      <div className="bg-background rounded-t-2xl">
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        <MiniappSheetHeader
          title={t('confirmTransfer')}
          description={
            isBuilding
              ? t('buildingTransaction')
              : step === 'review'
                ? lockDescription
                : step === 'wallet_lock'
                  ? t('drawPatternToConfirm')
                  : step === 'two_step_secret'
                    ? t('transaction:sendPage.twoStepSecretDescription')
                    : isSuccess
                      ? t('transaction:txStatus.broadcastedDesc')
                      : t('transaction:txStatus.broadcasting')
          }
          appName={appName}
          appIcon={appIcon}
          walletInfo={{
            name: walletName,
            address: from,
            chainId: resolvedChainId,
          }}
        />

        <div className="px-4 pt-4">
          <MiniappStepProgress
            currentStep={flowProgress.currentStep}
            totalSteps={flowProgress.totalSteps}
            percent={flowProgress.percent}
          />
        </div>

        {step === 'review' ? (
          <>
            <div className="space-y-4 p-4">
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

              <div className="bg-muted/50 space-y-3 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground w-10 shrink-0 text-xs"> {t('from')}</span>
                  <AddressDisplay address={from} copyable className="flex-1 text-sm" />
                </div>

                <div className="flex justify-center">
                  <IconArrowDown className="text-muted-foreground size-4" />
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground w-10 shrink-0 text-xs"> {t('to')}</span>
                  <AddressDisplay address={to} copyable className="flex-1 text-sm" />
                </div>
              </div>

              {!walletId && (
                <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  {t('signingAddressNotFound')}
                </div>
              )}

              <div className="bg-muted/50 flex items-center justify-between rounded-xl p-3">
                <span className="text-muted-foreground text-sm"> {t('network')}</span>
                <ChainBadge chainId={resolvedChainId} />
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
                <IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-800 dark:text-amber-200">{t('transferWarning')}</p>
              </div>
            </div>

            <div className="flex gap-3 p-4">
              <button
                onClick={handleCancel}
                disabled={isBusy}
                className="bg-muted hover:bg-muted/80 flex-1 rounded-xl py-3 font-medium transition-colors disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                data-testid="miniapp-transfer-review-confirm"
                onClick={handleEnterWalletLockStep}
                disabled={isBusy || !walletId || isResolvingTwoStepSecret}
                className={cn(
                  'flex-1 rounded-xl py-3 font-medium transition-colors',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'flex items-center justify-center gap-2 disabled:opacity-50',
                )}
              >
                {t('confirm')}
              </button>
            </div>
          </>
        ) : step === 'wallet_lock' ? (
          <>
            <div className="space-y-4 p-4">
              {!walletId && (
                <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  {t('signingAddressNotFound')}
                </div>
              )}

              <PatternLock
                value={pattern}
                onChange={handlePatternChange}
                onComplete={handlePatternComplete}
                minPoints={4}
                disabled={isBusy || !walletId}
                error={patternError}
                errorText={patternError ? t('walletLock.error') : undefined}
              />

              {errorMessage && !patternError && (
                <div data-testid="miniapp-transfer-error" className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">{errorMessage}</div>
              )}

              {isBuilding && (
                <div
                  data-testid="miniapp-transfer-building-status"
                  className="bg-muted text-muted-foreground flex items-center justify-center gap-2 rounded-xl p-3 text-sm"
                >
                  <IconLoader2 className="size-4 animate-spin" />
                  {t('buildingTransaction')}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-4">
              <button
                onClick={handleBackToReview}
                disabled={isBusy}
                className="bg-muted hover:bg-muted/80 flex-1 rounded-xl py-3 font-medium transition-colors disabled:opacity-50"
              >
                {t('back')}
              </button>
              <button
                onClick={handleCancel}
                disabled={isBusy}
                className="bg-muted hover:bg-muted/80 flex-1 rounded-xl py-3 font-medium transition-colors disabled:opacity-50"
              >
                {t('cancel')}
              </button>
            </div>
          </>
        ) : step === 'two_step_secret' ? (
          <>
            <div className="space-y-4 p-4">
              <PasswordInput
                value={twoStepSecret}
                onChange={(event) => handleTwoStepSecretChange(event.target.value)}
                placeholder={t('transaction:sendPage.twoStepSecretPlaceholder')}
                disabled={isBusy}
                aria-describedby={errorMessage ? 'miniapp-two-step-secret-error' : undefined}
                data-testid="miniapp-two-step-secret-input"
              />

              {errorMessage && (
                <div
                  id="miniapp-two-step-secret-error"
                  data-testid="miniapp-transfer-error"
                  className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm"
                >
                  {errorMessage}
                </div>
              )}

              {isBuilding && (
                <div
                  data-testid="miniapp-transfer-building-status"
                  className="bg-muted text-muted-foreground flex items-center justify-center gap-2 rounded-xl p-3 text-sm"
                >
                  <IconLoader2 className="size-4 animate-spin" />
                  {t('buildingTransaction')}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-4">
              <button
                onClick={handleBackToReview}
                disabled={isBusy}
                className="bg-muted hover:bg-muted/80 flex-1 rounded-xl py-3 font-medium transition-colors disabled:opacity-50"
              >
                {t('back')}
              </button>
              <button
                onClick={handleTwoStepSecretConfirm}
                disabled={isBusy || twoStepSecret.trim().length === 0}
                className={cn(
                  'flex-1 rounded-xl py-3 font-medium transition-colors',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'disabled:opacity-50',
                )}
              >
                {t('confirm')}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4 p-4">
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

            <div className="bg-muted/50 space-y-3 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-10 shrink-0 text-xs"> {t('from')}</span>
                <AddressDisplay address={from} copyable className="flex-1 text-sm" />
              </div>

              <div className="flex justify-center">
                <IconArrowDown className="text-muted-foreground size-4" />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-10 shrink-0 text-xs"> {t('to')}</span>
                <AddressDisplay address={to} copyable className="flex-1 text-sm" />
              </div>
            </div>

            <div className="bg-muted/50 flex items-center justify-between rounded-xl p-3">
              <span className="text-muted-foreground text-sm"> {t('network')}</span>
              <ChainBadge chainId={resolvedChainId} />
            </div>

            {isSuccess ? (
              <>
                <div
                  data-testid="miniapp-transfer-broadcast-success-status"
                  className="bg-muted text-muted-foreground flex items-center justify-center gap-2 rounded-xl p-3 text-sm"
                >
                  {t('transaction:txStatus.broadcasted')}
                </div>

                <button
                  type="button"
                  data-testid="miniapp-transfer-success-close"
                  onClick={handleSuccessClose}
                  className={cn(
                    'w-full rounded-xl py-3 font-medium transition-colors',
                    'bg-primary text-primary-foreground hover:bg-primary/90',
                  )}
                >
                  {t('transaction:txStatus.closeIn', { seconds: successCountdown ?? 0 })}
                </button>
              </>
            ) : (
              <>
                <div
                  data-testid="miniapp-transfer-broadcasting-status"
                  className="bg-muted text-muted-foreground flex items-center justify-center gap-2 rounded-xl p-3 text-sm"
                >
                  <IconLoader2 className="size-4 animate-spin" />
                  {t('transaction:txStatus.broadcasting')}
                </div>

                <button
                  type="button"
                  data-testid="miniapp-transfer-background-broadcast"
                  onClick={moveToBackgroundBroadcast}
                  disabled={!isBroadcasting}
                  className={cn(
                    'w-full rounded-xl py-3 font-medium transition-colors',
                    'bg-muted hover:bg-muted/80 text-foreground',
                    'disabled:opacity-50',
                  )}
                >
                  {t('transaction:miniappTransfer.backgroundBroadcast')}
                </button>
              </>
            )}
          </div>
        )}

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
