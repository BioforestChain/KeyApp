import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WrappedIdentityProvider } from '../wrapped-identity-provider'
import type { IIdentityService } from '../../types'

// Mock service
function createMockIdentityService(): IIdentityService {
  return {
    deriveAddress: vi.fn(),
    deriveAddresses: vi.fn(),
    isValidAddress: vi.fn(),
    normalizeAddress: vi.fn(),
    signMessage: vi.fn(),
    verifyMessage: vi.fn(),
  }
}

describe('WrappedIdentityProvider', () => {
  let identityService: IIdentityService
  let provider: WrappedIdentityProvider

  beforeEach(() => {
    identityService = createMockIdentityService()
    provider = new WrappedIdentityProvider('wrapped-test-identity', identityService)
  })

  describe('constructor', () => {
    it('sets type and empty endpoint', () => {
      expect(provider.type).toBe('wrapped-test-identity')
      expect(provider.endpoint).toBe('')
    })
  })

  describe('deriveAddress', () => {
    it('delegates to identityService with default index', async () => {
      vi.mocked(identityService.deriveAddress).mockResolvedValue('0x123abc')

      const seed = new Uint8Array(64)
      const result = await provider.deriveAddress(seed)

      expect(identityService.deriveAddress).toHaveBeenCalledWith(seed, 0)
      expect(result).toBe('0x123abc')
    })

    it('delegates to identityService with specified index', async () => {
      vi.mocked(identityService.deriveAddress).mockResolvedValue('0x456def')

      const seed = new Uint8Array(64)
      const result = await provider.deriveAddress(seed, 5)

      expect(identityService.deriveAddress).toHaveBeenCalledWith(seed, 5)
      expect(result).toBe('0x456def')
    })
  })

  describe('deriveAddresses', () => {
    it('delegates to identityService', async () => {
      const mockAddresses = ['0x1', '0x2', '0x3']
      vi.mocked(identityService.deriveAddresses).mockResolvedValue(mockAddresses)

      const seed = new Uint8Array(64)
      const result = await provider.deriveAddresses(seed, 0, 3)

      expect(identityService.deriveAddresses).toHaveBeenCalledWith(seed, 0, 3)
      expect(result).toEqual(mockAddresses)
    })
  })

  describe('isValidAddress', () => {
    it('delegates to identityService and returns true for valid address', () => {
      vi.mocked(identityService.isValidAddress).mockReturnValue(true)

      const result = provider.isValidAddress('0x123')

      expect(identityService.isValidAddress).toHaveBeenCalledWith('0x123')
      expect(result).toBe(true)
    })

    it('delegates to identityService and returns false for invalid address', () => {
      vi.mocked(identityService.isValidAddress).mockReturnValue(false)

      const result = provider.isValidAddress('invalid')

      expect(identityService.isValidAddress).toHaveBeenCalledWith('invalid')
      expect(result).toBe(false)
    })
  })

  describe('normalizeAddress', () => {
    it('delegates to identityService', () => {
      vi.mocked(identityService.normalizeAddress).mockReturnValue('0x123abc')

      const result = provider.normalizeAddress('0x123ABC')

      expect(identityService.normalizeAddress).toHaveBeenCalledWith('0x123ABC')
      expect(result).toBe('0x123abc')
    })
  })
})
