import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TransferConfirmSheet } from './transfer-confirm-sheet';

const meta: Meta<typeof TransferConfirmSheet> = {
  title: 'Transfer/TransferConfirmSheet',
  component: TransferConfirmSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof TransferConfirmSheet>;

export const Default: Story = {
  args: {
    open: true,
    amount: '1.5',
    symbol: 'ETH',
    fiatValue: '3,000',
    toAddress: '0x1234567890abcdef1234567890abcdef12345678',
    feeAmount: 0.0021,
    feeSymbol: 'ETH',
    feeFiatValue: 4.2,
  },
};

export const HighFee: Story = {
  args: {
    open: true,
    amount: '0.5',
    symbol: 'ETH',
    fiatValue: '1,000',
    toAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    feeAmount: 0.05,
    feeSymbol: 'ETH',
    feeFiatValue: 100,
    highFeeThreshold: 50,
  },
};

export const FeeLoading: Story = {
  args: {
    open: true,
    amount: '100',
    symbol: 'USDT',
    fiatValue: '100',
    toAddress: 'TAbcdefghijklmnopqrstuvwxyz123456',
    feeAmount: 0,
    feeSymbol: 'TRX',
    feeLoading: true,
  },
};

export const Confirming: Story = {
  args: {
    open: true,
    amount: '0.1',
    symbol: 'BTC',
    fiatValue: '4,000',
    toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    feeAmount: 0.00001,
    feeSymbol: 'BTC',
    feeFiatValue: 0.4,
    isConfirming: true,
  },
};

export const TronTransfer: Story = {
  args: {
    open: true,
    amount: '10,000',
    symbol: 'TRX',
    fiatValue: '1,000',
    toAddress: 'TAbcdefghijklmnopqrstuvwxyz123456',
    feeAmount: 10,
    feeSymbol: 'TRX',
    feeFiatValue: 1,
  },
};

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const handleConfirm = () => {
      setConfirming(true);
      setTimeout(() => {
        setConfirming(false);
        setOpen(false);
      }, 2000);
    };

    return (
      <div className="p-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg bg-primary px-4 py-2 text-white"
        >
          Open Transfer Confirm
        </button>
        <TransferConfirmSheet
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={handleConfirm}
          amount="2.5"
          symbol="ETH"
          fiatValue="5,000"
          toAddress="0x1234567890abcdef1234567890abcdef12345678"
          feeAmount={0.003}
          feeSymbol="ETH"
          feeFiatValue={6}
          isConfirming={confirming}
        />
      </div>
    );
  },
};
