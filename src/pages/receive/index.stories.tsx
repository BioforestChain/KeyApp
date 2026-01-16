import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { ReceivePage } from './index'

// Note: This story requires mocking router, stores, and services
// Storybook preview.tsx provides QueryClient and i18n
// Additional mocks are provided via decorators

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

// Default story with play function for visual testing
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify page title is rendered
    await expect(canvas.getByText('收款')).toBeInTheDocument()

    // Verify QR code renders as actual SVG (not placeholder text)
    const svg = canvasElement.querySelector('svg')
    await expect(svg).toBeInTheDocument()

    // Verify placeholder text "QR:" is NOT present (this was the bug)
    const placeholderText = canvas.queryByText(/^QR:/)
    await expect(placeholderText).not.toBeInTheDocument()

    // Verify action buttons are rendered
    await expect(canvas.getByText('复制地址')).toBeInTheDocument()
    await expect(canvas.getByText('保存图片')).toBeInTheDocument()
    await expect(canvas.getByText('分享')).toBeInTheDocument()

    // Verify chain info is displayed
    await expect(canvas.getByText('Ethereum')).toBeInTheDocument()

    // Verify instruction text
    await expect(canvas.getByText('扫描二维码向此地址转账')).toBeInTheDocument()
  },
}

// Note: Additional stories for different chains would require
// mocking useSelectedChain with different values:
// - Bitcoin
// - Tron
// - BSC
// - BFMeta

