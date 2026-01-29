import { useState, useCallback } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { PatternLock, patternToString } from "@/components/security/pattern-lock";
import { walletActions, useWallets } from "@/stores";
import { verifyPassword } from "@/lib/crypto";
import { useFlow } from "../../stackflow";
import { useNavigation } from "../../hooks/use-navigation";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";

type WalletDeleteJobParams = {
  walletId: string;
};

function WalletDeleteJobContent() {
  const { t } = useTranslation("wallet");
  const { pop } = useFlow();
  const { navigate } = useNavigation();
  const { walletId } = useActivityParams<WalletDeleteJobParams>();

  const wallets = useWallets();
  const wallet = wallets.find((w) => w.id === walletId);

  const [pattern, setPattern] = useState<number[]>([]);
  const [patternError, setPatternError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleCancel = () => {
    pop();
  };

  const handlePatternComplete = useCallback(async (nodes: number[]) => {
    if (!wallet || nodes.length < 4) return;

    if (!wallet.encryptedMnemonic) {
      walletActions.deleteWallet(wallet.id);
      navigate({ to: "/" });
      return;
    }

    setIsVerifying(true);
    setPatternError(false);

    try {
      const patternKey = patternToString(nodes);
      const isValid = await verifyPassword(wallet.encryptedMnemonic, patternKey);
      if (!isValid) {
        setPatternError(true);
        setPattern([]);
        return;
      }
      walletActions.deleteWallet(wallet.id);
      navigate({ to: "/" });
    } catch {
      setPatternError(true);
      setPattern([]);
    } finally {
      setIsVerifying(false);
    }
  }, [wallet, navigate]);

  if (!wallet) {
    return null;
  }

  return (
    <BottomSheet onCancel={handleCancel}>
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

          <PatternLock
            value={pattern}
            onChange={setPattern}
            onComplete={handlePatternComplete}
            minPoints={4}
            error={patternError}
            disabled={isVerifying}
          />

          <div className="space-y-3">
            <button
              onClick={handleCancel}
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

export const WalletDeleteJob: ActivityComponentType<WalletDeleteJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <WalletDeleteJobContent />
    </ActivityParamsProvider>
  );
};
