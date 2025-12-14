import { afterEach, describe, expect, it, vi } from 'vitest'

import { CurrencyExchangeService } from '../web'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('CurrencyExchangeService (web)', () => {
  it('calls Frankfurter API and maps response', async () => {
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async () => {
      return new Response(
        JSON.stringify({
          amount: 1,
          base: 'USD',
          date: '2025-01-01',
          rates: { CNY: 7.24, EUR: 0.95 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    const service = new CurrencyExchangeService()
    const result = await service.getExchangeRates('USD', ['CNY', 'EUR'])

    expect(fetchMock).toHaveBeenCalledTimes(1)

    const url = String(fetchMock.mock.calls[0]?.[0])
    const decoded = decodeURIComponent(url)
    expect(decoded).toContain('https://api.frankfurter.app/latest?')
    expect(decoded).toContain('from=USD')
    expect(decoded).toContain('to=CNY,EUR')

    expect(result.base).toBe('USD')
    expect(result.date).toBe('2025-01-01')
    expect(result.rates.CNY).toBe(7.24)
    expect(result.rates.EUR).toBe(0.95)
  })

  it('throws on non-2xx response', async () => {
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async () => {
      return new Response('', { status: 500, statusText: 'Boom' })
    })
    vi.stubGlobal('fetch', fetchMock)

    const service = new CurrencyExchangeService()

    await expect(service.getExchangeRates('USD', ['CNY'])).rejects.toThrow(
      'Frankfurter API error: 500 Boom'
    )
  })
})
