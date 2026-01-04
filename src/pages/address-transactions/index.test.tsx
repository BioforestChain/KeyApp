import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AddressTransactionsPage } from './index'
import type { Transaction } from '@/services/chain-adapter/providers/types'

// Mock navigation
const mockGoBack = vi.fn()
vi.mock('@/stackflow', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common:addressLookup.transactionsTitle': '交易历史查询',
        'common:addressLookup.chain': '链',
        'common:addressLookup.address': '地址',
        'common:addressLookup.addressPlaceholder': '输入钱包地址',
        'common:addressLookup.queryError': '查询失败',
        'common:addressLookup.noTransactions': '没有交易记录',
        'common:addressLookup.useExplorerHint': '请使用区块浏览器查看交易历史',
        'common:addressLookup.viewOnExplorer': '在 {{name}} 上查看',
        'common:addressLookup.otherChains': '其他链',
      }
      return translations[key] ?? key
    },
  }),
}))

// Mock enabled chains
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
    explorer: {
      url: 'https://etherscan.io',
      queryAddress: 'https://etherscan.io/address/:address',
    },
  },
  {
    id: 'bfmeta',
    version: '1.0',
    type: 'bioforest',
    name: 'BFMeta',
    symbol: 'BFM',
    decimals: 8,
    enabled: true,
    source: 'default',
    prefix: 'b',
  },
]

vi.mock('@/stores', () => ({
  useEnabledChains: () => mockEnabledChains,
}))

// Mock ChainProvider
const mockGetTransactionHistory = vi.fn<(address: string, limit?: number) => Promise<Transaction[]>>()
const mockSupportsTransactionHistory = vi.fn<() => boolean>()

vi.mock('@/services/chain-adapter/providers', () => ({
  getChainProvider: (chainId: string) => ({
    chainId,
    supportsTransactionHistory: mockSupportsTransactionHistory(),
    getTransactionHistory: mockSupportsTransactionHistory() ? mockGetTransactionHistory : undefined,
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
      {ui}
    </QueryClientProvider>
  )
}

describe('AddressTransactionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupportsTransactionHistory.mockReturnValue(true)
    mockGetTransactionHistory.mockResolvedValue([])
  })

  it('renders page with chain selector and address input', () => {
    renderWithProviders(<AddressTransactionsPage />)
    
    expect(screen.getByText('交易历史查询')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('输入钱包地址')).toBeInTheDocument()
  })

  it('shows empty state when no transactions found', async () => {
    mockGetTransactionHistory.mockResolvedValue([])
    
    renderWithProviders(<AddressTransactionsPage />)
    
    const input = screen.getByPlaceholderText('输入钱包地址')
    await userEvent.type(input, '0x1234567890abcdef1234567890abcdef12345678')
    
    const searchButton = screen.getAllByRole('button')[1] // Second button is search
    await userEvent.click(searchButton)
    
    await waitFor(() => {
      expect(screen.getByText('没有交易记录')).toBeInTheDocument()
    })
  })

  it('shows transactions when data is returned', async () => {
    const mockTxs: Transaction[] = [
      {
        hash: '0xabc123',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x1234567890abcdef1234567890abcdef12345678',
        value: '1000000000000000000',
        symbol: 'ETH',
        timestamp: Date.now(),
        status: 'confirmed',
      },
    ]
    mockGetTransactionHistory.mockResolvedValue(mockTxs)
    
    renderWithProviders(<AddressTransactionsPage />)
    
    const input = screen.getByPlaceholderText('输入钱包地址')
    await userEvent.type(input, '0x1234567890abcdef1234567890abcdef12345678')
    
    const searchButton = screen.getAllByRole('button')[1]
    await userEvent.click(searchButton)
    
    await waitFor(() => {
      expect(screen.getByText(/From:/)).toBeInTheDocument()
    })
  })

  it('shows explorer hint when chain does not support transaction history', async () => {
    mockSupportsTransactionHistory.mockReturnValue(false)
    
    renderWithProviders(<AddressTransactionsPage />)
    
    const input = screen.getByPlaceholderText('输入钱包地址')
    await userEvent.type(input, '0x1234567890abcdef1234567890abcdef12345678')
    
    const searchButton = screen.getAllByRole('button')[1]
    await userEvent.click(searchButton)
    
    await waitFor(() => {
      expect(screen.getByText(/使用区块浏览器|请使用/i)).toBeInTheDocument()
    })
  })

  it('calls getTransactionHistory with correct parameters', async () => {
    const testAddress = '0x75a6F48BF634868b2980c97CcEf467A127597e08'
    mockGetTransactionHistory.mockResolvedValue([])
    
    renderWithProviders(<AddressTransactionsPage />)
    
    const input = screen.getByPlaceholderText('输入钱包地址')
    await userEvent.type(input, testAddress)
    
    const searchButton = screen.getAllByRole('button')[1]
    await userEvent.click(searchButton)
    
    await waitFor(() => {
      expect(mockGetTransactionHistory).toHaveBeenCalledWith(testAddress, 20)
    })
  })
})
