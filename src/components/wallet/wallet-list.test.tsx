import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestI18nProvider } from '@/test/i18n-mock'
import { WalletList, type WalletListItem } from './wallet-list'

const renderWithI18n = (ui: React.ReactElement) => render(<TestI18nProvider>{ui}</TestI18nProvider>)

const mockWallets: WalletListItem[] = [
  { id: 'wallet-1', name: '主钱包', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f00000', themeHue: 323 },
  { id: 'wallet-2', name: '交易账户', address: '0xA1B2C3D4E5F6789012345678901234567890ABCD', themeHue: 250 },
  { id: 'wallet-3', name: '储蓄', address: '0xDEADBEEF1234567890ABCDEF1234567890ABCDEF', themeHue: 145 },
]

describe('WalletList', () => {
  it('renders all wallets', () => {
    renderWithI18n(<WalletList wallets={mockWallets} />)

    expect(screen.getByText('主钱包')).toBeInTheDocument()
    expect(screen.getByText('交易账户')).toBeInTheDocument()
    expect(screen.getByText('储蓄')).toBeInTheDocument()
  })

  it('shows truncated addresses', () => {
    renderWithI18n(<WalletList wallets={mockWallets} />)

    expect(screen.getByText('0x742d...0000')).toBeInTheDocument()
    expect(screen.getByText('0xA1B2...ABCD')).toBeInTheDocument()
  })

  it('shows empty address as ---', () => {
    const walletsWithEmptyAddress: WalletListItem[] = [
      { id: 'wallet-1', name: '空地址钱包', address: '', themeHue: 323 },
    ]
    renderWithI18n(<WalletList wallets={walletsWithEmptyAddress} />)

    expect(screen.getByText('---')).toBeInTheDocument()
  })

  it('highlights current wallet with check icon', () => {
    renderWithI18n(<WalletList wallets={mockWallets} currentWalletId="wallet-1" />)

    const wallet1Button = screen.getByRole('option', { name: /主钱包/ })
    expect(wallet1Button).toHaveAttribute('aria-selected', 'true')
    expect(wallet1Button).toHaveClass('ring-2', 'ring-primary')
  })

  it('calls onSelect when wallet is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    renderWithI18n(<WalletList wallets={mockWallets} onSelect={onSelect} />)

    await user.click(screen.getByText('交易账户'))
    expect(onSelect).toHaveBeenCalledWith('wallet-2')
  })

  it('renders add wallet button by default', () => {
    renderWithI18n(<WalletList wallets={mockWallets} />)

    expect(screen.getByRole('button', { name: /添加钱包|add/i })).toBeInTheDocument()
  })

  it('calls onAddWallet when add button is clicked', async () => {
    const user = userEvent.setup()
    const onAddWallet = vi.fn()

    renderWithI18n(<WalletList wallets={mockWallets} onAddWallet={onAddWallet} />)

    await user.click(screen.getByRole('button', { name: /添加钱包|add/i }))
    expect(onAddWallet).toHaveBeenCalled()
  })

  it('hides add button when showAddButton is false', () => {
    renderWithI18n(<WalletList wallets={mockWallets} showAddButton={false} />)

    expect(screen.queryByRole('button', { name: /添加钱包|add/i })).not.toBeInTheDocument()
  })

  it('shows empty state when no wallets and showAddButton is false', () => {
    renderWithI18n(<WalletList wallets={[]} showAddButton={false} />)

    expect(screen.getByText(/暂无钱包|no wallet/i)).toBeInTheDocument()
  })

  it('shows only add button when no wallets but showAddButton is true', () => {
    renderWithI18n(<WalletList wallets={[]} showAddButton={true} />)

    expect(screen.getByRole('button', { name: /添加钱包|add/i })).toBeInTheDocument()
    expect(screen.queryByText(/暂无钱包|no wallet/i)).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    renderWithI18n(<WalletList wallets={mockWallets} className="custom-class" />)

    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveClass('custom-class')
  })

  it('renders WalletMiniCard for each wallet', () => {
    renderWithI18n(<WalletList wallets={mockWallets} />)

    const cards = screen.getAllByRole('img', { name: 'wallet card' })
    expect(cards).toHaveLength(3)
  })

  it('does not highlight any wallet when currentWalletId is null', () => {
    renderWithI18n(<WalletList wallets={mockWallets} currentWalletId={null} />)

    const options = screen.getAllByRole('option')
    options.forEach((option) => {
      expect(option).toHaveAttribute('aria-selected', 'false')
    })
  })
})
