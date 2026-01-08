import { useQuery } from '@tanstack/react-query'

/** Price data for a single token */
export interface PriceData {
  priceUsd: number
  priceChange24h: number
  updatedAt: number
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

/**
 * Price Query Keys
 */
export const priceQueryKeys = {
  all: ['prices'] as const,
  symbols: (symbols: string[]) => ['prices', symbols.toSorted().join(',')] as const,
}

/**
 * Fetch prices for given symbols
 */
async function fetchPrices(symbols: string[]): Promise<Map<string, PriceData>> {
  const now = Date.now()

  // TODO: Replace with actual API call (CoinGecko, etc.)
  await new Promise((resolve) => setTimeout(resolve, 100))

  const prices = new Map<string, PriceData>()
  for (const symbol of symbols) {
    const upperSymbol = symbol.toUpperCase()
    const mockPrice = MOCK_PRICES[upperSymbol]
    if (mockPrice) {
      prices.set(upperSymbol, { ...mockPrice, updatedAt: now })
    }
  }

  return prices
}

/**
 * Price Query Hook
 *
 * 特性：
 * - 5min staleTime：替代手动缓存
 * - 60s 轮询：自动刷新价格
 * - 共享缓存：多个组件使用同一 symbols 时共享数据
 * - 请求去重：同时发起的相同请求会被合并
 */
export function usePriceQuery(symbols: string[]) {
  const normalizedSymbols = symbols.map((s) => s.toUpperCase()).filter(Boolean)

  const query = useQuery({
    queryKey: priceQueryKeys.symbols(normalizedSymbols),
    queryFn: () => fetchPrices(normalizedSymbols),
    enabled: normalizedSymbols.length > 0,
    staleTime: 5 * 60 * 1000, // 5 分钟内认为数据新鲜
    gcTime: 10 * 60 * 1000, // 10 分钟缓存
    refetchInterval: 60 * 1000, // 60 秒轮询
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  })

  return {
    prices: query.data ?? new Map<string, PriceData>(),
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message ?? null,
  }
}

/**
 * Get price for a single token from the prices map
 */
export function getPrice(
  prices: Map<string, PriceData>,
  symbol: string
): PriceData | undefined {
  return prices.get(symbol.toUpperCase())
}
