import type { Meta, StoryObj } from '@storybook/react';
import { TokenIcon } from './token-icon';

const meta: Meta<typeof TokenIcon> = {
  title: 'Token/TokenIcon',
  component: TokenIcon,
  tags: ['autodocs'],
  argTypes: {
    symbol: {
      control: 'text',
    },
    imageUrl: {
      control: 'text',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TokenIcon>;

export const Default: Story = {
  args: {
    symbol: 'BTC',
    size: 'md',
  },
};

export const WithImage: Story = {
  args: {
    symbol: 'ETH',
    imageUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    size: 'md',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <TokenIcon symbol="BTC" size="sm" />
        <span className="text-xs text-muted">sm</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <TokenIcon symbol="BTC" size="md" />
        <span className="text-xs text-muted">md</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <TokenIcon symbol="BTC" size="lg" />
        <span className="text-xs text-muted">lg</span>
      </div>
    </div>
  ),
};

export const FallbackVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'DOGE'].map((symbol) => (
        <div key={symbol} className="flex flex-col items-center gap-1">
          <TokenIcon symbol={symbol} size="lg" />
          <span className="text-xs text-muted">{symbol}</span>
        </div>
      ))}
    </div>
  ),
};

export const ImageLoadFailure: Story = {
  args: {
    symbol: 'FAKE',
    imageUrl: 'https://broken.invalid/fake.png',
    size: 'lg',
  },
  name: 'Image Load Failure (shows fallback)',
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-lg bg-card p-3">
        <TokenIcon
          symbol="BTC"
          imageUrl="https://cryptologos.cc/logos/bitcoin-btc-logo.png"
          size="lg"
        />
        <div className="flex-1">
          <p className="font-medium">Bitcoin</p>
          <p className="text-sm text-muted">BTC</p>
        </div>
        <span className="font-semibold">0.5 BTC</span>
      </div>
      <div className="flex items-center gap-3 rounded-lg bg-card p-3">
        <TokenIcon symbol="USDT" size="lg" />
        <div className="flex-1">
          <p className="font-medium">Tether USD</p>
          <p className="text-sm text-muted">USDT</p>
        </div>
        <span className="font-semibold">1,000 USDT</span>
      </div>
    </div>
  ),
};
