import type { Meta, StoryObj } from '@storybook/react'
import { PendingTxList } from './pending-tx-list'
import type { PendingTx } from '@/services/transaction'

const meta: Meta<typeof PendingTxList> = {
  title: 'Transaction/PendingTxList',
  component: PendingTxList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof PendingTxList>

const now = Date.now()

const mockPendingTxs: PendingTx[] = [
  {
    id: 'tx-1',
    walletId: 'wallet-1',
    chainId: 'bfmeta',
    fromAddress: 'bXXX1234567890',
    status: 'broadcasting',
    rawTx: { signature: 'sig-1' },
    meta: {
      type: 'transfer',
      displayAmount: '100.5',
      displaySymbol: 'BFM',
      displayToAddress: 'bYYY0987654321',
    },
    retryCount: 0,
    createdAt: now - 30000,
    updatedAt: now - 10000,
  },
  {
    id: 'tx-2',
    walletId: 'wallet-1',
    chainId: 'bfmeta',
    fromAddress: 'bXXX1234567890',
    status: 'broadcasted',
    txHash: '0xabc123def456...',
    rawTx: { signature: 'sig-2' },
    meta: {
      type: 'transfer',
      displayAmount: '50',
      displaySymbol: 'CPCC',
      displayToAddress: 'bZZZ1122334455',
    },
    retryCount: 0,
    createdAt: now - 120000,
    updatedAt: now - 60000,
  },
  {
    id: 'tx-3',
    walletId: 'wallet-1',
    chainId: 'bfmeta',
    fromAddress: 'bXXX1234567890',
    status: 'failed',
    rawTx: { signature: 'sig-3' },
    meta: {
      type: 'transfer',
      displayAmount: '200',
      displaySymbol: 'BFM',
      displayToAddress: 'bAAA9988776655',
    },
    errorCode: '001-11028',
    errorMessage: '资产余额不足',
    retryCount: 2,
    createdAt: now - 300000,
    updatedAt: now - 180000,
  },
]

export const Default: Story = {
  args: {
    transactions: mockPendingTxs,
    onRetry: (tx) => console.log('Retry:', tx.id),
    onDelete: (tx) => console.log('Delete:', tx.id),
  },
}

export const Broadcasting: Story = {
  args: {
    transactions: [mockPendingTxs[0]],
    onRetry: (tx) => console.log('Retry:', tx.id),
    onDelete: (tx) => console.log('Delete:', tx.id),
  },
}

export const Broadcasted: Story = {
  args: {
    transactions: [mockPendingTxs[1]],
    onRetry: (tx) => console.log('Retry:', tx.id),
    onDelete: (tx) => console.log('Delete:', tx.id),
  },
}

export const Failed: Story = {
  args: {
    transactions: [mockPendingTxs[2]],
    onRetry: (tx) => console.log('Retry:', tx.id),
    onDelete: (tx) => console.log('Delete:', tx.id),
  },
}

export const Empty: Story = {
  args: {
    transactions: [],
    onRetry: (tx) => console.log('Retry:', tx.id),
    onDelete: (tx) => console.log('Delete:', tx.id),
  },
}

export const MultipleStates: Story = {
  args: {
    transactions: [
      {
        ...mockPendingTxs[0],
        id: 'tx-broadcasting',
        status: 'broadcasting',
      },
      {
        ...mockPendingTxs[1],
        id: 'tx-broadcasted',
        status: 'broadcasted',
      },
      {
        ...mockPendingTxs[2],
        id: 'tx-failed-1',
        status: 'failed',
        errorMessage: '资产余额不足',
      },
      {
        ...mockPendingTxs[2],
        id: 'tx-failed-2',
        status: 'failed',
        errorMessage: '手续费不足',
        meta: {
          type: 'burn',
          displayAmount: '1000',
          displaySymbol: 'BFM',
        },
      },
    ],
    onRetry: (tx) => console.log('Retry:', tx.id),
    onDelete: (tx) => console.log('Delete:', tx.id),
  },
}
