import type { Meta, StoryObj } from '@storybook/react-vite'
import { AmountDisplay } from './AmountDisplay'

const meta: Meta<typeof AmountDisplay> = {
  title: 'Components/AmountDisplay',
  component: AmountDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    sign: {
      control: 'select',
      options: ['auto', 'always', 'never'],
    },
    color: {
      control: 'select',
      options: ['auto', 'default', 'positive', 'negative'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: '1234.56789',
    symbol: 'ETH',
  },
}

export const Positive: Story = {
  args: {
    value: '1234.56789',
    symbol: 'ETH',
    sign: 'always',
    color: 'auto',
  },
}

export const Negative: Story = {
  args: {
    value: '-1234.56789',
    symbol: 'ETH',
    sign: 'auto',
    color: 'auto',
  },
}

export const Compact: Story = {
  args: {
    value: '1234567.89',
    symbol: 'ETH',
    compact: true,
  },
}

export const Large: Story = {
  args: {
    value: '1234.56789',
    symbol: 'ETH',
    size: 'xl',
    weight: 'bold',
  },
}

export const Loading: Story = {
  args: {
    value: '0',
    symbol: 'ETH',
    loading: true,
  },
}

export const Hidden: Story = {
  args: {
    value: '1234.56789',
    symbol: 'ETH',
    hidden: true,
  },
}

export const NoAnimation: Story = {
  args: {
    value: '1234.56789',
    symbol: 'ETH',
    animated: false,
  },
}

export const HighDecimals: Story = {
  args: {
    value: '0.00000001',
    symbol: 'BTC',
    decimals: 8,
  },
}
