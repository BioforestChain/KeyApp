import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'

import { WalletList, type WalletListItem } from './wallet-list'
import { WALLET_THEME_COLORS } from '@/hooks/useWalletTheme'

// 不同链的图标路径
const CHAIN_ICONS = {
  bfmeta: '/icons/bfmeta/chain.svg',
  ethereum: '/icons/ethereum/chain.svg',
  bitcoin: '/icons/bitcoin/chain.svg',
  tron: '/icons/tron/chain.svg',
  binance: '/icons/binance/chain.svg',
}

const mockWallets: WalletListItem[] = [
  {
    id: 'wallet-1',
    name: '主钱包 (BFMeta)',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f00000',
    themeHue: 323,
    chainIconUrl: CHAIN_ICONS.bfmeta,
  },
  {
    id: 'wallet-2',
    name: '以太坊账户',
    address: '0xA1B2C3D4E5F6789012345678901234567890ABCD',
    themeHue: 250,
    chainIconUrl: CHAIN_ICONS.ethereum,
  },
  {
    id: 'wallet-3',
    name: '比特币储蓄',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    themeHue: 40,
    chainIconUrl: CHAIN_ICONS.bitcoin,
  },
]

const meta: Meta<typeof WalletList> = {
  title: 'Wallet/WalletList',
  component: WalletList,
  tags: ['autodocs'],
  args: {
    onSelect: fn(),
    onAddWallet: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md rounded-xl bg-background p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof WalletList>

export const Default: Story = {
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet-1',
  },
}

export const NoCurrentWallet: Story = {
  args: {
    wallets: mockWallets,
    currentWalletId: null,
  },
}

export const SingleWallet: Story = {
  args: {
    wallets: [mockWallets[0]!],
    currentWalletId: 'wallet-1',
  },
}

export const EmptyList: Story = {
  args: {
    wallets: [],
    currentWalletId: null,
  },
}

export const EmptyListWithoutAddButton: Story = {
  args: {
    wallets: [],
    currentWalletId: null,
    showAddButton: false,
  },
}

export const WithoutAddButton: Story = {
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet-2',
    showAddButton: false,
  },
}

export const AllThemeColors: Story = {
  args: {
    wallets: WALLET_THEME_COLORS.map((color, idx) => ({
      id: `wallet-${idx}`,
      name: color.name,
      address: `0x${idx.toString().padStart(40, '0')}`,
      themeHue: color.hue,
    })),
    currentWalletId: 'wallet-0',
  },
}

export const LongWalletNames: Story = {
  args: {
    wallets: [
      {
        id: 'wallet-1',
        name: '这是一个非常长的钱包名称用于测试截断显示',
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f00000',
        themeHue: 323,
      },
      {
        id: 'wallet-2',
        name: 'Very Long Wallet Name For Testing Truncation',
        address: '0xA1B2C3D4E5F6789012345678901234567890ABCD',
        themeHue: 250,
      },
    ],
    currentWalletId: 'wallet-1',
  },
}

export const ManyWallets: Story = {
  args: {
    wallets: Array.from({ length: 10 }, (_, idx) => ({
      id: `wallet-${idx}`,
      name: `钱包 ${idx + 1}`,
      address: `0x${idx.toString().padStart(40, '0')}`,
      themeHue: (idx * 36) % 360,
    })),
    currentWalletId: 'wallet-3',
  },
  decorators: [
    (Story) => (
      <div className="max-h-[400px] w-full max-w-md overflow-y-auto rounded-xl bg-background p-4">
        <Story />
      </div>
    ),
  ],
}
