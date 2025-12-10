import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { SendResult } from './send-result'

const meta = {
  title: 'Transfer/SendResult',
  component: SendResult,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[380px] bg-background">
        <Story />
      </div>
    ),
  ],
  args: {
    onDone: fn(),
    onViewExplorer: fn(),
  },
} satisfies Meta<typeof SendResult>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: {
    status: 'success',
    amount: '100',
    symbol: 'USDT',
    toAddress: '0x1234567890abcdef1234567890abcdef12345678',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  },
}

export const SuccessWithoutHash: Story = {
  args: {
    status: 'success',
    amount: '1.5',
    symbol: 'ETH',
    toAddress: 'TJYmgH3xvqQbP1LqVvdrEaBzCHmvtjmJfS',
  },
}

export const Failed: Story = {
  args: {
    status: 'failed',
    amount: '500',
    symbol: 'USDT',
    toAddress: '0x1234567890abcdef1234567890abcdef12345678',
    errorMessage: '余额不足',
    onRetry: fn(),
  },
}

export const FailedNetworkError: Story = {
  args: {
    status: 'failed',
    amount: '0.1',
    symbol: 'BTC',
    toAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
    errorMessage: '网络连接失败，请检查网络后重试',
    onRetry: fn(),
  },
}

export const Pending: Story = {
  args: {
    status: 'pending',
    amount: '1000',
    symbol: 'TRX',
    toAddress: 'TJYmgH3xvqQbP1LqVvdrEaBzCHmvtjmJfS',
  },
}

export const LargeAmount: Story = {
  args: {
    status: 'success',
    amount: '1,234,567.89',
    symbol: 'USDT',
    toAddress: '0x1234567890abcdef1234567890abcdef12345678',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  },
}
