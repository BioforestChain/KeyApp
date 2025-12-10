import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WalletListPage } from './list'
import { walletStore, walletActions, type Wallet } from '@/stores'

// Mock dependencies
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock('@/components/layout/page-header', () => ({
  PageHeader: ({ title, onBack, trailing }: { title: string; onBack?: () => void; trailing?: React.ReactNode }) => (
    <div data-testid="page-header">
      <span>{title}</span>
      {onBack && <button onClick={onBack} data-testid="back-button">返回</button>}
      {trailing}
    </div>
  ),
}))

const mockNavigate = vi.fn()

const createMockWallet = (id: string, name: string, isActive: boolean = false): Wallet => ({
  id,
  name,
  address: `0x${id}abc123def456`,
  encryptedMnemonic: {
    ciphertext: 'test',
    iv: 'test',
    salt: 'test',
    iterations: 100000,
  },
  chainAddresses: [
    {
      chainId: 'eth-mainnet',
      address: `0x${id}abc123def456`,
      tokens: [
        { symbol: 'ETH', balance: '1.5', fiatValue: 3000, decimals: 18, contractAddress: null },
        { symbol: 'USDT', balance: '500', fiatValue: 500, decimals: 6, contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
      ],
    },
  ],
  createdAt: Date.now(),
})

describe('WalletListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store to empty state
    walletStore.setState({
      wallets: [],
      currentWalletId: null,
      isInitialized: true,
    })
  })

  it('renders empty state when no wallets', () => {
    render(<WalletListPage />)

    expect(screen.getByText('还没有钱包')).toBeInTheDocument()
    // Both header and empty state have create buttons
    const createButtons = screen.getAllByRole('button', { name: '创建钱包' })
    expect(createButtons.length).toBe(2) // Header + empty state
  })

  it('renders wallet list when wallets exist', () => {
    const wallet1 = createMockWallet('1', 'Main Wallet')
    const wallet2 = createMockWallet('2', 'Trading Wallet')

    walletStore.setState({
      wallets: [wallet1, wallet2],
      currentWalletId: '1',
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
      isInitialized: true,
    })

    const setCurrentWalletSpy = vi.spyOn(walletActions, 'setCurrentWallet')

    render(<WalletListPage />)

    // Click on the second wallet's avatar (first letter button)
    const walletAvatars = screen.getAllByRole('button', { name: /^[A-Z]$/i })
    fireEvent.click(walletAvatars[1]) // Click second wallet avatar

    expect(setCurrentWalletSpy).toHaveBeenCalledWith('2')
  })

  it('navigates to wallet detail', () => {
    const wallet1 = createMockWallet('1', 'Main Wallet')

    walletStore.setState({
      wallets: [wallet1],
      currentWalletId: '1',
      isInitialized: true,
    })

    render(<WalletListPage />)

    // Click detail button (chevron right)
    const detailButton = screen.getByRole('button', { name: '查看详情' })
    fireEvent.click(detailButton)

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/wallet/$walletId', params: { walletId: '1' } })
  })

  it('navigates to create wallet page from empty state', () => {
    walletStore.setState({
      wallets: [],
      currentWalletId: null,
      isInitialized: true,
    })

    render(<WalletListPage />)

    // Click create button in empty state (text button, not icon button)
    const createButtons = screen.getAllByRole('button', { name: '创建钱包' })
    // The second one is the text button in empty state
    fireEvent.click(createButtons[1])

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/onboarding/create' })
  })

  it('calculates total balance correctly', () => {
    const wallet = createMockWallet('1', 'Main Wallet')
    // wallet has ETH (3000) + USDT (500) = 3500 total

    walletStore.setState({
      wallets: [wallet],
      currentWalletId: '1',
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

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })
})
