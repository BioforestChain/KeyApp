import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { WhatsNewSheet } from './WhatsNewSheet'

const meta: Meta<typeof WhatsNewSheet> = {
  title: 'Migration/WhatsNewSheet',
  component: WhatsNewSheet,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof WhatsNewSheet>

export const Default: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true)
    const { t } = useTranslation('migration')

    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setOpen(true)}>
          {t('whats_new')}
        </Button>
        <WhatsNewSheet open={open} onOpenChange={setOpen} />
      </div>
    )
  },
}
