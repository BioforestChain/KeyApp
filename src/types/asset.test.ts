import { describe, it, expect } from 'vitest'
import { formatAssetAmount } from './asset'

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
