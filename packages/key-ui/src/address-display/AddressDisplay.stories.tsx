import type { Meta, StoryObj } from '@storybook/react-vite'
import { AddressDisplay } from './AddressDisplay'

const meta: Meta<typeof AddressDisplay> = {
  title: 'Components/AddressDisplay',
  component: AddressDisplay,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['auto', 'compact', 'standard', 'detailed', 'full'],
    },
    copyable: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const SAMPLE_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'

export const Default: Story = {
  args: {
    address: SAMPLE_ADDRESS,
  },
}

export const Compact: Story = {
  args: {
    address: SAMPLE_ADDRESS,
    mode: 'compact',
  },
}

export const Standard: Story = {
  args: {
    address: SAMPLE_ADDRESS,
    mode: 'standard',
  },
}

export const Detailed: Story = {
  args: {
    address: SAMPLE_ADDRESS,
    mode: 'detailed',
  },
}

export const Full: Story = {
  args: {
    address: SAMPLE_ADDRESS,
    mode: 'full',
  },
}

export const NotCopyable: Story = {
  args: {
    address: SAMPLE_ADDRESS,
    copyable: false,
  },
}

export const CustomChars: Story = {
  args: {
    address: SAMPLE_ADDRESS,
    startChars: 10,
    endChars: 8,
  },
}

export const Empty: Story = {
  args: {
    address: '',
    placeholder: 'No address',
  },
}
