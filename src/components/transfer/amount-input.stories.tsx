import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AmountInput } from './amount-input';
import { Amount } from '@/types/amount';

const meta: Meta<typeof AmountInput> = {
  title: 'Transfer/AmountInput',
  component: AmountInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AmountInput>;

// Helper to create Amount objects for stories
const createAmount = (value: string, decimals: number, symbol: string) =>
  Amount.fromFormatted(value, decimals, symbol);

export const Default: Story = {
  args: {
    label: '转账金额',
    balance: createAmount('1234.56', 6, 'USDT'),
  },
};

export const WithValue: Story = {
  args: {
    label: '转账金额',
    value: createAmount('0.5', 18, 'ETH'),
    balance: createAmount('2.5', 18, 'ETH'),
    fiatValue: '900.00',
  },
};

export const WithError: Story = {
  args: {
    label: '转账金额',
    value: createAmount('5000', 6, 'USDT'),
    balance: createAmount('1000', 6, 'USDT'),
    max: createAmount('1000', 6, 'USDT'),
  },
};

export const CustomError: Story = {
  args: {
    label: '转账金额',
    value: createAmount('10', 6, 'USDT'),
    balance: createAmount('1000', 6, 'USDT'),
    error: '最小转账金额为 20 USDT',
  },
};

export const Disabled: Story = {
  args: {
    label: '转账金额',
    value: createAmount('100', 6, 'USDT'),
    balance: createAmount('1000', 6, 'USDT'),
    disabled: true,
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<Amount | null>(null);
    const balance = createAmount('1000', 6, 'USDT');
    const rate = 1; // USDT to USD
    const fiatValue = value ? (value.toNumber() * rate).toFixed(2) : undefined;

    return (
      <div className="space-y-4">
        <AmountInput
          label="转账金额"
          value={value}
          onChange={setValue}
          balance={balance}
          fiatValue={fiatValue ?? undefined}
        />
        <p className="text-muted-foreground text-sm">
          输入值: {value?.toFormatted() ?? '(空)'}
        </p>
        <p className="text-muted-foreground text-sm">
          原始值: {value?.toRawString() ?? '(空)'}
        </p>
      </div>
    );
  },
};

export const DifferentTokens: Story = {
  render: () => (
    <div className="space-y-6">
      <AmountInput
        label="发送"
        value={createAmount('0.5', 18, 'ETH')}
        balance={createAmount('2.5', 18, 'ETH')}
        fiatValue="900"
      />
      <AmountInput
        label="发送"
        value={createAmount('0.01', 8, 'BTC')}
        balance={createAmount('0.1', 8, 'BTC')}
        fiatValue="500"
      />
      <AmountInput
        label="发送"
        value={createAmount('1000', 6, 'TRX')}
        balance={createAmount('10000', 6, 'TRX')}
        fiatValue="80"
      />
    </div>
  ),
};

export const TransferForm: Story = {
  render: () => {
    const [amount, setAmount] = useState<Amount | null>(null);
    const balance = createAmount('1000', 6, 'USDT');
    const isValid = amount && amount.isPositive() && amount.lte(balance);
    const fiatValue = amount ? amount.toNumber().toFixed(2) : undefined;

    const handleQuickSelect = (val: string) => {
      setAmount(createAmount(val, 6, 'USDT'));
    };

    return (
      <div className="space-y-6 p-4">
        <h3 className="text-lg font-medium">转账 USDT</h3>
        <AmountInput
          label="转账金额"
          value={amount}
          onChange={setAmount}
          balance={balance}
          fiatValue={fiatValue ?? undefined}
        />
        <div className="flex gap-2 text-sm">
          {['100', '500', '1000'].map((val) => (
            <button
              key={val}
              onClick={() => handleQuickSelect(val)}
              className="bg-muted hover:bg-muted/80 rounded-lg px-4 py-2 transition-colors"
            >
              {val}
            </button>
          ))}
        </div>
        <button
          className="bg-primary w-full rounded-full py-3 font-medium text-white disabled:opacity-50"
          disabled={!isValid}
        >
          下一步
        </button>
      </div>
    );
  },
};
