import { describe, it, expect } from 'vitest'
import { Amount } from './amount'
import {
  formatFiatValue,
  formatPriceChange,
  convertFiat,
} from './asset'

describe('Amount.toFormatted (replaces formatAssetAmount)', () => {
  it('formats zero amount', () => {
    expect(Amount.zero(18).toFormatted()).toBe('0')
    expect(Amount.fromRaw('0', 18).toFormatted()).toBe('0')
  })

  it('formats integer amounts', () => {
    // 1 ETH = 1000000000000000000 wei
    expect(Amount.fromRaw('1000000000000000000', 18).toFormatted()).toBe('1')
    // 100 USDT = 100000000 (6 decimals)
    expect(Amount.fromRaw('100000000', 6).toFormatted()).toBe('100')
  })

  it('formats decimal amounts', () => {
    // 1.5 ETH
    expect(Amount.fromRaw('1500000000000000000', 18).toFormatted()).toBe('1.5')
    // 0.5 BTC
    expect(Amount.fromRaw('50000000', 8).toFormatted()).toBe('0.5')
    // 10.25 USDT
    expect(Amount.fromRaw('10250000', 6).toFormatted()).toBe('10.25')
  })

  it('trims trailing zeros', () => {
    // 1.10 should be 1.1
    expect(Amount.fromRaw('1100000000000000000', 18).toFormatted()).toBe('1.1')
    // 2.500 should be 2.5
    expect(Amount.fromRaw('2500000', 6).toFormatted()).toBe('2.5')
  })

  it('handles small amounts', () => {
    // 0.001 ETH
    expect(Amount.fromRaw('1000000000000000', 18).toFormatted()).toBe('0.001')
    // 0.000001 USDT
    expect(Amount.fromRaw('1', 6).toFormatted()).toBe('0.000001')
  })

  it('handles large amounts', () => {
    // 1000000 ETH
    expect(Amount.fromRaw('1000000000000000000000000', 18).toFormatted()).toBe('1000000')
    // 999999.999999 USDT
    expect(Amount.fromRaw('999999999999', 6).toFormatted()).toBe('999999.999999')
  })
})

describe('formatFiatValue', () => {
  it('formats USD values', () => {
    const amount = Amount.fromRaw('1000000000000000000', 18)
    expect(formatFiatValue(amount, 18, 2500, 'USD')).toBe('$2,500.00')
  })

  it('formats small values', () => {
    const amount = Amount.fromRaw('500000000000000000', 18)
    expect(formatFiatValue(amount, 18, 2500, 'USD')).toBe('$1,250.00')
  })

  it('returns $0.00 for zero amount', () => {
    expect(formatFiatValue(Amount.zero(18), 18, 2500, 'USD')).toBe('$0.00')
  })

  it('returns $0.00 when price is zero', () => {
    const amount = Amount.fromRaw('1000000000000000000', 18)
    expect(formatFiatValue(amount, 18, 0, 'USD')).toBe('$0.00')
  })

  it('formats CNY values', () => {
    const amount = Amount.fromRaw('1000000000000000000', 18)
    const result = formatFiatValue(amount, 18, 2500, 'CNY')
    expect(result).toContain('2,500.00')
  })

  it('formats EUR values', () => {
    const amount = Amount.fromRaw('1000000000000000000', 18)
    const result = formatFiatValue(amount, 18, 2500, 'EUR')
    expect(result).toContain('2.500,00') // German locale uses comma for decimals
  })

  it('defaults to USD for unknown currency', () => {
    const amount = Amount.fromRaw('1000000000000000000', 18)
    expect(formatFiatValue(amount, 18, 2500, 'UNKNOWN')).toBe('$2,500.00')
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
    const amount = Amount.fromRaw('1000000000000000000', 18)
    const result = formatFiatValue(amount, 18, 2500, {
      currency: 'CNY',
      exchangeRate: 7.2,
    })
    expect(result).toContain('18,000.00')
  })

  it('ignores exchange rate when currency is USD', () => {
    const amount = Amount.fromRaw('1000000000000000000', 18)
    const result = formatFiatValue(amount, 18, 2500, {
      currency: 'USD',
      exchangeRate: 7.2,
    })
    expect(result).toBe('$2,500.00')
  })

  it('works without exchange rate (legacy behavior)', () => {
    const amount = Amount.fromRaw('1000000000000000000', 18)
    const result = formatFiatValue(amount, 18, 2500, {
      currency: 'CNY',
    })
    expect(result).toContain('2,500.00')
  })

  it('supports legacy string parameter', () => {
    const amount = Amount.fromRaw('1000000000000000000', 18)
    const result = formatFiatValue(amount, 18, 2500, 'USD')
    expect(result).toBe('$2,500.00')
  })

  it('uses custom locale when provided', () => {
    const amount = Amount.fromRaw('1000000000000000000', 18)
    const result = formatFiatValue(amount, 18, 2500, {
      currency: 'EUR',
      exchangeRate: 0.92,
      locale: 'en-US',
    })
    expect(result).toContain('2,300.00')
  })

  it('formats zero with target currency symbol', () => {
    const result = formatFiatValue(Amount.zero(18), 18, 2500, {
      currency: 'CNY',
      exchangeRate: 7.2,
    })
    expect(result).toContain('0.00')
  })
})
