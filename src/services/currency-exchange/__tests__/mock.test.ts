import { describe, expect, it } from 'vitest'

import { CurrencyExchangeService } from '../mock'

describe('CurrencyExchangeService (mock)', () => {
  it('returns rates for requested targets', async () => {
    const service = new CurrencyExchangeService()
    const result = await service.getExchangeRates('USD', ['CNY', 'EUR'])

    expect(result.base).toBe('USD')
    expect(result.rates.CNY).toBeTypeOf('number')
    expect(result.rates.EUR).toBeTypeOf('number')
  })

  it('returns empty rates for unsupported base currency', async () => {
    const service = new CurrencyExchangeService()
    const result = await service.getExchangeRates('UNKNOWN', ['USD', 'CNY'])

    expect(result.base).toBe('UNKNOWN')
    expect(Object.keys(result.rates)).toHaveLength(0)
  })
})

