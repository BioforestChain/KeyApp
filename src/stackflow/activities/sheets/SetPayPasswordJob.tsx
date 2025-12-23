import { useState, useCallback, useEffect } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/security/password-input";
import {
  IconAlertCircle as AlertCircle,
  IconLock as Lock,
  IconCheck as Check,
  IconInfoCircle as InfoCircle,
} from "@tabler/icons-react";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";
import { Amount } from "@/types/amount";

// Global callback store for setting pay password
let pendingCallback: ((newPayPassword: string, walletPassword: string) => Promise<{ success: boolean; txHash?: string; error?: string }>) | null = null;
let feeAmount: Amount | null = null;
let feeSymbol: string = "";

/**
 * Set the callback for setting pay password before pushing this activity
 */
export function setSetPayPasswordCallback(
  onSubmit: (newPayPassword: string, walletPassword: string) => Promise<{ success: boolean; txHash?: string; error?: string }>,
  fee?: { amount: Amount; symbol: string }
) {
  pendingCallback = onSubmit;
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
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return () => {
      clearSetPayPasswordCallback();
    };
  }, []);

  const handleNextStep = useCallback(() => {
    setError(undefined);
    if (step === "input") {
      if (newPayPassword.length < 6) {
        setError(t("security:payPassword.tooShort"));
        return;
      }
      setStep("confirm");
    } else if (step === "confirm") {
      if (newPayPassword !== confirmPayPassword) {
        setError(t("security:payPassword.notMatch"));
        return;
      }
      setStep("password");
    }
  }, [step, newPayPassword, confirmPayPassword, t]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!walletPassword.trim() || !pendingCallback) return;

      setIsSubmitting(true);
      setError(undefined);

      try {
        const result = await pendingCallback(newPayPassword, walletPassword);
        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            pop();
          }, 1500);
        } else {
          setError(result.error ?? t("security:payPassword.setFailed"));
        }
      } catch (err) {
        setError(t("security:payPassword.setFailed"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [newPayPassword, walletPassword, pop, t]
  );

  const canSubmit = step === "password" && walletPassword.trim().length > 0 && !isSubmitting;

  if (success) {
    return (
      <BottomSheet>
        <div className="bg-background rounded-t-2xl">
          <div className="flex justify-center py-3">
            <div className="h-1 w-10 rounded-full bg-muted" />
          </div>
          <div className="flex flex-col items-center justify-center gap-4 p-8">
            <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Check className="size-8" />
            </div>
            <h2 className="text-lg font-semibold">{t("security:payPassword.setSuccess")}</h2>
            <p className="text-center text-sm text-muted-foreground">
              {t("security:payPassword.setSuccessDesc")}
            </p>
          </div>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Title */}
        <div className="border-b border-border px-4 pb-4">
          <div className="flex items-center justify-center gap-2">
            <Lock className="size-5 text-primary" />
            <h2 className="text-center text-lg font-semibold">
              {t("security:payPassword.setTitle")}
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
          {feeAmount && (
            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
              <InfoCircle className="mt-0.5 size-4 text-muted-foreground shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p>{t("security:payPassword.feeInfo")}</p>
                <p className="mt-1 font-medium text-foreground">
                  {feeAmount.toDisplayString()} {feeSymbol}
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
                {t("security:payPassword.inputDesc")}
              </p>
              <PasswordInput
                value={newPayPassword}
                onChange={(e) => setNewPayPassword(e.target.value)}
                placeholder={t("security:payPassword.inputPlaceholder")}
                aria-describedby={error ? "pay-password-error" : undefined}
              />
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                {t("security:payPassword.confirmDesc")}
              </p>
              <PasswordInput
                value={confirmPayPassword}
                onChange={(e) => setConfirmPayPassword(e.target.value)}
                placeholder={t("security:payPassword.confirmPlaceholder")}
                aria-describedby={error ? "pay-password-error" : undefined}
              />
            </div>
          )}

          {step === "password" && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                {t("security:payPassword.walletPasswordDesc")}
              </p>
              <PasswordInput
                value={walletPassword}
                onChange={(e) => setWalletPassword(e.target.value)}
                placeholder={t("security:payPassword.walletPasswordPlaceholder")}
                disabled={isSubmitting}
                aria-describedby={error ? "pay-password-error" : undefined}
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
                className={cn(
                  "w-full rounded-full py-3 font-medium text-white transition-colors",
                  "bg-primary hover:bg-primary/90"
                )}
              >
                {t("common:buttons.next")}
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "w-full rounded-full py-3 font-medium text-white transition-colors",
                  "bg-primary hover:bg-primary/90",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {isSubmitting ? t("common:buttons.processing") : t("common:buttons.confirm")}
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
              className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
            >
              {step === "input" ? t("common:buttons.cancel") : t("common:buttons.back")}
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
