import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TransactionDetails } from './TransactionDetails'
import { TestI18nProvider } from '@/test/i18n-mock'

function renderWithI18n(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('TransactionDetails', () => {
  it('renders from address', () => {
    renderWithI18n(
      <TransactionDetails
        from="0x1234567890abcdef1234567890abcdef12345678"
        to="0xabcdef1234567890abcdef1234567890abcdef12"
        amount="1.5 ETH"
      />
    )

    expect(screen.getByText('0x123456...345678')).toBeInTheDocument()
  })

  it('renders to address', () => {
    renderWithI18n(
      <TransactionDetails
        from="0x1234567890abcdef1234567890abcdef12345678"
        to="0xabcdef1234567890abcdef1234567890abcdef12"
        amount="1.5 ETH"
      />
    )

    expect(screen.getByText('0xabcdef...cdef12')).toBeInTheDocument()
  })

  it('renders amount', () => {
    renderWithI18n(
      <TransactionDetails
        from="0x1234567890abcdef1234567890abcdef12345678"
        to="0xabcdef1234567890abcdef1234567890abcdef12"
        amount="1.5 ETH"
      />
    )

    expect(screen.getByText('1.5 ETH')).toBeInTheDocument()
  })

  it('renders fee when provided', () => {
    renderWithI18n(
      <TransactionDetails
        from="0x1234567890abcdef1234567890abcdef12345678"
        to="0xabcdef1234567890abcdef1234567890abcdef12"
        amount="1.5 ETH"
        fee="0.002 ETH"
      />
    )

    expect(screen.getByText('0.002 ETH')).toBeInTheDocument()
  })

  it('does not render fee when not provided', () => {
    renderWithI18n(
      <TransactionDetails
        from="0x1234567890abcdef1234567890abcdef12345678"
        to="0xabcdef1234567890abcdef1234567890abcdef12"
        amount="1.5 ETH"
      />
    )

    expect(screen.queryByText('Network Fee')).not.toBeInTheDocument()
  })

  it('renders chain icon when chainId is provided', () => {
    renderWithI18n(
      <TransactionDetails
        from="0x1234567890abcdef1234567890abcdef12345678"
        to="0xabcdef1234567890abcdef1234567890abcdef12"
        amount="1.5 ETH"
        chainId="ethereum"
      />
    )

    expect(screen.getByText('ethereum')).toBeInTheDocument()
  })

  it('renders short addresses without truncation', () => {
    renderWithI18n(
      <TransactionDetails
        from="0x123456"
        to="0xabcdef"
        amount="1.5 ETH"
      />
    )

    expect(screen.getByText('0x123456')).toBeInTheDocument()
    expect(screen.getByText('0xabcdef')).toBeInTheDocument()
  })

  it('has correct aria label', () => {
    renderWithI18n(
      <TransactionDetails
        from="0x1234567890abcdef1234567890abcdef12345678"
        to="0xabcdef1234567890abcdef1234567890abcdef12"
        amount="1.5 ETH"
      />
    )

    expect(screen.getByRole('region', { name: '交易详情' })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = renderWithI18n(
      <TransactionDetails
        from="0x1234567890abcdef1234567890abcdef12345678"
        to="0xabcdef1234567890abcdef1234567890abcdef12"
        amount="1.5 ETH"
        className="custom-class"
      />
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('shows full address in title attribute', () => {
    renderWithI18n(
      <TransactionDetails
        from="0x1234567890abcdef1234567890abcdef12345678"
        to="0xabcdef1234567890abcdef1234567890abcdef12"
        amount="1.5 ETH"
      />
    )

    expect(screen.getByTitle('0x1234567890abcdef1234567890abcdef12345678')).toBeInTheDocument()
    expect(screen.getByTitle('0xabcdef1234567890abcdef1234567890abcdef12')).toBeInTheDocument()
  })
})
