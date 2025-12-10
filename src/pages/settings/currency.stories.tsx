import type { Meta, StoryObj } from '@storybook/react'
import { CurrencyPage } from './currency'

const meta = {
  title: 'Pages/Settings/CurrencyPage',
  component: CurrencyPage,
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
} satisfies Meta<typeof CurrencyPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
