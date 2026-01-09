import type { Meta, StoryObj } from '@storybook/react'
import { DestroyPage } from './index'

const meta: Meta<typeof DestroyPage> = {
  title: 'Pages/DestroyPage',
  component: DestroyPage,
  decorators: [
    (Story) => (
      <div className="h-screen w-full max-w-md mx-auto bg-background">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export default meta
type Story = StoryObj<typeof DestroyPage>

export const Default: Story = {
  name: 'Default',
}
