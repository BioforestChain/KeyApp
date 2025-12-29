import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  encodeTimestampMessage,
  encodeRechargeV2ToTrInfoData,
  createRechargeMessage,
} from './helpers'

describe('API Helpers', () => {
  describe('encodeTimestampMessage', () => {
    it('should encode message with timestamp', () => {
      const result = encodeTimestampMessage({
        timestamp: 1704067200000,
      })

      expect(result).toContain('1704067200000')
      expect(JSON.parse(result)).toEqual({ timestamp: 1704067200000 })
    })

    it('should return valid JSON', () => {
      const result = encodeTimestampMessage({
        timestamp: 1704067200000,
      })

      expect(() => JSON.parse(result)).not.toThrow()
    })
  })

  describe('encodeRechargeV2ToTrInfoData', () => {
    it('should encode recharge data correctly', () => {
      const result = encodeRechargeV2ToTrInfoData({
        chainName: 'bfmeta',
        address: 'BFM123456789',
        timestamp: 1704067200000,
      })

      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should produce different results for different inputs', () => {
      const result1 = encodeRechargeV2ToTrInfoData({
        chainName: 'bfmeta',
        address: 'addr1',
        timestamp: 1000,
      })

      const result2 = encodeRechargeV2ToTrInfoData({
        chainName: 'bfmeta',
        address: 'addr2',
        timestamp: 1000,
      })

      expect(result1).not.toBe(result2)
    })

    it('should be deterministic for same input', () => {
      const input = {
        chainName: 'bfmeta',
        address: 'testaddr',
        timestamp: 1704067200000,
      }

      const result1 = encodeRechargeV2ToTrInfoData(input)
      const result2 = encodeRechargeV2ToTrInfoData(input)

      expect(result1).toBe(result2)
    })
  })

  describe('createRechargeMessage', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should create message with current timestamp', () => {
      const result = createRechargeMessage({
        chainName: 'bfmeta',
        address: 'testaddr',
        assetType: 'BFM',
      })

      expect(result.chainName).toBe('bfmeta')
      expect(result.address).toBe('testaddr')
      expect(result.assetType).toBe('BFM')
      expect(result.timestamp).toBe(1704067200000)
    })

    it('should use current time for timestamp', () => {
      const before = Date.now()
      const result = createRechargeMessage({
        chainName: 'bfchain',
        address: 'addr123',
        assetType: 'BFC',
      })
      const after = Date.now()

      expect(result.timestamp).toBeGreaterThanOrEqual(before)
      expect(result.timestamp).toBeLessThanOrEqual(after)
    })

    it('should include all required fields', () => {
      const result = createRechargeMessage({
        chainName: 'bfmeta',
        address: 'testaddr',
        assetType: 'BFM',
      })

      expect(result).toHaveProperty('chainName')
      expect(result).toHaveProperty('address')
      expect(result).toHaveProperty('assetType')
      expect(result).toHaveProperty('timestamp')
    })
  })
})
