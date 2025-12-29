import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlowButton } from './GlowButton'
import { Send } from 'lucide-react'

const meta = {
  title: 'Components/GlowButton',
  component: GlowButton,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof GlowButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: '开始传送',
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Send className="mr-2 size-4" />
        发送资产
      </>
    ),
  },
}

export const Disabled: Story = {
  args: {
    children: '处理中...',
    disabled: true,
    className: 'opacity-50 cursor-not-allowed',
  },
}

export const Wide: Story = {
  args: {
    children: '确认转账',
    className: 'w-64',
  },
}
