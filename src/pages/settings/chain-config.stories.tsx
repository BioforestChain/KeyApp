import type { Meta, StoryObj } from '@storybook/react'
import { ChainConfigPage } from './chain-config'

const meta = {
  title: 'Pages/Settings/ChainConfigPage',
  component: ChainConfigPage,
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
} satisfies Meta<typeof ChainConfigPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

