import type { Meta, StoryObj } from '@storybook/react';
import { ChainIcon, ChainBadge, type ChainType } from './chain-icon';

const meta: Meta<typeof ChainIcon> = {
  title: 'Wallet/ChainIcon',
  component: ChainIcon,
  tags: ['autodocs'],
  argTypes: {
    chain: {
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

export const Default: Story = {
  args: {
    chain: 'ethereum',
    size: 'md',
  },
};

export const AllChains: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {allChains.map((chain) => (
        <div key={chain} className="flex flex-col items-center gap-1">
          <ChainIcon chain={chain} size="lg" />
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
        <ChainIcon chain="ethereum" size="sm" />
        <span className="text-muted-foreground text-xs">sm</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ChainIcon chain="ethereum" size="md" />
        <span className="text-muted-foreground text-xs">md</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ChainIcon chain="ethereum" size="lg" />
        <span className="text-muted-foreground text-xs">lg</span>
      </div>
    </div>
  ),
};

export const Badges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {allChains.map((chain) => (
        <ChainBadge key={chain} chain={chain} />
      ))}
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <ChainIcon chain="ethereum" size="lg" />
        <div className="flex-1">
          <p className="font-medium">Ethereum</p>
          <p className="text-muted-foreground text-sm">0x1234...5678</p>
        </div>
        <span className="font-semibold">2.5 ETH</span>
      </div>
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <ChainIcon chain="tron" size="lg" />
        <div className="flex-1">
          <p className="font-medium">Tron</p>
          <p className="text-muted-foreground text-sm">TAbcd...xyz</p>
        </div>
        <span className="font-semibold">10,000 TRX</span>
      </div>
    </div>
  ),
};
