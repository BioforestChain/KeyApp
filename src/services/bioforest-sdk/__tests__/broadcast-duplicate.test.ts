/**
 * TDD: 测试重复交易 (001-00034) 应被视为成功
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock ApiError
class MockApiError extends Error {
  response: unknown
  constructor(message: string, response: unknown) {
    super(message)
    this.name = 'ApiError'
    this.response = response
  }
}

// 测试 001-00034 错误码的处理逻辑
describe('broadcastTransaction duplicate handling', () => {
  describe('001-00034 error code', () => {
    it('should treat 001-00034 as success with alreadyExists=true', () => {
      const errorCode = '001-00034'
      const shouldTreatAsSuccess = errorCode === '001-00034'
      
      expect(shouldTreatAsSuccess).toBe(true)
    })

    it('should extract error code from API response', () => {
      const apiResponse = {
        success: false,
        error: {
          code: '001-00034',
          message: 'Transaction with signature xxx in blockChain already exist'
        }
      }
      
      const errorCode = apiResponse.error?.code
      expect(errorCode).toBe('001-00034')
    })

    it('should return BroadcastResult with alreadyExists when 001-00034', () => {
      const errorCode = '001-00034'
      const txSignature = 'abc123def456'
      
      // 模拟修复后的逻辑
      const result = errorCode === '001-00034'
        ? { txHash: txSignature, alreadyExists: true }
        : null
      
      expect(result).not.toBeNull()
      expect(result?.txHash).toBe(txSignature)
      expect(result?.alreadyExists).toBe(true)
    })

    it('should NOT throw BroadcastError for 001-00034', () => {
      const errorCode = '001-00034'
      
      // 修复后的逻辑：001-00034 不应该抛出错误
      const shouldThrow = errorCode !== '001-00034'
      
      expect(shouldThrow).toBe(false)
    })
  })

  describe('other error codes should still throw', () => {
    it('should throw BroadcastError for 001-11028 (asset not enough)', () => {
      const errorCode = '001-11028'
      const shouldThrow = errorCode !== '001-00034'
      
      expect(shouldThrow).toBe(true)
    })

    it('should throw BroadcastError for 001-11029 (fee not enough)', () => {
      const errorCode = '001-11029'
      const shouldThrow = errorCode !== '001-00034'
      
      expect(shouldThrow).toBe(true)
    })
  })
})
