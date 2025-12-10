import type { Meta, StoryObj } from '@storybook/react';
import { FeeDisplay } from './fee-display';

const meta: Meta<typeof FeeDisplay> = {
  title: 'Transaction/FeeDisplay',
  component: FeeDisplay,
  tags: ['autodocs'],
  argTypes: {
    amount: { control: 'text' },
    symbol: { control: 'text' },
    fiatValue: { control: 'number' },
    fiatSymbol: { control: 'text' },
    isLoading: { control: 'boolean' },
    highFeeThreshold: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof FeeDisplay>;

export const Default: Story = {
  args: {
    amount: 0.0021,
    symbol: 'ETH',
  },
};

export const WithFiat: Story = {
  args: {
    amount: 0.0021,
    symbol: 'ETH',
    fiatValue: 5.25,
  },
};

export const HighFeeWarning: Story = {
  args: {
    amount: 0.05,
    symbol: 'ETH',
    fiatValue: 125.5,
    highFeeThreshold: 50,
  },
};

export const Loading: Story = {
  args: {
    amount: 0,
    symbol: 'ETH',
    isLoading: true,
  },
};

export const SmallAmount: Story = {
  args: {
    amount: 0.0000001,
    symbol: 'ETH',
    fiatValue: 0.0002,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Normal Fee</p>
        <FeeDisplay amount={0.0021} symbol="ETH" fiatValue={5.25} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">High Fee Warning</p>
        <FeeDisplay amount={0.05} symbol="ETH" fiatValue={125.5} highFeeThreshold={50} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Loading</p>
        <FeeDisplay amount={0} symbol="ETH" isLoading />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">No Fiat</p>
        <FeeDisplay amount={0.001} symbol="TRX" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Very Small</p>
        <FeeDisplay amount={0.0000001} symbol="BTC" fiatValue={0.001} />
      </div>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="w-80 rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 font-semibold">Transaction Details</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">0.5 ETH</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">To</span>
          <span className="font-mono text-sm">0x1234...5678</span>
        </div>
        <div className="border-t border-border pt-3">
          <div className="flex items-start justify-between">
            <span className="text-muted-foreground">Network Fee</span>
            <FeeDisplay amount={0.0021} symbol="ETH" fiatValue={5.25} />
          </div>
        </div>
      </div>
    </div>
  ),
};
