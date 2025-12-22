import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { AssetList } from './asset-list'
import type { AssetInfo } from '@/types/asset'
import { Amount } from '@/types/amount'

const mockAssets: AssetInfo[] = [
  {
    assetType: 'ETH',
    name: 'Ethereum',
    amount: Amount.fromRaw('1500000000000000000', 18, 'ETH'),
    decimals: 18,
  },
  {
    assetType: 'USDT',
    name: 'Tether USD',
    amount: Amount.fromRaw('100000000', 6, 'USDT'),
    decimals: 6,
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  {
    assetType: 'USDC',
    name: 'USD Coin',
    amount: Amount.fromRaw('50000000', 6, 'USDC'),
    decimals: 6,
  },
  {
    assetType: 'BTC',
    name: 'Bitcoin',
    amount: Amount.fromRaw('50000000', 8, 'BTC'),
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
        amount: Amount.fromRaw('10000000000', 6, 'TRX'),
        decimals: 6,
      },
      {
        assetType: 'BFM',
        name: 'BioForest Meta',
        amount: Amount.fromRaw('500000000000', 8, 'BFM'),
        decimals: 8,
      },
    ],
  },
}
