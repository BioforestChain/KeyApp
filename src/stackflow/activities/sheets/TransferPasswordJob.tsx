/**
 * 合并的转账密码确认组件
 * 
 * 将钱包锁和安全密码确认合并到一个 BottomSheet 中，
 * 避免 stackflow 多个 sheet 的时序问题，提供更流畅的用户体验。
 * 
 * 安全密码实时验证：
 * - 输入时实时验证安全密码是否正确
 * - 正确才启用"确认"按钮
 */
import { useState, useCallback, useRef } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet, SheetContent } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/security/password-input";
import { IconAlertCircle as AlertCircle, IconLock as Lock } from "@tabler/icons-react";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";
import { TxStatusDisplay, type TxStatus } from "@/components/transaction/tx-status-display";
import { useClipboard, useToast } from "@/services";

// 回调类型
type SubmitCallback = (walletPassword: string, payPassword?: string) => Promise<{
  status: 'ok' | 'password' | 'pay_password_required' | 'pay_password_invalid' | 'error';
  secondPublicKey?: string | undefined;
  message?: string | undefined;
  txHash?: string | undefined;
}>;

// Global callback store
let pendingCallback: SubmitCallback | null = null;

export function setTransferPasswordCallback(callback: SubmitCallback) {
  pendingCallback = callback;
}

function clearTransferPasswordCallback() {
  pendingCallback = null;
}

type TransferPasswordJobParams = {
  title?: string;
};

type Step = 'wallet_password' | 'pay_password';

