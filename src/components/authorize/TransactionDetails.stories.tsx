import type { Meta, StoryObj } from '@storybook/react'
import { TransactionDetails } from './TransactionDetails'

const meta: Meta<typeof TransactionDetails> = {
  title: 'Authorize/TransactionDetails',
  component: TransactionDetails,
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
type Story = StoryObj<typeof TransactionDetails>

export const Default: Story = {
  args: {
    from: '0x1234567890abcdef1234567890abcdef12345678',
    to: '0xabcdef1234567890abcdef1234567890abcdef12',
    amount: '1.5 ETH',
    fee: '0.002 ETH',
    chainId: 'ethereum',
  },
}

export const WithoutFee: Story = {
  args: {
    from: '0x1234567890abcdef1234567890abcdef12345678',
    to: '0xabcdef1234567890abcdef1234567890abcdef12',
    amount: '100 USDT',
    chainId: 'ethereum',
  },
}

export const BitcoinTransaction: Story = {
  args: {
    from: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    to: 'bc1q9h5yjzpqzqzyqqyrpqgz7zp7yyc7',
    amount: '0.05 BTC',
    fee: '0.0001 BTC',
    chainId: 'bitcoin',
  },
}

export const TronTransaction: Story = {
  args: {
    from: 'TJRyWwFs9wTFGZg3JbrVriFbNfCug5tDeC',
    to: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    amount: '500 TRX',
    fee: '10 TRX',
    chainId: 'tron',
  },
}

export const WithoutChain: Story = {
  args: {
    from: '0x1234567890abcdef1234567890abcdef12345678',
    to: '0xabcdef1234567890abcdef1234567890abcdef12',
    amount: '1000 TOKEN',
    fee: '0.1 TOKEN',
  },
}

export const ShortAddresses: Story = {
  args: {
    from: '0x123456',
    to: '0xabcdef',
    amount: '10 ETH',
    fee: '0.001 ETH',
    chainId: 'ethereum',
  },
}
