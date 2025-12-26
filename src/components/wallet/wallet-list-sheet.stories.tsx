import type { Meta, StoryObj } from '@storybook/react'
import { WalletListSheet } from './wallet-list-sheet'
import type { Wallet } from '@/stores'
import { fn } from '@storybook/test'

const createMockWallet = (id: string, name: string, balance = 1000): Wallet => ({
  id,
  name,
  address: `0x${id.padEnd(40, '0')}`,
  chain: 'ethereum',
  chainAddresses: [
    {
      chain: 'ethereum',
      address: `0x${id.padEnd(40, '0')}`,
      tokens: [
        {
          id: 't1',
          symbol: 'USDT',
          name: 'Tether USD',
          balance: String(balance),
          fiatValue: balance,
          change24h: 0.01,
          decimals: 6,
          chain: 'ethereum',
        },
      ],
    },
  ],
  createdAt: Date.now(),
  tokens: [],
})

const mockWallets = [
  createMockWallet('wallet1', '我的钱包', 12345.67),
  createMockWallet('wallet2', '工作钱包', 5678.90),
  createMockWallet('wallet3', '储蓄钱包', 98765.43),
  createMockWallet('wallet4', '测试钱包', 0),
]

const meta: Meta<typeof WalletListSheet> = {
  title: 'Wallet/WalletListSheet',
  component: WalletListSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-background w-[360px] rounded-t-3xl shadow-xl">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof WalletListSheet>

export const Default: Story = {
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet1',
    onSelectWallet: fn(),
    onAddWallet: fn(),
  },
}

export const SingleWallet: Story = {
  args: {
    wallets: mockWallets.slice(0, 1),
    currentWalletId: 'wallet1',
    onSelectWallet: fn(),
    onAddWallet: fn(),
  },
}

export const NoWallets: Story = {
  args: {
    wallets: [],
    currentWalletId: null,
    onSelectWallet: fn(),
    onAddWallet: fn(),
  },
}

export const ManyWallets: Story = {
  args: {
    wallets: [
      ...mockWallets,
      createMockWallet('wallet5', '钱包五', 1111.11),
      createMockWallet('wallet6', '钱包六', 2222.22),
      createMockWallet('wallet7', '钱包七', 3333.33),
      createMockWallet('wallet8', '钱包八', 4444.44),
    ],
    currentWalletId: 'wallet1',
    onSelectWallet: fn(),
    onAddWallet: fn(),
  },
  decorators: [
    (Story) => (
      <div className="bg-background max-h-[500px] w-[360px] overflow-auto rounded-t-3xl shadow-xl">
        <Story />
      </div>
    ),
  ],
}

export const DifferentSelected: Story = {
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet3',
    onSelectWallet: fn(),
    onAddWallet: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '当前选中的是第三个钱包（储蓄钱包），会显示"当前"标记。',
      },
    },
  },
}

export const WithLongNames: Story = {
  args: {
    wallets: [
      createMockWallet('wallet1', '这是一个非常长的钱包名称用于测试溢出显示', 1000),
      createMockWallet('wallet2', '另一个超长的钱包名称测试', 2000),
      createMockWallet('wallet3', '普通名称', 3000),
    ],
    currentWalletId: 'wallet1',
    onSelectWallet: fn(),
    onAddWallet: fn(),
  },
}

export const HighBalances: Story = {
  args: {
    wallets: [
      createMockWallet('wallet1', 'Whale Wallet', 1234567.89),
      createMockWallet('wallet2', 'Rich Wallet', 987654.32),
      createMockWallet('wallet3', 'Modest Wallet', 12345.67),
    ],
    currentWalletId: 'wallet1',
    onSelectWallet: fn(),
    onAddWallet: fn(),
  },
}

export const ZeroBalances: Story = {
  args: {
    wallets: [
      createMockWallet('wallet1', '空钱包1', 0),
      createMockWallet('wallet2', '空钱包2', 0),
      createMockWallet('wallet3', '空钱包3', 0),
    ],
    currentWalletId: 'wallet1',
    onSelectWallet: fn(),
    onAddWallet: fn(),
  },
}

export const Interactive: Story = {
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet1',
    onSelectWallet: fn(),
    onAddWallet: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '点击钱包选择，点击调色板图标更改主题色，拖拽手柄可以排序（功能待实现）。',
      },
    },
  },
}

export const DarkMode: Story = {
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet1',
    onSelectWallet: fn(),
    onAddWallet: fn(),
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background w-[360px] rounded-t-3xl shadow-xl">
        <Story />
      </div>
    ),
  ],
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
}
