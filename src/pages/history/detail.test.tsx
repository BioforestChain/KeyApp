import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Amount } from '@/types/amount'
import { TransactionDetailPage } from './detail'
import { TestI18nProvider, testI18n } from '@/test/i18n-mock'

// Mock stackflow
const mockNavigate = vi.fn()
const mockGoBack = vi.fn()
let mockTxId = 'tx-1'

vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useActivityParams: () => ({ txId: mockTxId }),
}))

// Mock wallet store
const mockWallet = {
  id: 'wallet-1',
  name: 'My Wallet',
  chainAddresses: [],
}

let mockCurrentWallet: typeof mockWallet | null = mockWallet

vi.mock('@/stores', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/stores')>()
  return {
    ...actual,
    useCurrentWallet: () => mockCurrentWallet,
    useChainConfigState: () => ({ snapshot: null, isLoading: false, error: null }),
  }
})

// Create mock transaction with Amount objects
const createMockTransaction = () => ({
  id: 'tx-1',
  type: 'send' as const,
  status: 'confirmed' as const,
  amount: Amount.fromFormatted('1.5', 18, 'ETH'),
  symbol: 'ETH',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  timestamp: new Date('2025-12-10T10:00:00Z'),
  hash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  chain: 'ethereum' as const,
  fee: Amount.fromFormatted('0.001', 18, 'ETH'),
  feeSymbol: 'ETH',
  blockNumber: 18500000,
  confirmations: 50,
})

vi.mock('@/queries', () => ({
  useTransactionHistoryQuery: () => ({
    transactions: [createMockTransaction()],
    isLoading: false,
    isFetching: false,
    error: undefined,
    filter: { chain: 'all', period: 'all' },
    setFilter: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock clipboard service
const { mockClipboardWrite } = vi.hoisted(() => ({
  mockClipboardWrite: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/services/clipboard', () => ({
  clipboardService: {
    write: mockClipboardWrite,
    read: vi.fn().mockResolvedValue(''),
  },
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

describe('TransactionDetailPage', () => {
  const t = testI18n.t.bind(testI18n)

  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentWallet = mockWallet
    mockTxId = 'tx-1'
    mockClipboardWrite.mockResolvedValue(undefined)
  })

  describe('Initial State', () => {
    it('renders page header', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText(t('transaction:detail.title'))).toBeInTheDocument()
    })

    it('shows transaction type', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText(t('transaction:type.send'))).toBeInTheDocument()
    })

    it('shows transaction amount', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText('ETH')).toBeInTheDocument()
    })

    it('shows transaction status', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText(t('transaction:status.confirmed'))).toBeInTheDocument()
    })

    it('shows network', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText(t('transaction:detail.network'))).toBeInTheDocument()
      expect(screen.getByText('ethereum')).toBeInTheDocument()
    })

    it('shows block number', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText(t('transaction:detail.blockHeight'))).toBeInTheDocument()
      expect(screen.getByText('18,500,000')).toBeInTheDocument()
    })

    it('shows confirmations', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText(t('transaction:detail.confirmations'))).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
    })
  })

  describe('No Wallet State', () => {
    it('shows message when no wallet exists', () => {
      mockCurrentWallet = null
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText(t('transaction:history.noWallet'))).toBeInTheDocument()
    })
  })

  describe('Transaction Not Found', () => {
    it('shows message when transaction is not found', () => {
      mockTxId = 'non-existent-tx'
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText(t('transaction:detail.notFound'))).toBeInTheDocument()
    })
  })

  describe('Copy Hash', () => {
    it('copies hash to clipboard when button is clicked', async () => {
      renderWithProviders(<TransactionDetailPage />)

      const copyButton = screen.getByText(t('transaction:detail.copyHash'))
      await userEvent.click(copyButton)

      expect(mockClipboardWrite).toHaveBeenCalledWith({ text: createMockTransaction().hash })
    })

    it('shows copied state after clicking', async () => {
      renderWithProviders(<TransactionDetailPage />)

      const copyButton = screen.getByText(t('transaction:detail.copyHash'))
      await userEvent.click(copyButton)

      expect(screen.getByText(t('transaction:detail.copied'))).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('navigates back when back button is clicked', async () => {
      renderWithProviders(<TransactionDetailPage />)

      const backButton = screen.getByRole('button', { name: t('common:a11y.back') })
      await userEvent.click(backButton)

      expect(mockGoBack).toHaveBeenCalled()
    })
  })

  describe('Explorer Link', () => {
    it('has explorer button', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText(t('transaction:detail.share'))).toBeInTheDocument()
    })
  })
})
