import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { ArbitraryKeyInput } from './arbitrary-key-input'

const meta: Meta<typeof ArbitraryKeyInput> = {
  title: 'Onboarding/ArbitraryKeyInput',
  component: ArbitraryKeyInput,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-md space-y-4 p-4">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof ArbitraryKeyInput>

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('')
    return <ArbitraryKeyInput value={value} onChange={setValue} />
  },
}

export const Filled: Story = {
  args: {
    value: 'my secret key',
    onChange: () => undefined,
  },
}
