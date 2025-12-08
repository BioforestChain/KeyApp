import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BalanceDisplay, formatNumber } from './balance-display'

describe('formatNumber', () => {
  it('formats zero correctly', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber('0')).toBe('0')
  })

  it('formats small numbers with < prefix', () => {
    expect(formatNumber(0.00001)).toBe('< 0.0001')
  })

  it('formats large numbers with separator', () => {
    expect(formatNumber(1500000)).toContain('1,500,000')
  })

  it('formats thousands with locale separator', () => {
    expect(formatNumber(12345.67)).toContain('12')
  })

  it('removes trailing zeros', () => {
    expect(formatNumber(100)).toBe('100')
    expect(formatNumber(100.5)).toBe('100.5')
  })

  it('handles string input', () => {
    expect(formatNumber('1234.5678')).toBe('1,234.5678')
  })

  it('handles invalid input', () => {
    expect(formatNumber('invalid')).toBe('0')
  })
})

describe('BalanceDisplay', () => {
  it('renders value with symbol', () => {
    render(<BalanceDisplay value="100" symbol="USDT" />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('USDT')).toBeInTheDocument()
  })

  it('renders fiat value when provided', () => {
    render(<BalanceDisplay value="100" fiatValue="100" />)
    expect(screen.getByText(/≈ \$100/)).toBeInTheDocument()
  })

  it('uses custom fiat symbol', () => {
    render(<BalanceDisplay value="100" fiatValue="100" fiatSymbol="¥" />)
    expect(screen.getByText(/≈ ¥100/)).toBeInTheDocument()
  })

  it('shows hidden state', () => {
    render(<BalanceDisplay value="100" symbol="USDT" fiatValue="100" hidden />)
    expect(screen.getByText('••••••')).toBeInTheDocument()
    expect(screen.queryByText('100')).not.toBeInTheDocument()
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<BalanceDisplay value="100" size="sm" />)
    expect(screen.getByText('100')).toHaveClass('text-sm')

    rerender(<BalanceDisplay value="100" size="md" />)
    expect(screen.getByText('100')).toHaveClass('text-base')
  })

  it('renders without fiat when not provided', () => {
    render(<BalanceDisplay value="100" symbol="BTC" />)
    expect(screen.queryByText(/≈/)).not.toBeInTheDocument()
  })
})
