import type { Meta, StoryObj } from '@storybook/react'
import { ChangePasswordPage } from './change-password'

const meta = {
  title: 'Pages/Settings/ChangePasswordPage',
  component: ChangePasswordPage,
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
} satisfies Meta<typeof ChangePasswordPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
