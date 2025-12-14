import { describe, it, expect } from 'vitest'
import {
  formatAssetAmount,
  formatFiatValue,
  formatPriceChange,
  convertFiat,
} from './asset'

describe('formatAssetAmount', () => {
  it('formats zero amount', () => {
    expect(formatAssetAmount('0', 18)).toBe('0')
    expect(formatAssetAmount('', 18)).toBe('0')
  })

  it('formats integer amounts', () => {
    // 1 ETH = 1000000000000000000 wei
    expect(formatAssetAmount('1000000000000000000', 18)).toBe('1')
    // 100 USDT = 100000000 (6 decimals)
    expect(formatAssetAmount('100000000', 6)).toBe('100')
  })

  it('formats decimal amounts', () => {
    // 1.5 ETH
    expect(formatAssetAmount('1500000000000000000', 18)).toBe('1.5')
    // 0.5 BTC
    expect(formatAssetAmount('50000000', 8)).toBe('0.5')
    // 10.25 USDT
    expect(formatAssetAmount('10250000', 6)).toBe('10.25')
  })

  it('trims trailing zeros', () => {
    // 1.10 should be 1.1
    expect(formatAssetAmount('1100000000000000000', 18)).toBe('1.1')
    // 2.500 should be 2.5
    expect(formatAssetAmount('2500000', 6)).toBe('2.5')
  })

  it('handles small amounts', () => {
    // 0.001 ETH
    expect(formatAssetAmount('1000000000000000', 18)).toBe('0.001')
    // 0.000001 USDT
    expect(formatAssetAmount('1', 6)).toBe('0.000001')
  })

  it('handles large amounts', () => {
    // 1000000 ETH
    expect(formatAssetAmount('1000000000000000000000000', 18)).toBe('1000000')
    // 999999.999999 USDT
    expect(formatAssetAmount('999999999999', 6)).toBe('999999.999999')
  })
})

describe('formatFiatValue', () => {
  it('formats USD values', () => {
    // 1 ETH at $2500 = $2500.00
    expect(formatFiatValue('1000000000000000000', 18, 2500, 'USD')).toBe('$2,500.00')
  })

  it('formats small values', () => {
    // 0.5 ETH at $2500 = $1250.00
    expect(formatFiatValue('500000000000000000', 18, 2500, 'USD')).toBe('$1,250.00')
  })

  it('returns $0.00 for zero amount', () => {
    expect(formatFiatValue('0', 18, 2500, 'USD')).toBe('$0.00')
    expect(formatFiatValue('', 18, 2500, 'USD')).toBe('$0.00')
  })

  it('returns $0.00 when price is zero', () => {
    expect(formatFiatValue('1000000000000000000', 18, 0, 'USD')).toBe('$0.00')
  })

  it('formats CNY values', () => {
    // 1 ETH at $2500 in CNY
    const result = formatFiatValue('1000000000000000000', 18, 2500, 'CNY')
    expect(result).toContain('2,500.00')
  })

  it('formats EUR values', () => {
    const result = formatFiatValue('1000000000000000000', 18, 2500, 'EUR')
    expect(result).toContain('2.500,00') // German locale uses comma for decimals
  })

  it('defaults to USD for unknown currency', () => {
    expect(formatFiatValue('1000000000000000000', 18, 2500, 'UNKNOWN')).toBe('$2,500.00')
  })
})

describe('formatPriceChange', () => {
  it('formats positive change with plus sign', () => {
    expect(formatPriceChange(2.5)).toBe('+2.50%')
    expect(formatPriceChange(0.1)).toBe('+0.10%')
  })

  it('formats negative change', () => {
    expect(formatPriceChange(-1.3)).toBe('-1.30%')
    expect(formatPriceChange(-10.55)).toBe('-10.55%')
  })

  it('formats zero as positive', () => {
    expect(formatPriceChange(0)).toBe('+0.00%')
  })

  it('returns empty string for undefined', () => {
    expect(formatPriceChange(undefined)).toBe('')
  })
})

describe('convertFiat', () => {
  it('converts USD to target currency using rate', () => {
    // 1 USD = 7.2 CNY
    expect(convertFiat(100, 7.2)).toBe(720)
    expect(convertFiat(1, 7.2)).toBe(7.2)
  })

  it('handles rate of 1 (same currency)', () => {
    expect(convertFiat(100, 1)).toBe(100)
  })

  it('handles rates less than 1', () => {
    // 1 USD = 0.92 EUR
    expect(convertFiat(100, 0.92)).toBeCloseTo(92, 2)
  })

  it('handles zero amount', () => {
    expect(convertFiat(0, 7.2)).toBe(0)
  })
})

describe('formatFiatValue with exchange rate', () => {
  it('applies exchange rate when currency is not USD', () => {
    // 1 ETH at $2500, convert to CNY at rate 7.2
    // Expected: 2500 * 7.2 = 18000 CNY
    const result = formatFiatValue('1000000000000000000', 18, 2500, {
      currency: 'CNY',
      exchangeRate: 7.2,
    })
    expect(result).toContain('18,000.00')
  })

  it('ignores exchange rate when currency is USD', () => {
    // Even with exchange rate provided, USD should not be converted
    const result = formatFiatValue('1000000000000000000', 18, 2500, {
      currency: 'USD',
      exchangeRate: 7.2,
    })
    expect(result).toBe('$2,500.00')
  })

  it('works without exchange rate (legacy behavior)', () => {
    // Without exchange rate, just formats the USD value with target currency symbol
    const result = formatFiatValue('1000000000000000000', 18, 2500, {
      currency: 'CNY',
    })
    expect(result).toContain('2,500.00')
  })

  it('supports legacy string parameter', () => {
    // Legacy call with string currency parameter
    const result = formatFiatValue('1000000000000000000', 18, 2500, 'USD')
    expect(result).toBe('$2,500.00')
  })

  it('uses custom locale when provided', () => {
    const result = formatFiatValue('1000000000000000000', 18, 2500, {
      currency: 'EUR',
      exchangeRate: 0.92,
      locale: 'en-US',
    })
    // Using en-US locale for EUR should give different format
    expect(result).toContain('2,300.00')
  })

  it('formats zero with target currency symbol', () => {
    const result = formatFiatValue('0', 18, 2500, {
      currency: 'CNY',
      exchangeRate: 7.2,
    })
    // Should show CNY formatted zero, not USD
    expect(result).toContain('0.00')
  })
})
