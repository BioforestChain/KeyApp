import type { Meta, StoryObj } from '@storybook/react';
import { BalanceDisplay } from './balance-display';

const meta: Meta<typeof BalanceDisplay> = {
  title: 'Token/BalanceDisplay',
  component: BalanceDisplay,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    hidden: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BalanceDisplay>;

export const Default: Story = {
  args: {
    value: '1234.5678',
    symbol: 'USDT',
    fiatValue: '1234.56',
  },
};

export const LargeNumber: Story = {
  args: {
    value: '1234567.89',
    symbol: 'TRX',
    fiatValue: '98765.43',
  },
};

export const SmallNumber: Story = {
  args: {
    value: '0.00001234',
    symbol: 'BTC',
    fiatValue: '0.62',
  },
};

export const Hidden: Story = {
  args: {
    value: '1234.5678',
    symbol: 'USDT',
    fiatValue: '1234.56',
    hidden: true,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground mb-1 text-xs">Small</p>
        <BalanceDisplay value="1234.56" symbol="USDT" fiatValue="1234.56" size="sm" />
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-xs">Medium</p>
        <BalanceDisplay value="1234.56" symbol="USDT" fiatValue="1234.56" size="md" />
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-xs">Large</p>
        <BalanceDisplay value="1234.56" symbol="USDT" fiatValue="1234.56" size="lg" />
      </div>
    </div>
  ),
};

export const WithoutFiat: Story = {
  args: {
    value: '100',
    symbol: 'BFM',
  },
};

export const DifferentCurrencies: Story = {
  render: () => (
    <div className="space-y-4">
      <BalanceDisplay value="2.5" symbol="ETH" fiatValue="4500" fiatSymbol="$" />
      <BalanceDisplay value="10000" symbol="TRX" fiatValue="800" fiatSymbol="¥" />
      <BalanceDisplay value="0.05" symbol="BTC" fiatValue="2500" fiatSymbol="€" />
    </div>
  ),
};
