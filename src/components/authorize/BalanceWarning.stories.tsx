import type { Meta, StoryObj } from '@storybook/react'
import { BalanceWarning } from './BalanceWarning'

const meta: Meta<typeof BalanceWarning> = {
  title: 'Authorize/BalanceWarning',
  component: BalanceWarning,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof BalanceWarning>

export const Default: Story = {
  args: {
    balance: '1.0',
    required: '1.502',
    symbol: 'ETH',
  },
}

export const BitcoinInsufficient: Story = {
  args: {
    balance: '0.05',
    required: '0.1',
    symbol: 'BTC',
  },
}

export const TokenInsufficient: Story = {
  args: {
    balance: '100',
    required: '500',
    symbol: 'USDT',
  },
}

export const SmallDifference: Story = {
  args: {
    balance: '1.499',
    required: '1.502',
    symbol: 'ETH',
  },
}

export const LargeDifference: Story = {
  args: {
    balance: '0.001',
    required: '10.0',
    symbol: 'ETH',
  },
}
