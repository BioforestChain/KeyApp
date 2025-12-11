import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTransactionHistory } from './use-transaction-history'

describe('useTransactionHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('returns transactions array', () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      expect(Array.isArray(result.current.transactions)).toBe(true)
    })

    it('returns default filter state', () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      expect(result.current.filter).toEqual({ chain: 'all', period: 'all' })
    })

    it('is not loading initially', () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      expect(result.current.isLoading).toBe(false)
    })

    it('has no error initially', () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      expect(result.current.error).toBeUndefined()
    })
  })

  describe('Mock Data', () => {
    it('generates transactions with required fields', () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
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

    it('transactions are sorted by timestamp (newest first)', () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      const { transactions } = result.current

      for (let i = 1; i < transactions.length; i++) {
        const prevTime = new Date(transactions[i - 1]!.timestamp).getTime()
        const currTime = new Date(transactions[i]!.timestamp).getTime()
        expect(prevTime).toBeGreaterThanOrEqual(currTime)
      }
    })
  })

  describe('Filtering', () => {
    it('filters by chain', () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))

      act(() => {
        result.current.setFilter({ chain: 'ethereum', period: 'all' })
      })

      result.current.transactions.forEach(tx => {
        expect(tx.chain).toBe('ethereum')
      })
    })

    it('filters by period (7d)', () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

      act(() => {
        result.current.setFilter({ chain: 'all', period: '7d' })
      })

      result.current.transactions.forEach(tx => {
        expect(new Date(tx.timestamp).getTime()).toBeGreaterThanOrEqual(sevenDaysAgo)
      })
    })

    it('filters by period (30d)', () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000

      act(() => {
        result.current.setFilter({ chain: 'all', period: '30d' })
      })

      result.current.transactions.forEach(tx => {
        expect(new Date(tx.timestamp).getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo)
      })
    })

    it('combines chain and period filters', () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000

      act(() => {
        result.current.setFilter({ chain: 'ethereum', period: '7d' })
      })

      result.current.transactions.forEach(tx => {
        expect(tx.chain).toBe('ethereum')
        expect(new Date(tx.timestamp).getTime()).toBeGreaterThanOrEqual(sevenDaysAgo)
      })
    })

    it('returns all transactions when filter is "all"', () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))
      const initialCount = result.current.transactions.length

      act(() => {
        result.current.setFilter({ chain: 'all', period: 'all' })
      })

      expect(result.current.transactions.length).toBe(initialCount)
    })
  })

  describe('Refresh', () => {
    it('sets loading state during refresh', async () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))

      expect(result.current.isLoading).toBe(false)

      act(() => {
        result.current.refresh()
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('completes refresh without error', async () => {
      const { result } = renderHook(() => useTransactionHistory('wallet-1'))

      await act(async () => {
        await result.current.refresh()
      })

      expect(result.current.error).toBeUndefined()
    })
  })
})
