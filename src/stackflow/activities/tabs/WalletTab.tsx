import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useFlow } from "../../stackflow";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { IconPlus, IconWallet, IconCircleCheckFilled, IconSettings } from "@tabler/icons-react";
import { useWallets, useCurrentWallet, walletActions } from "@/stores";
import { cn } from "@/lib/utils";

export function WalletTab() {
  const { push } = useFlow();
  const { t } = useTranslation();
  const wallets = useWallets();
  const currentWallet = useCurrentWallet();
  const currentWalletId = currentWallet?.id;

  const handleSelectWallet = useCallback((walletId: string) => {
    walletActions.setCurrentWallet(walletId);
  }, []);

  const handleWalletSettings = useCallback((e: React.MouseEvent, walletId: string, walletName: string) => {
    e.stopPropagation();
    push("WalletDetailActivity", { walletId, walletName });
  }, [push]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <PageHeader title={t("a11y.tabWallet")} />

      <div className="flex-1 p-4">
        {/* Wallet List */}
        <div className="space-y-2">
          {wallets.map((wallet) => {
            const isActive = wallet.id === currentWalletId;
            const address = wallet.chainAddresses[0]?.address;
            const displayAddress = address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : "---";

            return (
              <div
                key={wallet.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectWallet(wallet.id)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectWallet(wallet.id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl p-4 text-left transition-all cursor-pointer",
                  "active:scale-[0.98]",
                  isActive
                    ? "bg-primary/10 ring-2 ring-primary"
                    : "bg-card hover:bg-muted/80"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-full",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  <IconWallet className="size-5" />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{wallet.name}</span>
                    {isActive && (
                      <IconCircleCheckFilled className="size-4 shrink-0 text-primary" />
                    )}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground truncate">
                    {displayAddress}
                  </p>
                </div>

                {/* Settings button */}
                <button
                  type="button"
                  onClick={(e) => handleWalletSettings(e, wallet.id, wallet.name)}
                  className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label={t('wallet:detail.title')}
                >
                  <IconSettings className="size-5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {wallets.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
              <IconWallet className="size-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{t('wallet:empty')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('wallet:emptyHint')}</p>
          </div>
        )}

        {/* Add wallet button - fixed at bottom */}
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => push("WalletAddSheetActivity", {})}
          >
            <IconPlus className="size-4" />
            {t('wallet:add')}
          </Button>
        </div>
      </div>
    </div>
  );
}
