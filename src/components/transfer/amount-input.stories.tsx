import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AmountInput } from './amount-input';

const meta: Meta<typeof AmountInput> = {
  title: 'Transfer/AmountInput',
  component: AmountInput,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AmountInput>;

export const Default: Story = {
  args: {
    label: '转账金额',
    symbol: 'USDT',
    balance: '1,234.56',
  },
};

export const WithValue: Story = {
  args: {
    label: '转账金额',
    symbol: 'ETH',
    value: '0.5',
    balance: '2.5',
    fiatValue: '900.00',
  },
};

export const WithError: Story = {
  args: {
    label: '转账金额',
    symbol: 'USDT',
    value: '5000',
    balance: '1000',
    max: '1000',
  },
};

export const CustomError: Story = {
  args: {
    label: '转账金额',
    symbol: 'USDT',
    value: '10',
    error: '最小转账金额为 20 USDT',
  },
};

export const Disabled: Story = {
  args: {
    label: '转账金额',
    symbol: 'USDT',
    value: '100',
    disabled: true,
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const balance = '1000';
    const rate = 1; // USDT to USD
    const fiatValue = value ? (parseFloat(value) * rate).toFixed(2) : undefined;

    const inputProps: Record<string, unknown> = {
      label: '转账金额',
      symbol: 'USDT',
      value,
      onChange: setValue,
      balance,
      max: balance,
    };
    if (fiatValue !== undefined) {
      inputProps.fiatValue = fiatValue;
    }

    return (
      <div className="space-y-4">
        <AmountInput {...inputProps} />
        <p className="text-muted-foreground text-sm">输入值: {value || '(空)'}</p>
      </div>
    );
  },
};

export const DifferentTokens: Story = {
  render: () => (
    <div className="space-y-6">
      <AmountInput label="发送" symbol="ETH" value="0.5" balance="2.5" fiatValue="900" />
      <AmountInput label="发送" symbol="BTC" value="0.01" balance="0.1" fiatValue="500" />
      <AmountInput label="发送" symbol="TRX" value="1000" balance="10000" fiatValue="80" />
    </div>
  ),
};

export const TransferForm: Story = {
  render: () => {
    const [amount, setAmount] = useState('');
    const balance = '1000';
    const numAmount = parseFloat(amount) || 0;
    const isValid = numAmount > 0 && numAmount <= parseFloat(balance);
    const fiatValue = amount ? (parseFloat(amount) || 0).toFixed(2) : undefined;

    const formInputProps: Record<string, unknown> = {
      label: '转账金额',
      symbol: 'USDT',
      value: amount,
      onChange: setAmount,
      balance,
      max: balance,
    };
    if (fiatValue !== undefined) {
      formInputProps.fiatValue = fiatValue;
    }

    return (
      <div className="space-y-6 p-4">
        <h3 className="text-lg font-medium">转账 USDT</h3>
        <AmountInput {...formInputProps} />
        <div className="flex gap-2 text-sm">
          {['100', '500', '1000'].map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val)}
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
