import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { useTranslation } from "react-i18next";
import { IconPlus, IconWallet, IconCircleCheckFilled } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useFlow } from "../../stackflow";
import { useWallets, useCurrentWallet, walletActions } from "@/stores";
import { WALLET_THEME_COLORS, useWalletTheme } from "@/hooks/useWalletTheme";

export const WalletListJob: ActivityComponentType = () => {
  const { t } = useTranslation(["wallet", "common"]);
  const { pop, push } = useFlow();
  const wallets = useWallets();
  const currentWallet = useCurrentWallet();
  const currentWalletId = currentWallet?.id;
  const { getWalletTheme } = useWalletTheme();

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
            const themeColor = WALLET_THEME_COLORS.find(c => c.hue === themeHue) ?? WALLET_THEME_COLORS[0];

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
                {/* 钱包图标带主题色 */}
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: `oklch(0.85 0.15 ${themeHue})`,
                  }}
                >
                  <IconWallet className="size-5 text-white" />
                </div>

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

                {/* 主题色指示 */}
                <div
                  className="size-4 shrink-0 rounded-full"
                  style={{ backgroundColor: themeColor?.color ?? `oklch(0.7 0.2 ${themeHue})` }}
                  title={themeColor?.name}
                />
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
