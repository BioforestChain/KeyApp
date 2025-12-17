import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionHistoryPage } from './index'
import { TestI18nProvider } from '@/test/i18n-mock'

// Mock stackflow
const mockNavigate = vi.fn()
const mockGoBack = vi.fn()
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useActivityParams: () => ({}),
}))

// Mock wallet store
const mockWallet = {
  id: 'wallet-1',
  name: 'My Wallet',
  chainAddresses: [],
}

let mockCurrentWallet: typeof mockWallet | null = mockWallet

vi.mock('@/stores', () => ({
  useCurrentWallet: () => mockCurrentWallet,
}))

// Mock transaction history hook
const mockTransactions = [
  {
    id: 'tx-1',
    type: 'send' as const,
    status: 'confirmed' as const,
    amount: '1.5',
    symbol: 'ETH',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    timestamp: new Date(),
    hash: '0xabc123',
    chain: 'ethereum' as const,
  },
  {
    id: 'tx-2',
    type: 'receive' as const,
    status: 'confirmed' as const,
    amount: '100',
    symbol: 'USDT',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    timestamp: new Date(Date.now() - 86400000), // Yesterday
    hash: '0xdef456',
    chain: 'tron' as const,
  },
]

const mockSetFilter = vi.fn()
vi.mock('@/hooks/use-transaction-history', () => ({
  useTransactionHistory: () => ({
    transactions: mockTransactions,
    isLoading: false,
    error: undefined,
    filter: { chain: 'all', period: 'all' },
    setFilter: mockSetFilter,
    refresh: vi.fn(),
  }),
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('TransactionHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentWallet = mockWallet
  })

  describe('Initial State', () => {
    it('renders page header', () => {
      renderWithProviders(<TransactionHistoryPage />)
      expect(screen.getByText('交易记录')).toBeInTheDocument()
    })

    it('shows filter bar', () => {
      renderWithProviders(<TransactionHistoryPage />)
      expect(screen.getByLabelText('选择链')).toBeInTheDocument()
      expect(screen.getByLabelText('选择时间段')).toBeInTheDocument()
    })

    it('shows transaction count', () => {
      renderWithProviders(<TransactionHistoryPage />)
      expect(screen.getByText('共 2 条记录')).toBeInTheDocument()
    })

    it('renders transactions list', () => {
      renderWithProviders(<TransactionHistoryPage />)
      expect(screen.getByText('发送')).toBeInTheDocument()
      expect(screen.getByText('接收')).toBeInTheDocument()
    })

    it('shows message when no wallet exists', () => {
      mockCurrentWallet = null
      renderWithProviders(<TransactionHistoryPage />)
      expect(screen.getByText('请先创建或导入钱包')).toBeInTheDocument()
    })
  })

  describe('Filter Interactions', () => {
    it('calls setFilter when chain is changed', async () => {
      renderWithProviders(<TransactionHistoryPage />)

      const chainSelect = screen.getByLabelText('选择链')
      await userEvent.selectOptions(chainSelect, 'ethereum')

      expect(mockSetFilter).toHaveBeenCalledWith({ chain: 'ethereum', period: 'all' })
    })

    it('calls setFilter when period is changed', async () => {
      renderWithProviders(<TransactionHistoryPage />)

      const periodSelect = screen.getByLabelText('选择时间段')
      await userEvent.selectOptions(periodSelect, '7d')

      expect(mockSetFilter).toHaveBeenCalledWith({ chain: 'all', period: '7d' })
    })
  })

  describe('Navigation', () => {
    it('navigates to transaction detail when transaction is clicked', async () => {
      renderWithProviders(<TransactionHistoryPage />)

      // Click on the first transaction (发送)
      const sendTx = screen.getByText('发送').closest('[role="button"]')
      if (sendTx) {
        await userEvent.click(sendTx)
      }

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/transaction/tx-1',
      })
    })

    it('navigates back when back button is clicked', async () => {
      renderWithProviders(<TransactionHistoryPage />)

      const backButton = screen.getByRole('button', { name: /返回/i })
      await userEvent.click(backButton)

      expect(mockGoBack).toHaveBeenCalled()
    })
  })
})
