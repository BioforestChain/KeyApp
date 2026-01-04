import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import type { ChainConfig } from '@/services/chain-config'
import { ChainAddressPreview } from './chain-address-preview'

const meta: Meta<typeof ChainAddressPreview> = {
  title: 'Onboarding/ChainAddressPreview',
  component: ChainAddressPreview,
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
type Story = StoryObj<typeof ChainAddressPreview>

const mockConfigs: ChainConfig[] = [
  {
    id: 'bfmeta',
    version: '1.0',
    chainKind: 'bioforest',
    name: 'BFMeta',
    symbol: 'BFT',
    decimals: 8,
    enabled: true,
    source: 'default',
  },
  {
    id: 'pmchain',
    version: '1.0',
    chainKind: 'bioforest',
    name: 'PMChain',
    symbol: 'PM',
    decimals: 8,
    enabled: true,
    source: 'default',
  },
]

export const Default: Story = {
  render: () => {
    const [secret, setSecret] = useState('my secret')
    return (
      <div className="space-y-3">
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
        <ChainAddressPreview secret={secret} enabledBioforestChainConfigs={mockConfigs} />
      </div>
    )
  },
}
