import type { Meta, StoryObj } from '@storybook/react';
import { TransactionStatus, TransactionStatusIcon, type TransactionStatusType } from './transaction-status';

const meta: Meta<typeof TransactionStatus> = {
  title: 'Transaction/TransactionStatus',
  component: TransactionStatus,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['success', 'failed', 'pending', 'cancelled'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showLabel: { control: 'boolean' },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof TransactionStatus>;

const allStatuses: TransactionStatusType[] = ['success', 'failed', 'pending', 'cancelled'];

export const Default: Story = {
  args: {
    status: 'success',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {allStatuses.map((status) => (
        <TransactionStatus key={status} status={status} />
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-8 text-sm text-muted-foreground">{size}</span>
          {allStatuses.map((status) => (
            <TransactionStatus key={status} status={status} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex gap-4">
      {allStatuses.map((status) => (
        <div key={status} className="flex flex-col items-center gap-1">
          <TransactionStatus status={status} showLabel={false} />
          <span className="text-xs text-muted-foreground">{status}</span>
        </div>
      ))}
    </div>
  ),
};

export const StatusIcons: Story = {
  render: () => (
    <div className="flex gap-4">
      {allStatuses.map((status) => (
        <div key={status} className="flex flex-col items-center gap-1">
          <TransactionStatusIcon status={status} size="lg" />
          <span className="text-xs text-muted-foreground">{status}</span>
        </div>
      ))}
    </div>
  ),
};

export const CustomLabels: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <TransactionStatus status="success" label="Confirmed" />
      <TransactionStatus status="pending" label="Processing" />
      <TransactionStatus status="failed" label="Rejected" />
      <TransactionStatus status="cancelled" label="Reverted" />
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <div className="w-80 space-y-2">
      {[
        { hash: '0x1234...abcd', amount: '+0.5 ETH', status: 'success' as const },
        { hash: '0x5678...efgh', amount: '-100 USDT', status: 'pending' as const },
        { hash: '0x9abc...ijkl', amount: '-0.1 ETH', status: 'failed' as const },
        { hash: '0xdef0...mnop', amount: '-50 USDT', status: 'cancelled' as const },
      ].map((tx) => (
        <div
          key={tx.hash}
          className="flex items-center justify-between rounded-lg border border-border p-3"
        >
          <div>
            <p className="font-mono text-sm">{tx.hash}</p>
            <p className="text-sm text-muted-foreground">{tx.amount}</p>
          </div>
          <TransactionStatus status={tx.status} size="sm" />
        </div>
      ))}
    </div>
  ),
};
