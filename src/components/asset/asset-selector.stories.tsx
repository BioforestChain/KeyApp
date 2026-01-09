import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { AssetSelector } from './asset-selector'
import type { TokenInfo } from '@/components/token/token-item'

const mockAssets: TokenInfo[] = [
  {
    symbol: 'BFM',
    name: 'BFMeta',
    balance: '10000.12345678',
    decimals: 8,
    chain: 'bfmeta',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    balance: '500.00',
    decimals: 6,
    chain: 'bfmeta',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    balance: '2.50000000',
    decimals: 18,
    chain: 'ethereum',
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: '0.05',
    decimals: 8,
    chain: 'bitcoin',
  },
  {
    symbol: 'TRX',
    name: 'Tron',
    balance: '1500.00',
    decimals: 6,
    chain: 'tron',
  },
]

const meta: Meta<typeof AssetSelector> = {
  title: 'Asset/AssetSelector',
  component: AssetSelector,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AssetSelector>

/** 交互式示例 */
function InteractiveDemo() {
  const [selected, setSelected] = useState<TokenInfo | null>(null)

  return (
    <div className="space-y-4">
      <AssetSelector
        selectedAsset={selected}
        assets={mockAssets}
        onSelect={setSelected}
      />
      {selected && (
        <div className="text-sm text-muted-foreground">
          已选择: {selected.symbol} ({selected.name})
        </div>
      )}
    </div>
  )
}

export const Default: Story = {
  render: () => <InteractiveDemo />,
}

/** 预选资产 */
export const WithSelectedAsset: Story = {
  args: {
    selectedAsset: mockAssets[0],
    assets: mockAssets,
    onSelect: () => {},
  },
}

/** 禁用状态 */
export const Disabled: Story = {
  args: {
    selectedAsset: mockAssets[1],
    assets: mockAssets,
    onSelect: () => {},
    disabled: true,
  },
}

/** 排除资产 (如销毁场景不显示主资产) */
export const ExcludeAssets: Story = {
  render: () => {
    const [selected, setSelected] = useState<TokenInfo | null>(null)
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">排除了 BFM (主资产)</p>
        <AssetSelector
          selectedAsset={selected}
          assets={mockAssets}
          onSelect={setSelected}
          excludeAssets={['BFM']}
        />
      </div>
    )
  },
}

/** 不显示余额 */
export const WithoutBalance: Story = {
  args: {
    selectedAsset: mockAssets[0],
    assets: mockAssets,
    onSelect: () => {},
    showBalance: false,
  },
}

/** 自定义占位符 */
export const CustomPlaceholder: Story = {
  args: {
    selectedAsset: null,
    assets: mockAssets,
    onSelect: () => {},
    placeholder: '点击选择要销毁的资产',
  },
}

/** 空资产列表 */
export const EmptyAssets: Story = {
  args: {
    selectedAsset: null,
    assets: [],
    onSelect: () => {},
  },
}

/** 所有资产被排除 */
export const AllExcluded: Story = {
  args: {
    selectedAsset: null,
    assets: mockAssets,
    onSelect: () => {},
    excludeAssets: ['BFM', 'USDT', 'ETH', 'BTC', 'TRX'],
  },
}
