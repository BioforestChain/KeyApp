import { useState, useCallback, useEffect, useRef } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/security/password-input";
import {
  IconAlertCircle as AlertCircle,
  IconLock as Lock,
  IconInfoCircle as InfoCircle,
} from "@tabler/icons-react";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";
import { Amount } from "@/types/amount";
import { TxStatusDisplay, type TxStatus } from "@/components/transaction/tx-status-display";

// Global callback store for setting pay password
let pendingCallback: ((newPayPassword: string, walletPassword: string) => Promise<{ success: boolean; txHash?: string; error?: string }>) | null = null;
let checkConfirmedCallback: (() => Promise<boolean>) | null = null;
let feeAmount: Amount | null = null;
let feeSymbol: string = "";

/**
 * Set the callback for setting pay password before pushing this activity
 */
export function setSetPayPasswordCallback(
  onSubmit: (newPayPassword: string, walletPassword: string) => Promise<{ success: boolean; txHash?: string; error?: string }>,
  fee?: { amount: Amount; symbol: string },
  checkConfirmed?: () => Promise<boolean>
) {
  pendingCallback = onSubmit;
  checkConfirmedCallback = checkConfirmed ?? null;
  if (fee) {
    feeAmount = fee.amount;
    feeSymbol = fee.symbol;
  }
}

/**
 * Clear the callback (called on unmount)
 */
function clearSetPayPasswordCallback() {
  pendingCallback = null;
  checkConfirmedCallback = null;
  feeAmount = null;
  feeSymbol = "";
}

type SetPayPasswordJobParams = {
  chainName?: string;
};

