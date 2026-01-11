import type { Meta, StoryObj } from '@storybook/react-vite'
import { GradientButton } from './GradientButton'

const meta: Meta<typeof GradientButton> = {
  title: 'Components/GradientButton',
  component: GradientButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['blue', 'purple', 'red', 'mint'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Purple: Story = {
  args: {
    variant: 'purple',
    children: 'Continue',
  },
}

export const Blue: Story = {
  args: {
    variant: 'blue',
    children: 'Connect Wallet',
  },
}

export const Red: Story = {
  args: {
    variant: 'red',
    children: 'Disconnect',
  },
}

export const Mint: Story = {
  args: {
    variant: 'mint',
    children: 'Confirm',
  },
}

export const Loading: Story = {
  args: {
    variant: 'purple',
    children: 'Processing...',
    loading: true,
  },
}

export const Disabled: Story = {
  args: {
    variant: 'purple',
    children: 'Disabled',
    disabled: true,
  },
}

export const FullWidth: Story = {
  args: {
    variant: 'purple',
    children: 'Full Width Button',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <GradientButton size="sm">Small</GradientButton>
      <GradientButton size="md">Medium</GradientButton>
      <GradientButton size="lg">Large</GradientButton>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <GradientButton variant="purple">Purple</GradientButton>
      <GradientButton variant="blue">Blue</GradientButton>
      <GradientButton variant="red">Red</GradientButton>
      <GradientButton variant="mint">Mint</GradientButton>
    </div>
  ),
}
