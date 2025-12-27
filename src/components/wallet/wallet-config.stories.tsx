import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { useEffect } from 'react'
import { WalletConfig } from './wallet-config'
import { walletStore, type Wallet } from '@/stores'

const createMockWallet = (id: string, name: string, themeHue: number): Wallet => ({
  id,
  name,
  address: `0x${id.padEnd(40, '0')}`,
  chain: 'ethereum',
  chainAddresses: [
    { chain: 'ethereum', address: `0x${id.padEnd(40, '0')}`, tokens: [] },
    { chain: 'tron', address: `T${id.padEnd(33, 'A')}`, tokens: [] },
  ],
  createdAt: Date.now(),
  themeHue,
  tokens: [],
})

const mockWallets = [
  createMockWallet('mock-wallet-1', '我的钱包', 323),
  createMockWallet('mock-wallet-2', '工作钱包', 200),
  createMockWallet('mock-wallet-3', '储蓄钱包', 120),
]

function StoreMockDecorator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    walletStore.setState((prev) => ({
      ...prev,
      wallets: mockWallets,
      currentWalletId: 'mock-wallet-1',
      chainPreferences: {},
    }))
  }, [])
  return <>{children}</>
}

const meta: Meta<typeof WalletConfig> = {
  title: 'Wallet/WalletConfig',
  component: WalletConfig,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: ['edit-only', 'default', 'edit'],
      description: '组件模式',
    },
    walletId: {
      control: 'text',
      description: '钱包 ID',
    },
  },
  decorators: [
    (Story) => (
      <StoreMockDecorator>
        <div className="w-[400px] max-w-full p-4">
          <Story />
        </div>
      </StoreMockDecorator>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof WalletConfig>

export const EditOnly: Story = {
  name: 'edit-only 模式（创建流程）',
  args: {
    mode: 'edit-only',
    walletId: 'mock-wallet-1',
    onEditOnlyComplete: fn(),
  },
  parameters: {
    docs: {
      description: {
        story: '用于创建/恢复钱包的最后一步，只有确认按钮',
      },
    },
  },
}

export const Default: Story = {
  name: 'default 模式（钱包详情）',
  args: {
    mode: 'default',
    walletId: 'mock-wallet-1',
  },
  parameters: {
    docs: {
      description: {
        story: '钱包详情页，显示功能按钮列表',
      },
    },
  },
}

export const Edit: Story = {
  name: 'edit 模式（编辑中）',
  args: {
    mode: 'edit',
    walletId: 'mock-wallet-1',
  },
  parameters: {
    docs: {
      description: {
        story: '从 default 切换到编辑模式，有保存/取消按钮',
      },
    },
  },
}

export const WalletNotFound: Story = {
  name: '钱包未找到',
  args: {
    mode: 'default',
    walletId: 'non-existent-wallet',
  },
  parameters: {
    docs: {
      description: {
        story: '当钱包 ID 无效时显示未找到提示',
      },
    },
  },
}

export const MobileView: Story = {
  name: '移动端视图',
  args: {
    mode: 'edit-only',
    walletId: 'mock-wallet-1',
    onEditOnlyComplete: fn(),
  },
  decorators: [
    (Story) => (
      <div className="w-[320px] p-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: '移动端宽度下的显示效果',
      },
    },
  },
}
