import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { KeyTypeSelector, type WalletKeyType } from './key-type-selector'

const meta: Meta<typeof KeyTypeSelector> = {
  title: 'Onboarding/KeyTypeSelector',
  component: KeyTypeSelector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-md p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof KeyTypeSelector>

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<WalletKeyType>('mnemonic')
    return <KeyTypeSelector value={value} onChange={setValue} />
  },
}

export const Disabled: Story = {
  args: {
    value: 'mnemonic',
    disabled: true,
    onChange: () => undefined,
  },
}
