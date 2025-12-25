import type { Meta, StoryObj } from '@storybook/react'
import { ChangeWalletLockPage } from './change-wallet-lock'

const meta = {
  title: 'Pages/Settings/ChangeWalletLockPage',
  component: ChangeWalletLockPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="max-w-md mx-auto min-h-screen bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChangeWalletLockPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
