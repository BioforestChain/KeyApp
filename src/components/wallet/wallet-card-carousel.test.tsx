import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalletCardCarousel } from './wallet-card-carousel'
import type { Wallet } from '@/stores'

// Mock Swiper
vi.mock('swiper/react', () => ({
  Swiper: ({ children, onSlideChange, onSwiper }: any) => {
    const mockSwiper = { activeIndex: 0, slideTo: vi.fn() }
    onSwiper?.(mockSwiper)
    return (
      <div data-testid="swiper-container">
        {children}
        <button
          data-testid="next-slide"
          onClick={() => {
            mockSwiper.activeIndex = 1
            onSlideChange?.(mockSwiper)
          }}
        >
          Next
        </button>
      </div>
    )
  },
  SwiperSlide: ({ children }: any) => <div data-testid="swiper-slide">{children}</div>,
}))

vi.mock('swiper/modules', () => ({
  EffectCards: {},
  Pagination: {},
}))

vi.mock('swiper/css', () => ({}))
vi.mock('swiper/css/effect-cards', () => ({}))
vi.mock('swiper/css/pagination', () => ({}))

// Mock WalletCard
vi.mock('./wallet-card', () => ({
  WalletCard: ({ wallet, chainName, onCopyAddress }: any) => (
    <div data-testid={`wallet-card-${wallet.id}`}>
      <span>{wallet.name}</span>
      <span>{chainName}</span>
      <button onClick={onCopyAddress}>Copy</button>
    </div>
  ),
}))

// Mock useWalletTheme
vi.mock('@/hooks/useWalletTheme', () => ({
  useWalletTheme: () => ({
    getWalletTheme: () => 323,
  }),
}))

const createMockWallet = (id: string, name: string): Wallet => ({
  id,
  name,
  address: `0x${id}`,
  chain: 'ethereum',
  chainAddresses: [
    {
      chain: 'ethereum',
      address: `0x${id}`,
      publicKey: `0x04${id}`,
      tokens: [],
    },
  ],
  createdAt: Date.now(),
  themeHue: 323,
  tokens: [],
})

describe('WalletCardCarousel', () => {
  const mockWallets = [
    createMockWallet('wallet-1', '钱包一'),
    createMockWallet('wallet-2', '钱包二'),
    createMockWallet('wallet-3', '钱包三'),
  ]

  const defaultProps = {
    wallets: mockWallets,
    currentWalletId: 'wallet-1',
    selectedChain: 'ethereum' as const,
    chainNames: { ethereum: 'Ethereum', tron: 'Tron' },
  }

  it('renders all wallet cards', () => {
    render(<WalletCardCarousel {...defaultProps} />)

    expect(screen.getByTestId('wallet-card-wallet-1')).toBeInTheDocument()
    expect(screen.getByTestId('wallet-card-wallet-2')).toBeInTheDocument()
    expect(screen.getByTestId('wallet-card-wallet-3')).toBeInTheDocument()
  })

  it('renders swiper container', () => {
    render(<WalletCardCarousel {...defaultProps} />)
    expect(screen.getByTestId('swiper-container')).toBeInTheDocument()
  })

  it('renders wallet count button when multiple wallets', () => {
    render(<WalletCardCarousel {...defaultProps} />)
    expect(screen.getByText('3 个钱包')).toBeInTheDocument()
  })

  it('does not render wallet count for single wallet', () => {
    render(<WalletCardCarousel {...defaultProps} wallets={[mockWallets.at(0)!]} />)
    expect(screen.queryByText(/个钱包/)).not.toBeInTheDocument()
  })

  it('calls onWalletChange when slide changes', async () => {
    const handleWalletChange = vi.fn()
    render(<WalletCardCarousel {...defaultProps} onWalletChange={handleWalletChange} />)

    const nextButton = screen.getByTestId('next-slide')
    await userEvent.click(nextButton)

    expect(handleWalletChange).toHaveBeenCalledWith('wallet-2')
  })

  it('calls onCopyAddress with correct address', async () => {
    const handleCopyAddress = vi.fn()
    render(<WalletCardCarousel {...defaultProps} onCopyAddress={handleCopyAddress} />)

    const copyButtons = screen.getAllByRole('button', { name: 'Copy' })
    await userEvent.click(copyButtons.at(0)!)

    expect(handleCopyAddress).toHaveBeenCalledWith('0xwallet-1')
  })

  it('calls onOpenWalletList when wallet count clicked', async () => {
    const handleOpenWalletList = vi.fn()
    render(<WalletCardCarousel {...defaultProps} onOpenWalletList={handleOpenWalletList} />)

    const walletListButton = screen.getByText('3 个钱包').closest('button')!
    await userEvent.click(walletListButton)

    expect(handleOpenWalletList).toHaveBeenCalledTimes(1)
  })

  it('returns null when wallets array is empty', () => {
    const { container } = render(<WalletCardCarousel {...defaultProps} wallets={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('passes chain name to wallet cards', () => {
    render(<WalletCardCarousel {...defaultProps} />)
    expect(screen.getAllByText('Ethereum')).toHaveLength(3)
  })

  it('renders slides for each wallet', () => {
    render(<WalletCardCarousel {...defaultProps} />)
    const slides = screen.getAllByTestId('swiper-slide')
    expect(slides).toHaveLength(3)
  })

  it('applies custom className', () => {
    const { container } = render(<WalletCardCarousel {...defaultProps} className="custom-carousel" />)
    expect(container.querySelector('.custom-carousel')).toBeInTheDocument()
  })

  it('uses address from chainAddresses when available', () => {
    const baseWallet = mockWallets.at(0)!
    const walletWithMultiChain: Wallet = {
      ...baseWallet,
      chainAddresses: [
        { chain: 'ethereum', address: '0xETH-ADDRESS', publicKey: '0x04eth', tokens: [] },
        { chain: 'tron', address: 'TRON-ADDRESS', publicKey: '0x04tron', tokens: [] },
      ],
    }

    const handleCopy = vi.fn()
    render(
      <WalletCardCarousel
        {...defaultProps}
        wallets={[walletWithMultiChain]}
        selectedChain="tron"
        chainPreferences={{ [walletWithMultiChain.id]: 'tron' }}
        onCopyAddress={handleCopy}
      />
    )

    const copyButton = screen.getByRole('button', { name: 'Copy' })
    fireEvent.click(copyButton)

    expect(handleCopy).toHaveBeenCalledWith('TRON-ADDRESS')
  })
})
