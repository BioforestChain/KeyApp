import type { Meta, StoryObj } from '@storybook/react'
import { WalletCard, type WalletInfo } from './wallet-card'

const meta: Meta<typeof WalletCard> = {
  title: 'Wallet/WalletCard',
  component: WalletCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof WalletCard>

const mockWallet: WalletInfo = {
  id: '1',
  name: '我的钱包',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  balance: '1,234.56 USDT',
  fiatValue: '1,234.56',
  chainName: 'Ethereum',
  isBackedUp: true,
}

export const Default: Story = {
  args: {
    wallet: mockWallet,
    onCopyAddress: () => alert('地址已复制'),
    onTransfer: () => alert('转账'),
    onReceive: () => alert('收款'),
  },
}

export const NotBackedUp: Story = {
  args: {
    wallet: {
      ...mockWallet,
      isBackedUp: false,
    },
    onCopyAddress: () => alert('地址已复制'),
  },
}

export const NoActions: Story = {
  args: {
    wallet: mockWallet,
    onCopyAddress: () => alert('地址已复制'),
  },
}

export const DifferentChains: Story = {
  render: () => (
    <div className="space-y-4">
      <WalletCard
        wallet={{
          ...mockWallet,
          chainName: 'Ethereum',
          balance: '2.5 ETH',
        }}
      />
      <WalletCard
        wallet={{
          ...mockWallet,
          id: '2',
          chainName: 'Tron',
          balance: '10,000 TRX',
          address: 'TAbcd1234567890abcdef1234567890abcde',
        }}
      />
      <WalletCard
        wallet={{
          ...mockWallet,
          id: '3',
          chainName: 'Bitcoin',
          balance: '0.05 BTC',
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        }}
      />
    </div>
  ),
}

export const Responsive: Story = {
  args: {
    wallet: mockWallet,
    onCopyAddress: () => alert('地址已复制'),
    onTransfer: () => alert('转账'),
    onReceive: () => alert('收款'),
  },
  parameters: {
    docs: {
      description: {
        story: '拖拽容器边缘调整宽度，观察卡片响应式变化：\n- 窄容器：紧凑布局，地址缩写\n- 宽容器：宽松布局，显示完整地址',
      },
    },
  },
}
