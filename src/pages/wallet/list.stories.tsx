import type { Meta, StoryObj } from '@storybook/react'
import { WalletListPage } from './list'
import { walletStore, type Wallet } from '@/stores'
import { withRouter, withI18n } from '@/test/storybook-decorators'

const meta: Meta<typeof WalletListPage> = {
  title: 'Pages/Wallet/WalletListPage',
  component: WalletListPage,
  decorators: [withRouter(), withI18n()],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof WalletListPage>

const createMockWallet = (id: string, name: string): Wallet => ({
  id,
  name,
  address: `0x${id.padStart(40, '0')}`,
  chain: 'ethereum',
  tokens: [],
  encryptedMnemonic: {
    ciphertext: 'test',
    iv: 'test',
    salt: 'test',
    iterations: 100000,
  },
  chainAddresses: [
    {
      chain: 'ethereum',
      address: `0x${id.padStart(40, '0')}`,
      tokens: [
        { id: 'eth', symbol: 'ETH', name: 'Ethereum', balance: '1.5', fiatValue: 3000, change24h: 2.5, decimals: 18, contractAddress: '', chain: 'ethereum' },
        { id: 'usdt', symbol: 'USDT', name: 'Tether', balance: '500', fiatValue: 500, change24h: 0.1, decimals: 6, contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7', chain: 'ethereum' },
      ],
    },
    {
      chain: 'binance',
      address: `0x${id.padStart(40, '0')}`,
      tokens: [
        { id: 'bnb', symbol: 'BNB', name: 'Binance Coin', balance: '2.0', fiatValue: 600, change24h: 1.8, decimals: 18, contractAddress: '', chain: 'binance' },
      ],
    },
  ],
  createdAt: Date.now() - 86400000 * Number(id), // Days ago
})

/**
 * 空状态：没有钱包
 */
export const Empty: Story = {
  decorators: [
    (Story) => {
      walletStore.setState({
        wallets: [],
        currentWalletId: null,
        chainPreferences: {},
      selectedChain: 'ethereum',
        isLoading: false,
        isInitialized: true,
      })
      return <Story />
    },
  ],
}

/**
 * 单个钱包
 */
export const SingleWallet: Story = {
  decorators: [
    (Story) => {
      const wallet = createMockWallet('1', 'Main Wallet')
      walletStore.setState({
        wallets: [wallet],
        currentWalletId: '1',
        chainPreferences: {},
      selectedChain: 'ethereum',
        isLoading: false,
        isInitialized: true,
      })
      return <Story />
    },
  ],
}

/**
 * 多个钱包
 */
export const MultipleWallets: Story = {
  decorators: [
    (Story) => {
      const wallets = [
        createMockWallet('1', 'Main Wallet'),
        createMockWallet('2', 'Trading'),
        createMockWallet('3', 'Savings'),
      ]
      walletStore.setState({
        wallets,
        currentWalletId: '1',
        chainPreferences: {},
      selectedChain: 'ethereum',
        isLoading: false,
        isInitialized: true,
      })
      return <Story />
    },
  ],
}

/**
 * 非第一个钱包为当前钱包
 */
export const SecondWalletActive: Story = {
  decorators: [
    (Story) => {
      const wallets = [
        createMockWallet('1', 'Main Wallet'),
        createMockWallet('2', 'Trading'),
        createMockWallet('3', 'Savings'),
      ]
      walletStore.setState({
        wallets,
        currentWalletId: '2',
        chainPreferences: {},
      selectedChain: 'ethereum',
        isLoading: false,
        isInitialized: true,
      })
      return <Story />
    },
  ],
}

/**
 * 钱包带有长名称
 */
export const LongWalletNames: Story = {
  decorators: [
    (Story) => {
      const wallets = [
        createMockWallet('1', 'My Very Long Wallet Name That Should Be Truncated'),
        createMockWallet('2', 'Another Long Name For Testing Purposes'),
      ]
      walletStore.setState({
        wallets,
        currentWalletId: '1',
        chainPreferences: {},
      selectedChain: 'ethereum',
        isLoading: false,
        isInitialized: true,
      })
      return <Story />
    },
  ],
}
