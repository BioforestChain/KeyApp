import type { Meta, StoryObj } from '@storybook/react';
import { TokenIcon, TokenBadge, TokenIconProvider } from './token-icon';

const meta: Meta<typeof TokenIcon> = {
  title: 'Wallet/TokenIcon',
  component: TokenIcon,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TokenIconProvider>
        <Story />
      </TokenIconProvider>
    ),
  ],
  argTypes: {
    symbol: {
      control: 'select',
      options: ['ETH', 'BTC', 'BFM', 'USDT', 'USDC', 'TRX', 'BNB', 'CCC', 'PMC'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TokenIcon>;

const allTokens = ['ETH', 'BTC', 'BFM', 'BFT', 'BTGM', 'CCC', 'PMC', 'ETHM', 'TRX', 'BNB', 'USDT', 'USDC', 'DAI', 'USDM'];

export const Default: Story = {
  args: {
    symbol: 'ETH',
    size: 'md',
  },
};

export const AllTokens: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {allTokens.map((symbol) => (
        <div key={symbol} className="flex flex-col items-center gap-1">
          <TokenIcon symbol={symbol} size="lg" />
          <span className="text-muted-foreground text-xs">{symbol}</span>
        </div>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-1">
          <TokenIcon symbol="BFM" size={size} />
          <span className="text-muted-foreground text-xs">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const Badges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {allTokens.slice(0, 8).map((symbol) => (
        <TokenBadge key={symbol} symbol={symbol} />
      ))}
    </div>
  ),
};

export const FallbackOnly: Story = {
  render: () => (
    <TokenIconProvider getIconUrl={() => undefined}>
      <div className="flex flex-wrap gap-4">
        {allTokens.map((symbol) => (
          <div key={symbol} className="flex flex-col items-center gap-1">
            <TokenIcon symbol={symbol} size="lg" />
            <span className="text-muted-foreground text-xs">{symbol}</span>
          </div>
        ))}
      </div>
    </TokenIconProvider>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <TokenIcon symbol="ETH" size="lg" />
        <div className="flex-1">
          <p className="font-medium">Ethereum</p>
          <p className="text-muted-foreground text-sm">ETH</p>
        </div>
        <span className="font-semibold">2.5 ETH</span>
      </div>
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <TokenIcon symbol="USDT" size="lg" />
        <div className="flex-1">
          <p className="font-medium">Tether USD</p>
          <p className="text-muted-foreground text-sm">USDT</p>
        </div>
        <span className="font-semibold">1,000.00 USDT</span>
      </div>
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <TokenIcon symbol="BFM" size="lg" />
        <div className="flex-1">
          <p className="font-medium">BFMeta</p>
          <p className="text-muted-foreground text-sm">BFM</p>
        </div>
        <span className="font-semibold">50,000 BFM</span>
      </div>
    </div>
  ),
};
