import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalletListSheet } from './wallet-list-sheet'
import type { Wallet } from '@/stores'

// Mock useWalletTheme
vi.mock('@/hooks/useWalletTheme', () => ({
  useWalletTheme: () => ({
    themeHue: 323,
    presets: {
      purple: 323,
      blue: 250,
      cyan: 200,
      green: 145,
      yellow: 85,
      orange: 45,
      red: 25,
      pink: 350,
      magenta: 310,
    },
    getWalletTheme: (id: string) => (id === 'wallet-1' ? 323 : 200),
    setThemeColor: vi.fn(),
    setThemePreset: vi.fn(),
  }),
  WALLET_THEME_PRESETS: {
    purple: 323,
    blue: 250,
    cyan: 200,
    green: 145,
    yellow: 85,
    orange: 45,
    red: 25,
    pink: 350,
    magenta: 310,
  },
}))

const createMockWallet = (id: string, name: string, balance = 1000): Wallet => ({
  id,
  name,
  address: `0x${id}`,
  chain: 'ethereum',
  chainAddresses: [
    {
      chain: 'ethereum',
      address: `0x${id}`,
      tokens: [{ id: 't1', symbol: 'USDT', name: 'Tether', balance: '1000', fiatValue: balance, change24h: 0, decimals: 6, chain: 'ethereum' }],
    },
  ],
  createdAt: Date.now(),
  tokens: [],
})

describe('WalletListSheet', () => {
  const mockWallets = [
    createMockWallet('wallet-1', '钱包一', 1234.56),
    createMockWallet('wallet-2', '钱包二', 5678.90),
    createMockWallet('wallet-3', '钱包三', 0),
  ]

  const defaultProps = {
    wallets: mockWallets,
    currentWalletId: 'wallet-1',
    onSelectWallet: vi.fn(),
    onAddWallet: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title', () => {
    render(<WalletListSheet {...defaultProps} />)
    expect(screen.getByRole('heading', { name: '我的钱包' })).toBeInTheDocument()
  })

  it('renders add button', () => {
    render(<WalletListSheet {...defaultProps} />)
    expect(screen.getByRole('button', { name: /添加/i })).toBeInTheDocument()
  })

  it('renders all wallets', () => {
    render(<WalletListSheet {...defaultProps} />)
    expect(screen.getByText('钱包一')).toBeInTheDocument()
    expect(screen.getByText('钱包二')).toBeInTheDocument()
    expect(screen.getByText('钱包三')).toBeInTheDocument()
  })

  it('shows current wallet indicator', () => {
    render(<WalletListSheet {...defaultProps} />)
    expect(screen.getByText('当前')).toBeInTheDocument()
  })

  it('displays wallet balances', () => {
    render(<WalletListSheet {...defaultProps} />)
    expect(screen.getByText('$1,234.56')).toBeInTheDocument()
    expect(screen.getByText('$5,678.90')).toBeInTheDocument()
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })

  it('calls onSelectWallet when wallet clicked', async () => {
    const handleSelect = vi.fn()
    render(<WalletListSheet {...defaultProps} onSelectWallet={handleSelect} />)

    const wallet2 = screen.getByText('钱包二')
    await userEvent.click(wallet2)

    expect(handleSelect).toHaveBeenCalledWith('wallet-2')
  })

  it('calls onAddWallet when add button clicked', async () => {
    const handleAdd = vi.fn()
    render(<WalletListSheet {...defaultProps} onAddWallet={handleAdd} />)

    const addButton = screen.getByRole('button', { name: /添加/i })
    await userEvent.click(addButton)

    expect(handleAdd).toHaveBeenCalledTimes(1)
  })

  it('renders empty state when no wallets', () => {
    render(<WalletListSheet {...defaultProps} wallets={[]} currentWalletId={null} />)
    expect(screen.getByText('暂无钱包')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '创建钱包' })).toBeInTheDocument()
  })

  it('calls onAddWallet from empty state button', async () => {
    const handleAdd = vi.fn()
    render(<WalletListSheet {...defaultProps} wallets={[]} currentWalletId={null} onAddWallet={handleAdd} />)

    const createButton = screen.getByRole('button', { name: '创建钱包' })
    await userEvent.click(createButton)

    expect(handleAdd).toHaveBeenCalledTimes(1)
  })

  it('renders theme color buttons', async () => {
    render(<WalletListSheet {...defaultProps} />)

    // Click palette button to show theme picker
    const paletteButtons = screen.getAllByRole('button', { name: '更改主题色' })
    await userEvent.click(paletteButtons[0])

    // Should show color options (10 presets)
    const colorButtons = screen.getAllByRole('button').filter((btn) =>
      btn.getAttribute('aria-label')?.match(/purple|blue|cyan|green|yellow|orange|red|pink|ocean|forest/)
    )
    expect(colorButtons.length).toBeGreaterThan(0)
  })

  it('renders wallet avatar with first letter', () => {
    render(<WalletListSheet {...defaultProps} />)

    // Each wallet should have an avatar with first letter
    const avatars = screen.getAllByText('钱')
    expect(avatars.length).toBe(3)
  })

  it('renders drag handles', () => {
    render(<WalletListSheet {...defaultProps} />)

    const dragHandles = screen.getAllByRole('button', { name: '拖拽排序' })
    expect(dragHandles).toHaveLength(3)
  })

  it('applies custom className', () => {
    const { container } = render(<WalletListSheet {...defaultProps} className="custom-sheet" />)
    expect(container.querySelector('.custom-sheet')).toBeInTheDocument()
  })

  it('highlights current wallet differently', () => {
    const { container } = render(<WalletListSheet {...defaultProps} />)

    // Current wallet should have a different background
    const currentWalletItem = container.querySelector('[class*="bg-primary"]')
    expect(currentWalletItem).toBeInTheDocument()
  })
})
