import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactRenderer } from '@storybook/react'
import type { DecoratorFunction } from 'storybook/internal/types'
import { useEffect, useState } from 'react'
import { expect, waitFor, within } from '@storybook/test'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WalletAddressPortfolioView } from './wallet-address-portfolio-view'
import { WalletAddressPortfolioFromProvider } from './wallet-address-portfolio-from-provider'
import { chainConfigActions, chainConfigStore } from '@/stores/chain-config'
import { clearProviderCache } from '@/services/chain-adapter'
import { Amount } from '@/types/amount'
import type { TokenInfo } from '@/components/token/token-item'
import type { TransactionInfo, TransactionType } from '@/components/transaction/transaction-item'

const mockTokens: TokenInfo[] = [
  { symbol: 'BFT', name: 'BFT', balance: '1234.56789012', decimals: 8, chain: 'bfmeta' },
  { symbol: 'USDT', name: 'USDT', balance: '500.00000000', decimals: 8, chain: 'bfmeta' },
  { symbol: 'BTC', name: 'Bitcoin', balance: '0.00123456', decimals: 8, chain: 'bfmeta' },
]

const mockTransactions: TransactionInfo[] = [
  {
    id: 'tx1',
    type: 'receive' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('100000000', 8, 'BFT'),
    symbol: 'BFT',
    address: 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j',
    timestamp: new Date(Date.now() - 3600000),
    chain: 'bfmeta',
  },
  {
    id: 'tx2',
    type: 'send' as TransactionType,
    status: 'confirmed',
    amount: Amount.fromRaw('50000000', 8, 'BFT'),
    symbol: 'BFT',
    address: 'bAnotherAddress1234567890abcdef',
    timestamp: new Date(Date.now() - 86400000),
    chain: 'bfmeta',
  },
]

function ChainConfigProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    
    async function init() {
      try {
        clearProviderCache()
        await chainConfigActions.initialize()
        
        if (!mounted) return
        
        const state = chainConfigStore.state
        if (state.error) {
          setError(state.error)
          setStatus('error')
        } else if (state.snapshot) {
          setStatus('ready')
        } else {
          setError('No chain config snapshot after initialization')
          setStatus('error')
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : String(e))
          setStatus('error')
        }
      }
    }
    
    init()
    return () => { mounted = false }
  }, [])

  if (status === 'error') {
    return (
      <div data-testid="chain-config-error" className="flex h-96 items-center justify-center p-4">
        <div className="text-center text-destructive">
          <p className="font-medium">Chain config initialization failed</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div data-testid="chain-config-loading" className="flex h-96 items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Loading chain configuration...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
  },
})

const withChainConfig: DecoratorFunction<ReactRenderer> = (Story) => (
  <QueryClientProvider client={createQueryClient()}>
    <ChainConfigProvider>
      <div className="max-w-md mx-auto min-h-screen bg-background">
        <Story />
      </div>
    </ChainConfigProvider>
  </QueryClientProvider>
)

const meta = {
  title: 'Wallet/WalletAddressPortfolio',
  component: WalletAddressPortfolioView,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WalletAddressPortfolioView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: mockTokens,
    transactions: mockTransactions,
  },
}

export const Loading: Story = {
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: [],
    transactions: [],
    tokensLoading: true,
    transactionsLoading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    await waitFor(() => {
      const portfolio = canvas.getByTestId('wallet-address-portfolio')
      expect(portfolio).toBeVisible()
      
      const pulsingElements = portfolio.querySelectorAll('.animate-pulse')
      expect(pulsingElements.length).toBeGreaterThan(0)
    })
  },
}

export const Empty: Story = {
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: [],
    transactions: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    await waitFor(() => {
      const emptyState = canvas.getByTestId('wallet-address-portfolio-token-list-empty')
      expect(emptyState).toBeVisible()
    })
  },
}

export const RealDataBfmeta: Story = {
  name: 'Real Data: bfmeta',
  decorators: [withChainConfig],
  parameters: {
    chromatic: { delay: 5000 },
    docs: {
      description: {
        story: 'Fetches real token balances and transactions from BFMeta chain using the actual chainProvider API.',
      },
    },
  },
  render: () => (
    <WalletAddressPortfolioFromProvider
      chainId="bfmeta"
      address="bCfAynSAKhzgKLi3BXyuh5k22GctLR72j"
      chainName="BFMeta"
      testId="bfmeta-portfolio"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    await waitFor(() => {
      const portfolio = canvas.getByTestId('bfmeta-portfolio')
      expect(portfolio).toBeVisible()
    }, { timeout: 3000 })
    
    await waitFor(() => {
      const loadingIndicator = canvas.queryByTestId('chain-config-loading')
      expect(loadingIndicator).not.toBeInTheDocument()
    }, { timeout: 5000 })
    
    await waitFor(() => {
      const tokenList = canvas.getByTestId('bfmeta-portfolio-token-list')
      expect(tokenList).toBeVisible()
      
      const hasTokens = canvas.queryAllByTestId(/^token-item-/).length > 0
      const hasEmptyState = canvas.queryByTestId('bfmeta-portfolio-token-list-empty') !== null
      expect(hasTokens || hasEmptyState).toBe(true)
    }, { timeout: 15000 })
  },
}

export const RealDataEthmeta: Story = {
  name: 'Real Data: ethmeta',
  decorators: [withChainConfig],
  parameters: {
    chromatic: { delay: 5000 },
    docs: {
      description: {
        story: 'Fetches real token balances from ETHMeta chain (BioForest ecosystem). The address format `bCfA...` is a BioForest address compatible with ETHMeta.',
      },
    },
  },
  render: () => (
    <WalletAddressPortfolioFromProvider
      chainId="ethmeta"
      address="bCfAynSAKhzgKLi3BXyuh5k22GctLR72j"
      chainName="ETHMeta"
      testId="ethmeta-portfolio"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    await waitFor(() => {
      const portfolio = canvas.getByTestId('ethmeta-portfolio')
      expect(portfolio).toBeVisible()
    }, { timeout: 3000 })
    
    await waitFor(() => {
      const loadingIndicator = canvas.queryByTestId('chain-config-loading')
      expect(loadingIndicator).not.toBeInTheDocument()
    }, { timeout: 5000 })
    
    await waitFor(() => {
      const tokenList = canvas.getByTestId('ethmeta-portfolio-token-list')
      expect(tokenList).toBeVisible()
    }, { timeout: 15000 })
  },
}
