import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ChainAddressSelector, type ChainData } from './chain-address-selector';

const meta: Meta<typeof ChainAddressSelector> = {
  title: 'Wallet/ChainAddressSelector',
  component: ChainAddressSelector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChainAddressSelector>;

const mockChains: ChainData[] = [
  {
    chain: 'ethereum',
    name: 'Ethereum',
    addresses: [
      { address: '0x1234567890abcdef1234567890abcdef12345678', balance: '1.5 ETH', isDefault: true },
      { address: '0xabcdef1234567890abcdef1234567890abcdef12', balance: '0.5 ETH' },
      { address: '0x9876543210fedcba9876543210fedcba98765432', balance: '0.1 ETH' },
    ],
  },
  {
    chain: 'tron',
    name: 'Tron',
    addresses: [
      { address: 'TAbcdefghijklmnopqrstuvwxyz123456', balance: '10,000 TRX', isDefault: true },
      { address: 'TXyzabcdefghijklmnopqrstuvwx987654', balance: '5,000 TRX' },
    ],
  },
  {
    chain: 'bsc',
    name: 'BSC',
    addresses: [
      { address: '0xfedcba9876543210fedcba9876543210fedcba98', balance: '2 BNB', isDefault: true },
    ],
  },
  {
    chain: 'bfmeta',
    name: 'BFMeta',
    addresses: [
      { address: 'c3nqGntFJ2fF7GwJoGmcuHVCVhpBpQSA', balance: '100 BFT', isDefault: true },
    ],
  },
];

export const Default: Story = {
  args: {
    chains: mockChains,
  },
};

export const SingleChain: Story = {
  args: {
    chains: [mockChains[0]!],
  },
};

export const WithSelection: Story = {
  args: {
    chains: mockChains,
    selectedChain: 'ethereum',
    selectedAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
  },
};

export const EmptyChain: Story = {
  args: {
    chains: [
      ...mockChains,
      {
        chain: 'bitcoin',
        name: 'Bitcoin',
        addresses: [],
      },
    ],
    selectedChain: 'bitcoin',
  },
};

export const Interactive: Story = {
  render: () => {
    const [selection, setSelection] = useState<{ chain: string; address: string } | null>(null);

    const chainAddressProps = {
      chains: mockChains,
      onSelect: (chain: string, address: string) => setSelection({ chain, address }),
      ...(selection?.chain && { selectedChain: selection.chain as ChainData['chain'] }),
      ...(selection?.address && { selectedAddress: selection.address }),
    }

    return (
      <div className="space-y-4">
        <ChainAddressSelector {...chainAddressProps} />
        {selection && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p>
              <strong>Chain:</strong> {selection.chain}
            </p>
            <p className="font-mono">
              <strong>Address:</strong> {selection.address}
            </p>
          </div>
        )}
      </div>
    );
  },
};

export const ManyAddresses: Story = {
  args: {
    chains: [
      {
        chain: 'ethereum',
        name: 'Ethereum',
        addresses: Array.from({ length: 10 }, (_, i) => ({
          address: `0x${(i + 1).toString().padStart(40, '0')}`,
          balance: `${(10 - i) * 0.5} ETH`,
          isDefault: i === 0,
        })),
      },
      ...mockChains.slice(1),
    ],
  },
};

export const WithBalances: Story = {
  args: {
    chains: mockChains.map((c) => ({
      ...c,
      addresses: c.addresses.map((a) => ({
        ...a,
        balance: a.balance || '0',
      })),
    })),
  },
};
