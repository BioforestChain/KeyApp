import { describe, it, expect } from 'vitest'
import { BioErrorCodes, createProviderError } from './types'

describe('BioErrorCodes', () => {
  it('should have correct error code values', () => {
    expect(BioErrorCodes.USER_REJECTED).toBe(4001)
    expect(BioErrorCodes.UNAUTHORIZED).toBe(4100)
    expect(BioErrorCodes.UNSUPPORTED_METHOD).toBe(4200)
    expect(BioErrorCodes.DISCONNECTED).toBe(4900)
    expect(BioErrorCodes.CHAIN_DISCONNECTED).toBe(4901)
    expect(BioErrorCodes.INTERNAL_ERROR).toBe(-32603)
    expect(BioErrorCodes.INVALID_PARAMS).toBe(-32602)
    expect(BioErrorCodes.METHOD_NOT_FOUND).toBe(-32601)
  })
})

describe('createProviderError', () => {
  it('should create an error with code and message', () => {
    const error = createProviderError(4001, 'User rejected')

    expect(error).toBeInstanceOf(Error)
    expect(error.code).toBe(4001)
    expect(error.message).toBe('User rejected')
    expect(error.data).toBeUndefined()
  })

  it('should include data when provided', () => {
    const data = { reason: 'test' }
    const error = createProviderError(4100, 'Unauthorized', data)

    expect(error.code).toBe(4100)
    expect(error.message).toBe('Unauthorized')
    expect(error.data).toEqual(data)
  })
})
