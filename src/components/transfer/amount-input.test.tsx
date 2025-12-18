import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AmountInput, formatInputValue } from './amount-input'
import { TestI18nProvider } from '@/test/i18n-mock'

const renderWithI18n = (ui: React.ReactElement) => render(<TestI18nProvider>{ui}</TestI18nProvider>)

describe('formatInputValue', () => {
  it('removes non-numeric characters', () => {
    expect(formatInputValue('abc123')).toBe('123')
  })

  it('allows decimal point', () => {
    expect(formatInputValue('123.45')).toBe('123.45')
  })

  it('keeps only one decimal point', () => {
    expect(formatInputValue('123.45.67')).toBe('123.4567')
  })

  it('limits decimal places to 8', () => {
    expect(formatInputValue('1.123456789012')).toBe('1.12345678')
  })
})

describe('AmountInput', () => {
  it('renders with label', () => {
    renderWithI18n(<AmountInput label="转账金额" />)
    expect(screen.getByText('转账金额')).toBeInTheDocument()
  })

  it('renders with symbol', () => {
    renderWithI18n(<AmountInput symbol="USDT" />)
    expect(screen.getByText('USDT')).toBeInTheDocument()
  })

  it('shows balance when provided', () => {
    renderWithI18n(<AmountInput label="金额" symbol="ETH" balance="2.5" />)
    expect(screen.getByText(/余额: 2.5 ETH/)).toBeInTheDocument()
  })

  it('calls onChange when typing', async () => {
    const handleChange = vi.fn()
    renderWithI18n(<AmountInput onChange={handleChange} />)
    
    const input = screen.getByPlaceholderText('0')
    await userEvent.type(input, '100')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('shows MAX button when balance is provided', () => {
    renderWithI18n(<AmountInput balance="1000" />)
    expect(screen.getByRole('button', { name: 'MAX' })).toBeInTheDocument()
  })

  it('sets max value when MAX button clicked', async () => {
    const handleChange = vi.fn()
    renderWithI18n(<AmountInput balance="1000" max="1000" onChange={handleChange} />)
    
    await userEvent.click(screen.getByRole('button', { name: 'MAX' }))
    expect(handleChange).toHaveBeenCalledWith('1000')
  })

  it('shows fiat value when provided', () => {
    renderWithI18n(<AmountInput value="100" fiatValue="100.00" />)
    expect(screen.getByText(/≈ \$100.00/)).toBeInTheDocument()
  })

  it('shows custom fiat symbol', () => {
    renderWithI18n(<AmountInput value="100" fiatValue="800" fiatSymbol="¥" />)
    expect(screen.getByText(/≈ ¥800/)).toBeInTheDocument()
  })

  it('shows error when value exceeds max', () => {
    renderWithI18n(<AmountInput value="5000" max="1000" />)
    expect(screen.getByText('超出可用余额')).toBeInTheDocument()
  })

  it('shows custom error message', () => {
    renderWithI18n(<AmountInput error="最小金额为 10" />)
    expect(screen.getByText('最小金额为 10')).toBeInTheDocument()
  })

  it('disables input when disabled', () => {
    renderWithI18n(<AmountInput disabled />)
    expect(screen.getByPlaceholderText('0')).toBeDisabled()
  })

  it('hides MAX button when disabled', () => {
    renderWithI18n(<AmountInput balance="1000" disabled />)
    expect(screen.queryByRole('button', { name: 'MAX' })).not.toBeInTheDocument()
  })
})
