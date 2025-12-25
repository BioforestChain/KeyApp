import { useState, useCallback, useRef } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { PatternLock, patternToString } from "@/components/security/pattern-lock";
import { IconFingerprint as Fingerprint } from "@tabler/icons-react";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";

// Global callback store for wallet lock verification
let pendingCallback: ((pattern: string) => Promise<boolean>) | null = null;
let pendingBiometricCallback: (() => Promise<boolean>) | null = null;

/**
 * Set the callback for wallet lock verification before pushing this activity
 */
export function setWalletLockConfirmCallback(
  onVerify: (pattern: string) => Promise<boolean>,
  onBiometric?: () => Promise<boolean>
) {
  pendingCallback = onVerify;
  pendingBiometricCallback = onBiometric ?? null;
}

/**
 * Clear the callback
 */
function clearWalletLockConfirmCallback() {
  pendingCallback = null;
  pendingBiometricCallback = null;
}

type WalletLockConfirmJobParams = {
  title?: string;
  description?: string;
  biometricAvailable?: string; // "true" or "false" as URL params are strings
};

function WalletLockConfirmJobContent() {
  const { t } = useTranslation("security");
  const { pop } = useFlow();
  const { title, description, biometricAvailable } = useActivityParams<WalletLockConfirmJobParams>();

  const [pattern, setPattern] = useState<number[]>([]);
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Capture callback on mount and keep it throughout component lifecycle
  const callbackRef = useRef<((pattern: string) => Promise<boolean>) | null>(null);
  const biometricCallbackRef = useRef<(() => Promise<boolean>) | null>(null);
  const initialized = useRef(false);
  
  // Only capture on first mount (survives React Strict Mode double-mount)
  if (!initialized.current && pendingCallback) {
    callbackRef.current = pendingCallback;
    biometricCallbackRef.current = pendingBiometricCallback;
    clearWalletLockConfirmCallback();
    initialized.current = true;
  }

  const displayTitle = title ?? t("patternLock.unlockTitle");
  const hasBiometric = biometricAvailable === "true" && biometricCallbackRef.current;

  const handlePatternComplete = useCallback(
    async (nodes: number[]) => {
      const callback = callbackRef.current;
      if (nodes.length < 4 || !callback) {
        return;
      }

      setIsVerifying(true);
      setError(false);

      try {
        const patternKey = patternToString(nodes);
        const success = await callback(patternKey);
        if (success) {
          pop();
        } else {
          setError(true);
          setPattern([]);
          // 1.5秒后自动重置错误状态，让用户重新输入
          setTimeout(() => {
            setError(false);
          }, 1500);
        }
      } catch {
        setError(true);
        setPattern([]);
        // 1.5秒后自动重置错误状态
        setTimeout(() => {
          setError(false);
        }, 1500);
      } finally {
        setIsVerifying(false);
      }
    },
    [pop]
  );

  const handleBiometric = useCallback(async () => {
    const biometricCallback = biometricCallbackRef.current;
    if (!biometricCallback) return;

    setIsVerifying(true);
    setError(false);

    try {
      const success = await biometricCallback();
      if (success) {
        pop();
      } else {
        setError(true);
        // 1.5秒后自动重置错误状态
        setTimeout(() => {
          setError(false);
        }, 1500);
      }
    } catch {
      setError(true);
      // 1.5秒后自动重置错误状态
      setTimeout(() => {
        setError(false);
      }, 1500);
    } finally {
      setIsVerifying(false);
    }
  }, [pop]);

  return (
    <BottomSheet data-testid="wallet-lock-dialog">
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Title */}
        <div className="px-4 pb-4 text-center">
          <h2 className="text-lg font-semibold">{displayTitle}</h2>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          )}
        </div>

        {/* Pattern Lock */}
        <div className="px-4 pb-4">
          <PatternLock
            value={pattern}
            onChange={setPattern}
            onComplete={handlePatternComplete}
            minPoints={4}
            error={error}
            disabled={isVerifying}
            data-testid="wallet-lock-pattern"
          />
        </div>

        {/* Biometric & Cancel */}
        <div className="space-y-3 px-4 pb-4">
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
              <span>{t("walletLock.biometric")}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => pop()}
            disabled={isVerifying}
            className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {t("walletLock.cancel")}
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const WalletLockConfirmJob: ActivityComponentType<WalletLockConfirmJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <WalletLockConfirmJobContent />
    </ActivityParamsProvider>
  );
};
