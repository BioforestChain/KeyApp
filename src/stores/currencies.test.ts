import { describe, it, expect } from 'vitest'
import enCurrency from '@/i18n/locales/en/currency.json'
import { currencies, type CurrencyCode } from './preferences'

const supportedCurrencyCodes: CurrencyCode[] = ['USD', 'CNY', 'EUR', 'JPY', 'KRW']

describe('currencies', () => {
  it('uses the expected symbols for supported currencies', () => {
    const expected: Record<CurrencyCode, string> = {
      USD: '$',
      CNY: '¥',
      EUR: '€',
      JPY: '¥',
      KRW: '₩',
    }

    for (const code of supportedCurrencyCodes) {
      expect(currencies[code].symbol).toBe(expected[code])
    }
  })

  it('keeps i18n currency symbols consistent with store symbols', () => {
    for (const code of supportedCurrencyCodes) {
      expect(enCurrency.symbol[code]).toBe(currencies[code].symbol)
    }
  })
})

