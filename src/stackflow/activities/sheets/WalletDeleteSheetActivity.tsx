import { useState, useCallback } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/components/security/password-input";
import { walletActions, useWallets } from "@/stores";
import { verifyPassword } from "@/lib/crypto";
import { IconAlertCircle as AlertCircle } from "@tabler/icons-react";
import { useFlow } from "../../stackflow";
import { useNavigation } from "../../hooks/use-navigation";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";

type WalletDeleteSheetParams = {
  walletId: string;
};

function WalletDeleteSheetContent() {
  const { t } = useTranslation("wallet");
  const { pop } = useFlow();
  const { navigate } = useNavigation();
  const { walletId } = useActivityParams<WalletDeleteSheetParams>();

  const wallets = useWallets();
  const wallet = wallets.find((w) => w.id === walletId);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string>();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyAndDelete = useCallback(async () => {
    if (!wallet) return;

    if (!wallet.encryptedMnemonic) {
      walletActions.deleteWallet(wallet.id);
      // Navigate back to home after deletion
      navigate({ to: "/" });
      return;
    }

    setIsVerifying(true);
    setPasswordError(undefined);

    try {
      const isValid = await verifyPassword(wallet.encryptedMnemonic, password);
      if (!isValid) {
        setPasswordError(t("editSheet.passwordError"));
        return;
      }
      walletActions.deleteWallet(wallet.id);
      // Navigate back to home after deletion
      navigate({ to: "/" });
    } catch {
      setPasswordError(t("editSheet.verifyFailed"));
    } finally {
      setIsVerifying(false);
    }
  }, [wallet, password, navigate, t]);

  if (!wallet) {
    return null;
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
          <h2 className="text-center text-lg font-semibold">{t("editSheet.deleteTitle")}</h2>
        </div>

        {/* Content */}
        <div className="space-y-6 p-4">
          <p className="text-center text-muted-foreground">
            {t("editSheet.deleteWarning", { name: wallet.name })}
          </p>

          <div className="space-y-2">
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("editSheet.passwordPlaceholder")}
              disabled={isVerifying}
            />
            {passwordError && (
              <div className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="size-4" />
                <span>{passwordError}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleVerifyAndDelete}
              disabled={!password.trim() || isVerifying}
              className={cn(
                "w-full rounded-full py-3 font-medium text-white transition-colors",
                "bg-destructive hover:bg-destructive/90",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isVerifying ? t("editSheet.verifying") : t("editSheet.confirmDelete")}
            </button>
            <button
              onClick={() => pop()}
              disabled={isVerifying}
              className="w-full py-2 text-center text-sm text-muted-foreground hover:text-foreground"
            >
              {t("editSheet.cancel")}
            </button>
          </div>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const WalletDeleteSheetActivity: ActivityComponentType<WalletDeleteSheetParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <WalletDeleteSheetContent />
    </ActivityParamsProvider>
  );
};
