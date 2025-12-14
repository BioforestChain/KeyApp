import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { SecurityWarningDialog } from './security-warning-dialog'

const meta: Meta<typeof SecurityWarningDialog> = {
  title: 'Onboarding/SecurityWarningDialog',
  component: SecurityWarningDialog,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof SecurityWarningDialog>

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    return (
      <div className="space-y-3">
        <button className="rounded bg-primary px-3 py-2 text-white" onClick={() => setOpen(true)}>
          Open
        </button>
        <SecurityWarningDialog
          open={open}
          onOpenChange={setOpen}
          onConfirm={() => undefined}
        />
      </div>
    )
  },
}
