/**
 * 合并的转账钱包锁确认组件
 * 
 * 将钱包锁和二次签名确认合并到一个 BottomSheet 中，
 * 避免 stackflow 多个 sheet 的时序问题，提供更流畅的用户体验。
 * 
 * 流程：
 * - 广播中：显示加载动画，无关闭按钮
 * - 广播成功/失败：显示关闭按钮（不自动关闭）
 * - 广播失败：显示重试+关闭按钮
 * - 上链成功：5秒倒计时自动关闭
 */
import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet, SheetContent } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { PatternLock, patternToString } from "@/components/security/pattern-lock";
import { PasswordInput } from "@/components/security/password-input";
import { IconAlertCircle as AlertCircle, IconLock as Lock, IconRefresh as Refresh } from "@tabler/icons-react";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";
import { TxStatusDisplay, type TxStatus } from "@/components/transaction/tx-status-display";
import { useClipboard, useToast } from "@/services";
import { useSelectedChain, useChainConfigState, useCurrentWallet, chainConfigSelectors } from "@/stores";
import { pendingTxManager } from "@/services/transaction";
import { getChainProvider } from "@/services/chain-adapter/providers";
import type { Transaction } from "@/services/chain-adapter/providers/transaction-schema";

// 回调类型
type SubmitCallback = (walletLockKey: string, twoStepSecret?: string) => Promise<{
  status: 'ok' | 'wallet_lock_invalid' | 'two_step_secret_required' | 'two_step_secret_invalid' | 'error';
  secondPublicKey?: string | undefined;
  message?: string | undefined;
  txHash?: string | undefined;
  pendingTxId?: string | undefined;
}>;

// Global callback store
let pendingCallback: SubmitCallback | null = null;

export function setTransferWalletLockCallback(callback: SubmitCallback) {
  pendingCallback = callback;
}

function clearTransferWalletLockCallback() {
  pendingCallback = null;
}

type TransferWalletLockJobParams = {
  title?: string;
};

type Step = 'wallet_lock' | 'two_step_secret';

