import type { Meta, StoryObj } from '@storybook/react'
import { WalletCardCarousel } from './wallet-card-carousel'
import type { Wallet } from '@/stores'
import { fn } from '@storybook/test'

const createMockWallet = (id: string, name: string): Wallet => ({
  id,
  name,
  address: `0x${id.padEnd(40, '0')}`,
  chain: 'ethereum',
  chainAddresses: [
    {
      chain: 'ethereum',
      address: `0x${id.padEnd(40, '0')}`,
      tokens: [],
    },
    {
      chain: 'tron',
      address: `T${id.padEnd(33, 'A')}`,
      tokens: [],
    },
  ],
  createdAt: Date.now(),
  tokens: [],
})

const mockWallets = [
  createMockWallet('wallet1', '我的钱包'),
  createMockWallet('wallet2', '工作钱包'),
  createMockWallet('wallet3', '储蓄钱包'),
  createMockWallet('wallet4', '测试钱包'),
]

const chainNames: Record<string, string> = {
  ethereum: 'Ethereum',
  tron: 'Tron',
  bitcoin: 'Bitcoin',
  binance: 'BSC',
  bfmeta: 'BFMeta',
}

const meta: Meta<typeof WalletCardCarousel> = {
  title: 'Wallet/WalletCardCarousel',
  component: WalletCardCarousel,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'gradient',
      values: [
        { name: 'gradient', value: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' },
        { name: 'dark', value: '#1a1a2e' },
        { name: 'light', value: '#f5f5f5' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[360px] py-8">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof WalletCardCarousel>

export const Default: Story = {
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet1',
    selectedChain: 'ethereum',
    chainNames,
    onWalletChange: fn(),
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
    onOpenWalletList: fn(),
  },
}

export const SingleWallet: Story = {
  args: {
    wallets: mockWallets.slice(0, 1),
    currentWalletId: 'wallet1',
    selectedChain: 'ethereum',
    chainNames,
    onWalletChange: fn(),
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
    onOpenWalletList: fn(),
  },
}

export const TwoWallets: Story = {
  args: {
    wallets: mockWallets.slice(0, 2),
    currentWalletId: 'wallet1',
    selectedChain: 'ethereum',
    chainNames,
    onWalletChange: fn(),
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
    onOpenWalletList: fn(),
  },
}

export const TronChain: Story = {
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet1',
    selectedChain: 'tron',
    chainNames,
    onWalletChange: fn(),
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
    onOpenWalletList: fn(),
  },
}

export const ManyWallets: Story = {
  args: {
    wallets: [
      ...mockWallets,
      createMockWallet('wallet5', '钱包五'),
      createMockWallet('wallet6', '钱包六'),
      createMockWallet('wallet7', '钱包七'),
    ],
    currentWalletId: 'wallet1',
    selectedChain: 'ethereum',
    chainNames,
    onWalletChange: fn(),
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
    onOpenWalletList: fn(),
  },
}

export const StartFromMiddle: Story = {
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet3',
    selectedChain: 'ethereum',
    chainNames,
    onWalletChange: fn(),
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
    onOpenWalletList: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '当前选中的是第三个钱包，轮播会自动定位到该卡片。',
      },
    },
  },
}

export const Interactive: Story = {
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet1',
    selectedChain: 'ethereum',
    chainNames,
  },
  parameters: {
    docs: {
      description: {
        story: '左右滑动切换钱包卡片。点击底部的"X个钱包"按钮可以展开钱包列表。',
      },
    },
  },
}
