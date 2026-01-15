import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFlow } from "../../stackflow";
import { WalletCardCarousel } from "@/components/wallet/wallet-card-carousel";
import { WalletAddressPortfolioView } from "@/components/wallet/wallet-address-portfolio-view";
import { LoadingSpinner, GradientButton } from "@biochain/key-ui";
import { MigrationRequiredView } from "@/components/common/migration-required-view";
import { Button } from "@/components/ui/button";
import { useWalletTheme } from "@/hooks/useWalletTheme";
import { useClipboard, useToast, useHaptics } from "@/services";
import { getChainProvider } from "@/services/chain-adapter/providers";
import { usePendingTransactions } from "@/hooks/use-pending-transactions";
import { PendingTxList } from "@/components/transaction/pending-tx-list";
import type { TokenInfo, TokenItemContext, TokenMenuItem } from "@/components/token/token-item";
import {
  IconPlus,
  IconSend,
  IconQrcode,
  IconLineScan,
  IconFlame,
  IconArrowRight,
} from "@tabler/icons-react";
import {
  useWallets,
  useCurrentWallet,
  useSelectedChain,
  useChainPreferences,
  useHasWallet,
  useWalletInitialized,
  useChainConfigMigrationRequired,
  useChainConfigState,
  chainConfigSelectors,
  walletActions,
} from "@/stores";
import type { TransactionInfo } from "@/components/transaction/transaction-item";
import { toTransactionInfoList } from "@/components/transaction/adapters";

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
  const chainConfigState = useChainConfigState();
  const chainConfig = chainConfigState.snapshot
    ? chainConfigSelectors.getChainById(chainConfigState, selectedChain)
    : null;
  const mainAssetSymbol = chainConfig?.symbol;

  // 初始化钱包主题
  useWalletTheme();

  // 获取当前链地址
  const currentChainAddress = currentWallet?.chainAddresses?.find(
    (ca) => ca.chain === selectedChain
  );
  const address = currentChainAddress?.address;

  // 获取 ChainProvider 的响应式 fetchers
  const chainProvider = useMemo(
    () => (selectedChain ? getChainProvider(selectedChain) : null),
    [selectedChain]
  );

  // 余额查询（使用 fetcher.useState()）
  const { data: balanceResult, isFetching: isRefreshing } = chainProvider?.nativeBalance.useState(
    { address: address ?? "" },
    { enabled: !!address }
  ) ?? {}

  // 代币余额列表（使用 fetcher.useState()）
  const { data: tokensResult } = chainProvider?.tokenBalances.useState(
    { address: address ?? "" },
    { enabled: !!address }
  ) ?? {}

  // 交易历史（使用 fetcher.useState()）
  const { data: txResult, isLoading: txLoading } = chainProvider?.transactionHistory.useState(
    { address: address ?? "", limit: 50 },
    { enabled: !!address }
  ) ?? {}

  // Note: Support checks via NoSupportError are available via balanceError/txError if needed

  // 转换代币数据（从 tokenBalances 使用 keyFetch 获取）
  const tokens = useMemo(() => tokensResult ?? [], [tokensResult]);

  // 转换余额数据格式
  const balanceData = useMemo(() => ({
    tokens: tokens,
    supported: !!balanceResult || tokens.length > 0,
    fallbackReason: !chainProvider?.nativeBalance ? "No balance provider" : undefined,
  }), [balanceResult, chainProvider?.nativeBalance, tokens]);

  // 转换交易历史格式（使用适配器将 API Transaction 转换为 UI TransactionInfo）
  const transactions = useMemo(() => {
    if (!txResult) return [];
    return toTransactionInfoList(txResult, selectedChain);
  }, [txResult, selectedChain]);

  // Pending Transactions
  const {
    transactions: pendingTransactions,
    deleteTransaction: deletePendingTx,
    retryTransaction: retryPendingTx,
    clearAllFailed: clearAllFailedPendingTx,
  } = usePendingTransactions(currentWallet?.id);

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

  // 资产操作菜单项生成器
  const getTokenMenuItems = useCallback(
    (token: TokenInfo, context: TokenItemContext): TokenMenuItem[] => [
      {
        label: t("home:wallet.transfer"),
        icon: <IconArrowRight className="size-4" />,
        onClick: () => {
          haptics.impact("light");
          push("SendActivity", { assetType: token.symbol });
        },
      },
      {
        label: t("home:wallet.destroy"),
        icon: <IconFlame className="size-4" />,
        onClick: () => {
          haptics.impact("light");
          push("DestroyActivity", { assetType: token.symbol, assetLocked: "true" });
        },
        variant: "destructive",
        show: context.canDestroy,
      },
    ],
    [haptics, push, t]
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
    <div data-testid="wallet-home" className="flex h-full flex-col overflow-y-auto bg-background">
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
            data-testid="wallet-home-send-button"
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-all active:scale-95 group-hover:bg-primary/20">
              <IconSend className="size-5" />
            </div>
            <span className="text-xs font-medium">{t("home:wallet.send")}</span>
          </button>
          <button
            onClick={() => push("ReceiveActivity", {})}
            data-testid="wallet-home-receive-button"
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-all active:scale-95 group-hover:bg-primary/20">
              <IconQrcode className="size-5" />
            </div>
            <span className="text-xs font-medium">{t("home:wallet.receive")}</span>
          </button>
          <button
            onClick={() => push("ScannerActivity", {})}
            data-testid="wallet-home-scan-button"
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-all active:scale-95 group-hover:bg-primary/20">
              <IconLineScan className="size-5" />
            </div>
            <span className="text-xs font-medium">{t("common:a11y.scan")}</span>
          </button>
        </div>
      </div>

      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <div className="px-4 pt-2">
          <PendingTxList
            transactions={pendingTransactions.slice(0, 3)}
            onRetry={retryPendingTx}
            onDelete={deletePendingTx}
            onClearAllFailed={clearAllFailedPendingTx}
          />
          {pendingTransactions.length > 3 && (
            <button
              onClick={() => push("HistoryActivity", { chain: selectedChain })}
              className="mt-2 w-full rounded-lg bg-muted/60 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              {t("transaction:pendingTx.viewAll", { count: pendingTransactions.length })}
            </button>
          )}
        </div>
      )}

      {/* 内容区：复用 WalletAddressPortfolioView */}
      <div className="flex-1 pt-3">
        <WalletAddressPortfolioView
          chainId={selectedChain}
          chainName={selectedChainName}
          tokens={tokens.map((token) => ({
            symbol: token.symbol,
            name: token.name,
            chain: selectedChain,
            balance: token.amount.toFormatted(),
            decimals: token.decimals,
            fiatValue: undefined, // Price data not in TokenBalance, handled separately
            change24h: 0,
            icon: token.icon,
          }))}
          transactions={transactions.slice(0, 5)}
          tokensRefreshing={isRefreshing}
          transactionsLoading={txLoading}
          tokensSupported={balanceData?.supported ?? true}
          tokensFallbackReason={balanceData?.fallbackReason}
          onTokenClick={(_token) => {
            // Token click handler
          }}
          onTransactionClick={handleTransactionClick}
          mainAssetSymbol={mainAssetSymbol}
          tokenMenuItems={getTokenMenuItems}
          renderTransactionFooter={() => (
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
          )}
          testId="wallet-home"
        />
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
