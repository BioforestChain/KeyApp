import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { currencyExchangeService, type ExchangeRateResponse } from '@/services'

/**
 * Exchange Rate Query Keys
 */
export const exchangeRateQueryKeys = {
  all: ['exchangeRate'] as const,
  rate: (baseCurrency: string, targetCurrencies: string[]) =>
    ['exchangeRate', baseCurrency.toUpperCase(), targetCurrencies.toSorted().join(',')] as const,
}

function normalizeCurrencyCode(code: string): string {
  return code.trim().toUpperCase()
}

/**
 * Exchange Rate Query Hook
 *
 * 特性：
 * - 5min staleTime：替代手动缓存
 * - 共享缓存：多个组件使用同一 base+targets 时共享数据
 * - 请求去重：同时发起的相同请求会被合并
 */
export function useExchangeRateQuery(
  baseCurrency: string,
  targetCurrencies: string[]
) {
  const normalizedBase = useMemo(() => normalizeCurrencyCode(baseCurrency), [baseCurrency])
  const normalizedTargets = useMemo(
    () => [...new Set(targetCurrencies.map(normalizeCurrencyCode))].filter((c) => c !== normalizedBase),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [targetCurrencies.join(','), normalizedBase]
  )

  const query = useQuery({
    queryKey: exchangeRateQueryKeys.rate(normalizedBase, normalizedTargets),
    queryFn: async (): Promise<ExchangeRateResponse> => {
      if (normalizedTargets.length === 0) {
        const datePart = new Date().toISOString().split('T')[0]
        return {
          base: normalizedBase,
          date: datePart ?? new Date().toISOString().slice(0, 10),
          rates: {},
        }
      }

      return currencyExchangeService.getExchangeRates({
        baseCurrency: normalizedBase,
        targetCurrencies: normalizedTargets,
      })
    },
    enabled: !!normalizedBase,
    staleTime: 5 * 60 * 1000, // 5 分钟内认为数据新鲜
    gcTime: 10 * 60 * 1000, // 10 分钟缓存
    refetchOnWindowFocus: true,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error?.message ?? null,
    updatedAt: query.dataUpdatedAt || null,
  }
}

/**
 * Get exchange rate for a single currency
 */
export function getExchangeRate(
  data: ExchangeRateResponse | null,
  targetCurrency: string
): number | undefined {
  const normalizedTarget = normalizeCurrencyCode(targetCurrency)
  return data?.rates[normalizedTarget]
}
