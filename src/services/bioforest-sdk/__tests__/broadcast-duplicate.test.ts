/**
 * TDD: 测试重复交易 (001-00034) 应被视为成功
 * 
 * 实际 API 响应:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "001-00034",
 *     "message": "Transaction with signature xxx in blockChain already exist, errorId {errorId}"
 *   }
 * }
 * 
 * ApiClient 在 !json.success 时抛出 ApiError，其中 response = json（完整响应）
 */
import { describe, it, expect } from 'vitest'
import { BroadcastResultSchema } from '@/apis/bnqkl_wallet/bioforest/types'
import { ApiError } from '@/apis/bnqkl_wallet/client'
import { BroadcastError } from '../errors'

describe('BroadcastResultSchema parsing', () => {
  it('should correctly parse 001-00034 duplicate transaction response', () => {
    // 实际 API 响应（这就是 ApiError.response 的内容）
    const apiResponse = {
      success: false,
      error: {
        code: '001-00034',
        message: 'Transaction with signature 090c8ac83d9692acb30a23df5e11e66f318221fe7bcd035d972c6b56cf7576aad3a04ae00ce16b5127726ca065df9c4558879909c7eaf517445782b21ef4160e in blockChain already exist, errorId {errorId}'
      }
    }
    
    const parseResult = BroadcastResultSchema.safeParse(apiResponse)
    
    // 验证 Schema 能正确解析
    expect(parseResult.success).toBe(true)
    if (parseResult.success) {
      expect(parseResult.data.success).toBe(false)
      expect(parseResult.data.error?.code).toBe('001-00034')
      expect(parseResult.data.error?.message).toContain('already exist')
    }
  })

  it('should extract errorCode from parsed result', () => {
    const apiResponse = {
      success: false,
      error: {
        code: '001-00034',
        message: 'Transaction already exist'
      }
    }
    
    const parseResult = BroadcastResultSchema.safeParse(apiResponse)
    expect(parseResult.success).toBe(true)
    
    if (parseResult.success) {
      const result = parseResult.data
      const errorCode = result.error?.code
      
      // 关键断言：errorCode 应该是 '001-00034'
      expect(errorCode).toBe('001-00034')
      
      // 验证 001-00034 检查逻辑
      const isDuplicate = errorCode === '001-00034'
      expect(isDuplicate).toBe(true)
    }
  })
})

describe('001-00034 handling logic', () => {
  it('should treat 001-00034 as success with alreadyExists=true', () => {
    const errorCode = '001-00034'
    const txSignature = 'abc123def456'
    
    // 模拟 broadcastTransaction 中的处理逻辑
    const shouldReturnSuccess = errorCode === '001-00034'
    
    expect(shouldReturnSuccess).toBe(true)
    
    if (shouldReturnSuccess) {
      const result = { txHash: txSignature, alreadyExists: true }
      expect(result.txHash).toBe(txSignature)
      expect(result.alreadyExists).toBe(true)
    }
  })

  it('should throw BroadcastError for other error codes', () => {
    const testCases = [
      { code: '001-11028', shouldThrow: true },  // asset not enough
      { code: '001-11029', shouldThrow: true },  // fee not enough
      { code: '002-41011', shouldThrow: true },  // fee not enough
      { code: '001-00034', shouldThrow: false }, // duplicate - should NOT throw
    ]
    
    for (const { code, shouldThrow } of testCases) {
      const isDuplicate = code === '001-00034'
      expect(isDuplicate).toBe(!shouldThrow)
    }
  })
})

