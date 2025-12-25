import type { Meta, StoryObj } from '@storybook/react';
import { TokenIcon, TokenBadge, TokenIconProvider } from './token-icon';

const mockGetTokenIconBases = (chainId: string) => {
  const bases: Record<string, string[]> = {
    bfmeta: ['/icons/bfmeta/tokens', 'https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/bfm'],
    ccchain: ['/icons/ccchain/tokens', 'https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/ccc'],
    pmchain: ['/icons/pmchain/tokens', 'https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/pmc'],
    bfchainv2: ['/icons/bfchainv2/tokens', 'https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/bftv2'],
    btgmeta: ['/icons/btgmeta/tokens', 'https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/btgm'],
    ethmeta: ['/icons/ethmeta/tokens', 'https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/ethm'],
    ethereum: ['/icons/ethereum/tokens', 'https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/eth'],
    binance: ['/icons/binance/tokens', 'https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/bsc'],
    tron: ['/icons/tron/tokens', 'https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/tron'],
    bitcoin: ['/icons/bitcoin/tokens', 'https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/btcm'],
  };
  return bases[chainId] ?? [];
};

const meta: Meta<typeof TokenIcon> = {
  title: 'Wallet/TokenIcon',
  component: TokenIcon,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TokenIconProvider getTokenIconBases={mockGetTokenIconBases}>
        <Story />
      </TokenIconProvider>
    ),
  ],
  argTypes: {
    symbol: {
      control: 'select',
      options: ['ETH', 'BTC', 'BFM', 'USDT', 'USDC', 'TRX', 'BNB', 'CCC', 'PMC'],
    },
    chainId: {
      control: 'select',
      options: ['ethereum', 'bitcoin', 'bfmeta', 'tron', 'binance', 'ccchain', 'pmchain'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TokenIcon>;

const tokensByChain = [
  { symbol: 'BFM', chainId: 'bfmeta' },
  { symbol: 'CCC', chainId: 'ccchain' },
  { symbol: 'PMC', chainId: 'pmchain' },
  { symbol: 'BFT', chainId: 'bfchainv2' },
  { symbol: 'BTGM', chainId: 'btgmeta' },
  { symbol: 'ETHM', chainId: 'ethmeta' },
  { symbol: 'ETH', chainId: 'ethereum' },
  { symbol: 'BNB', chainId: 'binance' },
  { symbol: 'TRX', chainId: 'tron' },
  { symbol: 'BTC', chainId: 'bitcoin' },
  { symbol: 'USDT', chainId: 'ethereum' },
  { symbol: 'USDM', chainId: 'bfmeta' },
];

export const Default: Story = {
  args: {
    symbol: 'BFM',
    chainId: 'bfmeta',
    size: 'md',
  },
};

export const WithImageUrl: Story = {
  name: 'With imageUrl (priority over chainId)',
  args: {
    symbol: 'BTC',
    imageUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    size: 'lg',
  },
};

export const AllTokens: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {tokensByChain.map(({ symbol, chainId }) => (
        <div key={`${chainId}-${symbol}`} className="flex flex-col items-center gap-1">
          <TokenIcon symbol={symbol} chainId={chainId} size="lg" />
          <span className="text-muted-foreground text-xs">{symbol}</span>
        </div>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-1">
          <TokenIcon symbol="BFM" chainId="bfmeta" size={size} />
          <span className="text-muted-foreground text-xs">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const Badges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {tokensByChain.slice(0, 8).map(({ symbol, chainId }) => (
        <TokenBadge key={`${chainId}-${symbol}`} symbol={symbol} chainId={chainId} />
      ))}
    </div>
  ),
};

export const FallbackOnly: Story = {
  name: 'Letter Fallback (No Icons)',
  render: () => (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        No chainId, no imageUrl - shows first letter:
      </p>
      <div className="flex flex-wrap gap-4">
        {['ABC', 'XYZ', 'TEST', 'NEW'].map((symbol) => (
          <div key={symbol} className="flex flex-col items-center gap-1">
            <TokenIcon symbol={symbol} size="lg" />
            <span className="text-muted-foreground text-xs">{symbol}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <TokenIcon symbol="BFM" chainId="bfmeta" size="lg" />
        <div className="flex-1">
          <p className="font-medium">BFMeta</p>
          <p className="text-muted-foreground text-sm">BFM</p>
        </div>
        <span className="font-semibold">50,000 BFM</span>
      </div>
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <TokenIcon symbol="ETH" chainId="ethereum" size="lg" />
        <div className="flex-1">
          <p className="font-medium">Ethereum</p>
          <p className="text-muted-foreground text-sm">ETH</p>
        </div>
        <span className="font-semibold">2.5 ETH</span>
      </div>
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <TokenIcon symbol="USDT" imageUrl="https://cryptologos.cc/logos/tether-usdt-logo.png" size="lg" />
        <div className="flex-1">
          <p className="font-medium">Tether USD</p>
          <p className="text-muted-foreground text-sm">USDT</p>
        </div>
        <span className="font-semibold">1,000.00 USDT</span>
      </div>
    </div>
  ),
};
