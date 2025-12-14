import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BalanceWarning } from './BalanceWarning'
import { TestI18nProvider } from '@/test/i18n-mock'

function renderWithI18n(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('BalanceWarning', () => {
  it('renders insufficient balance message', () => {
    renderWithI18n(
      <BalanceWarning
        balance="1.0"
        required="1.502"
        symbol="ETH"
      />
    )

    expect(screen.getByText(/余额不足|Insufficient balance/i)).toBeInTheDocument()
  })

  it('renders required amount', () => {
    renderWithI18n(
      <BalanceWarning
        balance="1.0"
        required="1.502"
        symbol="ETH"
      />
    )

    expect(screen.getByText(/1\.502.*ETH/)).toBeInTheDocument()
  })

  it('renders current balance', () => {
    renderWithI18n(
      <BalanceWarning
        balance="1.0"
        required="1.502"
        symbol="ETH"
      />
    )

    expect(screen.getByText(/1\.0.*ETH/)).toBeInTheDocument()
  })

  it('has alert role for accessibility', () => {
    renderWithI18n(
      <BalanceWarning
        balance="1.0"
        required="1.502"
        symbol="ETH"
      />
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = renderWithI18n(
      <BalanceWarning
        balance="1.0"
        required="1.502"
        symbol="ETH"
        className="custom-class"
      />
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('displays warning icon', () => {
    const { container } = renderWithI18n(
      <BalanceWarning
        balance="1.0"
        required="1.502"
        symbol="ETH"
      />
    )

    // Check for lucide-react AlertTriangle icon (rendered as svg)
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders with different token symbols', () => {
    renderWithI18n(
      <BalanceWarning
        balance="0.05"
        required="0.1"
        symbol="BTC"
      />
    )

    expect(screen.getByText(/0\.1.*BTC/)).toBeInTheDocument()
    expect(screen.getByText(/0\.05.*BTC/)).toBeInTheDocument()
  })

  it('handles large numbers', () => {
    renderWithI18n(
      <BalanceWarning
        balance="1000000"
        required="2000000"
        symbol="USDT"
      />
    )

    expect(screen.getByText(/2000000.*USDT/)).toBeInTheDocument()
    expect(screen.getByText(/1000000.*USDT/)).toBeInTheDocument()
  })
})
