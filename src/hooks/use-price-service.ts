import { useState, useEffect, useCallback } from 'react'

/** Price data for a single token */
export interface PriceData {
  /** Price in USD */
  priceUsd: number
  /** 24-hour price change percentage */
  priceChange24h: number
  /** Last update timestamp */
  updatedAt: number
}

/** Price service state */
export interface PriceServiceState {
  /** Price data keyed by token symbol (uppercase) */
  prices: Map<string, PriceData>
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
}

/** Mock price data for development */
const MOCK_PRICES: Record<string, PriceData> = {
  ETH: { priceUsd: 2500, priceChange24h: 2.3, updatedAt: Date.now() },
  BTC: { priceUsd: 45000, priceChange24h: -1.5, updatedAt: Date.now() },
  USDT: { priceUsd: 1, priceChange24h: 0.01, updatedAt: Date.now() },
  USDC: { priceUsd: 1, priceChange24h: -0.02, updatedAt: Date.now() },
  BFM: { priceUsd: 0.05, priceChange24h: 5.2, updatedAt: Date.now() },
  TRX: { priceUsd: 0.12, priceChange24h: 3.1, updatedAt: Date.now() },
  BNB: { priceUsd: 320, priceChange24h: 1.8, updatedAt: Date.now() },
}

/** Cache TTL in milliseconds (5 minutes) */
const CACHE_TTL = 5 * 60 * 1000

/** Cached prices with timestamp */
let priceCache: Map<string, PriceData> = new Map()
let cacheUpdatedAt = 0

/**
 * Hook for fetching and caching token prices
 * @param symbols Array of token symbols to fetch prices for
 * @returns Price service state with prices map, loading, and error
 */
export function usePriceService(symbols: string[]): PriceServiceState {
  const [state, setState] = useState<PriceServiceState>({
    prices: new Map(),
    isLoading: true,
    error: null,
  })

  const fetchPrices = useCallback(async (syms: string[]) => {
    // Check cache validity
    const now = Date.now()
    if (now - cacheUpdatedAt < CACHE_TTL && priceCache.size > 0) {
      // Use cached prices
      const cachedPrices = new Map<string, PriceData>()
      for (const symbol of syms) {
        const cached = priceCache.get(symbol.toUpperCase())
        if (cached) {
          cachedPrices.set(symbol.toUpperCase(), cached)
        }
      }
      setState({ prices: cachedPrices, isLoading: false, error: null })
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // TODO: Replace with actual API call (CoinGecko, etc.)
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100))

      const prices = new Map<string, PriceData>()
      for (const symbol of syms) {
        const upperSymbol = symbol.toUpperCase()
        const mockPrice = MOCK_PRICES[upperSymbol]
        if (mockPrice) {
          prices.set(upperSymbol, { ...mockPrice, updatedAt: now })
        }
      }

      // Update cache
      priceCache = new Map([...priceCache, ...prices])
      cacheUpdatedAt = now

      setState({ prices, isLoading: false, error: null })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch prices',
      }))
    }
  }, [])

  useEffect(() => {
    if (symbols.length > 0) {
      fetchPrices(symbols)
    } else {
      setState({ prices: new Map(), isLoading: false, error: null })
    }
  }, [symbols.join(','), fetchPrices])

  return state
}

/**
 * Get price for a single token from the prices map
 * @param prices Price map from usePriceService
 * @param symbol Token symbol
 * @returns PriceData or undefined
 */
export function getPrice(
  prices: Map<string, PriceData>,
  symbol: string
): PriceData | undefined {
  return prices.get(symbol.toUpperCase())
}

/** Clear price cache (useful for testing) */
export function clearPriceCache(): void {
  priceCache = new Map()
  cacheUpdatedAt = 0
}
