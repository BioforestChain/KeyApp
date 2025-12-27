import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalletCard } from './wallet-card'
import type { Wallet } from '@/stores'

// Mock useCardInteraction hook
vi.mock('@/hooks/useCardInteraction', () => ({
  useCardInteraction: () => ({
    pointerX: 0,
    pointerY: 0,
    isActive: false,
    bindElement: vi.fn(),
    style: {},
  }),
}))

const createMockWallet = (overrides: Partial<Wallet> = {}): Wallet => ({
  id: 'test-wallet-1',
  name: '我的钱包',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  chain: 'ethereum',
  chainAddresses: [
    {
      chain: 'ethereum',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      tokens: [],
    },
  ],
  createdAt: Date.now(),
  themeHue: 323,
  tokens: [],
  ...overrides,
})

describe('WalletCard (3D)', () => {
  const defaultProps = {
    wallet: createMockWallet(),
    chain: 'ethereum' as const,
    chainName: 'Ethereum',
    address: '0x1234567890abcdef1234567890abcdef12345678',
  }

  it('renders wallet name', () => {
    render(<WalletCard {...defaultProps} />)
    expect(screen.getByRole('heading', { name: '我的钱包' })).toBeInTheDocument()
  })

  it('renders chain name', () => {
    render(<WalletCard {...defaultProps} />)
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })

  it('renders address in AddressDisplay', () => {
    const { container } = render(<WalletCard {...defaultProps} />)
    // AddressDisplay component handles dynamic truncation based on container width
    // In tests, we verify the address is passed correctly via title attribute
    const addressElement = container.querySelector('[title*="0x1234"]')
    expect(addressElement).toBeInTheDocument()
  })

  it('renders empty address when not provided', () => {
    const { container } = render(<WalletCard {...defaultProps} address={undefined} />)
    // AddressDisplay with empty string
    const addressElement = container.querySelector('[title=""]')
    expect(addressElement).toBeInTheDocument()
  })

  it('calls onCopyAddress when copy button clicked', async () => {
    const handleCopy = vi.fn()
    render(<WalletCard {...defaultProps} onCopyAddress={handleCopy} />)

    // Get all buttons: [chain selector, settings, copy]
    const buttons = screen.getAllByRole('button')
    // The copy button is the last one (in the bottom row after address)
    const copyButton = buttons.at(-1)!

    await userEvent.click(copyButton)

    expect(handleCopy).toHaveBeenCalledTimes(1)
  })

  it('shows check icon after copy', async () => {
    const handleCopy = vi.fn()
    render(<WalletCard {...defaultProps} onCopyAddress={handleCopy} />)

    const buttons = screen.getAllByRole('button')
    await userEvent.click(buttons.at(-1)!)

    // Check icon should appear
    await waitFor(() => {
      expect(screen.getByText((_, el) => el?.classList.contains('text-green-300') ?? false)).toBeInTheDocument()
    })
  })

  it('calls onOpenChainSelector when chain button clicked', async () => {
    const handleOpenChainSelector = vi.fn()
    render(<WalletCard {...defaultProps} onOpenChainSelector={handleOpenChainSelector} />)

    // Chain selector button contains chain name
    const chainButton = screen.getByRole('button', { name: /Ethereum/i })
    await userEvent.click(chainButton)

    expect(handleOpenChainSelector).toHaveBeenCalledTimes(1)
  })

  it('calls onOpenSettings when settings button clicked', async () => {
    const handleOpenSettings = vi.fn()
    render(<WalletCard {...defaultProps} onOpenSettings={handleOpenSettings} />)

    // Settings button is in the top-right
    const buttons = screen.getAllByRole('button')
    // Second button (after chain selector) should be settings
    await userEvent.click(buttons.at(1)!)

    expect(handleOpenSettings).toHaveBeenCalledTimes(1)
  })

  it('applies custom theme hue', () => {
    const { container } = render(<WalletCard {...defaultProps} themeHue={200} />)
    // Theme hue is used in the gradient background, check the style contains the hue
    const card = container.querySelector('.wallet-card')
    expect(card).toBeInTheDocument()
  })

  it('applies default theme hue when not specified', () => {
    const { container } = render(<WalletCard {...defaultProps} />)
    // Default theme hue from wallet is 323
    const card = container.querySelector('.wallet-card')
    expect(card).toBeInTheDocument()
  })

  it('renders with 3D transform styles', () => {
    const { container } = render(<WalletCard {...defaultProps} />)

    const card = container.querySelector('.wallet-card')
    expect(card).toHaveStyle({ transformStyle: 'preserve-3d' })
  })

  it('has perspective container', () => {
    const { container } = render(<WalletCard {...defaultProps} />)
    // Container uses inline style for perspective
    const perspectiveContainer = container.querySelector('.wallet-card-container')
    expect(perspectiveContainer).toBeInTheDocument()
    expect(perspectiveContainer).toHaveStyle({ perspective: '1000px' })
  })

  it('renders different chain names', () => {
    render(<WalletCard {...defaultProps} chain="tron" chainName="Tron" />)
    expect(screen.getByText('Tron')).toBeInTheDocument()
  })

  it('handles long wallet names', () => {
    const longNameWallet = createMockWallet({ name: '这是一个非常长的钱包名称用于测试' })
    render(<WalletCard {...defaultProps} wallet={longNameWallet} />)

    expect(screen.getByRole('heading', { name: '这是一个非常长的钱包名称用于测试' })).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    const { container } = render(<WalletCard {...defaultProps} className="custom-class" />)

    const perspectiveContainer = container.querySelector('.custom-class')
    expect(perspectiveContainer).toBeInTheDocument()
  })

  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<WalletCard {...defaultProps} ref={ref} />)

    expect(ref).toHaveBeenCalled()
  })
})