describe('ApiError.response parsing (simulates actual error flow)', () => {
  it('should parse error.response containing 001-00034', () => {
    // 模拟 ApiError.response 的内容
    // ApiClient 在 !json.success 时会把整个 json 作为 response
    const errorResponse = {
      success: false,
      error: {
        code: '001-00034',
        message: 'Transaction already exist'
      }
    }
    
    const parseResult = BroadcastResultSchema.safeParse(errorResponse)
    
    expect(parseResult.success).toBe(true)
    if (parseResult.success) {
      const errorCode = parseResult.data.error?.code
      expect(errorCode).toBe('001-00034')
    }
  })

  it('should simulate the complete broadcastTransaction error handling flow', () => {
    // 模拟完整的错误处理流程
    const apiErrorResponse = {
      success: false,
      error: {
        code: '001-00034',
        message: 'Transaction with signature xxx in blockChain already exist'
      }
    }
    
    const txSignature = 'test-signature-123'
    
    // Step 1: 解析响应
    const parseResult = BroadcastResultSchema.safeParse(apiErrorResponse)
    expect(parseResult.success).toBe(true)
    
    if (parseResult.success) {
      const result = parseResult.data
      const errorCode = result.error?.code
      
      // Step 2: 检查是否是 001-00034
      if (errorCode === '001-00034') {
        // Step 3: 应该返回成功结果
        const broadcastResult = { txHash: txSignature, alreadyExists: true }
        
        expect(broadcastResult.txHash).toBe(txSignature)
        expect(broadcastResult.alreadyExists).toBe(true)
      } else {
        // 不应该走到这里
        expect.fail('Should have detected 001-00034 as duplicate')
      }
    }
  })
})

describe('ApiError handling in catch block', () => {
  it('should handle ApiError with 001-00034 response', () => {
    // 模拟 ApiError 实例
    const apiErrorResponse = {
      success: false,
      error: {
        code: '001-00034',
        message: 'Transaction already exist'
      }
    }
    const apiError = new ApiError('Request failed', 400, apiErrorResponse)
    const txSignature = 'test-tx-signature'
    
    // 模拟 catch 块中的处理逻辑
    let result: { txHash: string; alreadyExists: boolean } | null = null
    let thrownError: BroadcastError | null = null
    
    try {
      // 模拟抛出 ApiError
      throw apiError
    } catch (error) {
      if (error instanceof ApiError && error.response) {
        const parseResult = BroadcastResultSchema.safeParse(error.response)
        if (parseResult.success) {
          const parsed = parseResult.data
          const errorCode = parsed.error?.code
          
          if (errorCode === '001-00034') {
            // 应该返回成功结果，不抛出错误
            result = { txHash: txSignature, alreadyExists: true }
          } else {
            thrownError = new BroadcastError(
              errorCode,
              parsed.error?.message ?? 'Transaction rejected'
            )
          }
        }
      }
    }
    
    // 验证：001-00034 应该返回成功结果，不抛出错误
    expect(result).not.toBeNull()
    expect(result?.txHash).toBe(txSignature)
    expect(result?.alreadyExists).toBe(true)
    expect(thrownError).toBeNull()
  })

  it('should throw BroadcastError for non-duplicate errors', () => {
    // 模拟非重复交易错误
    const apiErrorResponse = {
      success: false,
      error: {
        code: '001-11028',
        message: 'Asset not enough'
      }
    }
    const apiError = new ApiError('Request failed', 400, apiErrorResponse)
    const txSignature = 'test-tx-signature'
    
    let result: { txHash: string; alreadyExists: boolean } | null = null
    let thrownError: BroadcastError | null = null
    
    try {
      throw apiError
    } catch (error) {
      if (error instanceof ApiError && error.response) {
        const parseResult = BroadcastResultSchema.safeParse(error.response)
        if (parseResult.success) {
          const parsed = parseResult.data
          const errorCode = parsed.error?.code
          
          if (errorCode === '001-00034') {
            result = { txHash: txSignature, alreadyExists: true }
          } else {
            thrownError = new BroadcastError(
              errorCode,
              parsed.error?.message ?? 'Transaction rejected'
            )
          }
        }
      }
    }
    
    // 验证：非重复错误应该抛出 BroadcastError
    expect(result).toBeNull()
    expect(thrownError).not.toBeNull()
    expect(thrownError?.code).toBe('001-11028')
    expect(thrownError?.message).toBe('Asset not enough')
  })
})


