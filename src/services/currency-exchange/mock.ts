/**
 * 货币兑换服务 - Mock 实现
 */

import { currencyExchangeServiceMeta } from './types'

const MOCK_USD_RATES: Record<string, number> = {
  CNY: 7.24,
  EUR: 0.95,
  JPY: 149.50,
  KRW: 1320.00,
  GBP: 0.79,
  AUD: 1.53,
  CAD: 1.36,
  CHF: 0.88,
  HKD: 7.82,
  SGD: 1.34,
  TWD: 31.50,
  THB: 35.20,
  INR: 83.50,
  MYR: 4.72,
  PHP: 56.20,
}

function getMockDate(): string {
  const datePart = new Date().toISOString().split('T')[0]
  return datePart ?? new Date().toISOString().slice(0, 10)
}

function calculateRates(baseCurrency: string, targetCurrencies: string[]): Record<string, number> {
  const rates: Record<string, number> = {}

  if (baseCurrency === 'USD') {
    for (const target of targetCurrencies) {
      if (target === 'USD') rates[target] = 1
      else if (MOCK_USD_RATES[target] !== undefined) rates[target] = MOCK_USD_RATES[target]!
    }
    return rates
  }

  const baseToUsd = MOCK_USD_RATES[baseCurrency]
  if (baseToUsd === undefined) return rates

  const usdToBase = 1 / baseToUsd

  for (const target of targetCurrencies) {
    if (target === baseCurrency) rates[target] = 1
    else if (target === 'USD') rates[target] = usdToBase
    else if (MOCK_USD_RATES[target] !== undefined) rates[target] = MOCK_USD_RATES[target]! * usdToBase
  }

  return rates
}

export const currencyExchangeService = currencyExchangeServiceMeta.impl({
  async getExchangeRates({ baseCurrency, targetCurrencies }) {
    await new Promise(resolve => setTimeout(resolve, 100))
    return {
      base: baseCurrency,
      date: getMockDate(),
      rates: calculateRates(baseCurrency, targetCurrencies),
    }
  },
})
