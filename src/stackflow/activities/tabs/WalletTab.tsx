import { useTranslation } from "react-i18next";
import { useFlow } from "../../stackflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { IconPlus, IconWallet, IconChevronRight } from "@tabler/icons-react";
import { useCurrentWallet } from "@/stores";

export function WalletTab() {
  const { push } = useFlow();
  const { t } = useTranslation();
  const currentWallet = useCurrentWallet();

  const wallets = currentWallet
    ? [
        {
          id: currentWallet.id,
          name: currentWallet.name,
          balance: "0.00",
          address:
            currentWallet.chainAddresses[0]?.address?.slice(0, 6) +
            "..." +
            currentWallet.chainAddresses[0]?.address?.slice(-4),
        },
      ]
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <PageHeader title={t("a11y.tabWallet")} />

      <div className="flex flex-col gap-4 p-4">
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => push("WalletCreateActivity", {})}
        >
          <IconPlus className="size-4" />
          {t('wallet:add')}
        </Button>

        <div className="space-y-3">
        {wallets.map((wallet) => (
          <Card
            key={wallet.id}
            className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
            onClick={() =>
              push("WalletDetailActivity", { walletId: wallet.id, walletName: wallet.name })
            }
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <IconWallet className="size-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{wallet.name}</h3>
                  <p className="font-mono text-sm text-muted-foreground">{wallet.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">${wallet.balance}</span>
                <IconChevronRight className="size-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}

          {wallets.length === 0 && (
            <div className="py-12 text-center">
              <IconWallet className="mx-auto size-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">{t('wallet:empty')}</p>
              <p className="text-sm text-muted-foreground">{t('wallet:emptyHint')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
