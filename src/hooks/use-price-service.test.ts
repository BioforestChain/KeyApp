import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePriceService, getPrice, clearPriceCache } from './use-price-service'

describe('usePriceService', () => {
  beforeEach(() => {
    clearPriceCache()
    vi.clearAllMocks()
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => usePriceService(['ETH']))
    expect(result.current.isLoading).toBe(true)
  })

  it('fetches prices for requested symbols', async () => {
    const { result } = renderHook(() => usePriceService(['ETH', 'BTC']))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.prices.has('ETH')).toBe(true)
    expect(result.current.prices.has('BTC')).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('returns correct price data structure', async () => {
    const { result } = renderHook(() => usePriceService(['ETH']))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const ethPrice = result.current.prices.get('ETH')
    expect(ethPrice).toBeDefined()
    expect(ethPrice?.priceUsd).toBe(2500)
    expect(ethPrice?.priceChange24h).toBe(2.3)
    expect(ethPrice?.updatedAt).toBeGreaterThan(0)
  })

  it('handles empty symbols array', async () => {
    const { result } = renderHook(() => usePriceService([]))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.prices.size).toBe(0)
    expect(result.current.error).toBeNull()
  })

  it('normalizes symbols to uppercase', async () => {
    const { result } = renderHook(() => usePriceService(['eth', 'Btc']))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.prices.has('ETH')).toBe(true)
    expect(result.current.prices.has('BTC')).toBe(true)
  })

  it('handles unknown symbols gracefully', async () => {
    const { result } = renderHook(() => usePriceService(['UNKNOWN_TOKEN']))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.prices.has('UNKNOWN_TOKEN')).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('uses cached prices on subsequent calls', async () => {
    // First call - populates cache
    const { result: result1, unmount } = renderHook(() =>
      usePriceService(['ETH'])
    )

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false)
    })

    unmount()

    // Second call - should use cache
    const { result: result2 } = renderHook(() => usePriceService(['ETH']))

    // Cache hit should be nearly instant
    await waitFor(() => {
      expect(result2.current.isLoading).toBe(false)
    })

    expect(result2.current.prices.has('ETH')).toBe(true)
  })
})

describe('getPrice', () => {
  it('returns price data for existing symbol', () => {
    const prices = new Map([
      ['ETH', { priceUsd: 2500, priceChange24h: 2.3, updatedAt: Date.now() }],
    ])

    const result = getPrice(prices, 'ETH')
    expect(result?.priceUsd).toBe(2500)
  })

  it('returns undefined for missing symbol', () => {
    const prices = new Map()
    const result = getPrice(prices, 'ETH')
    expect(result).toBeUndefined()
  })

  it('normalizes symbol to uppercase', () => {
    const prices = new Map([
      ['ETH', { priceUsd: 2500, priceChange24h: 2.3, updatedAt: Date.now() }],
    ])

    const result = getPrice(prices, 'eth')
    expect(result?.priceUsd).toBe(2500)
  })
})
