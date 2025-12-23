import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-store";
import { useFlow } from "../../stackflow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { TransactionItem } from "@/components/transaction/transaction-item";
import { useTransactionHistoryQuery } from "@/queries";
import { addressBookActions, addressBookStore, addressBookSelectors, useCurrentWallet, useSelectedChain, type Contact } from "@/stores";
import { IconSend } from "@tabler/icons-react";

export function TransferTab() {
  const { push } = useFlow();
  const { t } = useTranslation(['transaction', 'common']);
  const currentWallet = useCurrentWallet();
  const selectedChain = useSelectedChain();
  const addressBookState = useStore(addressBookStore);
  const contacts = addressBookState.contacts;
  // 使用 TanStack Query 管理交易历史
  // - 30s staleTime: Tab 切换不会重复请求
  // - 共享缓存: 多个组件使用同一数据
  const { transactions, isLoading } = useTransactionHistoryQuery(currentWallet?.id);

  useEffect(() => {
    if (!addressBookState.isInitialized) {
      addressBookActions.initialize();
    }
  }, [addressBookState.isInitialized]);

  const recentContacts = useMemo(() => {
    const filtered = selectedChain
      ? contacts.filter((contact) => 
          contact.addresses.some((addr) => addr.chainType === selectedChain)
        )
      : contacts;
    return filtered.slice(0, 4);
  }, [contacts, selectedChain]);

  // Helper to get primary address for a contact
  const getPrimaryAddress = (contact: Contact): string => {
    const addr = addressBookSelectors.getDefaultAddress(contact, selectedChain ?? undefined);
    return addr?.address ?? contact.addresses[0]?.address ?? '';
  };

  const recentTransactions = useMemo(() => {
    const filtered = selectedChain
      ? transactions.filter((tx) => tx.chain === selectedChain)
      : transactions;
    return filtered.slice(0, 3);
  }, [transactions, selectedChain]);

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
              {recentContacts.length > 0 ? (
                recentContacts.map((contact) => (
                  <button
                    key={contact.id}
                    className="flex flex-col items-center gap-1"
                    onClick={() => push("SendActivity", { address: getPrimaryAddress(contact) })}
                  >
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                      {contact.name[0] ?? "?"}
                    </div>
                    <span className="text-xs">{contact.name}</span>
                  </button>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">{t('common:addressBook.noContacts')}</p>
              )}
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
          {!currentWallet && (
            <p className="text-muted-foreground text-sm">{t('transaction:history.noWallet')}</p>
          )}
          {currentWallet && isLoading && (
            <p className="text-muted-foreground text-sm">{t('common:loading')}</p>
          )}
          {currentWallet && !isLoading && recentTransactions.length === 0 && (
            <p className="text-muted-foreground text-sm">{t('transaction:history.emptyTitle')}</p>
          )}
          {recentTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onClick={() => push("TransactionDetailActivity", { txId: tx.id })}
            />
          ))}
          {currentWallet && recentTransactions.length > 0 && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => push("HistoryActivity", {})}
            >
              {t('common:showMore')}
            </Button>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