function SetPayPasswordJobContent() {
  const { t } = useTranslation(["security", "transaction", "common"]);
  const { pop } = useFlow();
  const { chainName } = useActivityParams<SetPayPasswordJobParams>();

  const [newPayPassword, setNewPayPassword] = useState("");
  const [confirmPayPassword, setConfirmPayPassword] = useState("");
  const [walletPassword, setWalletPassword] = useState("");
  const [step, setStep] = useState<"input" | "confirm" | "password">("input");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus | "idle">("idle");
  const [txHash, setTxHash] = useState<string>();

  // 在组件挂载时捕获回调，避免 React Strict Mode 问题
  const callbackRef = useRef(pendingCallback);
  const checkConfirmedRef = useRef(checkConfirmedCallback);
  const feeRef = useRef({ amount: feeAmount, symbol: feeSymbol });
  
  useEffect(() => {
    // 只在首次挂载时捕获，避免 Strict Mode 清除问题
    if (pendingCallback && !callbackRef.current) {
      callbackRef.current = pendingCallback;
      checkConfirmedRef.current = checkConfirmedCallback;
      feeRef.current = { amount: feeAmount, symbol: feeSymbol };
    }
    return () => {
      // 组件真正卸载时才清除模块级变量
      clearSetPayPasswordCallback();
    };
  }, []);

  // 轮询检查由 TxStatusDisplay 组件处理

  const handleNextStep = useCallback(() => {
    setError(undefined);
    if (step === "input") {
      if (!newPayPassword.trim()) {
        return;
      }
      setStep("confirm");
    } else if (step === "confirm") {
      if (newPayPassword !== confirmPayPassword) {
        setError(t("security:twoStepSecret.notMatch"));
        return;
      }
      setStep("password");
    }
  }, [step, newPayPassword, confirmPayPassword, t]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const callback = callbackRef.current;
      if (!walletPassword.trim() || !callback) return;

      setIsSubmitting(true);
      setTxStatus("broadcasting");
      setError(undefined);

      try {
        const result = await callback(newPayPassword, walletPassword);
        if (result.success) {
          setTxHash(result.txHash);
          setTxStatus("broadcasted");
          // 不自动关闭，让用户看到状态
        } else {
          setTxStatus("idle");
          setError(result.error ?? t("security:twoStepSecret.setFailed"));
        }
      } catch {
        setTxStatus("idle");
        setError(t("security:twoStepSecret.setFailed"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [newPayPassword, walletPassword, t]
  );

  const canSubmit = step === "password" && walletPassword.trim().length > 0 && !isSubmitting;

  // 广播成功后的状态显示
  if (txStatus !== "idle") {
    return (
      <BottomSheet>
        <div className="bg-background rounded-t-2xl">
          <div className="flex justify-center py-3">
            <div className="h-1 w-10 rounded-full bg-muted" />
          </div>
          <TxStatusDisplay
            status={txStatus}
            txHash={txHash}
            title={{
              confirmed: t("security:twoStepSecret.txConfirmed"),
            }}
            description={{
              confirmed: t("security:twoStepSecret.setSuccessDesc"),
            }}
            checkConfirmed={checkConfirmedRef.current ?? undefined}
            onStatusChange={setTxStatus}
            onDone={() => pop()}
          />
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl" data-testid="set-pay-password-dialog">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Title */}
        <div className="border-b border-border px-4 pb-4">
          <div className="flex items-center justify-center gap-2">
            <Lock className="size-5 text-primary" />
            <h2 className="text-center text-lg font-semibold">
              {t("security:twoStepSecret.setTitle")}
            </h2>
          </div>
          {chainName && (
            <p className="mt-1 text-center text-sm text-muted-foreground">
              {chainName}
            </p>
          )}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          {/* Fee info */}
          {feeRef.current.amount && (
            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
              <InfoCircle className="mt-0.5 size-4 text-muted-foreground shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p>{t("security:twoStepSecret.feeInfo")}</p>
                <p className="mt-1 font-medium text-foreground">
                  {feeRef.current.amount.toDisplayString()} {feeRef.current.symbol}
                </p>
              </div>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={cn(
              "size-2 rounded-full",
              step === "input" ? "bg-primary" : "bg-muted"
            )} />
            <div className={cn(
              "size-2 rounded-full",
              step === "confirm" ? "bg-primary" : "bg-muted"
            )} />
            <div className={cn(
              "size-2 rounded-full",
              step === "password" ? "bg-primary" : "bg-muted"
            )} />
          </div>

          {step === "input" && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                {t("security:twoStepSecret.inputDesc")}
              </p>
              <PasswordInput
                value={newPayPassword}
                onChange={(e) => setNewPayPassword(e.target.value)}
                placeholder={t("security:twoStepSecret.inputPlaceholder")}
                aria-describedby={error ? "pay-password-error" : undefined}
                data-testid="new-pay-password-input"
              />
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                {t("security:twoStepSecret.confirmDesc")}
              </p>
              <PasswordInput
                value={confirmPayPassword}
                onChange={(e) => setConfirmPayPassword(e.target.value)}
                placeholder={t("security:twoStepSecret.confirmPlaceholder")}
                aria-describedby={error ? "pay-password-error" : undefined}
                data-testid="confirm-pay-password-input"
              />
            </div>
          )}

          {step === "password" && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                {t("security:twoStepSecret.walletLockDesc")}
              </p>
              <PasswordInput
                value={walletPassword}
                onChange={(e) => setWalletPassword(e.target.value)}
                placeholder={t("security:twoStepSecret.walletLockPlaceholder")}
                disabled={isSubmitting}
                aria-describedby={error ? "pay-password-error" : undefined}
                data-testid="wallet-password-input"
              />
            </div>
          )}

          {error && (
            <div id="pay-password-error" className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="size-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {step !== "password" ? (
              <button
                type="button"
                onClick={handleNextStep}
                data-testid="set-pay-password-next-button"
                className={cn(
                  "w-full rounded-full py-3 font-medium text-white transition-colors",
                  "bg-primary hover:bg-primary/90"
                )}
              >
                {t("common:next")}
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit}
                data-testid="set-pay-password-confirm-button"
                className={cn(
                  "w-full rounded-full py-3 font-medium text-white transition-colors",
                  "bg-primary hover:bg-primary/90",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {isSubmitting ? t("common:loading") : t("common:confirm")}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (step === "input") {
                  pop();
                } else if (step === "confirm") {
                  setStep("input");
                  setError(undefined);
                } else {
                  setStep("confirm");
                  setError(undefined);
                }
              }}
              disabled={isSubmitting}
              data-testid="set-pay-password-cancel-button"
              className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
            >
              {step === "input" ? t("common:cancel") : t("common:back")}
            </button>
          </div>
        </form>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const SetPayPasswordJob: ActivityComponentType<SetPayPasswordJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <SetPayPasswordJobContent />
    </ActivityParamsProvider>
  );
};
