import { useCallback, useEffect, useMemo, useState } from 'react'
import { currencyExchangeService, type ExchangeRateResponse } from '@/services'

/** Exchange rate hook state */
export interface ExchangeRateState {
  /** Latest exchange rate response */
  data: ExchangeRateResponse | null
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
  /** Cache/update timestamp (ms) */
  updatedAt: number | null
}

/** Cache TTL in milliseconds (5 minutes) */
const CACHE_TTL = 5 * 60 * 1000

interface CacheEntry {
  data: ExchangeRateResponse
  updatedAt: number
}

const exchangeRateCache = new Map<string, CacheEntry>()

function normalizeCurrencyCode(code: string): string {
  return code.trim().toUpperCase()
}

function buildCacheKey(baseCurrency: string, targetCurrencies: readonly string[]): string {
  const base = normalizeCurrencyCode(baseCurrency)
  const targets = [...new Set(targetCurrencies.map(normalizeCurrencyCode))]
    .filter((c) => c !== base)
    .sort()
    .join(',')

  return `${base}|${targets}`
}

/**
 * Hook: fetch and cache fiat exchange rates.
 *
 * Note:
 * - Default base currency for KeyApp is USD (acceptance #7).
 * - Caching is global (module-level) to dedupe requests across components.
 */
export function useExchangeRate(
  baseCurrency: string,
  targetCurrencies: string[]
): ExchangeRateState {
  const normalizedBase = useMemo(() => normalizeCurrencyCode(baseCurrency), [baseCurrency])
  const normalizedTargets = useMemo(
    () => [...new Set(targetCurrencies.map(normalizeCurrencyCode))],
    [targetCurrencies.join(',')]
  )

  const cacheKey = useMemo(() => buildCacheKey(normalizedBase, normalizedTargets), [
    normalizedBase,
    normalizedTargets.join(','),
  ])

  const [state, setState] = useState<ExchangeRateState>({
    data: null,
    isLoading: normalizedTargets.length > 0,
    error: null,
    updatedAt: null,
  })

  const fetchExchangeRate = useCallback(
    async (base: string, targets: string[]) => {
      const normalizedBase = normalizeCurrencyCode(base)
      const normalizedTargets = [...new Set(targets.map(normalizeCurrencyCode))].filter(
        (c) => c !== normalizedBase
      )

      const key = buildCacheKey(normalizedBase, normalizedTargets)
      const now = Date.now()

      const cached = exchangeRateCache.get(key)
      if (cached && now - cached.updatedAt < CACHE_TTL) {
        setState({ data: cached.data, isLoading: false, error: null, updatedAt: cached.updatedAt })
        return
      }

      if (normalizedTargets.length === 0) {
        // Nothing to fetch; return an empty response as a stable shape.
        const datePart = new Date().toISOString().split('T')[0]
        const data: ExchangeRateResponse = {
          base: normalizedBase,
          date: datePart ?? new Date().toISOString().slice(0, 10),
          rates: {},
        }
        setState({ data, isLoading: false, error: null, updatedAt: now })
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const data = await currencyExchangeService.getExchangeRates(normalizedBase, normalizedTargets)
        exchangeRateCache.set(key, { data, updatedAt: now })
        setState({ data, isLoading: false, error: null, updatedAt: now })
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch exchange rates',
        }))
      }
    },
    []
  )

  useEffect(() => {
    void fetchExchangeRate(normalizedBase, normalizedTargets)
  }, [cacheKey, normalizedBase, normalizedTargets, fetchExchangeRate])

  return state
}

/** Helper: read one rate from response */
export function getExchangeRate(
  data: ExchangeRateResponse | null,
  targetCurrency: string
): number | undefined {
  const normalizedTarget = normalizeCurrencyCode(targetCurrency)
  return data?.rates[normalizedTarget]
}

/** Clear exchange rate cache (useful for testing) */
export function clearExchangeRateCache(): void {
  exchangeRateCache.clear()
}
