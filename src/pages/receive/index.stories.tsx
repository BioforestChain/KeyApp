import type { Meta, StoryObj } from '@storybook/react'
import { ReceivePage } from './index'

// Note: This story requires mocking router, stores, and services
// For now we show the structure - full mocking would need decorator setup

const meta = {
  title: 'Pages/ReceivePage',
  component: ReceivePage,
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
} satisfies Meta<typeof ReceivePage>

export default meta
type Story = StoryObj<typeof meta>

// Default story - requires proper mocking in .storybook/preview
export const Default: Story = {}

// Note: Additional stories for different chains would require
// mocking useSelectedChain with different values:
// - Ethereum
// - Bitcoin
// - Tron
// - BSC
// - BFMeta
