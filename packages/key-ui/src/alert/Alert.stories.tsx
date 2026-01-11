import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert } from './Alert'

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </svg>
)

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'This is an informational message.',
    icon: <InfoIcon />,
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Your transaction was successful!',
    icon: <InfoIcon />,
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Please review before proceeding.',
    icon: <InfoIcon />,
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Something went wrong. Please try again.',
    icon: <InfoIcon />,
  },
}

export const WithTitle: Story = {
  args: {
    variant: 'warning',
    title: 'Important Notice',
    children: 'Your session will expire in 5 minutes.',
    icon: <InfoIcon />,
  },
}

export const NoIcon: Story = {
  args: {
    variant: 'info',
    children: 'Alert without an icon.',
  },
}
