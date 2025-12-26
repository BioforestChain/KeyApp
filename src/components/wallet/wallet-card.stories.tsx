import type { Meta, StoryObj } from '@storybook/react'
import { WalletCard } from './wallet-card'
import type { Wallet } from '@/stores'
import { fn } from '@storybook/test'

const createMockWallet = (overrides: Partial<Wallet> = {}): Wallet => ({
  id: 'wallet-1',
  name: '我的钱包',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  chain: 'ethereum',
  chainAddresses: [
    {
      chain: 'ethereum',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      tokens: [],
    },
  ],
  createdAt: Date.now(),
  tokens: [],
  ...overrides,
})

const meta: Meta<typeof WalletCard> = {
  title: 'Wallet/WalletCard3D',
  component: WalletCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a2e' },
        { name: 'light', value: '#f5f5f5' },
      ],
    },
  },
  argTypes: {
    themeHue: {
      control: { type: 'range', min: 0, max: 360, step: 1 },
      description: 'Theme color hue (oklch)',
    },
    chain: {
      control: 'select',
      options: ['ethereum', 'tron', 'bitcoin', 'binance', 'bfmeta', 'ccchain'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[320px] p-8">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof WalletCard>

export const Default: Story = {
  args: {
    wallet: createMockWallet(),
    chain: 'ethereum',
    chainName: 'Ethereum',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    themeHue: 323,
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
  },
}

export const PurpleTheme: Story = {
  args: {
    ...Default.args,
    themeHue: 323,
  },
}

export const BlueTheme: Story = {
  args: {
    ...Default.args,
    themeHue: 240,
  },
}

export const CyanTheme: Story = {
  args: {
    ...Default.args,
    themeHue: 190,
  },
}

export const GreenTheme: Story = {
  args: {
    ...Default.args,
    themeHue: 145,
  },
}

export const OrangeTheme: Story = {
  args: {
    ...Default.args,
    themeHue: 30,
  },
}

export const TronChain: Story = {
  args: {
    wallet: createMockWallet({ name: 'Tron Wallet' }),
    chain: 'tron',
    chainName: 'Tron',
    address: 'TAbcd1234567890abcdef1234567890abcde',
    themeHue: 0,
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
  },
}

export const BitcoinChain: Story = {
  args: {
    wallet: createMockWallet({ name: 'BTC Wallet' }),
    chain: 'bitcoin',
    chainName: 'Bitcoin',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    themeHue: 30,
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
  },
}

export const LongWalletName: Story = {
  args: {
    wallet: createMockWallet({ name: '这是一个超长的钱包名称用于测试显示效果' }),
    chain: 'ethereum',
    chainName: 'Ethereum',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    themeHue: 240,
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
  },
}

export const NoAddress: Story = {
  args: {
    wallet: createMockWallet(),
    chain: 'ethereum',
    chainName: 'Ethereum',
    address: undefined,
    themeHue: 323,
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
  },
}

export const AllThemes: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {[323, 240, 190, 145, 60, 30, 0, 350].map((hue) => (
        <WalletCard
          key={hue}
          wallet={createMockWallet({ name: `Hue ${hue}` })}
          chain="ethereum"
          chainName="ETH"
          address="0x1234...5678"
          themeHue={hue}
        />
      ))}
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="w-[680px] p-4">
        <Story />
      </div>
    ),
  ],
}

export const Interactive: Story = {
  args: {
    wallet: createMockWallet({ name: '触摸/移动鼠标查看效果' }),
    chain: 'ethereum',
    chainName: 'Ethereum',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    themeHue: 323,
  },
  parameters: {
    docs: {
      description: {
        story: '将鼠标悬停在卡片上并移动，观察3D倾斜和炫光效果。在移动设备上，触摸并拖动卡片。',
      },
    },
  },
}
