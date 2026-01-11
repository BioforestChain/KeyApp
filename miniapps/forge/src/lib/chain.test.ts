import { describe, it, expect } from 'vitest'
import {
  getChainType,
  isEvmChain,
  isTronChain,
  isValidTronBase58Address,
  isTronHexAddress,
  isEvmAddress,
  validateDepositAddress,
} from './chain'

describe('chain utilities', () => {
  describe('getChainType', () => {
    it('should return evm for ETH', () => {
      expect(getChainType('ETH')).toBe('evm')
      expect(getChainType('eth')).toBe('evm')
    })

    it('should return evm for BSC', () => {
      expect(getChainType('BSC')).toBe('evm')
      expect(getChainType('bsc')).toBe('evm')
    })

    it('should return tron for TRON', () => {
      expect(getChainType('TRON')).toBe('tron')
      expect(getChainType('tron')).toBe('tron')
    })

    it('should return bio for other chains', () => {
      expect(getChainType('bfmeta')).toBe('bio')
      expect(getChainType('bfchain')).toBe('bio')
    })
  })

  describe('isEvmChain', () => {
    it('should return true for EVM chains', () => {
      expect(isEvmChain('ETH')).toBe(true)
      expect(isEvmChain('BSC')).toBe(true)
    })

    it('should return false for non-EVM chains', () => {
      expect(isEvmChain('TRON')).toBe(false)
      expect(isEvmChain('bfmeta')).toBe(false)
    })
  })

  describe('isTronChain', () => {
    it('should return true for TRON', () => {
      expect(isTronChain('TRON')).toBe(true)
      expect(isTronChain('tron')).toBe(true)
    })

    it('should return false for non-TRON chains', () => {
      expect(isTronChain('ETH')).toBe(false)
      expect(isTronChain('BSC')).toBe(false)
    })
  })

  describe('isValidTronBase58Address', () => {
    it('should validate correct TRON base58 addresses', () => {
      // Real TRON address format: T + 33 base58 chars = 34 chars total
      expect(isValidTronBase58Address('TZ4UXDV5ZhNW7fb2AMSbgfAEZ7hWsnYS2g')).toBe(true)
      expect(isValidTronBase58Address('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t')).toBe(true)
    })

    it('should reject invalid addresses', () => {
      // Too short
      expect(isValidTronBase58Address('T123')).toBe(false)
      // Wrong prefix
      expect(isValidTronBase58Address('0x1234567890abcdef1234567890abcdef12345678')).toBe(false)
      // Contains invalid base58 chars (0, O, I, l)
      expect(isValidTronBase58Address('T0UXDV5ZhNW7fb2AMSbgfAEZ7hWsnYS2g')).toBe(false)
      // Empty
      expect(isValidTronBase58Address('')).toBe(false)
    })
  })

  describe('isTronHexAddress', () => {
    it('should validate correct TRON hex addresses', () => {
      expect(isTronHexAddress('41a614f803b6fd780986a42c78ec9c7f77e6ded13c')).toBe(true)
    })

    it('should reject invalid hex addresses', () => {
      expect(isTronHexAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(false)
      expect(isTronHexAddress('TZ4UXDV5ZhNW7fb2AMSbgfAEZ7hWsnYS2g')).toBe(false)
    })
  })

  describe('isEvmAddress', () => {
    it('should validate correct EVM addresses', () => {
      expect(isEvmAddress('0x1234567890abcdef1234567890abcdef12345678')).toBe(true)
      expect(isEvmAddress('0xABCDEF1234567890ABCDEF1234567890ABCDEF12')).toBe(true)
    })

    it('should reject invalid EVM addresses', () => {
      expect(isEvmAddress('1234567890abcdef1234567890abcdef12345678')).toBe(false)
      expect(isEvmAddress('0x123')).toBe(false)
      expect(isEvmAddress('TZ4UXDV5ZhNW7fb2AMSbgfAEZ7hWsnYS2g')).toBe(false)
    })
  })

  describe('validateDepositAddress', () => {
    it('should validate EVM addresses for ETH/BSC', () => {
      expect(validateDepositAddress('ETH', '0x1234567890abcdef1234567890abcdef12345678')).toBeNull()
      expect(validateDepositAddress('BSC', '0x1234567890abcdef1234567890abcdef12345678')).toBeNull()
    })

    it('should reject invalid EVM addresses', () => {
      const error = validateDepositAddress('ETH', 'invalid')
      expect(error).toContain('Invalid EVM address format')
    })

    it('should validate TRON base58 addresses', () => {
      expect(validateDepositAddress('TRON', 'TZ4UXDV5ZhNW7fb2AMSbgfAEZ7hWsnYS2g')).toBeNull()
    })

    it('should reject EVM format for TRON with helpful message', () => {
      const error = validateDepositAddress('TRON', '0x1234567890abcdef1234567890abcdef12345678')
      expect(error).toContain('Invalid TRON address')
      expect(error).toContain('EVM format')
      expect(error).toContain('expected base58')
    })

    it('should reject hex format for TRON with helpful message', () => {
      const error = validateDepositAddress('TRON', '41a614f803b6fd780986a42c78ec9c7f77e6ded13c')
      expect(error).toContain('Invalid TRON address')
      expect(error).toContain('hex format')
      expect(error).toContain('expected base58')
    })
  })
})
