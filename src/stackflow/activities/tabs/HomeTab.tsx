import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFlow } from "../../stackflow";
import { Button } from "@/components/ui/button";
import { TokenList } from "@/components/token/token-list";
import { GradientButton } from "@/components/common/gradient-button";
import { ChainIcon } from "@/components/wallet/chain-icon";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useClipboard, useToast, useHaptics } from "@/services";
import {
  IconSend,
  IconQrcode,
  IconChevronDown,
  IconCheck,
  IconCopy,
  IconLineScan,
  IconChevronRight,
} from "@tabler/icons-react";
import {
  useCurrentWallet,
  useSelectedChain,
  useCurrentChainAddress,
  useCurrentChainTokens,
  useHasWallet,
  useWalletInitialized,
  walletActions,
  type ChainType,
} from "@/stores";

const CHAIN_NAMES: Record<ChainType, string> = {
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

function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (address.length <= startChars + endChars + 3) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function HomeTab() {
  const { push } = useFlow();
  const clipboard = useClipboard();
  const toast = useToast();
  const haptics = useHaptics();
  const { t } = useTranslation(['home', 'common']);

  const isInitialized = useWalletInitialized();
  const hasWallet = useHasWallet();
  const currentWallet = useCurrentWallet();
  const selectedChain = useSelectedChain();
  const selectedChainName = CHAIN_NAMES[selectedChain] ?? selectedChain;
  const chainAddress = useCurrentChainAddress();
  const tokens = useCurrentChainTokens();

  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      walletActions.initialize();
    }
  }, [isInitialized]);

  // Refresh balance when wallet or chain changes
  useEffect(() => {
    if (!currentWallet || !selectedChain) return;

    const refreshBalance = async () => {
      setIsRefreshing(true);
      try {
        await walletActions.refreshBalance(currentWallet.id, selectedChain);
      } catch (error) {
        console.error('Failed to refresh balance:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    void refreshBalance();
  }, [currentWallet?.id, selectedChain]);

  const handleCopyAddress = async () => {
    if (chainAddress?.address) {
      await clipboard.write({ text: chainAddress.address });
      await haptics.impact("light");
      setCopied(true);
      toast.show(t('home:wallet.addressCopied'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenChainSelector = () => {
    push("ChainSelectorSheetActivity", {});
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasWallet || !currentWallet) {
    return <NoWalletView />;
  }

  return (
    <div className="flex flex-col bg-muted/30">
      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-primary to-primary/80 p-5 pb-8">
        {/* Chain Selector */}
        <button
          data-testid="chain-selector"
          onClick={handleOpenChainSelector}
          className="mb-4 flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white"
          aria-label={t("common:a11y.chainSelector")}
        >
          <ChainIcon chain={selectedChain} size="sm" />
          <span>{selectedChainName}</span>
          <IconChevronDown className="size-4" />
        </button>

        {/* Wallet Name and Address */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">{currentWallet.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-sm text-white/70">
              {chainAddress?.address ? truncateAddress(chainAddress.address) : "---"}
            </span>
            <button
              onClick={handleCopyAddress}
              className="rounded p-1 hover:bg-white/10"
              aria-label={t("common:a11y.copyAddress")}
            >
              {copied ? (
                <IconCheck className="size-4 text-green-300" />
              ) : (
                <IconCopy className="size-4 text-white/70" />
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <GradientButton
            variant="blue"
            className="flex-1"
            size="sm"
            data-testid="send-button"
            onClick={() => push("SendActivity", {})}
          >
            <IconSend className="mr-1.5 size-4" />
            {t('home:wallet.send')}
          </GradientButton>
          <GradientButton
            variant="red"
            className="flex-1"
            data-testid="receive-button"
            size="sm"
            data-testid="receive-button"
            onClick={() => push("ReceiveActivity", {})}
          >
            <IconQrcode className="mr-1.5 size-4" />
            {t('home:wallet.receive')}
          </GradientButton>
        </div>
      </div>

      {/* Asset List */}
      <div className="-mt-4 flex-1 rounded-t-3xl bg-background p-5">
        <h2 className="mb-4 text-lg font-semibold">{t('home:wallet.assets')}</h2>
        <TokenList
          tokens={tokens.map((tk) => ({
            symbol: tk.symbol,
            name: tk.name,
            chain: selectedChain,
            balance: tk.balance,
            decimals: tk.decimals,
            fiatValue: tk.fiatValue ? String(tk.fiatValue) : undefined,
            change24h: tk.change24h,
            icon: tk.icon,
          }))}
          refreshing={isRefreshing}
          onTokenClick={(token) => {
            console.log("Token clicked:", token.symbol);
          }}
          emptyTitle={t('home:wallet.noAssets')}
          emptyDescription={t('home:wallet.noAssetsOnChain', { chain: selectedChainName })}
        />
      </div>

      {/* Scanner FAB */}
      <button
        onClick={() => push("ScannerActivity", {})}
        className="fixed right-6 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-60 flex size-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={t("common:a11y.scan")}
      >
        <IconLineScan className="size-6 text-primary-foreground" />
      </button>
    </div>
  );
}

function NoWalletView() {
  const { push } = useFlow();
  const { t } = useTranslation('home');

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="rounded-full bg-primary/10 p-6">
        <IconChevronRight className="size-12 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{t('welcome.title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('welcome.subtitle')}</p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <GradientButton
          variant="mint"
          className="w-full"
          onClick={() => push("WalletCreateActivity", {})}
        >
          {t('welcome.createWallet')}
        </GradientButton>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => push("OnboardingRecoverActivity", {})}
        >
          {t('welcome.importWallet')}
        </Button>
      </div>
    </div>
  );
}
