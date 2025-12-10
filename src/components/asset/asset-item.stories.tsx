import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { AssetItem } from './asset-item'
import type { AssetInfo } from '@/types/asset'

const mockAsset: AssetInfo = {
  assetType: 'ETH',
  name: 'Ethereum',
  amount: '1500000000000000000', // 1.5 ETH
  decimals: 18,
}

const meta = {
  title: 'Asset/AssetItem',
  component: AssetItem,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
  args: {
    asset: mockAsset,
    onClick: fn(),
  },
} satisfies Meta<typeof AssetItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithIcon: Story = {
  args: {
    asset: {
      ...mockAsset,
      logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    },
  },
}

export const USDT: Story = {
  args: {
    asset: {
      assetType: 'USDT',
      name: 'Tether USD',
      amount: '100000000', // 100 USDT
      decimals: 6,
      contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
  },
}

export const Bitcoin: Story = {
  args: {
    asset: {
      assetType: 'BTC',
      name: 'Bitcoin',
      amount: '50000000', // 0.5 BTC
      decimals: 8,
    },
  },
}

export const NoClick: Story = {
  args: {
    onClick: undefined,
    showChevron: false,
  },
}

export const SmallAmount: Story = {
  args: {
    asset: {
      ...mockAsset,
      amount: '1000000000000000', // 0.001 ETH
    },
  },
}
