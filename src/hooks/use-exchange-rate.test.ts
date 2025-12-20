import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { clearExchangeRateCache, getExchangeRate, useExchangeRate } from './use-exchange-rate'

// Mock currency exchange service
const { mockGetExchangeRates } = vi.hoisted(() => ({
  mockGetExchangeRates: vi.fn().mockResolvedValue({
    base: 'USD',
    date: '2025-01-01',
    rates: { CNY: 7.24, EUR: 0.95 },
  }),
}))

vi.mock('@/services/currency-exchange', () => ({
  currencyExchangeService: {
    getExchangeRates: mockGetExchangeRates,
  },
}))

describe('useExchangeRate', () => {
  beforeEach(() => {
    clearExchangeRateCache()
    mockGetExchangeRates.mockClear()
    mockGetExchangeRates.mockResolvedValue({
      base: 'USD',
      date: '2025-01-01',
      rates: { CNY: 7.24, EUR: 0.95 },
    })
  })

  it('starts in loading state when targets are provided', () => {
    const { result } = renderHook(() => useExchangeRate('USD', ['CNY']))
    expect(result.current.isLoading).toBe(true)
  })

  it('fetches rates for requested currencies (mock impl by default)', async () => {
    const { result } = renderHook(() => useExchangeRate('USD', ['CNY', 'EUR']))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeNull()
    expect(getExchangeRate(result.current.data, 'CNY')).toBeTypeOf('number')
    expect(getExchangeRate(result.current.data, 'EUR')).toBeTypeOf('number')
  })

  it('uses cache on subsequent calls', async () => {
    const { result: r1, unmount } = renderHook(() => useExchangeRate('USD', ['CNY']))
    await waitFor(() => expect(r1.current.isLoading).toBe(false))
    unmount()

    const { result: r2 } = renderHook(() => useExchangeRate('USD', ['CNY']))
    await waitFor(() => expect(r2.current.isLoading).toBe(false))

    expect(mockGetExchangeRates).toHaveBeenCalledTimes(1)
  })

  it('handles service errors', async () => {
    mockGetExchangeRates.mockRejectedValueOnce(new Error('boom'))

    const { result } = renderHook(() => useExchangeRate('USD', ['CNY']))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('boom')
  })
})

