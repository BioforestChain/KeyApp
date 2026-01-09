import type { Meta, StoryObj } from '@storybook/react'
import { DestroyPage } from './index'
import { StorybookProviders } from '@/test/storybook-providers'
import { StackflowStoryWrapper } from '@/test/stackflow-story-wrapper'

const meta: Meta<typeof DestroyPage> = {
  title: 'Pages/DestroyPage',
  component: DestroyPage,
  decorators: [
    (Story) => (
      <StorybookProviders>
        <StackflowStoryWrapper>
          <div className="h-screen w-full max-w-md mx-auto bg-background">
            <Story />
          </div>
        </StackflowStoryWrapper>
      </StorybookProviders>
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
  name: 'Default (No Wallet)',
}

export const WithMockData: Story = {
  name: 'With Mock Wallet',
  parameters: {
    mockData: {
      hasWallet: true,
      selectedChain: 'bfmeta',
      tokens: [
        { symbol: 'BFM', name: 'BFMeta', balance: '1000', decimals: 8 },
        { symbol: 'TEST', name: 'Test Token', balance: '500', decimals: 8 },
        { symbol: 'USDT', name: 'Tether USD', balance: '1000', decimals: 8 },
      ],
    },
  },
}
