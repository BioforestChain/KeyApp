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
import { Input } from '@/components/ui/input';
import { getChainProvider } from '@/services/chain-adapter/providers';
import { signUnsignedTransaction } from '@/services/ecosystem/handlers';
import { chainConfigService } from '@/services/chain-config/service';
import { useToast } from '@/services';
import { superjson } from '@biochain/chain-effect';
import { Amount } from '@/types/amount';
import { findMiniappWalletIdByAddress, resolveMiniappChainId } from './miniapp-wallet';
import { createMiniappUnsupportedPipelineError, resolveMiniappTransferErrorFeedback } from './miniapp-transfer-error';
import { parseMiniappTransferAmountRaw } from './miniapp-transfer-amount';
import type { SignedTransaction, UnsignedTransaction } from '@/services/ecosystem';
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
  /** 处理模式（默认 send） */
  mode?: 'send' | 'sign';
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
  /** 业务备注（透传到交易体） */
  remark?: Record<string, string>;
  /** sign 模式下使用的未签名交易（superjson 字符串） */
  unsignedTx?: string;
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
  signedTx?: SignedTransaction;
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

function parseAmountLike(value: unknown): Amount | null {
  if (value instanceof Amount) {
    return value;
  }
  if (!isRecord(value)) {
    return null;
  }

  const rawValue = value.raw;
  const decimalsValue = value.decimals;
  const symbolValue = value.symbol;

  const raw =
    typeof rawValue === 'string'
      ? rawValue
      : typeof rawValue === 'number'
        ? String(rawValue)
        : null;
  const decimals = typeof decimalsValue === 'number' ? decimalsValue : null;
  const symbol = typeof symbolValue === 'string' ? symbolValue : undefined;

  if (!raw || decimals === null || !/^-?\d+$/.test(raw)) {
    return null;
  }

  try {
    return Amount.fromRaw(raw, decimals, symbol);
  } catch {
    return null;
  }
}

const SUCCESS_CLOSE_SECONDS = 3;
const pendingUnmountSettleTimers = new Map<string, number>();

