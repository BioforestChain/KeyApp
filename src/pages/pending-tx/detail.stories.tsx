import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from '@/test/storybook-decorators'
import { PendingTxDetailPage } from './detail'

const meta = {
  title: 'Pages/PendingTx/DetailPage',
  component: PendingTxDetailPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    withRouter('/pending-tx/mock-pending-tx-id', ['/pending-tx/$pendingTxId']),
    (Story) => (
      <div className="max-w-md mx-auto min-h-screen bg-background">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PendingTxDetailPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
