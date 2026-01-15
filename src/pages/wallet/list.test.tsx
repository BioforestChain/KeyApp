import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WalletListPage } from './list'
import { walletStore, walletActions, type Wallet } from '@/stores'

// Mock dependencies
const mockGoBack = vi.fn()
const mockPush = vi.fn()
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useActivityParams: () => ({}),
  useFlow: () => ({ push: mockPush }),
}))

vi.mock('@/components/layout/page-header', () => ({
  PageHeader: ({ title, onBack, rightAction }: { title: string; onBack?: () => void; rightAction?: React.ReactNode }) => (
    <div data-testid="page-header">
      <span>{title}</span>
      {onBack && <button onClick={onBack} data-testid="back-button">返回</button>}
      {rightAction}
    </div>
  ),
}))

const mockNavigate = vi.fn()

const createMockWallet = (id: string, name: string, _isActive: boolean = false): Wallet => ({
  id,
  name,
  address: `0x${id}abc123def456`,
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
      address: `0x${id}abc123def456`,
      publicKey: `0x04${id}pubkey`,
      tokens: [
        { id: 'eth', symbol: 'ETH', name: 'Ethereum', balance: '1.5', fiatValue: 3000, change24h: 2.5, decimals: 18, contractAddress: '', chain: 'ethereum' },
        { id: 'usdt', symbol: 'USDT', name: 'Tether', balance: '500', fiatValue: 500, change24h: 0.1, decimals: 6, contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7', chain: 'ethereum' },
      ],
    },
  ],
  createdAt: Date.now(),
  themeHue: 323,
})

describe('WalletListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store to empty state
    walletStore.setState({
      wallets: [],
      currentWalletId: null,
      chainPreferences: {},
      selectedChain: 'ethereum',
      isLoading: false,
      isInitialized: true,
    })
  })

  it('renders empty state when no wallets', () => {
    render(<WalletListPage />)

    expect(screen.getByText('还没有钱包')).toBeInTheDocument()
    // Both header and empty state have add buttons
    const addButtons = screen.getAllByRole('button', { name: '添加钱包' })
    expect(addButtons.length).toBe(2) // Header + empty state
  })

  it('renders wallet list when wallets exist', () => {
    const wallet1 = createMockWallet('1', 'Main Wallet')
    const wallet2 = createMockWallet('2', 'Trading Wallet')

    walletStore.setState({
      wallets: [wallet1, wallet2],
      currentWalletId: '1',
      chainPreferences: {},
      selectedChain: 'ethereum',
      isLoading: false,
      isInitialized: true,
    })

    render(<WalletListPage />)

    expect(screen.getByText('Main Wallet')).toBeInTheDocument()
    expect(screen.getByText('Trading Wallet')).toBeInTheDocument()
    expect(screen.queryByText('还没有钱包')).not.toBeInTheDocument()
  })

  it('shows active wallet with indicator', () => {
    const wallet1 = createMockWallet('1', 'Main Wallet')
    const wallet2 = createMockWallet('2', 'Trading Wallet')

    walletStore.setState({
      wallets: [wallet1, wallet2],
      currentWalletId: '1',
      chainPreferences: {},
      selectedChain: 'ethereum',
      isLoading: false,
      isInitialized: true,
    })

    render(<WalletListPage />)

    // Active wallet should show "当前" indicator
    expect(screen.getByText('当前')).toBeInTheDocument()
  })

  it('allows switching between wallets', () => {
    const wallet1 = createMockWallet('1', 'Main Wallet')
    const wallet2 = createMockWallet('2', 'Trading Wallet')

    walletStore.setState({
      wallets: [wallet1, wallet2],
      currentWalletId: '1',
      chainPreferences: {},
      selectedChain: 'ethereum',
      isLoading: false,
      isInitialized: true,
    })

    const setCurrentWalletSpy = vi.spyOn(walletActions, 'setCurrentWallet')

    render(<WalletListPage />)

    // Click on the second wallet's avatar (first letter button)
    const walletAvatars = screen.getAllByRole('button', { name: /^[A-Z]$/i })
    fireEvent.click(walletAvatars[1]!) // Click second wallet avatar

    expect(setCurrentWalletSpy).toHaveBeenCalledWith('2')
  })

  it('navigates to wallet detail', () => {
    const wallet1 = createMockWallet('1', 'Main Wallet')

    walletStore.setState({
      wallets: [wallet1],
      currentWalletId: '1',
      chainPreferences: {},
      selectedChain: 'ethereum',
      isLoading: false,
      isInitialized: true,
    })

    render(<WalletListPage />)

    // Click detail button (chevron right)
    const detailButton = screen.getByRole('button', { name: '查看详情' })
    fireEvent.click(detailButton)

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/wallet/1' })
  })

  it('opens wallet add sheet from empty state', () => {
    walletStore.setState({
      wallets: [],
      currentWalletId: null,
      chainPreferences: {},
      selectedChain: 'ethereum',
      isLoading: false,
      isInitialized: true,
    })

    render(<WalletListPage />)

    // Click add button in empty state (use getAllByRole and pick the second one)
    const addButtons = screen.getAllByRole('button', { name: '添加钱包' })
    fireEvent.click(addButtons[1]!) // Second button is in empty state

    expect(mockPush).toHaveBeenCalledWith('WalletAddJob', {})
  })

  it('calculates total balance correctly', () => {
    const wallet = createMockWallet('1', 'Main Wallet')
    // wallet has ETH (3000) + USDT (500) = 3500 total

    walletStore.setState({
      wallets: [wallet],
      currentWalletId: '1',
      chainPreferences: {},
      selectedChain: 'ethereum',
      isLoading: false,
      isInitialized: true,
    })

    render(<WalletListPage />)

    // Check that total balance is displayed
    expect(screen.getByText('$3,500.00')).toBeInTheDocument()
  })

  it('shows wallet address preview', () => {
    const wallet = createMockWallet('1', 'Main Wallet')

    walletStore.setState({
      wallets: [wallet],
      currentWalletId: '1',
      chainPreferences: {},
      selectedChain: 'ethereum',
      isLoading: false,
      isInitialized: true,
    })

    render(<WalletListPage />)

    // Check address is displayed (truncated)
    expect(screen.getByText('0x1abc123def456')).toBeInTheDocument()
  })

  it('navigates back to home', () => {
    render(<WalletListPage />)

    const backButton = screen.getByTestId('back-button')
    fireEvent.click(backButton)

    expect(mockGoBack).toHaveBeenCalled()
  })
})
