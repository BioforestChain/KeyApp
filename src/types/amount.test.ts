import { describe, it, expect } from 'vitest'
import { Amount, amountFromAsset } from './amount'

describe('Amount', () => {
  describe('fromRaw', () => {
    it('should create from bigint', () => {
      const amount = Amount.fromRaw(1000000000000000000n, 18, 'ETH')
      expect(amount.raw).toBe(1000000000000000000n)
      expect(amount.decimals).toBe(18)
      expect(amount.symbol).toBe('ETH')
    })

    it('should create from string', () => {
      const amount = Amount.fromRaw('1000000000000000000', 18)
      expect(amount.raw).toBe(1000000000000000000n)
    })
  })

  describe('fromFormatted', () => {
    it('should parse whole number', () => {
      const amount = Amount.fromFormatted('100', 18)
      expect(amount.raw).toBe(100000000000000000000n)
    })

    it('should parse decimal number', () => {
      const amount = Amount.fromFormatted('1.5', 18)
      expect(amount.raw).toBe(1500000000000000000n)
    })

    it('should parse small decimal', () => {
      const amount = Amount.fromFormatted('0.001', 18)
      expect(amount.raw).toBe(1000000000000000n)
    })

    it('should throw on invalid format', () => {
      expect(() => Amount.fromFormatted('abc', 18)).toThrow('Invalid amount format')
    })

    it('should throw on too many decimals', () => {
      expect(() => Amount.fromFormatted('1.0000000000000000001', 18)).toThrow()
    })
  })

  describe('tryFromFormatted', () => {
    it('should return Amount on valid input', () => {
      const amount = Amount.tryFromFormatted('1.5', 18)
      expect(amount).not.toBeNull()
      expect(amount?.toFormatted()).toBe('1.5')
    })

    it('should return null on invalid input', () => {
      expect(Amount.tryFromFormatted('abc', 18)).toBeNull()
      expect(Amount.tryFromFormatted('', 18)).toBeNull()
    })
  })

  describe('parse (smart parsing)', () => {
    it('should parse raw value (no decimal point)', () => {
      const amount = Amount.parse('1000000000000000000', 18)
      expect(amount.toFormatted()).toBe('1')
    })

    it('should parse formatted value (with decimal point)', () => {
      const amount = Amount.parse('102531.02649070', 8) // 问题中的实际值
      expect(amount.toFormatted()).toBe('102531.0264907')
    })

    it('should handle the SendPage error case', () => {
      // 这是导致 BUG 的实际值
      const amount = Amount.parse('102531.02649070', 8)
      expect(amount.isPositive()).toBe(true)
      expect(amount.raw).toBe(10253102649070n)
    })
  })

  describe('toFormatted', () => {
    it('should format whole number', () => {
      const amount = Amount.fromRaw(1000000000000000000n, 18)
      expect(amount.toFormatted()).toBe('1')
    })

    it('should format decimal with trimmed zeros', () => {
      const amount = Amount.fromRaw(1500000000000000000n, 18)
      expect(amount.toFormatted()).toBe('1.5')
    })

    it('should keep trailing zeros when specified', () => {
      const amount = Amount.fromRaw(1500000000000000000n, 18)
      expect(amount.toFormatted({ trimTrailingZeros: false })).toBe('1.500000000000000000')
    })

    it('should format zero', () => {
      expect(Amount.zero(18).toFormatted()).toBe('0')
    })
  })

  describe('comparison', () => {
    const a = Amount.fromFormatted('1.5', 18)
    const b = Amount.fromFormatted('2.0', 18)
    const c = Amount.fromFormatted('1.5', 18)

    it('gt', () => {
      expect(b.gt(a)).toBe(true)
      expect(a.gt(b)).toBe(false)
    })

    it('gte', () => {
      expect(b.gte(a)).toBe(true)
      expect(a.gte(c)).toBe(true)
    })

    it('lt', () => {
      expect(a.lt(b)).toBe(true)
      expect(b.lt(a)).toBe(false)
    })

    it('lte', () => {
      expect(a.lte(b)).toBe(true)
      expect(a.lte(c)).toBe(true)
    })

    it('eq', () => {
      expect(a.eq(c)).toBe(true)
      expect(a.eq(b)).toBe(false)
    })

    it('should throw on different decimals', () => {
      const x = Amount.fromFormatted('1', 18)
      const y = Amount.fromFormatted('1', 8)
      expect(() => x.gt(y)).toThrow('decimals mismatch')
    })
  })

  describe('arithmetic', () => {
    it('add', () => {
      const a = Amount.fromFormatted('1.5', 18)
      const b = Amount.fromFormatted('2.5', 18)
      expect(a.add(b).toFormatted()).toBe('4')
    })

    it('sub', () => {
      const a = Amount.fromFormatted('5', 18)
      const b = Amount.fromFormatted('1.5', 18)
      expect(a.sub(b).toFormatted()).toBe('3.5')
    })

    it('mul by integer', () => {
      const a = Amount.fromFormatted('1.5', 18)
      expect(a.mul(2n).toFormatted()).toBe('3')
    })

    it('mul by float', () => {
      const a = Amount.fromFormatted('10', 18)
      expect(a.mul(0.5).toFormatted()).toBe('5')
    })

    it('div by integer', () => {
      const a = Amount.fromFormatted('10', 18)
      expect(a.div(2n).toFormatted()).toBe('5')
    })

    it('min/max', () => {
      const a = Amount.fromFormatted('1', 18)
      const b = Amount.fromFormatted('2', 18)
      expect(a.min(b).eq(a)).toBe(true)
      expect(a.max(b).eq(b)).toBe(true)
    })
  })

  describe('utility methods', () => {
    it('isZero', () => {
      expect(Amount.zero(18).isZero()).toBe(true)
      expect(Amount.fromFormatted('1', 18).isZero()).toBe(false)
    })

    it('isPositive', () => {
      expect(Amount.fromFormatted('1', 18).isPositive()).toBe(true)
      expect(Amount.zero(18).isPositive()).toBe(false)
    })

    it('toNumber', () => {
      const amount = Amount.fromFormatted('1.5', 18)
      expect(amount.toNumber()).toBe(1.5)
    })

    it('toString with symbol', () => {
      const amount = Amount.fromFormatted('1.5', 18, 'ETH')
      expect(amount.toString()).toBe('1.5 ETH')
    })

    it('withSymbol', () => {
      const amount = Amount.fromFormatted('1.5', 18)
      expect(amount.withSymbol('ETH').symbol).toBe('ETH')
    })
  })

  describe('amountFromAsset', () => {
    it('should handle raw amount (no decimal)', () => {
      const asset = { amount: '1000000000000000000', decimals: 18, assetType: 'ETH' }
      const amount = amountFromAsset(asset)
      expect(amount.toFormatted()).toBe('1')
    })

    it('should handle formatted amount (with decimal)', () => {
      const asset = { amount: '102531.02649070', decimals: 8, assetType: 'BTC' }
      const amount = amountFromAsset(asset)
      expect(amount.isPositive()).toBe(true)
      expect(amount.toFormatted()).toBe('102531.0264907')
    })
  })
})
