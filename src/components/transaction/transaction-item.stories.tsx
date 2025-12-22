import type { Meta, StoryObj } from '@storybook/react'
import { Amount } from '@/types/amount'
import { TransactionItem, type TransactionInfo } from './transaction-item'

const meta: Meta<typeof TransactionItem> = {
  title: 'Transaction/TransactionItem',
  component: TransactionItem,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TransactionItem>

const mockSend: TransactionInfo = {
  id: '1',
  type: 'send',
  status: 'confirmed',
  amount: Amount.fromFormatted('100', 6, 'USDT'),
  symbol: 'USDT',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  timestamp: new Date(Date.now() - 3600000),
}

const mockReceive: TransactionInfo = {
  id: '2',
  type: 'receive',
  status: 'confirmed',
  amount: Amount.fromFormatted('0.5', 18, 'ETH'),
  symbol: 'ETH',
  address: 'TRX9876543210fedcba9876543210fedcba',
  timestamp: new Date(Date.now() - 86400000),
}

const mockPending: TransactionInfo = {
  id: '3',
  type: 'send',
  status: 'pending',
  amount: Amount.fromFormatted('50', 6, 'USDT'),
  symbol: 'USDT',
  address: '0xabcdef1234567890abcdef1234567890abcdef12',
  timestamp: new Date(),
}

const mockFailed: TransactionInfo = {
  id: '4',
  type: 'send',
  status: 'failed',
  amount: Amount.fromFormatted('200', 6, 'TRX'),
  symbol: 'TRX',
  address: 'TRX1111222233334444555566667777888899',
  timestamp: new Date(Date.now() - 7200000),
}

export const Send: Story = {
  args: {
    transaction: mockSend,
    onClick: () => alert('View transaction'),
  },
}

export const Receive: Story = {
  args: {
    transaction: mockReceive,
    onClick: () => alert('View transaction'),
  },
}

export const Pending: Story = {
  args: {
    transaction: mockPending,
    onClick: () => alert('View transaction'),
  },
}

export const Failed: Story = {
  args: {
    transaction: mockFailed,
    onClick: () => alert('View transaction'),
  },
}

export const Swap: Story = {
  args: {
    transaction: {
      id: '5',
      type: 'swap',
      status: 'confirmed',
      amount: Amount.fromFormatted('100', 6, 'USDT'),
      symbol: 'USDT → ETH',
      address: '0xdex1234567890',
      timestamp: new Date(Date.now() - 1800000),
    },
    onClick: () => alert('View swap'),
  },
}

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-1">
      <TransactionItem transaction={mockSend} onClick={() => {}} />
      <TransactionItem transaction={mockReceive} onClick={() => {}} />
      <TransactionItem transaction={mockPending} onClick={() => {}} />
      <TransactionItem transaction={mockFailed} onClick={() => {}} />
      <TransactionItem
        transaction={{
          id: '5',
          type: 'stake',
          status: 'confirmed',
          amount: Amount.fromFormatted('1000', 8, 'BFM'),
          symbol: 'BFM',
          address: '质押合约',
          timestamp: new Date(Date.now() - 172800000),
        }}
        onClick={() => {}}
      />
    </div>
  ),
}
