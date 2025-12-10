import type { Meta, StoryObj } from '@storybook/react'
import { WalletEditSheet } from './wallet-edit-sheet'
import { type Wallet } from '@/stores'
import { withI18n } from '@/test/storybook-decorators'

const meta: Meta<typeof WalletEditSheet> = {
  title: 'Components/Wallet/WalletEditSheet',
  component: WalletEditSheet,
  decorators: [withI18n()],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onClose: { action: 'close' },
    onSuccess: { action: 'success' },
  },
}

export default meta
type Story = StoryObj<typeof WalletEditSheet>

const createMockWallet = (id: string, name: string): Wallet => ({
  id,
  name,
  address: `0x${id.padStart(40, '0')}`,
  chain: 'ethereum',
  encryptedMnemonic: {
    ciphertext: 'test',
    iv: 'test',
    salt: 'test',
    iterations: 100000,
  },
  chainAddresses: [
    {
      chain: 'ethereum',
      address: `0x${id.padStart(40, '0')}`,
      tokens: [],
    },
  ],
  tokens: [],
  createdAt: Date.now(),
})

/**
 * 默认菜单视图
 */
export const Default: Story = {
  args: {
    wallet: createMockWallet('1', 'Main Wallet'),
    open: true,
  },
}

/**
 * 长钱包名称
 */
export const LongName: Story = {
  args: {
    wallet: createMockWallet('1', 'Very Long Wallet Name That Might Truncate'),
    open: true,
  },
}

/**
 * 关闭状态
 */
export const Closed: Story = {
  args: {
    wallet: createMockWallet('1', 'Main Wallet'),
    open: false,
  },
}
