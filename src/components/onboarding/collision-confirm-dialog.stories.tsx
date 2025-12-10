import type { Meta, StoryObj } from '@storybook/react'
import { CollisionConfirmDialog } from './collision-confirm-dialog'
import { fn } from '@storybook/test'
import type { DuplicateCheckResult } from '@/services/wallet/types'

const mockResult: DuplicateCheckResult = {
  isDuplicate: true,
  type: 'privateKey',
  matchedWallet: {
    id: 'pk-wallet-1',
    name: 'My BTC Wallet',
    importType: 'privateKey',
    matchedAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f1aB23',
  },
}

const meta = {
  title: 'Onboarding/CollisionConfirmDialog',
  component: CollisionConfirmDialog,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
  args: {
    result: mockResult,
    onConfirm: fn(),
    onCancel: fn(),
  },
} satisfies Meta<typeof CollisionConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

/** Default state - showing collision warning */
export const Default: Story = {}

/** Loading state during confirmation */
export const Loading: Story = {
  args: {
    isLoading: true,
  },
}

/** With long wallet name */
export const LongWalletName: Story = {
  args: {
    result: {
      ...mockResult,
      matchedWallet: {
        ...mockResult.matchedWallet!,
        name: 'My Very Long Wallet Name That Might Overflow',
      },
    },
  },
}

/** With Bitcoin address */
export const BitcoinAddress: Story = {
  args: {
    result: {
      isDuplicate: true,
      type: 'privateKey',
      matchedWallet: {
        id: 'btc-wallet-1',
        name: 'Bitcoin Savings',
        importType: 'privateKey',
        matchedAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      },
    },
  },
}

/** Not shown when no collision */
export const NoCollision: Story = {
  args: {
    result: {
      isDuplicate: false,
      type: 'none',
    },
  },
}
