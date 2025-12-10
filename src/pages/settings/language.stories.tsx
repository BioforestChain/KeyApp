import type { Meta, StoryObj } from '@storybook/react'
import { LanguagePage } from './language'

const meta = {
  title: 'Pages/Settings/LanguagePage',
  component: LanguagePage,
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
} satisfies Meta<typeof LanguagePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
