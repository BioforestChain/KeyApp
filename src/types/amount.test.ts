import { describe, it, expect } from 'vitest'
import { Amount, amountFromAsset, isAmount, toAmount } from './amount'

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

    it('should create from number', () => {
      const amount = Amount.fromRaw(1000000, 6)
      expect(amount.raw).toBe(1000000n)
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

    it('should parse negative number', () => {
      const amount = Amount.fromFormatted('-1.5', 18)
      expect(amount.raw).toBe(-1500000000000000000n)
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
      expect(Amount.tryFromFormatted('.', 18)).toBeNull()
      expect(Amount.tryFromFormatted('1.2.3', 18)).toBeNull()
    })

    it('should return null when exceeding decimals', () => {
      expect(Amount.tryFromFormatted('1.123456789', 8)).toBeNull()
    })
  })

  describe('parse (smart parsing)', () => {
    it('should parse raw value (no decimal point)', () => {
      const amount = Amount.parse('1000000000000000000', 18)
      expect(amount.toFormatted()).toBe('1')
    })

    it('should parse formatted value (with decimal point)', () => {
      const amount = Amount.parse('102531.02649070', 8)
      expect(amount.toFormatted()).toBe('102531.0264907')
    })

    it('should handle the SendPage error case', () => {
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

  describe('toDisplayString', () => {
    it('should format with thousands separator', () => {
      const amount = Amount.fromFormatted('1234567.89', 8)
      expect(amount.toDisplayString({ locale: 'en-US' })).toBe('1,234,567.89')
    })

    it('should respect maximumFractionDigits', () => {
      const amount = Amount.fromFormatted('1.23456789', 8)
      expect(amount.toDisplayString({ maximumFractionDigits: 2 })).toBe('1.23')
    })

    it('should use different locale', () => {
      const amount = Amount.fromFormatted('1234.56', 8)
      expect(amount.toDisplayString({ locale: 'de-DE' })).toBe('1.234,56')
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
      expect(a.mul(2).toFormatted()).toBe('3')
    })

    it('mul by float', () => {
      const a = Amount.fromFormatted('10', 18)
      expect(a.mul(0.5).toFormatted()).toBe('5')
    })

    it('div by integer', () => {
      const a = Amount.fromFormatted('10', 18)
      expect(a.div(2).toFormatted()).toBe('5')
    })

    it('div rounds down', () => {
      const a = Amount.fromFormatted('10', 18)
      expect(a.div(3).toFormatted()).toBe('3.333333333333333333')
    })

    it('mod', () => {
      // mod 操作在原始值上进行，10 raw % 3 = 1 raw
      const a = Amount.fromRaw('10', 18)
      expect(a.mod(3).toRawString()).toBe('1')
    })

    it('abs', () => {
      const a = Amount.fromFormatted('-5', 18)
      expect(a.abs().toFormatted()).toBe('5')
    })

    it('neg', () => {
      const a = Amount.fromFormatted('5', 18)
      expect(a.neg().toFormatted()).toBe('-5')
    })

    it('percent', () => {
      const a = Amount.fromFormatted('100', 18)
      expect(a.percent(5).toFormatted()).toBe('5')
    })

    it('min/max', () => {
      const a = Amount.fromFormatted('1', 18)
      const b = Amount.fromFormatted('2', 18)
      expect(a.min(b).eq(a)).toBe(true)
      expect(a.max(b).eq(b)).toBe(true)
    })
  })

  describe('decimals conversion', () => {
    it('should convert to higher decimals', () => {
      const amount = Amount.fromRaw('1000000', 6) // 1 USDC
      const converted = amount.toDecimals(18)
      expect(converted.decimals).toBe(18)
      expect(converted.toFormatted()).toBe('1')
    })

    it('should convert to lower decimals', () => {
      const amount = Amount.fromRaw('1000000000000000000', 18) // 1 ETH
      const converted = amount.toDecimals(6)
      expect(converted.decimals).toBe(6)
      expect(converted.toFormatted()).toBe('1')
    })

    it('should preserve value during conversion', () => {
      const amount = Amount.fromFormatted('123.456789', 8)
      const converted = amount.toDecimals(18).toDecimals(8)
      expect(converted.toFormatted()).toBe('123.456789')
    })
  })

  describe('serialization', () => {
    it('toJSON', () => {
      const amount = Amount.fromFormatted('1.5', 18, 'ETH')
      const json = amount.toJSON()
      expect(json).toEqual({
        raw: '1500000000000000000',
        decimals: 18,
        symbol: 'ETH',
      })
    })

    it('toJSON without symbol', () => {
      const amount = Amount.fromFormatted('1.5', 18)
      const json = amount.toJSON()
      expect(json).toEqual({
        raw: '1500000000000000000',
        decimals: 18,
      })
    })

    it('fromJSON', () => {
      const json = { raw: '1500000000000000000', decimals: 18, symbol: 'ETH' }
      const amount = Amount.fromJSON(json)
      expect(amount.toFormatted()).toBe('1.5')
      expect(amount.symbol).toBe('ETH')
    })

    it('roundtrip', () => {
      const original = Amount.fromFormatted('123.456789', 18, 'TOKEN')
      const restored = Amount.fromJSON(original.toJSON())
      expect(restored.eq(original)).toBe(true)
      expect(restored.symbol).toBe(original.symbol)
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
      expect(Amount.fromFormatted('-1', 18).isPositive()).toBe(false)
    })

    it('isNegative', () => {
      expect(Amount.fromFormatted('-1', 18).isNegative()).toBe(true)
      expect(Amount.zero(18).isNegative()).toBe(false)
      expect(Amount.fromFormatted('1', 18).isNegative()).toBe(false)
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

    it('withRaw', () => {
      const amount = Amount.fromFormatted('1', 18, 'ETH')
      const newAmount = amount.withRaw('2000000000000000000')
      expect(newAmount.toFormatted()).toBe('2')
      expect(newAmount.symbol).toBe('ETH')
    })

    it('withAsset', () => {
      const amount = Amount.fromRaw('1000000', 6)
      const newAmount = amount.withAsset({ decimals: 18, assetType: 'ETH' })
      expect(newAmount.decimals).toBe(18)
      expect(newAmount.symbol).toBe('ETH')
      expect(newAmount.toFormatted()).toBe('1')
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

  describe('isAmount', () => {
    it('should return true for Amount', () => {
      expect(isAmount(Amount.zero(18))).toBe(true)
    })

    it('should return false for non-Amount', () => {
      expect(isAmount('123')).toBe(false)
      expect(isAmount(123)).toBe(false)
      expect(isAmount(null)).toBe(false)
      expect(isAmount({})).toBe(false)
    })
  })

  describe('toAmount', () => {
    it('should return same instance if already Amount', () => {
      const amount = Amount.fromFormatted('1', 18)
      expect(toAmount(amount, 18)).toBe(amount)
    })

    it('should parse string', () => {
      const amount = toAmount('1.5', 18, 'ETH')
      expect(amount.toFormatted()).toBe('1.5')
      expect(amount.symbol).toBe('ETH')
    })
  })

  describe('precision edge cases', () => {
    it('should handle very large numbers', () => {
      const amount = Amount.fromRaw('999999999999999999999999999999999999', 18)
      expect(amount.toRawString()).toBe('999999999999999999999999999999999999')
    })

    it('should handle very small decimals', () => {
      const amount = Amount.fromFormatted('0.000000000000000001', 18)
      expect(amount.raw).toBe(1n)
    })

    it('should maintain precision in calculations', () => {
      const a = Amount.fromFormatted('0.1', 18)
      const b = Amount.fromFormatted('0.2', 18)
      const sum = a.add(b)
      expect(sum.toFormatted()).toBe('0.3')
    })
  })
})
