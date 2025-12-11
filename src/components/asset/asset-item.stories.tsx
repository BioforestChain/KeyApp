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

const mockAssetWithPrice: AssetInfo = {
  ...mockAsset,
  priceUsd: 2500,
  priceChange24h: 2.3,
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

export const WithPrice: Story = {
  args: {
    asset: mockAssetWithPrice,
  },
}

export const WithPricePositive: Story = {
  args: {
    asset: {
      ...mockAsset,
      priceUsd: 2500,
      priceChange24h: 5.2,
    },
  },
}

export const WithPriceNegative: Story = {
  args: {
    asset: {
      ...mockAsset,
      priceUsd: 2500,
      priceChange24h: -3.5,
    },
  },
}

export const WithIcon: Story = {
  args: {
    asset: {
      ...mockAssetWithPrice,
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
      priceUsd: 1,
      priceChange24h: 0.01,
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
      priceUsd: 45000,
      priceChange24h: -1.5,
    },
  },
}

export const NoClick: Story = {
  args: {
    showChevron: false,
  },
}

export const SmallAmount: Story = {
  args: {
    asset: {
      ...mockAsset,
      amount: '1000000000000000', // 0.001 ETH
      priceUsd: 2500,
      priceChange24h: 2.3,
    },
  },
}

export const NoPriceData: Story = {
  args: {
    asset: mockAsset, // No price fields
  },
}

export const CurrencyCNY: Story = {
  args: {
    asset: mockAssetWithPrice,
    currency: 'CNY',
  },
}

export const CurrencyEUR: Story = {
  args: {
    asset: mockAssetWithPrice,
    currency: 'EUR',
  },
}
