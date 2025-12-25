import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFlow } from '@/stackflow';
import { TokenList } from '@/components/token/token-list';
import { GradientButton } from '@/components/common/gradient-button';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { ChainIcon } from '@/components/wallet/chain-icon';
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

  useEffect(() => {
    if (!isInitialized) {
      walletActions.initialize();
    }
  }, [isInitialized]);

  const handleCopyAddress = async () => {
    if (chainAddress?.address) {
      await clipboard.write({ text: chainAddress.address });
      await haptics.impact('light');
      setCopied(true);
      toast.show(t('wallet.addressCopied'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenChainSelector = () => {
    push('ChainSelectorJob', {});
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
          onClick={handleOpenChainSelector}
          className="mb-4 flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white"
          aria-label={t('common:a11y.chainSelector')}
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
              aria-label={t('common:a11y.copyAddress')}
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
              {t('wallet.send')}
            </GradientButton>
          </div>
          <div className="flex-1">
            <GradientButton variant="red" className="w-full" size="sm" onClick={() => navigate({ to: '/receive' })}>
              <QrCode className="mr-1.5 size-4" />
              {t('wallet.receive')}
            </GradientButton>
          </div>
        </div>
      </div>

      {/* 资产列表 */}
      <div className="bg-background -mt-4 flex-1 rounded-t-3xl p-5">
        <h2 className="mb-4 text-lg font-semibold">{t('wallet.assets')}</h2>
        <TokenList
          tokens={tokens.map((token) => ({
            symbol: token.symbol,
            name: token.name,
            chain: selectedChain,
            balance: token.balance,
            fiatValue: token.fiatValue ? String(token.fiatValue) : undefined,
            change24h: token.change24h,
            icon: token.icon,
          }))}
          onTokenClick={(token) => {
            // TODO: Implement token detail page route once available
            console.log('Token clicked:', token.symbol);
          }}
          emptyTitle={t('wallet.noAssets')}
          emptyDescription={t('wallet.noAssetsOnChain', { chain: selectedChainName })}
        />
      </div>

      {/* Scanner FAB */}
      <button
        onClick={() => navigate({ to: '/scanner' })}
        className="bg-primary fixed right-6 bottom-[calc(var(--safe-area-inset-bottom)+1.5rem)] z-60 flex size-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label={t('common:a11y.scan')}
      >
        <ScanLine className="text-primary-foreground size-6" />
      </button>
    </div>
  );
}

function NoWalletView() {
  const { navigate } = useNavigation();
  const { t } = useTranslation(['home', 'common']);
  
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="bg-primary/10 rounded-full p-6">
        <Plus className="text-primary size-12" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{t('welcome.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('welcome.subtitle')}</p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <GradientButton variant="mint" className="w-full" onClick={() => navigate({ to: '/wallet/create' })}>
          {t('welcome.createWallet')}
        </GradientButton>
        <Button variant="outline" className="w-full" onClick={() => navigate({ to: '/onboarding/recover' })}>
          {t('welcome.importWallet')}
        </Button>
      </div>
    </div>
  );
}
