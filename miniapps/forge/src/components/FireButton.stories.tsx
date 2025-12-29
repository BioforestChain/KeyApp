import type { Meta, StoryObj } from '@storybook/react-vite'
import { FireButton } from './FireButton'
import { Zap } from 'lucide-react'

const meta = {
  title: 'Components/FireButton',
  component: FireButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FireButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: '连接钱包',
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Zap className="size-4" />
        <span>开始锻造</span>
      </>
    ),
  },
}

export const Disabled: Story = {
  args: {
    children: '处理中...',
    disabled: true,
  },
}

export const Wide: Story = {
  args: {
    children: '确认交易',
    className: 'max-w-xs',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
}
