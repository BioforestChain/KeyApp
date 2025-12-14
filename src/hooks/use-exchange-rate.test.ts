import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { currencyExchangeService } from '@/services'
import { clearExchangeRateCache, getExchangeRate, useExchangeRate } from './use-exchange-rate'

describe('useExchangeRate', () => {
  beforeEach(() => {
    clearExchangeRateCache()
    vi.restoreAllMocks()
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
    const spy = vi.spyOn(currencyExchangeService, 'getExchangeRates')

    const { result: r1, unmount } = renderHook(() => useExchangeRate('USD', ['CNY']))
    await waitFor(() => expect(r1.current.isLoading).toBe(false))
    unmount()

    const { result: r2 } = renderHook(() => useExchangeRate('USD', ['CNY']))
    await waitFor(() => expect(r2.current.isLoading).toBe(false))

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('handles service errors', async () => {
    vi.spyOn(currencyExchangeService, 'getExchangeRates').mockRejectedValueOnce(new Error('boom'))

    const { result } = renderHook(() => useExchangeRate('USD', ['CNY']))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('boom')
  })
})

