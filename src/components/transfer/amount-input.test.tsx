import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AmountInput, sanitizeInput, limitDecimals } from './amount-input'
import { TestI18nProvider } from '@/test/i18n-mock'
import { Amount } from '@/types/amount'

const renderWithI18n = (ui: React.ReactElement) => render(<TestI18nProvider>{ui}</TestI18nProvider>)

describe('sanitizeInput', () => {
  it('removes non-numeric characters', () => {
    expect(sanitizeInput('abc123')).toBe('123')
  })

  it('allows decimal point', () => {
    expect(sanitizeInput('123.45')).toBe('123.45')
  })

  it('keeps only one decimal point', () => {
    expect(sanitizeInput('123.45.67')).toBe('123.4567')
  })
})

describe('limitDecimals', () => {
  it('limits decimal places to specified number', () => {
    expect(limitDecimals('1.123456789012', 8)).toBe('1.12345678')
  })

  it('allows fewer decimals than limit', () => {
    expect(limitDecimals('1.12', 8)).toBe('1.12')
  })

  it('handles no decimals', () => {
    expect(limitDecimals('100', 8)).toBe('100')
  })
})

describe('AmountInput', () => {
  const createBalance = (value: string, decimals = 18, symbol = 'ETH') =>
    Amount.fromFormatted(value, decimals, symbol)

  it('renders with label', () => {
    renderWithI18n(<AmountInput label="转账金额" decimals={18} />)
    expect(screen.getByText('转账金额')).toBeInTheDocument()
  })

  it('renders with symbol', () => {
    renderWithI18n(<AmountInput symbol="USDT" decimals={18} />)
    expect(screen.getByText('USDT')).toBeInTheDocument()
  })

  it('shows balance when provided', () => {
    const balance = createBalance('2.5')
    renderWithI18n(<AmountInput label="金额" balance={balance} />)
    expect(screen.getByText(/余额: 2.5 ETH/)).toBeInTheDocument()
  })

  it('calls onChange with Amount when typing valid number', async () => {
    const handleChange = vi.fn()
    renderWithI18n(<AmountInput onChange={handleChange} decimals={18} />)
    
    const input = screen.getByPlaceholderText('0')
    await userEvent.type(input, '100')
    
    expect(handleChange).toHaveBeenCalled()
    // Last call should have Amount with value 100
    const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1]![0] as Amount
    expect(lastCall?.toFormatted()).toBe('100')
  })

  it('calls onChange with null for incomplete input', async () => {
    const handleChange = vi.fn()
    renderWithI18n(<AmountInput onChange={handleChange} decimals={18} />)
    
    const input = screen.getByPlaceholderText('0')
    await userEvent.type(input, '.')
    
    // Single dot is not a valid amount
    const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1]![0]
    expect(lastCall).toBeNull()
  })

  it('shows MAX button when balance is provided', () => {
    const balance = createBalance('1000')
    renderWithI18n(<AmountInput balance={balance} />)
    expect(screen.getByRole('button', { name: 'MAX' })).toBeInTheDocument()
  })

  it('sets max value when MAX button clicked', async () => {
    const handleChange = vi.fn()
    const balance = createBalance('1000')
    renderWithI18n(<AmountInput balance={balance} onChange={handleChange} />)
    
    await userEvent.click(screen.getByRole('button', { name: 'MAX' }))
    
    const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1]![0] as Amount
    expect(lastCall.toFormatted()).toBe('1000')
  })

  it('shows fiat value when provided and input has value', async () => {
    renderWithI18n(<AmountInput decimals={18} fiatValue="100.00" />)
    
    // First type something to show fiat value
    const input = screen.getByPlaceholderText('0')
    await userEvent.type(input, '100')
    
    expect(screen.getByText(/≈ \$100.00/)).toBeInTheDocument()
  })

  it('shows custom fiat symbol', async () => {
    renderWithI18n(<AmountInput decimals={18} fiatValue="800" fiatSymbol="¥" />)
    
    const input = screen.getByPlaceholderText('0')
    await userEvent.type(input, '100')
    
    expect(screen.getByText(/≈ ¥800/)).toBeInTheDocument()
  })

  it('shows error when value exceeds max', () => {
    const value = Amount.fromFormatted('5000', 18, 'ETH')
    const max = Amount.fromFormatted('1000', 18, 'ETH')
    renderWithI18n(<AmountInput value={value} max={max} />)
    expect(screen.getByText('超出可用余额')).toBeInTheDocument()
  })

  it('shows custom error message', () => {
    renderWithI18n(<AmountInput error="最小金额为 10" decimals={18} />)
    expect(screen.getByText('最小金额为 10')).toBeInTheDocument()
  })

  it('disables input when disabled', () => {
    renderWithI18n(<AmountInput disabled decimals={18} />)
    expect(screen.getByPlaceholderText('0')).toBeDisabled()
  })

  it('hides MAX button when disabled', () => {
    const balance = createBalance('1000')
    renderWithI18n(<AmountInput balance={balance} disabled />)
    expect(screen.queryByRole('button', { name: 'MAX' })).not.toBeInTheDocument()
  })

  it('derives decimals from balance', async () => {
    const handleChange = vi.fn()
    const balance = Amount.fromFormatted('100', 6, 'USDT') // 6 decimals like USDT
    renderWithI18n(<AmountInput balance={balance} onChange={handleChange} />)
    
    const input = screen.getByPlaceholderText('0')
    await userEvent.type(input, '1.1234567890') // More than 6 decimals
    
    // Should be limited to 6 decimals
    expect(input).toHaveValue('1.123456')
  })
})
