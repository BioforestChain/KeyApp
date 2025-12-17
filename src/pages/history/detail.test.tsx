import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionDetailPage } from './detail'
import { TestI18nProvider } from '@/test/i18n-mock'

// Mock stackflow
const mockNavigate = vi.fn()
let mockTxId = 'tx-1'

vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: vi.fn() }),
  useActivityParams: () => ({ txId: mockTxId }),
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
const mockTransaction = {
  id: 'tx-1',
  type: 'send' as const,
  status: 'confirmed' as const,
  amount: '1.5',
  symbol: 'ETH',
  address: '0x1234567890abcdef1234567890abcdef12345678',
  timestamp: new Date('2025-12-10T10:00:00Z'),
  hash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  chain: 'ethereum' as const,
  fee: '0.001',
  feeSymbol: 'ETH',
  blockNumber: 18500000,
  confirmations: 50,
}

vi.mock('@/hooks/use-transaction-history', () => ({
  useTransactionHistory: () => ({
    transactions: [mockTransaction],
    isLoading: false,
    error: undefined,
    filter: { chain: 'all', period: 'all' },
    setFilter: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock clipboard
const mockWriteText = vi.fn()
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
})

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('TransactionDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCurrentWallet = mockWallet
    mockTxId = 'tx-1'
    mockWriteText.mockResolvedValue(undefined)
  })

  describe('Initial State', () => {
    it('renders page header', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText('交易详情')).toBeInTheDocument()
    })

    it('shows transaction type', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText('发送')).toBeInTheDocument()
    })

    it('shows transaction amount', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText('ETH')).toBeInTheDocument()
    })

    it('shows transaction status', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText('已确认')).toBeInTheDocument()
    })

    it('shows network', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText('网络')).toBeInTheDocument()
      expect(screen.getByText('ethereum')).toBeInTheDocument()
    })

    it('shows block number', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText('区块高度')).toBeInTheDocument()
      expect(screen.getByText('18,500,000')).toBeInTheDocument()
    })

    it('shows confirmations', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText('确认数')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
    })
  })

  describe('No Wallet State', () => {
    it('shows message when no wallet exists', () => {
      mockCurrentWallet = null
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText('请先创建或导入钱包')).toBeInTheDocument()
    })
  })

  describe('Transaction Not Found', () => {
    it('shows message when transaction is not found', () => {
      mockTxId = 'non-existent-tx'
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText('交易不存在或已过期')).toBeInTheDocument()
    })
  })

  describe('Copy Hash', () => {
    it('copies hash to clipboard when button is clicked', async () => {
      renderWithProviders(<TransactionDetailPage />)

      const copyButton = screen.getByText('复制哈希')
      await userEvent.click(copyButton)

      expect(mockWriteText).toHaveBeenCalledWith(mockTransaction.hash)
    })

    it('shows copied state after clicking', async () => {
      renderWithProviders(<TransactionDetailPage />)

      const copyButton = screen.getByText('复制哈希')
      await userEvent.click(copyButton)

      expect(screen.getByText('已复制')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('navigates back when back button is clicked', async () => {
      renderWithProviders(<TransactionDetailPage />)

      const backButton = screen.getByRole('button', { name: /返回/i })
      await userEvent.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/history' })
    })
  })

  describe('Explorer Link', () => {
    it('has explorer button', () => {
      renderWithProviders(<TransactionDetailPage />)
      expect(screen.getByText('区块浏览器')).toBeInTheDocument()
    })
  })
})
