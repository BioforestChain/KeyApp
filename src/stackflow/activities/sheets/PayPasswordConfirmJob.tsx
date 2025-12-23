import { useState, useCallback, useEffect } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/security/password-input";
import { IconAlertCircle as AlertCircle, IconLock as Lock } from "@tabler/icons-react";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";

// Global callback store for pay password verification
let pendingCallback: ((payPassword: string) => Promise<boolean>) | null = null;

/**
 * Set the callback for pay password verification before pushing this activity
 */
export function setPayPasswordConfirmCallback(
  onVerify: (payPassword: string) => Promise<boolean>
) {
  pendingCallback = onVerify;
}

/**
 * Clear the callback (called on unmount)
 */
function clearPayPasswordConfirmCallback() {
  pendingCallback = null;
}

type PayPasswordConfirmJobParams = {
  title?: string;
  description?: string;
};

function PayPasswordConfirmJobContent() {
  const { t } = useTranslation(["security", "transaction"]);
  const { pop } = useFlow();
  const { title, description } = useActivityParams<PayPasswordConfirmJobParams>();

  const [payPassword, setPayPassword] = useState("");
  const [error, setError] = useState<string>();
  const [isVerifying, setIsVerifying] = useState(false);

  const displayTitle = title ?? t("transaction:sendPage.payPasswordTitle");
  const displayDescription = description ?? t("transaction:sendPage.payPasswordDescription");

  useEffect(() => {
    return () => {
      clearPayPasswordConfirmCallback();
    };
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!payPassword.trim() || !pendingCallback) return;

      setIsVerifying(true);
      setError(undefined);

      try {
        const success = await pendingCallback(payPassword);
        if (success) {
          pop();
        } else {
          setError(t("transaction:sendPage.payPasswordError"));
        }
      } catch {
        setError(t("transaction:sendPage.payPasswordError"));
      } finally {
        setIsVerifying(false);
      }
    },
    [payPassword, pop, t]
  );

  const canSubmit = payPassword.trim().length > 0 && !isVerifying;

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
            <h2 className="text-center text-lg font-semibold">{displayTitle}</h2>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          <p className="text-center text-muted-foreground text-sm">{displayDescription}</p>

          <div className="space-y-2">
            <PasswordInput
              value={payPassword}
              onChange={(e) => setPayPassword(e.target.value)}
              placeholder={t("transaction:sendPage.payPasswordPlaceholder")}
              disabled={isVerifying}
              aria-describedby={error ? "pay-password-error" : undefined}
            />
            {error && (
              <div id="pay-password-error" className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="size-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="submit"
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

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const PayPasswordConfirmJob: ActivityComponentType<PayPasswordConfirmJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <PayPasswordConfirmJobContent />
    </ActivityParamsProvider>
  );
};
