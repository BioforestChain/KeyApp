import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionItem, type TransactionInfo } from './transaction-item'
import { Amount } from '@/types/amount'
import { TestI18nProvider, testI18n } from '@/test/i18n-mock'

// Wrap with i18n provider
function renderWithProvider(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

const mockTransaction: TransactionInfo = {
  id: '1',
  type: 'send',
  status: 'confirmed',
  amount: Amount.fromFormatted('100', 6, 'USDT'),
  symbol: 'USDT',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  timestamp: new Date(),
}

describe('TransactionItem', () => {
  const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options)

  it('renders transaction type label', () => {
    renderWithProvider(<TransactionItem transaction={mockTransaction} />)
    expect(screen.getByText(t('transaction:type.send'))).toBeInTheDocument()
  })

  it('renders amount with correct sign for send', () => {
    renderWithProvider(<TransactionItem transaction={mockTransaction} />)
    expect(screen.getByText('-100')).toBeInTheDocument()
    expect(screen.getByText('USDT')).toBeInTheDocument()
  })

  it('renders amount with correct sign for receive', () => {
    renderWithProvider(<TransactionItem transaction={{ ...mockTransaction, type: 'receive' }} />)
    expect(screen.getByText('+100')).toBeInTheDocument()
    expect(screen.getByText('USDT')).toBeInTheDocument()
  })

  it('shows address label', () => {
    renderWithProvider(<TransactionItem transaction={mockTransaction} />)
    expect(screen.getByText(t('transaction:toAddress'))).toBeInTheDocument()
  })

  it('shows from label for receive transactions', () => {
    renderWithProvider(<TransactionItem transaction={{ ...mockTransaction, type: 'receive' }} />)
    expect(screen.getByText(t('transaction:fromAddress'))).toBeInTheDocument()
  })

  it('shows pending status', () => {
    renderWithProvider(<TransactionItem transaction={{ ...mockTransaction, status: 'pending' }} />)
    expect(screen.getByText(t('transaction:status.pending'))).toBeInTheDocument()
  })

  it('shows failed status', () => {
    renderWithProvider(<TransactionItem transaction={{ ...mockTransaction, status: 'failed' }} />)
    expect(screen.getByText(t('transaction:status.failed'))).toBeInTheDocument()
  })

  it('does not show status for confirmed transactions', () => {
    renderWithProvider(<TransactionItem transaction={mockTransaction} />)
    expect(screen.queryByText(t('transaction:status.confirmed'))).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    renderWithProvider(<TransactionItem transaction={mockTransaction} onClick={handleClick} />)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is keyboard accessible when clickable', async () => {
    const handleClick = vi.fn()
    renderWithProvider(<TransactionItem transaction={mockTransaction} onClick={handleClick} />)
    
    const button = screen.getByRole('button')
    button.focus()
    await userEvent.keyboard('{Enter}')
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not have button role when not clickable', () => {
    renderWithProvider(<TransactionItem transaction={mockTransaction} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders receive icon', () => {
    renderWithProvider(<TransactionItem transaction={{ ...mockTransaction, type: 'receive' }} />)
    expect(screen.getByText(t('transaction:type.receive'))).toBeInTheDocument()
  })

  it('renders swap type', () => {
    renderWithProvider(<TransactionItem transaction={{ ...mockTransaction, type: 'exchange' }} />)
    expect(screen.getByText(t('transaction:type.exchange'))).toBeInTheDocument()
  })

  it('formats recent timestamp', () => {
    renderWithProvider(<TransactionItem transaction={mockTransaction} />)
    expect(screen.getByText(t('time.justNow'))).toBeInTheDocument()
  })
})
