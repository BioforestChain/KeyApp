import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from '@/test/storybook-decorators'
import { TransactionDetailPage } from './detail'

const meta = {
  title: 'Pages/History/TransactionDetailPage',
  component: TransactionDetailPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    withRouter('/transaction/mock-tx', ['/transaction/$txId']),
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
