import { useState, useCallback, useEffect, useRef } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/security/password-input";
import { ChainAddressDisplay } from "@/components/wallet/chain-address-display";
import { FeeDisplay } from "@/components/transaction/fee-display";
import {
  IconAlertCircle as AlertCircle,
  IconLock as Lock,
} from "@tabler/icons-react";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";
import { Amount } from "@/types/amount";
import { TxStatusDisplay, type TxStatus } from "@/components/transaction/tx-status-display";
import { setFeeEditCallback } from "./FeeEditJob";

// Global callback store for setting two-step secret
let pendingCallback: ((newTwoStepSecret: string, walletLock: string) => Promise<{ success: boolean; txHash?: string; error?: string }>) | null = null;
let checkConfirmedCallback: (() => Promise<boolean>) | null = null;
let feeAmount: Amount | null = null;
let feeSymbol: string = "";

/**
 * Set the callback for setting two-step secret before pushing this activity
 */
export function setSetTwoStepSecretCallback(
  onSubmit: (newTwoStepSecret: string, walletLock: string) => Promise<{ success: boolean; txHash?: string; error?: string }>,
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
function clearSetTwoStepSecretCallback() {
  pendingCallback = null;
  checkConfirmedCallback = null;
  feeAmount = null;
  feeSymbol = "";
}

type SetTwoStepSecretJobParams = {
  chainId?: string;
  chainIcon?: string;
  chainSymbol?: string;
  address?: string;
  /** @deprecated 使用 chainId + address 代替 */
  chainName?: string;
};

function SetTwoStepSecretJobContent() {
  const { t } = useTranslation(["security", "transaction", "common"]);
  const { pop, push } = useFlow();
  const { chainId, chainIcon, chainSymbol, address, chainName } = useActivityParams<SetTwoStepSecretJobParams>();

  const [newTwoStepSecret, setNewTwoStepSecret] = useState("");
  const [confirmTwoStepSecret, setConfirmTwoStepSecret] = useState("");
  const [walletLock, setWalletLock] = useState("");
  const [step, setStep] = useState<"input" | "confirm" | "walletLock">("input");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus | "idle">("idle");
  const [txHash, setTxHash] = useState<string>();
  const [customFee, setCustomFee] = useState<string | null>(null);

  // 在组件挂载时捕获回调，避免 React Strict Mode 问题
  const callbackRef = useRef(pendingCallback);
  const checkConfirmedRef = useRef(checkConfirmedCallback);
  const feeRef = useRef({ amount: feeAmount, symbol: feeSymbol });
  
  // 当前显示的手续费
  const displayFee = customFee ?? feeRef.current.amount?.toDisplayString() ?? "0";
  
  useEffect(() => {
    // 只在首次挂载时捕获，避免 Strict Mode 清除问题
    if (pendingCallback && !callbackRef.current) {
      callbackRef.current = pendingCallback;
      checkConfirmedRef.current = checkConfirmedCallback;
      feeRef.current = { amount: feeAmount, symbol: feeSymbol };
    }
    return () => {
      // 组件真正卸载时才清除模块级变量
      clearSetTwoStepSecretCallback();
    };
  }, []);

  // 轮询检查由 TxStatusDisplay 组件处理

  // 编辑手续费
  const handleEditFee = useCallback(() => {
    const minFee = feeRef.current.amount?.toDisplayString() ?? "0";
    setFeeEditCallback(
      {
        currentFee: displayFee,
        minFee,
        symbol: feeRef.current.symbol,
      },
      (result) => {
        setCustomFee(result.fee);
      }
    );
    push("FeeEditJob", {});
  }, [displayFee, push]);

  const handleNextStep = useCallback(() => {
    setError(undefined);
    if (step === "input") {
      if (!newTwoStepSecret.trim()) {
        return;
      }
      setStep("confirm");
    } else if (step === "confirm") {
      if (newTwoStepSecret !== confirmTwoStepSecret) {
        setError(t("security:twoStepSecret.notMatch"));
        return;
      }
      setStep("walletLock");
    }
  }, [step, newTwoStepSecret, confirmTwoStepSecret, t]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const callback = callbackRef.current;
      if (!walletLock.trim() || !callback) return;

      setIsSubmitting(true);
      setTxStatus("broadcasting");
      setError(undefined);

      try {
        const result = await callback(newTwoStepSecret, walletLock);
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
    [newTwoStepSecret, walletLock, t]
  );

  const canSubmit = step === "walletLock" && walletLock.trim().length > 0 && !isSubmitting;

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
      <div className="bg-background rounded-t-2xl" data-testid="set-two-step-secret-dialog">
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
          {/* 链地址显示（新版）或链名称显示（兼容旧版） */}
          {chainId && address ? (
            <div className="mt-2 flex justify-center">
              <ChainAddressDisplay
                chainId={chainId}
                chainIcon={chainIcon}
                chainSymbol={chainSymbol}
                address={address}
                size="sm"
              />
            </div>
          ) : chainName ? (
            <p className="mt-1 text-center text-sm text-muted-foreground">
              {chainName}
            </p>
          ) : null}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          {/* Fee info */}
          {feeRef.current.amount && (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
              <span className="text-sm text-muted-foreground">
                {t("security:twoStepSecret.feeInfo")}
              </span>
              <FeeDisplay
                amount={displayFee}
                symbol={feeRef.current.symbol}
                editable
                onEdit={handleEditFee}
              />
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
              step === "walletLock" ? "bg-primary" : "bg-muted"
            )} />
          </div>

          {step === "input" && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                {t("security:twoStepSecret.inputDesc")}
              </p>
              <PasswordInput
                value={newTwoStepSecret}
                onChange={(e) => setNewTwoStepSecret(e.target.value)}
                placeholder={t("security:twoStepSecret.inputPlaceholder")}
                aria-describedby={error ? "two-step-secret-error" : undefined}
                data-testid="new-two-step-secret-input"
              />
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                {t("security:twoStepSecret.confirmDesc")}
              </p>
              <PasswordInput
                value={confirmTwoStepSecret}
                onChange={(e) => setConfirmTwoStepSecret(e.target.value)}
                placeholder={t("security:twoStepSecret.confirmPlaceholder")}
                aria-describedby={error ? "two-step-secret-error" : undefined}
                data-testid="confirm-two-step-secret-input"
              />
            </div>
          )}

          {step === "walletLock" && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                {t("security:twoStepSecret.walletLockDesc")}
              </p>
              <PasswordInput
                value={walletLock}
                onChange={(e) => setWalletLock(e.target.value)}
                placeholder={t("security:twoStepSecret.walletLockPlaceholder")}
                disabled={isSubmitting}
                aria-describedby={error ? "two-step-secret-error" : undefined}
                data-testid="wallet-lock-input"
              />
            </div>
          )}

          {error && (
            <div id="two-step-secret-error" className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="size-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {step !== "walletLock" ? (
              <button
                type="button"
                onClick={handleNextStep}
                data-testid="set-two-step-secret-next-button"
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
                data-testid="set-two-step-secret-confirm-button"
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
              data-testid="set-two-step-secret-cancel-button"
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

export const SetTwoStepSecretJob: ActivityComponentType<SetTwoStepSecretJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <SetTwoStepSecretJobContent />
    </ActivityParamsProvider>
  );
};