function TransferPasswordJobContent() {
  const { t } = useTranslation(["security", "transaction", "common"]);
  const { pop, push } = useFlow();
  const { title } = useActivityParams<TransferPasswordJobParams>();
  const clipboard = useClipboard();
  const toast = useToast();

  console.log('[TransferPasswordJob] Rendering...');
  
  const [step, setStep] = useState<Step>('wallet_password');
  const [walletPassword, setWalletPassword] = useState("");
  const [payPassword, setPayPassword] = useState("");
  const [txStatus, setTxStatus] = useState<TxStatus | "idle">("idle");
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<string>();
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Capture callback on mount
  const callbackRef = useRef<SubmitCallback | null>(null);
  const walletPasswordRef = useRef<string>("");
  const initialized = useRef(false);
  
  if (!initialized.current && pendingCallback) {
    console.log('[TransferPasswordJob] Capturing callback');
    callbackRef.current = pendingCallback;
    clearTransferPasswordCallback();
    initialized.current = true;
  }

  const displayTitle = step === 'wallet_password' 
    ? (title ?? t("security:passwordConfirm.defaultTitle"))
    : t("transaction:sendPage.payPasswordTitle");

  const handleWalletPasswordSubmit = useCallback(async () => {
    const callback = callbackRef.current;
    if (!walletPassword.trim() || !callback) return;

    setIsVerifying(true);
    setError(undefined);
    walletPasswordRef.current = walletPassword;

    try {
      const result = await callback(walletPassword);
      
      if (result.status === 'ok') {
        // 交易成功，显示状态
        if (result.txHash) {
          setTxHash(result.txHash);
        }
        setTxStatus("broadcasted");
        return;
      }
      
      if (result.status === 'password') {
        setError(t("security:passwordConfirm.error"));
        return;
      }
      
      if (result.status === 'pay_password_required') {
        // 切换到安全密码输入
        setStep('pay_password');
        setError(undefined);
        return;
      }
      
      if (result.status === 'error') {
        setError(result.message ?? t("security:passwordConfirm.error"));
      }
    } catch {
      setError(t("security:passwordConfirm.error"));
    } finally {
      setIsVerifying(false);
    }
  }, [walletPassword, t]);

  const handlePayPasswordSubmit = useCallback(async () => {
    const callback = callbackRef.current;
    if (!payPassword.trim() || !callback) return;

    setIsVerifying(true);
    setError(undefined);

    try {
      const result = await callback(walletPasswordRef.current, payPassword);
      
      if (result.status === 'ok') {
        // 交易成功，显示状态
        if (result.txHash) {
          setTxHash(result.txHash);
        }
        setTxStatus("broadcasted");
        return;
      }
      
      if (result.status === 'pay_password_invalid' || result.status === 'error') {
        setError(result.message ?? t("transaction:sendPage.payPasswordError"));
      }
    } catch {
      setError(t("transaction:sendPage.payPasswordError"));
    } finally {
      setIsVerifying(false);
    }
  }, [payPassword, t]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'wallet_password') {
      handleWalletPasswordSubmit();
    } else {
      handlePayPasswordSubmit();
    }
  }, [step, handleWalletPasswordSubmit, handlePayPasswordSubmit]);

  // 安全密码步骤只需要有输入且不在验证中
  const canSubmit = step === 'wallet_password' 
    ? walletPassword.trim().length > 0 && !isVerifying
    : payPassword.trim().length > 0 && !isVerifying;

  // 交易成功后显示状态
  if (txStatus !== "idle") {
    return (
      <BottomSheet>
        <div data-testid="transfer-password-dialog">
          <div className="bg-background rounded-t-2xl">
            <div className="flex justify-center py-3">
              <div className="h-1 w-10 rounded-full bg-muted" />
            </div>
            <TxStatusDisplay
              status={txStatus}
              txHash={txHash}
              title={{
                broadcasted: t("transaction:sendResult.success"),
                confirmed: t("transaction:sendResult.success"),
              }}
              description={{
                broadcasted: t("transaction:txStatus.broadcastedDesc"),
                confirmed: t("transaction:txStatus.confirmedDesc"),
              }}
              onStatusChange={setTxStatus}
              onDone={() => pop()}
              onViewDetails={() => {
                pop();
                if (txHash) {
                  push("TransactionDetailActivity", { txId: txHash });
                }
              }}
              onShare={async () => {
                if (txHash) {
                  await clipboard.write({ text: txHash });
                  toast.show(t("common:copied"));
                }
              }}
            />
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet>
      <div data-testid="transfer-password-dialog">
        <SheetContent title={displayTitle}>
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          {step === 'pay_password' && (
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <Lock className="size-5" />
              <span className="text-sm">{t("transaction:sendPage.payPasswordDescription")}</span>
            </div>
          )}

          <div className="space-y-2">
            {step === 'wallet_password' ? (
              <PasswordInput
                value={walletPassword}
                onChange={(e) => setWalletPassword(e.target.value)}
                placeholder={t("security:passwordConfirm.placeholder")}
                disabled={isVerifying}
                aria-describedby={error ? "password-error" : undefined}
                data-testid="wallet-password-input"
              />
            ) : (
              <div className="relative">
                <PasswordInput
                  value={payPassword}
                  onChange={(e) => setPayPassword(e.target.value)}
                  placeholder={t("transaction:sendPage.payPasswordPlaceholder")}
                  disabled={isVerifying}
                  aria-describedby={error ? "password-error" : undefined}
                  data-testid="pay-password-input"
                  autoFocus
                />
                {/* 长度建议提示 */}
                {payPassword.length > 0 && payPassword.length < 6 && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <span className="text-xs text-amber-500">{t("security:twoStepSecret.lengthHint", { count: payPassword.length })}</span>
                  </div>
                )}
              </div>
            )}
            {error && (
              <div id="password-error" className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="size-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              data-testid="password-confirm-button"
              disabled={!canSubmit}
              className={cn(
                "w-full rounded-full py-3 font-medium text-white transition-colors",
                "bg-primary hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isVerifying ? t("security:passwordConfirm.verifying") : t("security:passwordConfirm.confirm")}
            </button>

            <button
              type="button"
              onClick={() => pop()}
              disabled={isVerifying}
              className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
            >
              {t("security:passwordConfirm.cancel")}
            </button>
          </div>
        </form>
        </SheetContent>
      </div>
    </BottomSheet>
  );
}

export const TransferPasswordJob: ActivityComponentType<TransferPasswordJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <TransferPasswordJobContent />
    </ActivityParamsProvider>
  );
};
