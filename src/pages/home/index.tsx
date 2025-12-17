import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@/stackflow';
import { TokenList } from '@/components/token/token-list';
import { GradientButton } from '@/components/common/gradient-button';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ChainIcon } from '@/components/wallet/chain-icon';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { useClipboard, useToast, useHaptics } from '@/services';
import {
  IconPlus as Plus,
  IconSend as Send,
  IconQrcode as QrCode,
  IconCopy as Copy,
  IconChevronDown as ChevronDown,
  IconCheck as Check,
  IconLineScan as ScanLine,
} from '@tabler/icons-react';

/** 截断地址显示 */
function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (address.length <= startChars + endChars + 3) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
import {
  useCurrentWallet,
  useSelectedChain,
  useCurrentChainAddress,
  useCurrentChainTokens,
  useAvailableChains,
  useHasWallet,
  useWalletInitialized,
  walletActions,
  type ChainType,
} from '@/stores';

const CHAIN_NAMES: Record<ChainType, string> = {
  // 外部链
  ethereum: 'Ethereum',
  bitcoin: 'Bitcoin',
  tron: 'Tron',
  binance: 'BSC',
  // BioForest 链
  bfmeta: 'BFMeta',
  ccchain: 'CCChain',
  pmchain: 'PMChain',
  bfchainv2: 'BFChain V2',
  btgmeta: 'BTGMeta',
  biwmeta: 'BIWMeta',
  ethmeta: 'ETHMeta',
  malibu: 'Malibu',
};

export function HomePage() {
  const { navigate } = useNavigation();
  const clipboard = useClipboard();
  const toast = useToast();
  const haptics = useHaptics();
  const { t } = useTranslation();

  const isInitialized = useWalletInitialized();
  const hasWallet = useHasWallet();
  const currentWallet = useCurrentWallet();
  const selectedChain = useSelectedChain();
  const selectedChainName = CHAIN_NAMES[selectedChain] ?? selectedChain;
  const chainAddress = useCurrentChainAddress();
  const tokens = useCurrentChainTokens();
  const availableChains = useAvailableChains();

  const [chainSheetOpen, setChainSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      walletActions.initialize();
    }
  }, [isInitialized]);

  const handleCopyAddress = async () => {
    if (chainAddress?.address) {
      await clipboard.write(chainAddress.address);
      await haptics.impact('light');
      setCopied(true);
      toast.show('地址已复制');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSelectChain = (chain: ChainType) => {
    walletActions.setSelectedChain(chain);
    setChainSheetOpen(false);
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
    <div className="bg-muted/30 flex min-h-screen flex-col">
      {/* 钱包卡片 - mpay 风格 */}
      <div className="from-primary to-primary/80 bg-gradient-to-br p-5 pb-8">
        {/* 链选择器 */}
        <button
          data-testid="chain-selector"
          onClick={() => setChainSheetOpen(true)}
          className="mb-4 flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white"
          aria-label={t('a11y.chainSelector')}
        >
          <ChainIcon chain={selectedChain} size="sm" />
          <span>{selectedChainName}</span>
          <ChevronDown className="size-4" />
        </button>

        {/* 钱包名和地址 */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white">{currentWallet.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-sm text-white/70">
              {chainAddress?.address ? truncateAddress(chainAddress.address) : '---'}
            </span>
            <button
              onClick={handleCopyAddress}
              className="rounded p-1 hover:bg-white/10"
              aria-label={t('a11y.copyAddress')}
            >
              {copied ? <Check className="size-4 text-green-300" /> : <Copy className="size-4 text-white/70" />}
            </button>
          </div>
        </div>

        {/* 操作按钮 - mpay 三按钮布局 */}
        <div className="flex gap-3">
          <div className="flex-1">
            <GradientButton variant="blue" className="w-full" size="sm" onClick={() => navigate({ to: '/send' })}>
              <Send className="mr-1.5 size-4" />
              转账
            </GradientButton>
          </div>
          <div className="flex-1">
            <GradientButton variant="red" className="w-full" size="sm" onClick={() => navigate({ to: '/receive' })}>
              <QrCode className="mr-1.5 size-4" />
              收款
            </GradientButton>
          </div>
        </div>
      </div>

      {/* 资产列表 */}
      <div className="bg-background -mt-4 flex-1 rounded-t-3xl p-5">
        <h2 className="mb-4 text-lg font-semibold">资产</h2>
        <TokenList
          tokens={tokens.map((t) => ({
            symbol: t.symbol,
            name: t.name,
            chain: selectedChain,
            balance: t.balance,
            fiatValue: t.fiatValue ? String(t.fiatValue) : undefined,
            change24h: t.change24h,
            icon: t.icon,
          }))}
          onTokenClick={(token) => {
            // TODO: Implement token detail page route once available
            console.log('Token clicked:', token.symbol);
          }}
          emptyTitle="暂无资产"
          emptyDescription={`${selectedChainName} 链上暂无代币`}
        />
      </div>

      {/* Scanner FAB */}
      <button
        onClick={() => navigate({ to: '/scanner' })}
        className="bg-primary fixed right-6 bottom-[calc(var(--safe-area-inset-bottom)+1.5rem)] z-60 flex size-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={t('a11y.scan')}
      >
        <ScanLine className="text-primary-foreground size-6" />
      </button>

      {/* 链选择底部弹窗 */}
      <BottomSheet open={chainSheetOpen} onClose={() => setChainSheetOpen(false)} title="选择网络">
        <div data-testid="chain-sheet" className="space-y-2 p-4">
          {availableChains.map((chain) => {
            const chainAddr = currentWallet.chainAddresses.find((ca) => ca.chain === chain);
            return (
              <button
                key={chain}
                onClick={() => handleSelectChain(chain)}
                className={`flex w-full items-center gap-3 rounded-xl p-4 transition-colors ${
                  chain === selectedChain ? 'bg-primary/10 ring-primary ring-1' : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                <ChainIcon chain={chain} size="md" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{CHAIN_NAMES[chain] ?? chain}</div>
                  <div className="text-muted-foreground font-mono text-xs">
                    {chainAddr?.address ? truncateAddress(chainAddr.address, 10, 8) : '---'}
                  </div>
                </div>
                {chain === selectedChain && <Check className="text-primary size-5" />}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}

function NoWalletView() {
  const { navigate } = useNavigation();
  
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="bg-primary/10 rounded-full p-6">
        <Plus className="text-primary size-12" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">欢迎使用 BFM Pay</h1>
        <p className="text-muted-foreground mt-2">创建或导入钱包开始使用</p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <GradientButton variant="mint" className="w-full" onClick={() => navigate({ to: '/wallet/create' })}>
          创建新钱包
        </GradientButton>
        <Button variant="outline" className="w-full" onClick={() => navigate({ to: '/wallet/import' })}>
          导入已有钱包
        </Button>
      </div>
    </div>
  );
}