function TransferWalletLockJobContent() {
  const { t } = useTranslation(["security", "transaction", "common"]);
  const { pop, push } = useFlow();
  const { title } = useActivityParams<TransferWalletLockJobParams>();
  const clipboard = useClipboard();
  const toast = useToast();
  const selectedChain = useSelectedChain();
  const chainConfigState = useChainConfigState();
  const currentWallet = useCurrentWallet();

  const [step, setStep] = useState<Step>('wallet_lock');
  const [pattern, setPattern] = useState<number[]>([]);
  const [twoStepSecret, setTwoStepSecret] = useState("");
  const [txStatus, setTxStatus] = useState<TxStatus | "idle">("idle");
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();
  const [patternError, setPatternError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingTxId, setPendingTxId] = useState<string>();
  const [countdown, setCountdown] = useState<number | null>(null);

  // Capture callback on mount
  const callbackRef = useRef<SubmitCallback | null>(null);
  const walletLockKeyRef = useRef<string>("");
  const initialized = useRef(false);

  if (!initialized.current && pendingCallback) {
    callbackRef.current = pendingCallback;
    clearTransferWalletLockCallback();
    initialized.current = true;
  }

  // 订阅交易状态变化
  useEffect(() => {
    if (!txHash || !selectedChain || !currentWallet?.address) return;

    const chainProvider = getChainProvider(selectedChain);
    if (!chainProvider?.transaction) return;

    const unsubscribe = chainProvider.transaction.subscribe(
      { txHash, senderId: currentWallet.address },
      (transaction: Transaction | null) => {
        if (!transaction) return;

        if (transaction.status === 'confirmed') {
          setTxStatus('confirmed');
        } else if (transaction.status === 'failed') {
          setTxStatus('failed');
        } else if (transaction.status === 'pending') {
          setTxStatus('broadcasted');
        }
      }
    );

    return unsubscribe;
  }, [txHash, selectedChain, currentWallet?.address]);

  // 上链成功后 5 秒倒计时自动关闭
  useEffect(() => {
    if (txStatus !== 'confirmed') {
      setCountdown(null);
      return;
    }

    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          pop();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [txStatus, pop]);

  // Get chain config for explorer URL
  const chainConfig = useMemo(() => {
    return chainConfigSelectors.getChainById(chainConfigState, selectedChain);
  }, [chainConfigState, selectedChain]);

  // Build explorer URL
  const explorerTxUrl = useMemo(() => {
    const queryTx = chainConfig?.explorer?.queryTx;
    if (!queryTx || !txHash) return null;
    return queryTx.replace(':hash', txHash).replace(':signature', txHash);
  }, [chainConfig?.explorer?.queryTx, txHash]);

  const handleViewExplorer = useCallback(() => {
    if (explorerTxUrl) {
      window.open(explorerTxUrl, '_blank', 'noopener,noreferrer');
    }
  }, [explorerTxUrl]);

  const displayTitle = step === 'wallet_lock'
    ? (title ?? t("security:walletLock.verifyTitle"))
    : t("transaction:sendPage.twoStepSecretTitle");

  // 钱包锁验证完成
  const handlePatternComplete = useCallback(async (nodes: number[]) => {
    const callback = callbackRef.current;
    if (nodes.length < 4 || !callback) return;

    setIsVerifying(true);
    setError(undefined);
    setPatternError(false);
    setTxStatus("broadcasting");

    const patternKey = patternToString(nodes);
    walletLockKeyRef.current = patternKey;

    try {
      const result = await callback(patternKey);

      if (result.status === 'ok') {
        if (result.txHash) {
          setTxHash(result.txHash);
        }
        if (result.pendingTxId) {
          setPendingTxId(result.pendingTxId);
        }
        setTxStatus("broadcasted");
        return;
      }

      if (result.status === 'wallet_lock_invalid') {
        setPatternError(true);
        setPattern([]);
        return;
      }

      if (result.status === 'two_step_secret_required') {
        setStep('two_step_secret');
        setError(undefined);
        return;
      }

      if (result.status === 'error') {
        setError(result.message ?? t("security:walletLock.error"));
        setTxStatus("failed");
        if (result.pendingTxId) {
          setPendingTxId(result.pendingTxId);
        }
        return;
      }
    } catch {
      setPatternError(true);
      setPattern([]);
    } finally {
      setIsVerifying(false);
    }
  }, [t]);

  // 二次签名提交
  const handleTwoStepSecretSubmit = useCallback(async () => {
    const callback = callbackRef.current;
    if (!twoStepSecret.trim() || !callback) return;

    setIsVerifying(true);
    setError(undefined);

    try {
      const result = await callback(walletLockKeyRef.current, twoStepSecret);

      if (result.status === 'ok') {
        if (result.txHash) {
          setTxHash(result.txHash);
        }
        if (result.pendingTxId) {
          setPendingTxId(result.pendingTxId);
        }
        setTxStatus("broadcasted");
        return;
      }

      if (result.status === 'two_step_secret_invalid' || result.status === 'error') {
        setError(result.message ?? t("transaction:sendPage.twoStepSecretError"));
        if (result.pendingTxId) {
          setPendingTxId(result.pendingTxId);
          setTxStatus("failed");
        }
      }
    } catch {
      setError(t("transaction:sendPage.twoStepSecretError"));
    } finally {
      setIsVerifying(false);
    }
  }, [twoStepSecret, t]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'two_step_secret') {
      handleTwoStepSecretSubmit();
    }
  }, [step, handleTwoStepSecretSubmit]);

  const canSubmitTwoStepSecret = twoStepSecret.trim().length > 0 && !isVerifying;

  // 重试广播
  const handleRetry = useCallback(async () => {
    if (!pendingTxId) return;

    setIsVerifying(true);
    setError(undefined);

    try {
      await pendingTxManager.retryBroadcast(pendingTxId, chainConfigState);
      setTxStatus("broadcasted");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("transaction:broadcast.unknown"));
    } finally {
      setIsVerifying(false);
    }
  }, [pendingTxId, chainConfigState, t]);

  // 交易状态显示（广播后）
  if (txStatus !== "idle") {
    const isFailed = txStatus === "failed";
    const isConfirmed = txStatus === "confirmed";

    return (
      <BottomSheet>
        <div data-testid="transfer-wallet-lock-dialog">
          <div className="bg-background rounded-t-2xl">
            <div className="flex justify-center py-3">
              <div className="h-1 w-10 rounded-full bg-muted" />
            </div>
            <TxStatusDisplay
              status={txStatus}
              txHash={txHash}
              title={{
                broadcasted: t("transaction:txStatus.broadcasted"),
                confirmed: t("transaction:sendResult.success"),
                failed: t("transaction:broadcast.failed"),
              }}
              description={{
                broadcasted: t("transaction:txStatus.broadcastedDesc"),
                confirmed: countdown !== null
                  ? t("transaction:txStatus.autoCloseIn", { seconds: countdown })
                  : t("transaction:txStatus.confirmedDesc"),
                failed: error,
              }}
              onStatusChange={setTxStatus}
              onDone={() => pop()}
              onViewDetails={() => {
                pop();
                if (txHash) {
                  push("TransactionDetailActivity", { txId: txHash });
                }
              }}
              onViewExplorer={explorerTxUrl ? handleViewExplorer : undefined}
              onShare={async () => {
                if (txHash) {
                  await clipboard.write({ text: txHash });
                  toast.show(t("common:copied"));
                }
              }}
            />

            {/* 操作按钮区域 */}
            <div className="px-4 pb-4 space-y-2">
              {/* 失败时显示重试按钮 */}
              {isFailed && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isVerifying}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-full py-3 font-medium transition-colors",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                >
                  <Refresh className="size-4" />
                  {isVerifying ? t("common:retrying") : t("transaction:pendingTx.retry")}
                </button>
              )}

              {/* 广播后（成功或失败）显示关闭按钮，confirmed 状态显示倒计时 */}
              <button
                type="button"
                onClick={() => pop()}
                className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
              >
                {isConfirmed && countdown !== null
                  ? t("transaction:txStatus.closeIn", { seconds: countdown })
                  : t("common:close")}
              </button>
            </div>

            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      </BottomSheet>
    );
  }

  // 钱包锁验证步骤
  if (step === 'wallet_lock') {
    return (
      <BottomSheet>
        <div data-testid="transfer-wallet-lock-dialog">
          <SheetContent title={displayTitle}>
            <div className="p-4">
              <PatternLock
                value={pattern}
                onChange={setPattern}
                onComplete={handlePatternComplete}
                minPoints={4}
                error={patternError}
                disabled={isVerifying}
                data-testid="transfer-wallet-lock-pattern"
              />

              {error && (
                <div className="flex items-start justify-center gap-1.5 text-sm text-destructive mt-3">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <pre className="overflow-auto whitespace-break-spaces">{error}</pre>
                </div>
              )}

              <button
                type="button"
                onClick={() => pop()}
                disabled={isVerifying}
                className="mt-4 w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
              >
                {t("common:cancel")}
              </button>
            </div>
          </SheetContent>
        </div>
      </BottomSheet>
    );
  }

  // 二次签名验证步骤
  return (
    <BottomSheet>
      <div data-testid="transfer-wallet-lock-dialog">
        <SheetContent title={displayTitle}>
          <form onSubmit={handleSubmit} className="space-y-6 p-4">
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <Lock className="size-5" />
              <span className="text-sm">{t("transaction:sendPage.twoStepSecretDescription")}</span>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <PasswordInput
                  value={twoStepSecret}
                  onChange={(e) => setTwoStepSecret(e.target.value)}
                  placeholder={t("transaction:sendPage.twoStepSecretPlaceholder")}
                  disabled={isVerifying}
                  aria-describedby={error ? "two-step-error" : undefined}
                  data-testid="two-step-secret-input"

                />
                {twoStepSecret.length > 0 && twoStepSecret.length < 6 && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <span className="text-xs text-amber-500">{t("security:twoStepSecret.lengthHint", { count: twoStepSecret.length })}</span>
                  </div>
                )}
              </div>
              {error && (
                <div id="two-step-error" className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="size-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                data-testid="two-step-confirm-button"
                disabled={!canSubmitTwoStepSecret}
                className={cn(
                  "w-full rounded-full py-3 font-medium text-primary-foreground transition-colors",
                  "bg-primary hover:bg-primary/90",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {isVerifying ? t("common:verifying") : t("common:confirm")}
              </button>

              <button
                type="button"
                onClick={() => pop()}
                disabled={isVerifying}
                className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
              >
                {t("common:cancel")}
              </button>
            </div>
          </form>
        </SheetContent>
      </div>
    </BottomSheet>
  );
}

export const TransferWalletLockJob: ActivityComponentType<TransferWalletLockJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <TransferWalletLockJobContent />
    </ActivityParamsProvider>
  );
};
