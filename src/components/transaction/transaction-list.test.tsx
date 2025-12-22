import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionList } from './transaction-list'
import type { TransactionInfo } from './transaction-item'
import { Amount } from '@/types/amount'
import { TestI18nProvider } from '@/test/i18n-mock'

// 包装组件以提供 i18n
function renderWithProvider(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

// Use fixed date to avoid timezone/midnight flakiness
// Set to noon on a specific date so "today" and "yesterday" are stable
const FIXED_NOW = new Date('2025-06-15T12:00:00Z').getTime()

const mockTransactions: TransactionInfo[] = [
  {
    id: '1',
    type: 'send',
    status: 'confirmed',
    amount: Amount.fromFormatted('100', 6, 'USDT'),
    symbol: 'USDT',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    timestamp: new Date(FIXED_NOW - 3600000), // 1 hour ago = today
  },
  {
    id: '2',
    type: 'receive',
    status: 'confirmed',
    amount: Amount.fromFormatted('0.5', 18, 'ETH'),
    symbol: 'ETH',
    address: '0xabcdef1234567890',
    timestamp: new Date(FIXED_NOW - 86400000 - 3600000), // 25 hours ago = yesterday
  },
]

describe('TransactionList', () => {
  beforeEach(() => {
    // Mock Date.now() to return fixed time for consistent "today"/"yesterday" grouping
    vi.useFakeTimers()
    vi.setSystemTime(new Date(FIXED_NOW))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders all transactions', () => {
    renderWithProvider(<TransactionList transactions={mockTransactions} />)
    expect(screen.getByText('发送')).toBeInTheDocument()
    expect(screen.getByText('接收')).toBeInTheDocument()
  })

  it('groups transactions by date', () => {
    renderWithProvider(<TransactionList transactions={mockTransactions} />)
    expect(screen.getByText('今天')).toBeInTheDocument()
    expect(screen.getByText('昨天')).toBeInTheDocument()
  })

  it('shows loading skeleton', () => {
    const { container } = renderWithProvider(<TransactionList transactions={[]} loading />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('shows empty state when no transactions', () => {
    renderWithProvider(<TransactionList transactions={[]} />)
    expect(screen.getByText('暂无交易记录')).toBeInTheDocument()
  })

  it('shows custom empty message', () => {
    renderWithProvider(
      <TransactionList 
        transactions={[]} 
        emptyTitle="No transactions" 
        emptyDescription="Make your first transfer" 
      />
    )
    expect(screen.getByText('No transactions')).toBeInTheDocument()
    expect(screen.getByText('Make your first transfer')).toBeInTheDocument()
  })

  it('renders empty action', () => {
    renderWithProvider(
      <TransactionList 
        transactions={[]} 
        emptyAction={<button>Start Transfer</button>} 
      />
    )
    expect(screen.getByRole('button', { name: 'Start Transfer' })).toBeInTheDocument()
  })

  it('calls onTransactionClick when transaction is clicked', async () => {
    // Use real timers for userEvent interaction
    vi.useRealTimers()
    const handleClick = vi.fn()
    renderWithProvider(
      <TransactionList
        transactions={mockTransactions}
        onTransactionClick={handleClick}
      />
    )

    await userEvent.click(screen.getByText('发送').closest('[role="button"]')!)
    expect(handleClick).toHaveBeenCalledWith(mockTransactions[0])
  })

  it('renders transaction amounts correctly', () => {
    renderWithProvider(<TransactionList transactions={mockTransactions} />)
    expect(screen.getByText('-100')).toBeInTheDocument()
    expect(screen.getByText('USDT')).toBeInTheDocument()
    expect(screen.getByText('+0.5')).toBeInTheDocument()
    expect(screen.getByText('ETH')).toBeInTheDocument()
  })
})
