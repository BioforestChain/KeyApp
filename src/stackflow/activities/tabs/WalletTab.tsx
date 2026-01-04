import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFlow } from "../../stackflow";
import { TokenList } from "@/components/token/token-list";
import { TransactionList } from "@/components/transaction/transaction-list";
import { WalletCardCarousel } from "@/components/wallet/wallet-card-carousel";
import { SwipeableTabs } from "@/components/layout/swipeable-tabs";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { MigrationRequiredView } from "@/components/common/migration-required-view";
import { GradientButton } from "@/components/common/gradient-button";
import { Button } from "@/components/ui/button";
import { useWalletTheme } from "@/hooks/useWalletTheme";
import { useClipboard, useToast, useHaptics } from "@/services";
import { useBalanceQuery, useTransactionHistoryQuery } from "@/queries";
import {
  IconPlus,
  IconSend,
  IconQrcode,
  IconLineScan,
} from "@tabler/icons-react";
import {
  useWallets,
  useCurrentWallet,
  useSelectedChain,
  useChainPreferences,
  useCurrentChainTokens,
  useHasWallet,
  useWalletInitialized,
  useChainConfigMigrationRequired,
  walletActions,
} from "@/stores";
import type { TransactionInfo } from "@/components/transaction/transaction-item";

const CHAIN_NAMES: Record<string, string> = {
  ethereum: "Ethereum",
  bitcoin: "Bitcoin",
  tron: "Tron",
  binance: "BSC",
  bfmeta: "BFMeta",
  ccchain: "CCChain",
  pmchain: "PMChain",
  bfchainv2: "BFChain V2",
  btgmeta: "BTGMeta",
  biwmeta: "BIWMeta",
  ethmeta: "ETHMeta",
  malibu: "Malibu",
};

