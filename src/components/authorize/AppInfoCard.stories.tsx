import type { Meta, StoryObj } from '@storybook/react'
import { AppInfoCard } from './AppInfoCard'

const meta: Meta<typeof AppInfoCard> = {
  title: 'Authorize/AppInfoCard',
  component: AppInfoCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AppInfoCard>

export const Default: Story = {
  args: {
    appInfo: {
      appId: 'com.example.app',
      appName: 'Example DApp',
      appIcon: 'https://placehold.co/96x96/png',
      origin: 'https://example.app',
    },
  },
}

export const UnknownOrigin: Story = {
  args: {
    appInfo: {
      appId: 'mock.dapp.local',
      appName: 'Mock DApp',
      appIcon: '',
      origin: 'http://mock.dapp.local',
    },
  },
}

