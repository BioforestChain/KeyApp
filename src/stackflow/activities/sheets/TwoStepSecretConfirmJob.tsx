import { useState, useCallback, useRef } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/security/password-input";
import { IconAlertCircle as AlertCircle, IconLock as Lock } from "@tabler/icons-react";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";

// Global callback store for two-step secret verification
let pendingCallback: ((twoStepSecret: string) => Promise<boolean>) | null = null;

/**
 * Set the callback for two-step secret verification before pushing this activity
 */
export function setTwoStepSecretConfirmCallback(
  onVerify: (twoStepSecret: string) => Promise<boolean>
) {
  pendingCallback = onVerify;
}

/**
 * Clear the callback (called on unmount)
 */
function clearTwoStepSecretConfirmCallback() {
  pendingCallback = null;
}

type TwoStepSecretConfirmJobParams = {
  title?: string;
  description?: string;
};

function TwoStepSecretConfirmJobContent() {
  const { t } = useTranslation(["security", "transaction", "common"]);
  const { pop } = useFlow();
  const { title, description } = useActivityParams<TwoStepSecretConfirmJobParams>();

  const [twoStepSecret, setTwoStepSecret] = useState("");
  const [error, setError] = useState<string>();
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Capture callback on mount and keep it throughout component lifecycle
  const callbackRef = useRef<((twoStepSecret: string) => Promise<boolean>) | null>(null);
  const initialized = useRef(false);
  
  // Only capture on first mount (survives React Strict Mode double-mount)
  if (!initialized.current && pendingCallback) {
    callbackRef.current = pendingCallback;
    clearTwoStepSecretConfirmCallback();
    initialized.current = true;
  }

  const displayTitle = title ?? t("security:twoStepSecret.confirmTitle");
  const displayDescription = description ?? t("security:twoStepSecret.confirmDesc");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const callback = callbackRef.current;
      if (!twoStepSecret.trim() || !callback) return;

      setIsVerifying(true);
      setError(undefined);

      try {
        const success = await callback(twoStepSecret);
        if (success) {
          pop();
        } else {
          setError(t("security:twoStepSecret.notMatch"));
        }
      } catch {
        setError(t("security:twoStepSecret.notMatch"));
      } finally {
        setIsVerifying(false);
      }
    },
    [twoStepSecret, pop, t]
  );

  const canSubmit = twoStepSecret.trim().length > 0 && !isVerifying;

  return (
    <BottomSheet data-testid="two-step-secret-dialog">
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Title */}
        <div className="border-b border-border px-4 pb-4">
          <div className="flex items-center justify-center gap-2">
            <Lock className="size-5 text-primary" />
            <h2 className="text-center text-lg font-semibold">{displayTitle}</h2>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          <p className="text-center text-muted-foreground text-sm">{displayDescription}</p>

          <div className="space-y-2">
            <PasswordInput
              value={twoStepSecret}
              onChange={(e) => setTwoStepSecret(e.target.value)}
              placeholder={t("security:twoStepSecret.inputPlaceholder")}
              disabled={isVerifying}
              aria-describedby={error ? "two-step-secret-error" : undefined}
              data-testid="two-step-secret-input"
            />
            {error && (
              <div id="two-step-secret-error" className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="size-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={!canSubmit}
              data-testid="two-step-secret-confirm-button"
              className={cn(
                "w-full rounded-full py-3 font-medium text-white transition-colors",
                "bg-primary hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isVerifying ? t("security:walletLock.verifying") : t("common:confirm")}
            </button>

            <button
              type="button"
              onClick={() => pop()}
              disabled={isVerifying}
              className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
            >
              {t("security:walletLock.cancel")}
            </button>
          </div>
        </form>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const TwoStepSecretConfirmJob: ActivityComponentType<TwoStepSecretConfirmJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <TwoStepSecretConfirmJobContent />
    </ActivityParamsProvider>
  );
};