export function WalletTab() {
  const { push } = useFlow();
  const clipboard = useClipboard();
  const toast = useToast();
  const haptics = useHaptics();
  const { t } = useTranslation(["home", "wallet", "common", "transaction"]);

  const migrationRequired = useChainConfigMigrationRequired();
  const isInitialized = useWalletInitialized();
  const hasWallet = useHasWallet();
  const wallets = useWallets();
  const currentWallet = useCurrentWallet();
  const currentWalletId = currentWallet?.id ?? null;
  const selectedChain = useSelectedChain();
  const chainPreferences = useChainPreferences();
  const selectedChainName = CHAIN_NAMES[selectedChain] ?? selectedChain;
  const tokens = useCurrentChainTokens();

  // 初始化钱包主题
  useWalletTheme();

  // 当前内容 Tab
  const [activeTab, setActiveTab] = useState("assets");

  // 余额查询
  const { isFetching: isRefreshing } = useBalanceQuery(
    currentWallet?.id,
    selectedChain
  );

  // 交易历史 - 按当前选中的链过滤
  const { transactions, isLoading: txLoading, setFilter } = useTransactionHistoryQuery(
    currentWallet?.id
  );

  // 当链切换时更新交易过滤器
  useEffect(() => {
    setFilter((prev) => ({ ...prev, chain: selectedChain }));
  }, [selectedChain, setFilter]);

  // 复制地址
  const handleCopyAddress = useCallback(
    async (address: string) => {
      await clipboard.write({ text: address });
      await haptics.impact("light");
      toast.show(t("home:wallet.addressCopied"));
    },
    [clipboard, haptics, toast, t]
  );

  // 打开链选择器（传入钱包ID以便选择后更新该钱包的偏好）
  const handleOpenChainSelector = useCallback((walletId: string) => {
    // 如果不是当前钱包，先切换到该钱包
    if (walletId !== currentWalletId) {
      walletActions.setCurrentWallet(walletId);
    }
    push("ChainSelectorJob", {});
  }, [push, currentWalletId]);

  // 打开钱包设置
  const handleOpenWalletSettings = useCallback(
    (walletId: string) => {
      const wallet = wallets.find((w) => w.id === walletId);
      if (wallet) {
        push("WalletConfigActivity", { walletId, walletName: wallet.name });
      }
    },
    [push, wallets]
  );

  // 切换钱包
  const handleWalletChange = useCallback((walletId: string) => {
    walletActions.setCurrentWallet(walletId);
  }, []);

  // 添加钱包
  const handleAddWallet = useCallback(() => {
    push("WalletAddJob", {});
  }, [push]);

  // 打开钱包列表
  const handleOpenWalletList = useCallback(() => {
    push("WalletListJob", {});
  }, [push]);

  // 地址余额查询
  const handleOpenAddressBalance = useCallback(() => {
    push("AddressBalanceActivity", {});
  }, [push]);

  // 地址交易查询
  const handleOpenAddressTransactions = useCallback(() => {
    push("AddressTransactionsActivity", {});
  }, [push]);

  // 交易点击
  const handleTransactionClick = useCallback(
    (tx: TransactionInfo) => {
      if (tx.id) {
        push("TransactionDetailActivity", { txId: tx.id });
      }
    },
    [push]
  );

  // 需要迁移数据库
  if (migrationRequired) {
    return <MigrationRequiredView />;
  }

  if (!isInitialized) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasWallet || !currentWallet) {
    return <NoWalletView />;
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      {/* 钱包卡片轮播 */}
      <div className="pt-2 pb-1">
        <WalletCardCarousel
          wallets={wallets}
          currentWalletId={currentWalletId}
          selectedChain={selectedChain}
          chainPreferences={chainPreferences}
          chainNames={CHAIN_NAMES}
          onWalletChange={handleWalletChange}
          onCopyAddress={handleCopyAddress}
          onOpenChainSelector={handleOpenChainSelector}
          onOpenSettings={handleOpenWalletSettings}
          onOpenWalletList={handleOpenWalletList}
          onAddWallet={handleAddWallet}
          onOpenAddressBalance={handleOpenAddressBalance}
          onOpenAddressTransactions={handleOpenAddressTransactions}
        />

        {/* 快捷操作按钮 - 颜色跟随主题 */}
        <div className="mt-2 flex justify-center gap-8 px-6">
          <button
            onClick={() => push("SendActivity", {})}
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-all active:scale-95 group-hover:bg-primary/20">
              <IconSend className="size-5" />
            </div>
            <span className="text-xs font-medium">{t("home:wallet.send")}</span>
          </button>
          <button
            onClick={() => push("ReceiveActivity", {})}
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-all active:scale-95 group-hover:bg-primary/20">
              <IconQrcode className="size-5" />
            </div>
            <span className="text-xs font-medium">{t("home:wallet.receive")}</span>
          </button>
          <button
            onClick={() => push("ScannerActivity", {})}
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-all active:scale-95 group-hover:bg-primary/20">
              <IconLineScan className="size-5" />
            </div>
            <span className="text-xs font-medium">{t("common:a11y.scan")}</span>
          </button>
        </div>
      </div>

      {/* 内容区 Tab 切换 */}
      <div className="flex-1 pt-3">
        <SwipeableTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="h-full"
        >
          {(tab) =>
            tab === "assets" ? (
              <div className="p-4">
                <TokenList
                  tokens={tokens.map((token) => ({
                    symbol: token.symbol,
                    name: token.name,
                    chain: selectedChain,
                    balance: token.balance,
                    decimals: token.decimals,
                    fiatValue: token.fiatValue
                      ? String(token.fiatValue)
                      : undefined,
                    change24h: token.change24h,
                    icon: token.icon,
                  }))}
                  refreshing={isRefreshing}
                  onTokenClick={(token) => {
                    console.log("Token clicked:", token.symbol);
                  }}
                  emptyTitle={t("home:wallet.noAssets")}
                  emptyDescription={t("home:wallet.noAssetsOnChain", {
                    chain: selectedChainName,
                  })}
                />
              </div>
            ) : (
              <div className="p-4">
                <TransactionList
                  transactions={transactions.slice(0, 5)}
                  loading={txLoading}
                  onTransactionClick={handleTransactionClick}
                  emptyTitle={t("transaction:history.emptyTitle")}
                  emptyDescription={t("transaction:history.emptyDesc")}
                />
                <button
                  onClick={() => push("HistoryActivity", { 
                    chain: transactions.length > 0 ? selectedChain : "all" 
                  })}
                  className="mt-3 w-full rounded-lg bg-muted/60 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  {transactions.length > 0
                    ? t("transaction:history.viewAll", { count: transactions.length })
                    : t("transaction:history.viewAllChains")}
                </button>
              </div>
            )
          }
        </SwipeableTabs>
      </div>

      {/* TabBar spacer */}
      <div className="shrink-0 h-[var(--tab-bar-height)]" />
    </div>
  );
}

function NoWalletView() {
  const { push } = useFlow();
  const { t } = useTranslation("home");

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="bg-primary/10 rounded-full p-6">
        <IconPlus className="text-primary size-12" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{t("welcome.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("welcome.subtitle")}</p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <GradientButton
          variant="mint"
          className="w-full"
          data-testid="create-wallet-button"
          onClick={() => push("WalletCreateActivity", {})}
        >
          {t("welcome.createWallet")}
        </GradientButton>
        <Button
          variant="outline"
          className="w-full"
          data-testid="import-wallet-button"
          onClick={() => push("OnboardingRecoverActivity", {})}
        >
          {t("welcome.importWallet")}
        </Button>
      </div>
    </div>
  );
}
