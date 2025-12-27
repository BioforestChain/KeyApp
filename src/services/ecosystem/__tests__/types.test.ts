import { describe, it, expect } from 'vitest'
import {
  BioErrorCodes,
  createErrorResponse,
  createSuccessResponse,
} from '../types'

describe('Bio Ecosystem Types', () => {
  describe('BioErrorCodes', () => {
    it('has standard error codes', () => {
      expect(BioErrorCodes.USER_REJECTED).toBe(4001)
      expect(BioErrorCodes.UNAUTHORIZED).toBe(4100)
      expect(BioErrorCodes.UNSUPPORTED_METHOD).toBe(4200)
      expect(BioErrorCodes.DISCONNECTED).toBe(4900)
      expect(BioErrorCodes.INTERNAL_ERROR).toBe(-32603)
      expect(BioErrorCodes.INVALID_PARAMS).toBe(-32602)
      expect(BioErrorCodes.METHOD_NOT_FOUND).toBe(-32601)
    })
  })

  describe('createErrorResponse', () => {
    it('creates error response with code and message', () => {
      const response = createErrorResponse('req-1', 4001, 'User rejected')
      
      expect(response).toEqual({
        type: 'bio_response',
        id: 'req-1',
        success: false,
        error: {
          code: 4001,
          message: 'User rejected',
        },
      })
    })

    it('includes optional data', () => {
      const response = createErrorResponse('req-2', -32602, 'Invalid params', { field: 'address' })
      
      expect(response.error?.data).toEqual({ field: 'address' })
    })
  })

  describe('createSuccessResponse', () => {
    it('creates success response with result', () => {
      const result = [{ address: '0x123', chain: 'ethereum' }]
      const response = createSuccessResponse('req-3', result)
      
      expect(response).toEqual({
        type: 'bio_response',
        id: 'req-3',
        success: true,
        result,
      })
    })

    it('handles null result', () => {
      const response = createSuccessResponse('req-4', null)
      
      expect(response.success).toBe(true)
      expect(response.result).toBeNull()
    })
  })
})
