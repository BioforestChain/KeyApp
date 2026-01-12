import { describe, it, expect } from 'vitest'
import { 
  tronHexToBase58, 
  isTronHexAddress, 
  isValidTronBase58Address 
} from './tron-address'

describe('TRON Address Conversion', () => {
  // Known test vectors (verified with backend)
  const testVectors = [
    {
      hex: '412c9d3ed50dd097bc491d4164e39fe14d5288b554',
      base58: 'TE3776zaaZvY5J5EEdvkYTGQePDYdJs84N',
      description: 'depositAddress from API',
    },
    {
      hex: '41a614f803b6fd780986a42c78ec9c7f77e6ded13c',
      base58: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      description: 'USDT TRC20 contract',
    },
  ]

  describe('isTronHexAddress', () => {
    it('should return true for valid TRON hex addresses', () => {
      expect(isTronHexAddress('412c9d3ed50dd097bc491d4164e39fe14d5288b554')).toBe(true)
      expect(isTronHexAddress('41a614f803b6fd780986a42c78ec9c7f77e6ded13c')).toBe(true)
    })

    it('should return false for invalid formats', () => {
      expect(isTronHexAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f5bC12')).toBe(false)
      expect(isTronHexAddress('TE3776zaaZvY5J5EEdvkYTGQePDYdJs84N')).toBe(false)
      expect(isTronHexAddress('')).toBe(false)
      expect(isTronHexAddress('41')).toBe(false)
    })
  })

  describe('isValidTronBase58Address', () => {
    it('should return true for valid TRON base58 addresses', () => {
      expect(isValidTronBase58Address('TE3776zaaZvY5J5EEdvkYTGQePDYdJs84N')).toBe(true)
      expect(isValidTronBase58Address('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t')).toBe(true)
    })

    it('should return false for invalid formats', () => {
      expect(isValidTronBase58Address('0x742d35Cc6634C0532925a3b844Bc9e7595f5bC12')).toBe(false)
      expect(isValidTronBase58Address('412c9d3ed50dd097bc491d4164e39fe14d5288b554')).toBe(false)
      expect(isValidTronBase58Address('')).toBe(false)
      expect(isValidTronBase58Address('T')).toBe(false)
    })
  })

  describe('tronHexToBase58', () => {
    for (const { hex, base58, description } of testVectors) {
      it(`should convert ${description}`, async () => {
        const result = await tronHexToBase58(hex)
        expect(result).toBe(base58)
      })
    }

    it('should throw for invalid hex address', async () => {
      await expect(tronHexToBase58('invalid')).rejects.toThrow('Invalid TRON hex address')
      await expect(tronHexToBase58('0x742d35Cc6634C0532925a3b844Bc9e7595f5bC12')).rejects.toThrow()
    })
  })
})
