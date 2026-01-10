import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TokenList } from './token-list'
import type { TokenInfo } from './token-item'

const mockTokens: TokenInfo[] = [
  { symbol: 'USDT', name: 'Tether', balance: '100', chain: 'ethereum' },
  { symbol: 'ETH', name: 'Ethereum', balance: '2', chain: 'ethereum' },
]

describe('TokenList', () => {
  it('renders all tokens', () => {
    render(<TokenList tokens={mockTokens} />)
    expect(screen.getByText('USDT')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
  })

  it('shows loading skeleton', () => {
    const { container } = render(<TokenList tokens={[]} loading />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('shows empty state when no tokens', () => {
    render(<TokenList tokens={[]} />)
    expect(screen.getByText('暂无资产')).toBeInTheDocument()
  })

  it('shows custom empty message', () => {
    render(
      <TokenList 
        tokens={[]} 
        emptyTitle="No tokens" 
        emptyDescription="Add some tokens" 
      />
    )
    expect(screen.getByText('No tokens')).toBeInTheDocument()
    expect(screen.getByText('Add some tokens')).toBeInTheDocument()
  })

  it('renders empty action', () => {
    render(
      <TokenList 
        tokens={[]} 
        emptyAction={<button>Add Token</button>} 
      />
    )
    expect(screen.getByRole('button', { name: 'Add Token' })).toBeInTheDocument()
  })

  it('calls onTokenClick when token is clicked', async () => {
    const handleClick = vi.fn()
    render(<TokenList tokens={mockTokens} onTokenClick={handleClick} />)
    
    // Item component uses data-slot="item" instead of role="button"
    await userEvent.click(screen.getByText('USDT').closest('[data-slot="item"]')!)
    expect(handleClick).toHaveBeenCalledWith(mockTokens[0])
  })

  it('passes showChange to TokenItem', () => {
    const tokensWithChange: TokenInfo[] = [
      { ...mockTokens[0]!, fiatValue: '100', change24h: 5.5 },
    ]
    render(<TokenList tokens={tokensWithChange} showChange />)
    // Auto mode renders text in multiple places, use aria-label to find the element
    expect(screen.getByRole('text', { name: '+5.5' })).toBeInTheDocument()
    expect(screen.getByText(/≈.*%/)).toBeInTheDocument()
  })

  it('does not show change when showChange is false', () => {
    const tokensWithChange: TokenInfo[] = [
      { ...mockTokens[0]!, fiatValue: '100', change24h: 5.5 },
    ]
    render(<TokenList tokens={tokensWithChange} showChange={false} />)
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })
})
