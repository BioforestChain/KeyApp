import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TokenItem, type TokenInfo } from './token-item'

const mockToken: TokenInfo = {
  symbol: 'USDT',
  name: 'Tether USD',
  balance: '1234.56',
  fiatValue: '1234.56',
  chain: 'ethereum',
  change24h: 2.5,
}

describe('TokenItem', () => {
  it('renders token symbol and name', () => {
    render(<TokenItem token={mockToken} />)
    expect(screen.getByText('USDT')).toBeInTheDocument()
    expect(screen.getByText('Tether USD')).toBeInTheDocument()
  })

  it('renders balance and fiat value', () => {
    render(<TokenItem token={mockToken} />)
    // AmountDisplay formats numbers - there are two instances (balance and fiat)
    expect(screen.getAllByText('1,234.56').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/≈ \$/)).toBeInTheDocument()
  })

  it('renders chain icon', () => {
    render(<TokenItem token={mockToken} />)
    expect(screen.getByLabelText('ETH')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<TokenItem token={mockToken} onClick={handleClick} />)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is keyboard accessible when clickable', async () => {
    const handleClick = vi.fn()
    render(<TokenItem token={mockToken} onClick={handleClick} />)
    
    const button = screen.getByRole('button')
    button.focus()
    await userEvent.keyboard('{Enter}')
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not have button role when not clickable', () => {
    render(<TokenItem token={mockToken} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('shows 24h change when showChange is true', () => {
    render(<TokenItem token={mockToken} showChange />)
    // AmountDisplay shows +2.5 (without trailing zeros)
    expect(screen.getByText('+2.5')).toBeInTheDocument()
    // % is in the same <p> as the fiat value
    expect(screen.getByText(/≈.*%/)).toBeInTheDocument()
  })

  it('shows negative change with correct color', () => {
    render(<TokenItem token={{ ...mockToken, change24h: -3.5 }} showChange />)
    const changeText = screen.getByText('-3.5')
    expect(changeText).toHaveClass('text-destructive')
  })

  it('shows positive change with correct color', () => {
    render(<TokenItem token={mockToken} showChange />)
    const changeText = screen.getByText('+2.5')
    expect(changeText).toHaveClass('text-secondary')
  })

  it('does not show change when showChange is false', () => {
    render(<TokenItem token={mockToken} showChange={false} />)
    expect(screen.queryByText('%')).not.toBeInTheDocument()
  })

  it('renders fallback icon when no icon provided', () => {
    render(<TokenItem token={mockToken} />)
    expect(screen.getByText('U')).toBeInTheDocument()
  })
})
