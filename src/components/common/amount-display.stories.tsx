import type { Meta, StoryObj } from '@storybook/react';
import { AmountDisplay, AmountWithFiat } from './amount-display';

const meta: Meta<typeof AmountDisplay> = {
  title: 'Common/AmountDisplay',
  component: AmountDisplay,
  tags: ['autodocs'],
  argTypes: {
    sign: { control: 'select', options: ['auto', 'always', 'never'] },
    color: { control: 'select', options: ['auto', 'default', 'positive', 'negative'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    weight: { control: 'select', options: ['normal', 'medium', 'semibold', 'bold'] },
  },
};

export default meta;
type Story = StoryObj<typeof AmountDisplay>;

export const Default: Story = {
  args: {
    value: 1234.5678,
    symbol: 'USDT',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div>
        <AmountDisplay value={1234.56} symbol="USDT" size="xs" />
      </div>
      <div>
        <AmountDisplay value={1234.56} symbol="USDT" size="sm" />
      </div>
      <div>
        <AmountDisplay value={1234.56} symbol="USDT" size="md" />
      </div>
      <div>
        <AmountDisplay value={1234.56} symbol="USDT" size="lg" />
      </div>
      <div>
        <AmountDisplay value={1234.56} symbol="USDT" size="xl" />
      </div>
    </div>
  ),
};

export const WithSign: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4">
        <AmountDisplay value={100} sign="always" color="auto" />
        <AmountDisplay value={-50} sign="always" color="auto" />
      </div>
      <p className="text-muted-foreground text-sm">sign="always" + color="auto"</p>
    </div>
  ),
};

export const Compact: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div>
        <AmountDisplay value={1234} compact /> <span className="text-muted-foreground text-sm">(1,234)</span>
      </div>
      <div>
        <AmountDisplay value={12345} compact /> <span className="text-muted-foreground text-sm">(12,345)</span>
      </div>
      <div>
        <AmountDisplay value={1234567} compact /> <span className="text-muted-foreground text-sm">(1,234,567)</span>
      </div>
      <div>
        <AmountDisplay value={1234567890} compact />{' '}
        <span className="text-muted-foreground text-sm">(1,234,567,890)</span>
      </div>
    </div>
  ),
};

export const Hidden: Story = {
  args: {
    value: 1234.56,
    symbol: 'USDT',
    hidden: true,
  },
};

export const MonoFont: Story = {
  args: {
    value: 1234567.89,
    mono: true,
    weight: 'semibold',
  },
};

export const SmallNumbers: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div>
        <AmountDisplay value={0.1} /> <span className="text-muted-foreground text-sm">(0.1)</span>
      </div>
      <div>
        <AmountDisplay value={0.01} /> <span className="text-muted-foreground text-sm">(0.01)</span>
      </div>
      <div>
        <AmountDisplay value={0.001} /> <span className="text-muted-foreground text-sm">(0.001)</span>
      </div>
      <div>
        <AmountDisplay value={0.0001} /> <span className="text-muted-foreground text-sm">(0.0001)</span>
      </div>
      <div>
        <AmountDisplay value={0.00001} /> <span className="text-muted-foreground text-sm">(0.00001)</span>
      </div>
    </div>
  ),
};

// AmountWithFiat stories
export const WithFiat: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-muted-foreground mb-2 text-sm">Vertical (default)</p>
        <AmountWithFiat value={2.5} symbol="ETH" fiatValue={4500} weight="semibold" size="lg" />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-sm">Horizontal</p>
        <AmountWithFiat value={100} symbol="USDT" fiatValue={100} layout="horizontal" />
      </div>
    </div>
  ),
};

export const PriceChange: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">BTC:</span>
        <AmountDisplay value={45000} symbol="$" weight="semibold" />
        <AmountDisplay value={5.2} sign="always" color="auto" size="sm" />
        <span className="text-green-500 text-sm">%</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">ETH:</span>
        <AmountDisplay value={1800} symbol="$" weight="semibold" />
        <AmountDisplay value={-2.3} sign="always" color="auto" size="sm" />
        <span className="text-destructive text-sm">%</span>
      </div>
    </div>
  ),
};

export const TokenList: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {[
        { symbol: 'USDT', balance: 1234.56, fiat: 1234.56 },
        { symbol: 'ETH', balance: 2.5, fiat: 4500 },
        { symbol: 'BTC', balance: 0.05, fiat: 2250 },
      ].map((token) => (
        <div key={token.symbol} className="flex items-center justify-between">
          <span className="font-medium">{token.symbol}</span>
          <AmountWithFiat value={token.balance} fiatValue={token.fiat} weight="semibold" className="text-right" />
        </div>
      ))}
    </div>
  ),
};
