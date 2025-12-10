import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { BackupTipsSheet } from './backup-tips-sheet'

const meta = {
  title: 'Onboarding/BackupTipsSheet',
  component: BackupTipsSheet,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    open: true,
    onClose: fn(),
    onProceed: fn(),
    onSkip: fn(),
  },
} satisfies Meta<typeof BackupTipsSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Closed: Story = {
  args: {
    open: false,
  },
}
