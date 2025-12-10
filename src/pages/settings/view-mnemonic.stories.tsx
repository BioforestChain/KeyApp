import type { Meta, StoryObj } from '@storybook/react'
import { ViewMnemonicPage } from './view-mnemonic'

const meta = {
  title: 'Pages/Settings/ViewMnemonicPage',
  component: ViewMnemonicPage,
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
} satisfies Meta<typeof ViewMnemonicPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
