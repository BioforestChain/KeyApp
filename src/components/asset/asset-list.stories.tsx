import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { AssetList } from './asset-list'
import type { AssetInfo } from '@/types/asset'

const mockAssets: AssetInfo[] = [
  {
    assetType: 'ETH',
    name: 'Ethereum',
    amount: '1500000000000000000',
    decimals: 18,
  },
  {
    assetType: 'USDT',
    name: 'Tether USD',
    amount: '100000000',
    decimals: 6,
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  {
    assetType: 'USDC',
    name: 'USD Coin',
    amount: '50000000',
    decimals: 6,
  },
  {
    assetType: 'BTC',
    name: 'Bitcoin',
    amount: '50000000',
    decimals: 8,
  },
]

const meta = {
  title: 'Asset/AssetList',
  component: AssetList,
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
    assets: mockAssets,
    onAssetClick: fn(),
  },
} satisfies Meta<typeof AssetList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: {
    assets: [],
  },
}

export const Loading: Story = {
  args: {
    assets: [],
    isLoading: true,
  },
}

export const SingleAsset: Story = {
  args: {
    assets: [mockAssets[0]!],
  },
}

export const ManyAssets: Story = {
  args: {
    assets: [
      ...mockAssets,
      {
        assetType: 'TRX',
        name: 'TRON',
        amount: '10000000000',
        decimals: 6,
      },
      {
        assetType: 'BFM',
        name: 'BioForest Meta',
        amount: '500000000000',
        decimals: 8,
      },
    ],
  },
}
