import type { Meta, StoryObj } from '@storybook/react-vite'
import { FireButton } from './FireButton'
import { Zap } from 'lucide-react'
import { t } from 'i18next'
import '../i18n'

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
    children: t('connect.button'),
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Zap className="size-4" />
        <span>{t('forge.start')}</span>
      </>
    ),
  },
}

export const Disabled: Story = {
  args: {
    children: t('processing.default'),
    disabled: true,
  },
}

export const Wide: Story = {
  args: {
    children: t('forge.confirm'),
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
