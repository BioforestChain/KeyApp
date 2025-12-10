import type { Meta, StoryObj } from '@storybook/react'
import { TransactionDetailPage } from './detail'

const meta = {
  title: 'Pages/History/TransactionDetailPage',
  component: TransactionDetailPage,
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
} satisfies Meta<typeof TransactionDetailPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
