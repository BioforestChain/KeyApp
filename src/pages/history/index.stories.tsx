import type { Meta, StoryObj } from '@storybook/react'
import { TransactionHistoryPage } from './index'

const meta = {
  title: 'Pages/History/TransactionHistoryPage',
  component: TransactionHistoryPage,
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
} satisfies Meta<typeof TransactionHistoryPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
