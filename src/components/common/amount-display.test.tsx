import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AmountDisplay, AmountWithFiat, formatAmount } from './amount-display'

describe('formatAmount', () => {
  it('formats zero correctly', () => {
    expect(formatAmount(0, 4, false)).toEqual({ formatted: '0', isNegative: false, isZero: true, numValue: 0 })
  })

  it('formats small numbers correctly', () => {
    // Small numbers are formatted with full precision
    expect(formatAmount(0.00001, 4, false).formatted).toBe('0')
    expect(formatAmount(0.00001, 8, false).formatted).toBe('0.00001')
  })

  it('formats negative numbers', () => {
    const result = formatAmount(-100, 2, false)
    expect(result.formatted).toBe('100')
    expect(result.isNegative).toBe(true)
  })

  it('formats large numbers with separators', () => {
    expect(formatAmount(1234567, 2, false).formatted).toBe('1,234,567')
  })

  it('formats compact millions', () => {
    expect(formatAmount(1500000, 2, true).formatted).toBe('1.5M')
  })

  it('formats compact billions', () => {
    expect(formatAmount(2500000000, 2, true).formatted).toBe('2.5B')
  })

  it('formats compact thousands', () => {
    expect(formatAmount(12500, 2, true).formatted).toBe('12.5K')
  })

  it('removes trailing zeros', () => {
    expect(formatAmount(100.5, 4, false).formatted).toBe('100.5')
    expect(formatAmount(100, 4, false).formatted).toBe('100')
  })

  it('handles string input', () => {
    expect(formatAmount('1234.56', 2, false).formatted).toBe('1,234.56')
  })

  it('handles invalid input', () => {
    expect(formatAmount('invalid', 2, false)).toEqual({ formatted: '0', isNegative: false, isZero: true, numValue: 0 })
  })
})

describe('AmountDisplay', () => {
  it('renders value', () => {
    render(<AmountDisplay value={100} />)
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders with symbol', () => {
    render(<AmountDisplay value={100} symbol="USDT" />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('USDT')).toBeInTheDocument()
  })

  it('shows hidden state', () => {
    render(<AmountDisplay value={100} symbol="USDT" hidden />)
    expect(screen.getByText('••••••')).toBeInTheDocument()
    expect(screen.queryByText('100')).not.toBeInTheDocument()
  })

  it('shows + sign when sign=always for positive', () => {
    render(<AmountDisplay value={100} sign="always" />)
    expect(screen.getByText('+100')).toBeInTheDocument()
  })

  it('shows - sign when sign=always for negative', () => {
    render(<AmountDisplay value={-100} sign="always" />)
    expect(screen.getByText('-100')).toBeInTheDocument()
  })

  it('shows - sign when sign=auto for negative', () => {
    render(<AmountDisplay value={-100} sign="auto" />)
    expect(screen.getByText('-100')).toBeInTheDocument()
  })

  it('applies positive color when color=auto', () => {
    render(<AmountDisplay value={100} color="auto" />)
    expect(screen.getByText('100')).toHaveClass('text-green-500')
  })

  it('applies negative color when color=auto', () => {
    render(<AmountDisplay value={-100} color="auto" />)
    expect(screen.getByText('100')).toHaveClass('text-destructive')
  })

  it('applies size classes', () => {
    render(<AmountDisplay value={100} size="lg" />)
    expect(screen.getByText('100')).toHaveClass('text-lg')
  })

  it('applies weight classes', () => {
    render(<AmountDisplay value={100} weight="bold" />)
    expect(screen.getByText('100')).toHaveClass('font-bold')
  })

  it('applies mono font', () => {
    render(<AmountDisplay value={100} mono />)
    expect(screen.getByText('100')).toHaveClass('font-mono')
  })

  it('uses compact format', () => {
    render(<AmountDisplay value={1500000} compact />)
    expect(screen.getByText('1.5M')).toBeInTheDocument()
  })
})

describe('AmountWithFiat', () => {
  it('renders amount and fiat value vertically', () => {
    render(<AmountWithFiat value={100} symbol="USDT" fiatValue={100} />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('≈ $100')).toBeInTheDocument()
  })

  it('renders amount and fiat value horizontally', () => {
    render(<AmountWithFiat value={100} fiatValue={100} layout="horizontal" />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('≈ $100')).toBeInTheDocument()
  })

  it('uses custom fiat symbol', () => {
    render(<AmountWithFiat value={100} fiatValue={800} fiatSymbol="¥" />)
    expect(screen.getByText('≈ ¥800')).toBeInTheDocument()
  })

  it('renders without fiat when not provided', () => {
    render(<AmountWithFiat value={100} />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.queryByText(/≈/)).not.toBeInTheDocument()
  })
})
