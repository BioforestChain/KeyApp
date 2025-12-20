import { describe, expect, it } from 'vitest'

import { currencyExchangeService } from '../mock'

describe('currencyExchangeService (mock)', () => {
  it('returns rates for requested targets', async () => {
    const result = await currencyExchangeService.getExchangeRates({
      baseCurrency: 'USD',
      targetCurrencies: ['CNY', 'EUR'],
    })

    expect(result.base).toBe('USD')
    expect(result.rates.CNY).toBeTypeOf('number')
    expect(result.rates.EUR).toBeTypeOf('number')
  })

  it('returns empty rates for unsupported base currency', async () => {
    const result = await currencyExchangeService.getExchangeRates({
      baseCurrency: 'UNKNOWN',
      targetCurrencies: ['USD', 'CNY'],
    })

    expect(result.base).toBe('UNKNOWN')
    expect(Object.keys(result.rates)).toHaveLength(0)
  })
})

