import type { Meta, StoryObj } from '@storybook/react';
import { ChainIcon, ChainBadge, type ChainType } from './chain-icon';

const meta: Meta<typeof ChainIcon> = {
  title: 'Wallet/ChainIcon',
  component: ChainIcon,
  tags: ['autodocs'],
  argTypes: {
    chainId: {
      control: 'select',
      options: ['ethereum', 'tron', 'bsc', 'bitcoin', 'bfmeta', 'btgmeta', 'ethmeta', 'ccc'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChainIcon>;

const allChains: ChainType[] = ['ethereum', 'tron', 'bsc', 'bitcoin', 'bfmeta', 'btgmeta', 'ethmeta', 'ccc'];

const chainIcons: Record<string, string> = {
  ethereum: '/icons/chains/ethereum.svg',
  tron: '/icons/chains/tron.svg',
  bitcoin: '/icons/chains/bitcoin.svg',
  binance: '/icons/chains/binance.svg',
  bfmeta: '/icons/chains/bfmeta.svg',
  btgmeta: '/icons/chains/btgmeta.svg',
  ethmeta: '/icons/chains/ethmeta.svg',
  ccchain: '/icons/chains/ccchain.svg',
  pmchain: '/icons/chains/pmchain.svg',
  malibu: '/icons/chains/malibu.svg',
  biwmeta: '/icons/chains/biwmeta.svg',
  bfchainv2: '/icons/chains/bfchainv2.svg',
};

export const Default: Story = {
  args: {
    chainId: 'ethereum',
    size: 'md',
  },
};

export const WithSvgIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {allChains.map((chain) => (
        <div key={chain} className="flex flex-col items-center gap-1">
          <ChainIcon chainId={chain} iconUrl={chainIcons[chain]} size="lg" />
          <span className="text-muted-foreground text-xs">{chain}</span>
        </div>
      ))}
    </div>
  ),
};

export const FallbackOnly: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {allChains.map((chain) => (
        <div key={chain} className="flex flex-col items-center gap-1">
          <ChainIcon chainId={chain} size="lg" />
          <span className="text-muted-foreground text-xs">{chain}</span>
        </div>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <ChainIcon chainId="ethereum" iconUrl={chainIcons.ethereum} size="sm" />
        <span className="text-muted-foreground text-xs">sm</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ChainIcon chainId="ethereum" iconUrl={chainIcons.ethereum} size="md" />
        <span className="text-muted-foreground text-xs">md</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ChainIcon chainId="ethereum" iconUrl={chainIcons.ethereum} size="lg" />
        <span className="text-muted-foreground text-xs">lg</span>
      </div>
    </div>
  ),
};

export const Badges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {allChains.map((chain) => (
        <ChainBadge key={chain} chainId={chain} iconUrl={chainIcons[chain]} />
      ))}
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <ChainIcon chainId="ethereum" iconUrl={chainIcons.ethereum} size="lg" />
        <div className="flex-1">
          <p className="font-medium">Ethereum</p>
          <p className="text-muted-foreground text-sm">0x1234...5678</p>
        </div>
        <span className="font-semibold">2.5 ETH</span>
      </div>
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <ChainIcon chainId="tron" iconUrl={chainIcons.tron} size="lg" />
        <div className="flex-1">
          <p className="font-medium">Tron</p>
          <p className="text-muted-foreground text-sm">TAbcd...xyz</p>
        </div>
        <span className="font-semibold">10,000 TRX</span>
      </div>
    </div>
  ),
};
