import { useState, useCallback, useEffect } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { walletActions, useWallets } from "@/stores";
import { useFlow } from "../../stackflow";
import { ActivityParamsProvider, useActivityParams } from "../../hooks";

type WalletRenameJobParams = {
  walletId: string;
};

function WalletRenameJobContent() {
  const { t } = useTranslation("wallet");
  const { pop } = useFlow();
  const { walletId } = useActivityParams<WalletRenameJobParams>();

  const wallets = useWallets();
  const wallet = wallets.find((w) => w.id === walletId);

  const [newName, setNewName] = useState(wallet?.name ?? "");

  useEffect(() => {
    if (wallet) {
      setNewName(wallet.name);
    }
  }, [wallet]);

  const handleConfirmRename = useCallback(() => {
    if (!wallet) return;
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    walletActions.updateWalletName(wallet.id, trimmedName);
    pop();
  }, [wallet, newName, pop]);

  if (!wallet) {
    return null;
  }

  const canSave = newName.trim().length > 0 && newName.trim() !== wallet.name;

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Title */}
        <div className="border-b border-border px-4 pb-4">
          <h2 className="text-center text-lg font-semibold">{t("editSheet.renameTitle")}</h2>
        </div>

        {/* Content */}
        <div className="space-y-6 p-4">
          <div className="space-y-2">
            <label htmlFor="wallet-name" className="text-sm font-medium">
              {t("editSheet.walletName")}
            </label>
            <input
              id="wallet-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t("editSheet.walletNamePlaceholder")}
              maxLength={20}
              className={cn(
                "w-full rounded-xl border border-border bg-background px-4 py-3",
                "focus:outline-none focus:ring-2 focus:ring-primary"
              )}
            />
            <p className="text-right text-xs text-muted-foreground">{newName.length}/20</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleConfirmRename}
              disabled={!canSave}
              className={cn(
                "w-full rounded-full py-3 font-medium text-primary-foreground transition-colors",
                "bg-primary hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {t("editSheet.save")}
            </button>
            <button
              onClick={() => pop()}
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

export const WalletRenameJob: ActivityComponentType<WalletRenameJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <WalletRenameJobContent />
    </ActivityParamsProvider>
  );
};
