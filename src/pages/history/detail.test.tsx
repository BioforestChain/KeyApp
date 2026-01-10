import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Amount } from '@/types/amount'
import { TransactionDetailPage } from './detail'
import { TestI18nProvider, testI18n } from '@/test/i18n-mock'
import { transactionService } from '@/services/transaction'
import { InvalidDataError } from '@/services/chain-adapter/providers'

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

const createMockSwapTransaction = (overrides?: Partial<ReturnType<typeof createMockTransaction>>) => ({
  ...createMockTransaction(),
  id: 'ethereum--0xswaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  type: 'swap' as const,
  symbol: 'ETH',
  amount: Amount.fromFormatted('0', 18, 'ETH'),
  assets: [
    { assetType: 'token', symbol: 'ETH', decimals: 18, value: '1000000000000000000', contractAddress: '0xeth' },
  ],
  ...overrides,
})

const createMockSwapTransactionEnhanced = () =>
  createMockSwapTransaction({
    assets: [
      { assetType: 'token', symbol: 'ETH', decimals: 18, value: '1000000000000000000', contractAddress: '0xeth' },
      { assetType: 'token', symbol: 'USDC', decimals: 6, value: '1000000', contractAddress: '0xusdc' },
    ],
  })

const createMockApproveTransaction = () => ({
  ...createMockTransaction(),
  id: 'ethereum--0xapppppppppppppppppppppppppppppppppppppppppppppppppppppppp',
  type: 'approve' as const,
  amount: Amount.fromFormatted('0', 18, 'ETH'),
  to: '0xtoken',
  contract: { address: '0xtoken' },
})

const createMockInteractionTransaction = () => ({
  ...createMockTransaction(),
  id: 'ethereum--0xintttttttttttttttttttttttttttttttttttttttttttttttttttttttt',
  type: 'interaction' as const,
  amount: Amount.fromFormatted('0', 18, 'ETH'),
  to: '0xcontract',
  contract: { address: '0xcontract' },
})

let mockTransactions = [createMockTransaction()]

vi.mock('@/queries', () => ({
  useTransactionHistoryQuery: () => ({
    transactions: mockTransactions,
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

vi.mock('@/services/transaction', () => ({
  transactionService: {
    getTransaction: vi.fn().mockResolvedValue(null),
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
    mockTransactions = [createMockTransaction()]
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
      // 页面上有多个 ETH 元素（金额和手续费）
      expect(screen.getAllByText('ETH').length).toBeGreaterThan(0)
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
    it('shows message when transaction is not found', async () => {
      mockTxId = 'non-existent-tx'
      renderWithProviders(<TransactionDetailPage />)
      expect(await screen.findByText(t('transaction:detail.notFound'))).toBeInTheDocument()
    })
  })

  describe('Invalid Data', () => {
    it('shows message when transaction data cannot be parsed', async () => {
      mockTransactions = []
      mockTxId = 'ethereum--0xdeadbeef'
      vi.mocked(transactionService.getTransaction).mockRejectedValue(
        new InvalidDataError({ source: 'provider', chainId: 'ethereum', method: 'getTransaction' }),
      )

      renderWithProviders(<TransactionDetailPage />)
      expect(await screen.findByText(t('transaction:detail.invalidData'))).toBeInTheDocument()

      // CopyableText component uses clickToCopy aria-label
      const copyButton = screen.getByLabelText(t('common:clickToCopy'))
      await userEvent.click(copyButton)
      expect(mockClipboardWrite).toHaveBeenCalledWith({ text: '0xdeadbeef' })
    })
  })

  describe('Provider Enhancement', () => {
    it('enhances swap transaction and renders From/To + header summary', async () => {
      mockTransactions = [createMockSwapTransaction()]
      mockTxId = mockTransactions[0]!.id
      vi.mocked(transactionService.getTransaction).mockResolvedValue(createMockSwapTransactionEnhanced() as any)

      renderWithProviders(<TransactionDetailPage />)

      expect(await screen.findByText(t('transaction:detail.swapFrom'))).toBeInTheDocument()
      expect(screen.getByText(t('transaction:detail.swapTo'))).toBeInTheDocument()
      expect(screen.getByText('→')).toBeInTheDocument()
      expect(screen.getAllByText('ETH').length).toBeGreaterThan(0)
      expect(screen.getAllByText('USDC').length).toBeGreaterThan(0)
    })
  })

  describe('Approve/Interaction Placeholders', () => {
    it('renders approve with method/spender/allowance placeholders', async () => {
      mockTransactions = [createMockApproveTransaction()]
      mockTxId = mockTransactions[0]!.id
      vi.mocked(transactionService.getTransaction).mockResolvedValue(null)

      renderWithProviders(<TransactionDetailPage />)

      expect(await screen.findByText(t('transaction:detail.contractAddress'))).toBeInTheDocument()
      expect(screen.getByText(t('transaction:detail.method'))).toBeInTheDocument()
      expect(screen.getByText(t('transaction:detail.spender'))).toBeInTheDocument()
      expect(screen.getByText(t('transaction:detail.allowance'))).toBeInTheDocument()
      expect(screen.getAllByText(t('common:unknown')).length).toBeGreaterThan(0)
    })

    it('renders interaction with method placeholder', async () => {
      mockTransactions = [createMockInteractionTransaction()]
      mockTxId = mockTransactions[0]!.id
      vi.mocked(transactionService.getTransaction).mockResolvedValue(null)

      renderWithProviders(<TransactionDetailPage />)

      expect(await screen.findByText(t('transaction:detail.contractAddress'))).toBeInTheDocument()
      expect(screen.getByText(t('transaction:detail.method'))).toBeInTheDocument()
      expect(screen.getByText(t('common:unknown'))).toBeInTheDocument()
    })
  })

  describe('Copy Hash', () => {
    it('copies hash to clipboard when button is clicked', async () => {
      renderWithProviders(<TransactionDetailPage />)

      // CopyableText component displays the hash and uses clickToCopy aria-label
      const mockTx = createMockTransaction()
      const copyButton = await screen.findByLabelText(t('common:clickToCopy'))
      await userEvent.click(copyButton)

      expect(mockClipboardWrite).toHaveBeenCalledWith({ text: mockTx.hash })
    })

    it('shows copied state after clicking', async () => {
      renderWithProviders(<TransactionDetailPage />)

      // CopyableText component changes aria-label to copiedToClipboard after click
      const copyButton = await screen.findByLabelText(t('common:clickToCopy'))
      await userEvent.click(copyButton)

      expect(screen.getByLabelText(t('common:copiedToClipboard'))).toBeInTheDocument()
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
