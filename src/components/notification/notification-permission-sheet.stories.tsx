import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { NotificationPermissionSheet } from './notification-permission-sheet'

const meta = {
  title: 'Notification/PermissionSheet',
  component: NotificationPermissionSheet,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    open: true,
    onClose: fn(),
    onEnable: fn(),
    onSkip: fn(),
  },
} satisfies Meta<typeof NotificationPermissionSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Closed: Story = {
  args: {
    open: false,
  },
}
