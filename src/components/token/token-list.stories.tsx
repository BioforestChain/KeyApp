import type { Meta, StoryObj } from '@storybook/react'
import { TokenList } from './token-list'
import type { TokenInfo } from './token-item'
import { GradientButton } from '../common/gradient-button'

const meta: Meta<typeof TokenList> = {
  title: 'Token/TokenList',
  component: TokenList,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TokenList>

const mockTokens: TokenInfo[] = [
  {
    symbol: 'USDT',
    name: 'Tether USD',
    balance: '1,234.56',
    fiatValue: '1,234.56',
    chain: 'ethereum',
    change24h: 0.05,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '2.5',
    fiatValue: '4,500.00',
    chain: 'ethereum',
    change24h: -2.3,
  },
  {
    symbol: 'TRX',
    name: 'Tron',
    balance: '10,000',
    fiatValue: '800.00',
    chain: 'tron',
    change24h: 5.2,
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: '0.05',
    fiatValue: '2,500.00',
    chain: 'bitcoin',
    change24h: 1.8,
  },
  {
    symbol: 'BFM',
    name: 'BFMeta',
    balance: '5,000',
    fiatValue: '250.00',
    chain: 'bfmeta',
    change24h: 0,
  },
]

export const Default: Story = {
  args: {
    tokens: mockTokens,
    onTokenClick: (token) => alert(`Clicked ${token.symbol}`),
  },
}

export const WithChange: Story = {
  args: {
    tokens: mockTokens,
    showChange: true,
    onTokenClick: (token) => alert(`Clicked ${token.symbol}`),
  },
}

export const Loading: Story = {
  args: {
    tokens: [],
    loading: true,
  },
}

export const Empty: Story = {
  args: {
    tokens: [],
    emptyAction: <GradientButton size="sm">转入资产</GradientButton>,
  },
}

export const CustomEmpty: Story = {
  args: {
    tokens: [],
    emptyTitle: '没有找到代币',
    emptyDescription: '尝试添加新的代币到您的钱包',
    emptyAction: (
      <button className="text-primary text-sm font-medium">
        添加代币
      </button>
    ),
  },
}

export const SingleToken: Story = {
  args: {
    tokens: [mockTokens[0]!],
    onTokenClick: (token) => alert(`Clicked ${token.symbol}`),
  },
}

export const ManyTokens: Story = {
  args: {
    tokens: [
      ...mockTokens,
      { symbol: 'BNB', name: 'Binance Coin', balance: '10', fiatValue: '3,000', chain: 'bsc' as const, change24h: 3.1 },
      { symbol: 'USDC', name: 'USD Coin', balance: '500', fiatValue: '500', chain: 'ethereum' as const, change24h: 0 },
    ],
    showChange: true,
    onTokenClick: (token) => alert(`Clicked ${token.symbol}`),
  },
}
