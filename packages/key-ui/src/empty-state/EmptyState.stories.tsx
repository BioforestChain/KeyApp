import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyState } from './EmptyState'

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const PlaceholderIcon = () => (
  <svg className="size-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
)

export const Default: Story = {
  args: {
    title: 'No items found',
    description: 'Get started by creating your first item.',
  },
}

export const WithIcon: Story = {
  args: {
    icon: <PlaceholderIcon />,
    title: 'No transactions',
    description: 'Your transaction history will appear here.',
  },
}

export const WithAction: Story = {
  args: {
    icon: <PlaceholderIcon />,
    title: 'No wallet connected',
    description: 'Connect your wallet to get started.',
    action: (
      <button className="bg-primary text-primary-foreground rounded-full px-6 py-2 font-medium">
        Connect Wallet
      </button>
    ),
  },
}

export const Minimal: Story = {
  args: {
    title: 'Nothing here yet',
  },
}
