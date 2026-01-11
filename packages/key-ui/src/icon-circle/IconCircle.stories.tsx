import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconCircle } from './IconCircle'

const meta: Meta<typeof IconCircle> = {
  title: 'Components/IconCircle',
  component: IconCircle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-full">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

export const Primary: Story = {
  args: {
    icon: <ShieldIcon />,
    variant: 'primary',
    size: 'lg',
  },
}

export const Success: Story = {
  args: {
    icon: <ShieldIcon />,
    variant: 'success',
    size: 'lg',
  },
}

export const Warning: Story = {
  args: {
    icon: <ShieldIcon />,
    variant: 'warning',
    size: 'lg',
  },
}

export const Error: Story = {
  args: {
    icon: <ShieldIcon />,
    variant: 'error',
    size: 'lg',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <IconCircle icon={<ShieldIcon />} size="sm" />
      <IconCircle icon={<ShieldIcon />} size="md" />
      <IconCircle icon={<ShieldIcon />} size="lg" />
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <IconCircle icon={<ShieldIcon />} variant="primary" />
      <IconCircle icon={<ShieldIcon />} variant="secondary" />
      <IconCircle icon={<ShieldIcon />} variant="success" />
      <IconCircle icon={<ShieldIcon />} variant="warning" />
      <IconCircle icon={<ShieldIcon />} variant="error" />
    </div>
  ),
}
