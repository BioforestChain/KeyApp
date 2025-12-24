import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Amount } from '@/types/amount'
import { TransactionHistoryPage } from './index'
import { TestI18nProvider, testI18n } from '@/test/i18n-mock'

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

const mockEnabledChains = [
  {
    id: 'ethereum',
    version: '1.0',
    type: 'evm',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    enabled: true,
    source: 'default',
  },
  {
    id: 'tron',
    version: '1.0',
    type: 'bip39',
    name: 'Tron',
    symbol: 'TRX',
    decimals: 6,
    enabled: true,
    source: 'default',
  },
]

vi.mock('@/stores', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/stores')>()
  return {
    ...actual,
    useCurrentWallet: () => mockCurrentWallet,
    useEnabledChains: () => mockEnabledChains,
  }
})

// Create mock transactions with Amount objects
const createMockTransactions = () => [
  {
    id: 'tx-1',
    type: 'send' as const,
    status: 'confirmed' as const,
    amount: Amount.fromFormatted('1.5', 18, 'ETH'),
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
    amount: Amount.fromFormatted('100', 6, 'USDT'),
    symbol: 'USDT',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    timestamp: new Date(Date.now() - 86400000), // Yesterday
    hash: '0xdef456',
    chain: 'tron' as const,
  },
]

const mockSetFilter = vi.fn()
vi.mock('@/queries', () => ({
  useTransactionHistoryQuery: () => ({
    transactions: createMockTransactions(),
    isLoading: false,
    isFetching: false,
    error: undefined,
    filter: { chain: 'all', period: 'all' },
    setFilter: mockSetFilter,
    refresh: vi.fn(),
  }),
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <TestI18nProvider>{ui}</TestI18nProvider>
    </QueryClientProvider>
  )
}

describe('TransactionHistoryPage', () => {
  const t = (key: string, options?: Record<string, unknown>) => testI18n.t(key, options)
  const firstChainLabel = mockEnabledChains[0]!.name

  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentWallet = mockWallet
  })

  describe('Initial State', () => {
    it('renders page header', () => {
      renderWithProviders(<TransactionHistoryPage />)
      expect(screen.getByText(t('transaction:history.title'))).toBeInTheDocument()
    })

    it('shows filter bar', () => {
      renderWithProviders(<TransactionHistoryPage />)
      expect(screen.getByLabelText(t('common:a11y.selectChain'))).toBeInTheDocument()
      expect(screen.getByLabelText(t('common:a11y.selectPeriod'))).toBeInTheDocument()
    })

    it('shows transaction count', () => {
      renderWithProviders(<TransactionHistoryPage />)
      expect(screen.getByText(t('transaction:history.totalRecords', { count: 2 }))).toBeInTheDocument()
    })

    it('renders transactions list', () => {
      renderWithProviders(<TransactionHistoryPage />)
      expect(screen.getByText(t('transaction:type.send'))).toBeInTheDocument()
      expect(screen.getByText(t('transaction:type.receive'))).toBeInTheDocument()
    })

    it('shows message when no wallet exists', () => {
      mockCurrentWallet = null
      renderWithProviders(<TransactionHistoryPage />)
      expect(screen.getByText(t('transaction:history.noWallet'))).toBeInTheDocument()
    })
  })

  describe('Filter Interactions', () => {
    it('calls setFilter when chain is changed', async () => {
      renderWithProviders(<TransactionHistoryPage />)

      const chainSelect = screen.getByLabelText(t('common:a11y.selectChain'))
      await userEvent.click(chainSelect)
      await userEvent.click(screen.getByText(firstChainLabel))

      expect(mockSetFilter).toHaveBeenCalledWith({ chain: 'ethereum', period: 'all' })
    })

    it('calls setFilter when period is changed', async () => {
      renderWithProviders(<TransactionHistoryPage />)

      const periodSelect = screen.getByLabelText(t('common:a11y.selectPeriod'))
      await userEvent.click(periodSelect)
      await userEvent.click(screen.getByText(t('transaction:history.filter.days7')))

      expect(mockSetFilter).toHaveBeenCalledWith({ chain: 'all', period: '7d' })
    })
  })

  describe('Navigation', () => {
    it('navigates to transaction detail when transaction is clicked', async () => {
      renderWithProviders(<TransactionHistoryPage />)

      // Click on the first transaction item
      const sendTx = screen.getByText(t('transaction:type.send')).closest('[role="button"]')
      if (sendTx) {
        await userEvent.click(sendTx)
      }

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/transaction/tx-1',
      })
    })

    it('navigates back when back button is clicked', async () => {
      renderWithProviders(<TransactionHistoryPage />)

      const backButton = screen.getByRole('button', { name: t('common:a11y.back') })
      await userEvent.click(backButton)

      expect(mockGoBack).toHaveBeenCalled()
    })
  })
})
