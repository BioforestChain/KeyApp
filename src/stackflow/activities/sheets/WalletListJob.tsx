import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { IconPlus, IconCircleCheckFilled } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useFlow } from "../../stackflow";
import { useWallets, useCurrentWallet, walletActions } from "@/stores";
import { useWalletTheme } from "@/hooks/useWalletTheme";
import { useChainIconUrls } from "@/hooks/useChainIconUrls";
import { WalletMiniCard } from "@/components/wallet/wallet-mini-card";

export const WalletListJob: ActivityComponentType = () => {
  const { t } = useTranslation(["wallet", "common"]);
  const { pop, push } = useFlow();
  const wallets = useWallets();
  const currentWallet = useCurrentWallet();
  const currentWalletId = currentWallet?.id;
  const { getWalletTheme } = useWalletTheme();
  const chainIconUrls = useChainIconUrls();

  const handleSelectWallet = (walletId: string) => {
    walletActions.setCurrentWallet(walletId);
    pop();
  };

  const handleAddWallet = () => {
    pop();
    push("WalletAddJob", {});
  };

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Title */}
        <div className="border-b border-border px-4 pb-4">
          <h2 className="text-center text-lg font-semibold">{t("common:a11y.tabWallet")}</h2>
        </div>

        {/* Wallet List */}
        <div className="max-h-[50vh] space-y-2 overflow-y-auto p-4">
          {wallets.map((wallet) => {
            const isActive = wallet.id === currentWalletId;
            const address = wallet.chainAddresses[0]?.address;
            const displayAddress = address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : "---";
            const themeHue = getWalletTheme(wallet.id);

            return (
              <button
                key={wallet.id}
                onClick={() => handleSelectWallet(wallet.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl p-4 transition-all",
                  "active:scale-[0.98]",
                  isActive
                    ? "bg-primary/10 ring-2 ring-primary"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                {/* 钱包小卡片图标 */}
                <WalletMiniCard
                  themeHue={themeHue}
                  size="md"
                  watermarkIconUrl={chainIconUrls[wallet.chain]}
                />

                {/* 钱包信息 */}
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{wallet.name}</span>
                    {isActive && (
                      <IconCircleCheckFilled className="size-4 shrink-0 text-primary" />
                    )}
                  </div>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {displayAddress}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Add wallet button */}
        <div className="border-t border-border p-4">
          <button
            onClick={handleAddWallet}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl p-4",
              "bg-muted/50 hover:bg-muted active:bg-muted/80 transition-colors"
            )}
          >
            <IconPlus className="size-5" />
            <span className="font-medium">{t("wallet:add")}</span>
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
};
