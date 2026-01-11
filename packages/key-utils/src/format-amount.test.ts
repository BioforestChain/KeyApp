import { describe, it, expect } from 'vitest'
import { formatAmount, getEffectiveDecimals } from './format-amount'

describe('formatAmount', () => {
  it('formats zero correctly', () => {
    expect(formatAmount(0)).toEqual({
      formatted: '0',
      isNegative: false,
      isZero: true,
      numValue: 0,
    })
  })

  it('formats positive numbers', () => {
    const result = formatAmount(1234.56, { decimals: 2 })
    expect(result.formatted).toBe('1,234.56')
    expect(result.isNegative).toBe(false)
  })

  it('formats negative numbers', () => {
    const result = formatAmount(-100, { decimals: 2 })
    expect(result.formatted).toBe('100')
    expect(result.isNegative).toBe(true)
  })

  it('formats compact thousands', () => {
    expect(formatAmount(12500, { compact: true }).formatted).toBe('12.5K')
  })

  it('formats compact millions', () => {
    expect(formatAmount(1500000, { compact: true }).formatted).toBe('1.5M')
  })

  it('formats compact billions', () => {
    expect(formatAmount(2500000000, { compact: true }).formatted).toBe('2.5B')
  })

  it('handles string input', () => {
    expect(formatAmount('1234.56', { decimals: 2 }).formatted).toBe('1,234.56')
  })

  it('handles invalid input', () => {
    expect(formatAmount('invalid')).toEqual({
      formatted: '0',
      isNegative: false,
      isZero: true,
      numValue: 0,
    })
  })
})

describe('getEffectiveDecimals', () => {
  it('returns 0 for zero', () => {
    expect(getEffectiveDecimals(0, 8)).toBe(0)
  })

  it('returns correct decimals for whole numbers', () => {
    expect(getEffectiveDecimals(100, 8)).toBe(0)
  })

  it('returns correct decimals for fractional numbers', () => {
    expect(getEffectiveDecimals(1.5, 8)).toBe(1)
    expect(getEffectiveDecimals(1.25, 8)).toBe(2)
    expect(getEffectiveDecimals(1.123, 8)).toBe(3)
  })
})