function MiniappTransferConfirmJobContent() {
  const { t } = useTranslation(['common', 'transaction']);
  const { pop } = useFlow();
  const toast = useToast();
  const params = useActivityParams<MiniappTransferConfirmJobParams>();
  const { requestId, mode, appName, appIcon, from, to, amount, chain, asset, remark, unsignedTx: unsignedTxJson } = params;
  const fallbackRequestIdRef = useRef(requestId ?? `legacy-transfer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const effectiveRequestId = fallbackRequestIdRef.current;
  const isSignMode = mode === 'sign';

  const [step, setStep] = useState<TransferStep>('review');
  const [pattern, setPattern] = useState<number[]>([]);
  const [twoStepSecret, setTwoStepSecret] = useState('');
  const [patternError, setPatternError] = useState(false);
  const [twoStepSecretError, setTwoStepSecretError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [phase, setPhase] = useState<TransferPhase>('idle');
  const [successCountdown, setSuccessCountdown] = useState<number | null>(null);
  const [requiresTwoStepSecret, setRequiresTwoStepSecret] = useState(false);
  const [isResolvingTwoStepSecret, setIsResolvingTwoStepSecret] = useState(true);
  const [feeInput, setFeeInput] = useState('');
  const [feeSymbol, setFeeSymbol] = useState('');
  const [feeDecimals, setFeeDecimals] = useState(0);
  const [isFeeEstimating, setIsFeeEstimating] = useState(false);
  const [feeEstimateError, setFeeEstimateError] = useState<string | null>(null);

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
  const displayDecimals = useMemo(() => chainConfigService.getDecimals(resolvedChainId), [resolvedChainId]);
  const chainSymbol = useMemo(
    () => chainConfigService.getSymbol(resolvedChainId) || resolvedChainId.toUpperCase(),
    [resolvedChainId],
  );

  const parsedAmount = useMemo(() => {
    try {
      return parseMiniappTransferAmountRaw(amount, displayDecimals, displayAsset);
    } catch {
      return null;
    }
  }, [amount, displayDecimals, displayAsset]);
  const providedUnsignedTx = useMemo(() => {
    if (!isSignMode || !unsignedTxJson) {
      return null;
    }

    try {
      return superjson.parse<UnsignedTransaction>(unsignedTxJson);
    } catch {
      return null;
    }
  }, [isSignMode, unsignedTxJson]);
  const parsedFeeAmount = useMemo(() => {
    if (!isSignMode) {
      return null;
    }

    const feeText = feeInput.trim();
    if (feeText.length === 0) {
      return null;
    }

    return Amount.tryFromFormatted(feeText, feeDecimals, feeSymbol) ?? null;
  }, [feeDecimals, feeInput, feeSymbol, isSignMode]);

  const displayAmount = useMemo(() => parsedAmount?.toFormatted({ trimTrailingZeros: false }) ?? amount, [parsedAmount, amount]);
  const amountInvalidMessage = useMemo(
    () => (parsedAmount ? null : t('transaction:broadcast.invalidParams')),
    [parsedAmount, t],
  );
  const remarkEntries = useMemo(() => {
    if (!remark) {
      return [] as Array<{ key: string; value: string }>;
    }

    return Object.entries(remark)
      .map(([key, value]) => ({
        key: key.trim(),
        value: value.trim(),
      }))
      .filter((entry) => entry.key.length > 0 && entry.value.length > 0);
  }, [remark]);

  const transferShortTitle = useMemo(
    () => t('transaction:miniappTransfer.shortTitle', { amount: displayAmount, asset: displayAsset }),
    [t, displayAmount, displayAsset],
  );
  const isBuilding = phase === 'building';
  const isBroadcasting = phase === 'broadcasting';
  const isSuccess = phase === 'success';
  const isBusy = phase === 'building' || phase === 'broadcasting';
  const feeInputInvalid = isSignMode && feeInput.trim().length > 0 && !parsedFeeAmount;

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
    setErrorDetail(null);
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
      mode: isSignMode ? 'sign' : 'send',
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
  }, [amount, asset, effectiveRequestId, from, isSignMode, logTransferSheet, requestId, to]);

  useEffect(() => {
    if (!isSignMode || !providedUnsignedTx) {
      return;
    }

    let cancelled = false;
    const existingFee = parseAmountLike((providedUnsignedTx as { estimatedFee?: unknown }).estimatedFee);
    if (existingFee) {
      setFeeSymbol(existingFee.symbol || chainSymbol);
      setFeeDecimals(existingFee.decimals);
      setFeeInput(existingFee.toFormatted({ trimTrailingZeros: false }));
      setFeeEstimateError(null);
      setIsFeeEstimating(false);
      return;
    }

    const provider = getChainProvider(resolvedChainId);
    const estimateFee = provider.estimateFee;
    if (!estimateFee) {
      setFeeSymbol(chainSymbol);
      setFeeDecimals(displayDecimals);
      setFeeEstimateError(t('transaction:sendPage.feeUnavailable'));
      setIsFeeEstimating(false);
      return;
    }

    setFeeSymbol(chainSymbol);
    setFeeDecimals(displayDecimals);
    setFeeEstimateError(null);
    setIsFeeEstimating(true);

    void estimateFee(providedUnsignedTx)
      .then((feeEstimate) => {
        if (cancelled) {
          return;
        }
        const standardFee = feeEstimate.standard.amount;
        setFeeSymbol(standardFee.symbol || chainSymbol);
        setFeeDecimals(standardFee.decimals);
        setFeeInput(standardFee.toFormatted({ trimTrailingZeros: false }));
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setFeeEstimateError(t('transaction:sendPage.feeUnavailable'));
      })
      .finally(() => {
        if (cancelled) {
          return;
        }
        setIsFeeEstimating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chainSymbol, displayDecimals, isSignMode, providedUnsignedTx, resolvedChainId, t]);

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
      hasSignedTx: Boolean(payload.signedTx),
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
      if (patternError || errorMessage || twoStepSecretError || errorDetail) {
        setPatternError(false);
        setTwoStepSecretError(false);
        setErrorMessage(null);
        setErrorDetail(null);
      }
      setPattern(nextPattern);
    },
    [patternError, errorMessage, twoStepSecretError, errorDetail],
  );

  const handleTwoStepSecretChange = useCallback(
    (value: string) => {
      if (twoStepSecretError || errorMessage || errorDetail) {
        setTwoStepSecretError(false);
        setErrorMessage(null);
        setErrorDetail(null);
      }
      setTwoStepSecret(value);
    },
    [twoStepSecretError, errorMessage, errorDetail],
  );

  const performTransfer = useCallback(
    async (password: string, paySecret?: string) => {
      if (!walletId) {
        throw new Error('missing walletId');
      }

      if (isSignMode) {
        if (!providedUnsignedTx) {
          throw new Error('Missing unsigned transaction payload');
        }

        const unsignedTxForSign: UnsignedTransaction = parsedFeeAmount
          ? {
              ...providedUnsignedTx,
              estimatedFee: parsedFeeAmount,
            }
          : providedUnsignedTx;

        const signedTx = await signUnsignedTransaction({
          walletId,
          password,
          from,
          chainId: resolvedChainId,
          unsignedTx: unsignedTxForSign,
          ...(paySecret ? { paySecret } : {}),
        });

        const transaction = isRecord(signedTx.data)
          ? cloneTransactionRecord(signedTx.data)
          : { data: signedTx.data };

        return { signedTx, transaction };
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

      if (!parsedAmount) {
        throw new Error('Invalid miniapp transfer amount');
      }

      const unsignedTx = await provider.buildTransaction({
        type: 'transfer',
        from,
        to,
        amount: parsedAmount,
        ...(asset ? { bioAssetType: asset } : {}),
        ...(remark ? { remark } : {}),
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
    [isSignMode, parsedFeeAmount, providedUnsignedTx, resolvedChainId, parsedAmount, asset, from, to, walletId, remark],
  );

  const handleTransferFailure = useCallback(
    (error: unknown, inputStep: TransferInputStep) => {
      const { message: mappedError, detail: mappedErrorDetail } = resolveMiniappTransferErrorFeedback(t, error, resolvedChainId);
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
        setErrorDetail(null);
        setStep('wallet_lock');
        setPattern([]);
        return;
      }

      if (isMiniappTwoStepSecretError(error)) {
        setPatternError(false);
        setTwoStepSecretError(true);
        setErrorMessage(t('transaction:sendPage.twoStepSecretError'));
        setErrorDetail(null);
        setStep('two_step_secret');
        return;
      }

      setPatternError(false);
      setTwoStepSecretError(false);
      setErrorMessage(mappedError);
      setErrorDetail(mappedErrorDetail);
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
      setErrorDetail(null);

      try {
        const result = await performTransfer(password, paySecret);
        transferSucceeded = true;
        const signedTx = result.signedTx;
        const txHash = result.txHash;
        const transaction = result.transaction;
        logTransferSheet(isSignMode ? 'transfer.sign.success' : 'transfer.broadcast.success', {
          hasSignedTx: Boolean(signedTx),
          txHash,
        });

        if (signedTx) {
          emitTransferResult({
            confirmed: true,
            signedTx,
            transaction,
          });
          emitSheetClosed('confirmed');
          pop();
          return;
        }

        if (!txHash) {
          throw new Error('Missing txHash in transfer result');
        }

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
        const errorType = error instanceof Error ? error.name : typeof error;
        logTransferSheet('transfer.failed', { inputStep, errorType });

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
    [emitSheetClosed, emitTransferResult, handleTransferFailure, isSignMode, logTransferSheet, performTransfer, pop, t, toast, transferShortTitle],
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

  const walletLockServiceMessage = !patternError && errorMessage ? errorMessage : null;
  const walletLockErrorDetail = !patternError ? errorDetail : null;

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
                  value={displayAmount}
                  symbol={displayAsset}
                  size="xl"
                  weight="bold"
                  decimals={displayDecimals}
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

              {amountInvalidMessage && (
                <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">
                  {amountInvalidMessage}
                </div>
              )}

              <div className="bg-muted/50 flex items-center justify-between rounded-xl p-3">
                <span className="text-muted-foreground text-sm"> {t('network')}</span>
                <ChainBadge chainId={resolvedChainId} />
              </div>

              {isSignMode && (
                <div className="bg-muted/50 space-y-2 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">{t('transaction:sendPage.fee')}</span>
                    <span className="text-muted-foreground text-xs">{feeSymbol || chainSymbol}</span>
                  </div>
                  <Input
                    data-testid="miniapp-transfer-sign-fee-input"
                    value={feeInput}
                    onChange={(event) => setFeeInput(event.target.value)}
                    disabled={isBusy || isFeeEstimating}
                    placeholder={t('transaction:sendPage.feePending')}
                    inputMode="decimal"
                  />
                  {isFeeEstimating && (
                    <div className="text-muted-foreground text-xs">{t('transaction:sendPage.feeEstimating')}</div>
                  )}
                  {feeEstimateError && <div className="text-destructive text-xs">{feeEstimateError}</div>}
                  {feeInputInvalid && !feeEstimateError && (
                    <div className="text-destructive text-xs">{t('transaction:feeEdit.invalidFee')}</div>
                  )}
                </div>
              )}

              {remarkEntries.length > 0 && (
                <div data-testid="miniapp-transfer-remark" className="bg-muted/50 space-y-2 rounded-xl p-3">
                  <span className="text-muted-foreground text-xs">{t('memo')}</span>
                  <div className="max-h-36 space-y-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[color-mix(in_srgb,currentColor,transparent)]">
                    {remarkEntries.map((entry, index) => (
                      <div
                        key={entry.key}
                        className={cn(
                          'flex flex-row items-start justify-between gap-2 rounded-md px-2 py-1 text-xs leading-5',
                          index % 2 === 0 ? 'bg-white' : 'bg-muted/40',
                        )}
                      >
                        <span className="text-muted-foreground min-w-0 break-all">{entry.key}</span>
                        <span className="min-w-0 break-all text-right">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                disabled={isBusy || !walletId || isResolvingTwoStepSecret || !parsedAmount || (isSignMode && (isFeeEstimating || !parsedFeeAmount))}
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
                hintText={walletLockServiceMessage ?? undefined}
                hintTone={walletLockServiceMessage ? 'destructive' : 'default'}
                footerText={
                  walletLockErrorDetail
                    ? `${t('common:service.technicalDetails')}: ${walletLockErrorDetail}`
                    : undefined
                }
              />

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
                value={displayAmount}
                symbol={displayAsset}
                size="xl"
                weight="bold"
                decimals={displayDecimals}
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

            {remarkEntries.length > 0 && (
              <div data-testid="miniapp-transfer-remark" className="bg-muted/50 space-y-2 rounded-xl p-3">
                <span className="text-muted-foreground text-xs">{t('memo')}</span>
                <div className="max-h-36 space-y-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[color-mix(in_srgb,currentColor,transparent)]">
                  {remarkEntries.map((entry, index) => (
                    <div
                      key={entry.key}
                      className={cn(
                        'flex flex-row items-start justify-between gap-2 rounded-md px-2 py-1 text-xs leading-5',
                        index % 2 === 0 ? 'bg-white' : 'bg-muted/40',
                      )}
                    >
                      <span className="text-muted-foreground min-w-0 break-all">{entry.key}</span>
                      <span className="min-w-0 break-all text-right">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
