import { useState, useCallback, useEffect } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/security/password-input";
import { IconFingerprint as Fingerprint, IconAlertCircle as AlertCircle } from "@tabler/icons-react";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";

// Global callback store for password verification
let pendingCallback: ((password: string) => Promise<boolean>) | null = null;
let pendingBiometricCallback: (() => Promise<boolean>) | null = null;

/**
 * Set the callback for password verification before pushing this activity
 */
export function setPasswordConfirmCallback(
  onVerify: (password: string) => Promise<boolean>,
  onBiometric?: () => Promise<boolean>
) {
  pendingCallback = onVerify;
  pendingBiometricCallback = onBiometric ?? null;
}

/**
 * Clear the callback (called on unmount)
 */
function clearPasswordConfirmCallback() {
  pendingCallback = null;
  pendingBiometricCallback = null;
}

type PasswordConfirmJobParams = {
  title?: string;
  description?: string;
  biometricAvailable?: string; // "true" or "false" as URL params are strings
};

function PasswordConfirmJobContent() {
  const { t } = useTranslation("security");
  const { pop } = useFlow();
  const { title, description, biometricAvailable } = useActivityParams<PasswordConfirmJobParams>();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [isVerifying, setIsVerifying] = useState(false);

  const displayTitle = title ?? t("passwordConfirm.defaultTitle");
  const hasBiometric = biometricAvailable === "true" && pendingBiometricCallback;

  useEffect(() => {
    return () => {
      clearPasswordConfirmCallback();
    };
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!password.trim() || !pendingCallback) return;

      setIsVerifying(true);
      setError(undefined);

      try {
        const success = await pendingCallback(password);
        if (success) {
          pop();
        } else {
          setError(t("passwordConfirm.error"));
        }
      } catch {
        setError(t("passwordConfirm.error"));
      } finally {
        setIsVerifying(false);
      }
    },
    [password, pop, t]
  );

  const handleBiometric = useCallback(async () => {
    if (!pendingBiometricCallback) return;

    setIsVerifying(true);
    setError(undefined);

    try {
      const success = await pendingBiometricCallback();
      if (success) {
        pop();
      } else {
        setError(t("passwordConfirm.biometricFailed"));
      }
    } catch {
      setError(t("passwordConfirm.biometricFailed"));
    } finally {
      setIsVerifying(false);
    }
  }, [pop, t]);

  const canSubmit = password.trim().length > 0 && !isVerifying;

  return (
    <BottomSheet data-testid="password-dialog">
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Title */}
        <div className="border-b border-border px-4 pb-4">
          <h2 className="text-center text-lg font-semibold">{displayTitle}</h2>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          {description && <p className="text-center text-muted-foreground">{description}</p>}

          <div className="space-y-2">
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordConfirm.placeholder")}
              disabled={isVerifying}
              aria-describedby={error ? "password-error" : undefined}
            />
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
              {isVerifying ? t("passwordConfirm.verifying") : t("passwordConfirm.confirm")}
            </button>

            {hasBiometric && (
              <button
                type="button"
                onClick={handleBiometric}
                disabled={isVerifying}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 font-medium transition-colors",
                  "hover:bg-muted",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <Fingerprint className="size-5" />
                <span>{t("passwordConfirm.biometric")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => pop()}
              disabled={isVerifying}
              className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
            >
              {t("passwordConfirm.cancel")}
            </button>
          </div>
        </form>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const PasswordConfirmJob: ActivityComponentType<PasswordConfirmJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <PasswordConfirmJobContent />
    </ActivityParamsProvider>
  );
};
