import type { Meta, StoryObj } from '@storybook/react'
import { TransactionList } from './transaction-list'
import type { TransactionInfo } from './transaction-item'
import { GradientButton } from '../common/gradient-button'

const meta: Meta<typeof TransactionList> = {
  title: 'Transaction/TransactionList',
  component: TransactionList,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TransactionList>

const now = Date.now()
const mockTransactions: TransactionInfo[] = [
  {
    id: '1',
    type: 'send',
    status: 'confirmed',
    amount: '100',
    symbol: 'USDT',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    timestamp: new Date(now - 3600000),
  },
  {
    id: '2',
    type: 'receive',
    status: 'confirmed',
    amount: '0.5',
    symbol: 'ETH',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    timestamp: new Date(now - 7200000),
  },
  {
    id: '3',
    type: 'send',
    status: 'pending',
    amount: '50',
    symbol: 'USDT',
    address: '0x9876543210fedcba9876543210fedcba98765432',
    timestamp: new Date(now - 1800000),
  },
  {
    id: '4',
    type: 'receive',
    status: 'confirmed',
    amount: '1000',
    symbol: 'TRX',
    address: 'TRX1234567890123456789012345678901234',
    timestamp: new Date(now - 86400000 - 3600000),
  },
  {
    id: '5',
    type: 'send',
    status: 'failed',
    amount: '200',
    symbol: 'USDT',
    address: '0xfedcba9876543210fedcba9876543210fedcba98',
    timestamp: new Date(now - 86400000 - 7200000),
  },
  {
    id: '6',
    type: 'stake',
    status: 'confirmed',
    amount: '5000',
    symbol: 'BFM',
    address: '质押合约',
    timestamp: new Date(now - 172800000),
  },
]

export const Default: Story = {
  args: {
    transactions: mockTransactions,
    onTransactionClick: (tx) => alert(`查看交易: ${tx.id}`),
  },
}

export const Loading: Story = {
  args: {
    transactions: [],
    loading: true,
  },
}

export const Empty: Story = {
  args: {
    transactions: [],
    emptyAction: <GradientButton size="sm">开始转账</GradientButton>,
  },
}

export const CustomEmpty: Story = {
  args: {
    transactions: [],
    emptyTitle: '没有找到交易',
    emptyDescription: '尝试调整筛选条件',
    emptyAction: (
      <button className="text-primary text-sm font-medium">
        清除筛选
      </button>
    ),
  },
}

export const SingleTransaction: Story = {
  args: {
    transactions: [mockTransactions[0]!],
    onTransactionClick: (tx) => alert(`查看交易: ${tx.id}`),
  },
}

export const ManyTransactions: Story = {
  args: {
    transactions: [
      ...mockTransactions,
      {
        id: '7',
        type: 'receive',
        status: 'confirmed',
        amount: '0.1',
        symbol: 'BTC',
        address: 'bc1q123456789',
        timestamp: new Date(now - 259200000),
      },
      {
        id: '8',
        type: 'swap',
        status: 'confirmed',
        amount: '500',
        symbol: 'USDT → ETH',
        address: 'DEX Router',
        timestamp: new Date(now - 345600000),
      },
    ],
    onTransactionClick: (tx) => console.log('Clicked:', tx),
  },
}
