import { useTranslation } from "react-i18next";
import { useFlow } from "../../stackflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { IconSend } from "@tabler/icons-react";

export function TransferTab() {
  const { push } = useFlow();
  const { t } = useTranslation(['transaction', 'common']);

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <PageHeader title={t("common:a11y.tabTransfer")} />

      <div className="flex flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('transaction:transfer.quickTransfer')}</CardTitle>
          <CardDescription>{t('transaction:transfer.quickTransferDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recent contacts */}
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">{t('transaction:transfer.recentContacts')}</p>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {["Alice", "Bob", "Carol", "Dave"].map((name) => (
                <button
                  key={name}
                  className="flex flex-col items-center gap-1"
                  onClick={() => push("SendActivity", {})}
                >
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                    {name[0]}
                  </div>
                  <span className="text-xs">{name}</span>
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full gap-2" onClick={() => push("SendActivity", {})}>
            <IconSend className="size-4" />
            {t('transaction:transfer.newTransfer')}
          </Button>
        </CardContent>
      </Card>

      {/* Transfer history */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('transaction:transfer.transferHistory')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { to: "Alice", amount: "-500.00", timeKey: "today", time: "14:30" },
            { to: "Bob", amount: "-200.00", timeKey: "yesterday", time: "09:15" },
            { to: "Carol", amount: "-1,000.00", timeKey: "daysAgo", days: 3 },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600">
                  {tx.to[0]}
                </div>
                <div>
                  <p className="font-medium">{t('transaction:transfer.transferTo', { name: tx.to })}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.timeKey === 'daysAgo' 
                      ? t(`transaction:transfer.${tx.timeKey}`, { days: tx.days })
                      : `${t(`transaction:transfer.${tx.timeKey}`)} ${tx.time}`}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-orange-600">{tx.amount}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
