import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { WalletSelector } from './wallet-selector';
import type { WalletInfo } from './index';

// 不同链的图标路径
const CHAIN_ICONS = {
  bfmeta: '/icons/bfmeta/chain.svg',
  ethereum: '/icons/ethereum/chain.svg',
  bitcoin: '/icons/bitcoin/chain.svg',
  tron: '/icons/tron/chain.svg',
  binance: '/icons/binance/chain.svg',
}

const meta: Meta<typeof WalletSelector> = {
  title: 'Wallet/WalletSelector',
  component: WalletSelector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-sm rounded-xl border border-border bg-card p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof WalletSelector>;

const mockWallets: WalletInfo[] = [
  {
    id: 'wallet-1',
    name: 'Ethereum Wallet',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    balance: '1.5 ETH',
    fiatValue: '3000',
    isBackedUp: true,
    themeHue: 220,
    chainIconUrl: CHAIN_ICONS.ethereum,
  },
  {
    id: 'wallet-2',
    name: 'Bitcoin Savings',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    balance: '0.5 BTC',
    fiatValue: '20000',
    isBackedUp: false,
    themeHue: 40,
    chainIconUrl: CHAIN_ICONS.bitcoin,
  },
  {
    id: 'wallet-3',
    name: 'Tron Trading',
    address: 'TAbcdefghijklmnopqrstuvwxyz123456',
    balance: '10,000 TRX',
    isBackedUp: true,
    themeHue: 0,
    chainIconUrl: CHAIN_ICONS.tron,
  },
];

export const Default: Story = {
  args: {
    wallets: mockWallets,
    selectedId: 'wallet-1',
  },
};

export const SingleWallet: Story = {
  args: {
    wallets: [mockWallets[0]!],
    selectedId: 'wallet-1',
  },
};

export const EmptyState: Story = {
  args: {
    wallets: [],
  },
};

export const WithUnbackedWallet: Story = {
  args: {
    wallets: mockWallets,
    selectedId: 'wallet-2',
  },
};

export const Interactive: Story = {
  render: () => {
    const [selectedId, setSelectedId] = useState('wallet-1');
    return (
      <WalletSelector
        wallets={mockWallets}
        selectedId={selectedId}
        onSelect={(wallet) => setSelectedId(wallet.id)}
      />
    );
  },
};

export const ManyWallets: Story = {
  args: {
    wallets: [
      ...mockWallets,
      {
        id: 'wallet-4',
        name: 'Cold Storage',
        address: '0x9876543210fedcba9876543210fedcba98765432',
        balance: '10 ETH',
        isBackedUp: true,
      },
      {
        id: 'wallet-5',
        name: 'DeFi Wallet',
        address: '0xfedcba9876543210fedcba9876543210fedcba98',
        balance: '5,000 USDT',
        isBackedUp: true,
      },
    ],
    selectedId: 'wallet-1',
  },
};

export const InSheet: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <div className="mb-4 flex items-center justify-between px-4">
          <h2 className="text-lg font-semibold">选择钱包</h2>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            关闭
          </button>
        </div>
        <Story />
      </div>
    ),
  ],
  args: {
    wallets: mockWallets,
    selectedId: 'wallet-1',
  },
};
