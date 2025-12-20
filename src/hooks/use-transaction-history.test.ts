import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTransactionHistory } from './use-transaction-history'
import type { TransactionRecord as ServiceTransactionRecord } from '@/services/transaction'

// Mock transaction data
const mockTransactions: ServiceTransactionRecord[] = [
  {
    id: 'tx-1',
    type: 'send',
    status: 'confirmed',
    amount: '1.5',
    symbol: 'ETH',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    hash: '0xhash1',
    chain: 'ethereum',
    fee: '0.001',
    feeSymbol: 'ETH',
    blockNumber: 18000000,
    confirmations: 10,
  },
  {
    id: 'tx-2',
    type: 'receive',
    status: 'confirmed',
    amount: '100',
    symbol: 'USDT',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    hash: '0xhash2',
    chain: 'ethereum',
    fee: '0.002',
    feeSymbol: 'ETH',
    blockNumber: 17999000,
    confirmations: 50,
  },
  {
    id: 'tx-3',
    type: 'send',
    status: 'pending',
    amount: '50',
    symbol: 'TRX',
    address: 'TXYZ1234567890',
    timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
    hash: '0xhash3',
    chain: 'tron',
    fee: '1',
    feeSymbol: 'TRX',
    blockNumber: undefined,
    confirmations: 0,
  },
]

// Mock transaction service
vi.mock('@/services/transaction', () => ({
  transactionService: {
    getHistory: vi.fn().mockImplementation(async ({ walletId: _walletId, filter }: { walletId: string; filter?: { chain?: string; period?: string } }) => {
      let result = [...mockTransactions]
      
      if (filter?.chain && filter.chain !== 'all') {
        result = result.filter(tx => tx.chain === filter.chain)
      }
      
      if (filter?.period && filter.period !== 'all') {
        const now = Date.now()
        const days = filter.period === '7d' ? 7 : filter.period === '30d' ? 30 : 90
        const cutoff = now - days * 24 * 60 * 60 * 1000
        result = result.filter(tx => tx.timestamp.getTime() >= cutoff)
      }
      
      return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }),
    getTransaction: vi.fn(),
    refresh: vi.fn(),
  },
}))

describe('useTransactionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('returns transactions array', async () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      await waitFor(() => {
        expect(Array.isArray(result.current.transactions)).toBe(true)
      })
    })

    it('returns default filter state', () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      expect(result.current.filter).toEqual({ chain: 'all', period: 'all' })
    })

    it('starts in loading state', () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      expect(result.current.isLoading).toBe(true)
    })

    it('finishes loading with no error', async () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeUndefined()
      })
    })
  })

  describe('Transaction Data', () => {
    it('loads transactions with required fields', async () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      
      await waitFor(() => {
        expect(result.current.transactions.length).toBeGreaterThan(0)
      })
      
      const tx = result.current.transactions[0]
      expect(tx).toHaveProperty('id')
      expect(tx).toHaveProperty('type')
      expect(tx).toHaveProperty('status')
      expect(tx).toHaveProperty('amount')
      expect(tx).toHaveProperty('symbol')
      expect(tx).toHaveProperty('address')
      expect(tx).toHaveProperty('timestamp')
      expect(tx).toHaveProperty('chain')
    })

    it('transactions are sorted by timestamp (newest first)', async () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      
      await waitFor(() => {
        expect(result.current.transactions.length).toBeGreaterThan(1)
      })
      
      const { transactions } = result.current
      for (let i = 1; i < transactions.length; i++) {
        const prevTime = new Date(transactions[i - 1]!.timestamp).getTime()
        const currTime = new Date(transactions[i]!.timestamp).getTime()
        expect(prevTime).toBeGreaterThanOrEqual(currTime)
      }
    })
  })

  describe('Filtering', () => {
    it('filters by chain', async () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setFilter({ chain: 'ethereum', period: 'all' })
      })

      await waitFor(() => {
        result.current.transactions.forEach(tx => {
          expect(tx.chain).toBe('ethereum')
        })
      })
    })

    it('filters by period (7d)', async () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setFilter({ chain: 'all', period: '7d' })
      })

      await waitFor(() => {
        result.current.transactions.forEach(tx => {
          expect(new Date(tx.timestamp).getTime()).toBeGreaterThanOrEqual(sevenDaysAgo)
        })
      })
    })

    it('filters by period (30d)', async () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setFilter({ chain: 'all', period: '30d' })
      })

      await waitFor(() => {
        result.current.transactions.forEach(tx => {
          expect(new Date(tx.timestamp).getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo)
        })
      })
    })

    it('combines chain and period filters', async () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setFilter({ chain: 'ethereum', period: '7d' })
      })

      await waitFor(() => {
        result.current.transactions.forEach(tx => {
          expect(tx.chain).toBe('ethereum')
          expect(new Date(tx.timestamp).getTime()).toBeGreaterThanOrEqual(sevenDaysAgo)
        })
      })
    })

    it('returns all transactions when filter is "all"', async () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCount = result.current.transactions.length

      act(() => {
        result.current.setFilter({ chain: 'all', period: 'all' })
      })

      await waitFor(() => {
        expect(result.current.transactions.length).toBe(initialCount)
      })
    })
  })

  describe('Refresh', () => {
    it('sets loading state during refresh', async () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))

      // Wait for initial load to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Trigger refresh
      act(() => {
        void result.current.refresh()
      })

      // Should be loading
      expect(result.current.isLoading).toBe(true)

      // Wait for refresh to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('completes refresh without error', async () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.refresh()
      })

      expect(result.current.error).toBeUndefined()
    })
  })
})
