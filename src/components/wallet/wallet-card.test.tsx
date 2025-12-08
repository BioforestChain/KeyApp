import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalletCard, type WalletInfo } from './wallet-card'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
})

const mockWallet: WalletInfo = {
  id: '1',
  name: '我的钱包',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  balance: '1,234.56 USDT',
  fiatValue: '1,234.56',
  chainName: 'Ethereum',
  isBackedUp: true,
}

describe('WalletCard', () => {
  it('renders wallet name', () => {
    render(<WalletCard wallet={mockWallet} />)
    expect(screen.getByRole('heading', { name: '我的钱包' })).toBeInTheDocument()
  })

  it('renders wallet balance', () => {
    render(<WalletCard wallet={mockWallet} />)
    expect(screen.getByText('1,234.56 USDT')).toBeInTheDocument()
  })

  it('renders fiat value when provided', () => {
    render(<WalletCard wallet={mockWallet} />)
    expect(screen.getByText('≈ $1,234.56')).toBeInTheDocument()
  })

  it('renders chain name when provided', () => {
    render(<WalletCard wallet={mockWallet} />)
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })

  it('shows backup warning when isBackedUp is false', () => {
    render(<WalletCard wallet={{ ...mockWallet, isBackedUp: false }} />)
    expect(screen.getByText('未备份')).toBeInTheDocument()
  })

  it('does not show backup warning when isBackedUp is true', () => {
    render(<WalletCard wallet={mockWallet} />)
    expect(screen.queryByText('未备份')).not.toBeInTheDocument()
  })

  it('calls onCopyAddress when address is clicked', async () => {
    const handleCopy = vi.fn()
    render(<WalletCard wallet={mockWallet} onCopyAddress={handleCopy} />)
    
    // AddressDisplay uses aria-label with full address
    const addressButton = screen.getByRole('button', { name: /复制.*0x1234/i })
    await userEvent.click(addressButton)
    expect(handleCopy).toHaveBeenCalledTimes(1)
  })

  it('renders transfer button when onTransfer is provided', () => {
    render(<WalletCard wallet={mockWallet} onTransfer={() => {}} />)
    expect(screen.getByRole('button', { name: '转账' })).toBeInTheDocument()
  })

  it('renders receive button when onReceive is provided', () => {
    render(<WalletCard wallet={mockWallet} onReceive={() => {}} />)
    expect(screen.getByRole('button', { name: '收款' })).toBeInTheDocument()
  })

  it('calls onTransfer when transfer button is clicked', async () => {
    const handleTransfer = vi.fn()
    render(<WalletCard wallet={mockWallet} onTransfer={handleTransfer} />)
    
    await userEvent.click(screen.getByRole('button', { name: '转账' }))
    expect(handleTransfer).toHaveBeenCalledTimes(1)
  })

  it('calls onReceive when receive button is clicked', async () => {
    const handleReceive = vi.fn()
    render(<WalletCard wallet={mockWallet} onReceive={handleReceive} />)
    
    await userEvent.click(screen.getByRole('button', { name: '收款' }))
    expect(handleReceive).toHaveBeenCalledTimes(1)
  })

  it('does not render action buttons when handlers are not provided', () => {
    render(<WalletCard wallet={mockWallet} />)
    expect(screen.queryByRole('button', { name: '转账' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '收款' })).not.toBeInTheDocument()
  })
})
