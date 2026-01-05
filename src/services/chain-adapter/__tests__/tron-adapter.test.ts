import { describe, it, expect } from 'vitest'
import { TronAdapter } from '../tron'
import type { ChainConfig } from '@/services/chain-config'

const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const tronConfig: ChainConfig = {
  id: 'tron',
  version: '1.0',
  chainKind: 'tron',
  name: 'Tron',
  symbol: 'TRX',
  decimals: 6,
  enabled: true,
  source: 'default',
}

describe('TronAdapter', () => {
  const adapter = new TronAdapter(tronConfig)

  describe('TronIdentityService', () => {
    it('derives correct Tron address from mnemonic', async () => {
      // Identity service now expects UTF-8 encoded mnemonic string
      const seed = new TextEncoder().encode(TEST_MNEMONIC)
      const address = await adapter.identity.deriveAddress(seed, 0)
      
      // Tron addresses start with 'T' and are 34 characters
      expect(address).toMatch(/^T[A-Za-z0-9]{33}$/)
      expect(address.startsWith('T')).toBe(true)
      expect(address.length).toBe(34)
    })

    it('derives different addresses for different indices', async () => {
      const seed = new TextEncoder().encode(TEST_MNEMONIC)
      const addr0 = await adapter.identity.deriveAddress(seed, 0)
      const addr1 = await adapter.identity.deriveAddress(seed, 1)
      
      expect(addr0).not.toBe(addr1)
    })

    it('validates Tron addresses correctly', () => {
      // Valid Tron addresses
      expect(adapter.identity.isValidAddress('TZ4UXDV5ZhNW7fb2AMSbgfAEZ7hWsnYS2g')).toBe(true)
      expect(adapter.identity.isValidAddress('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t')).toBe(true)
      
      // Invalid addresses
      expect(adapter.identity.isValidAddress('invalid')).toBe(false)
      expect(adapter.identity.isValidAddress('T123')).toBe(false)
      expect(adapter.identity.isValidAddress('')).toBe(false)
      expect(adapter.identity.isValidAddress('0x9858effd232b4033e47d90003d41ec34ecaeda94')).toBe(false) // Ethereum addr
    })

    it('does not modify valid Tron addresses', () => {
      const addr = 'TZ4UXDV5ZhNW7fb2AMSbgfAEZ7hWsnYS2g'
      expect(adapter.identity.normalizeAddress(addr)).toBe(addr)
    })
  })

  describe('TronChainService', () => {
    it('returns correct chain info', () => {
      const info = adapter.chain.getChainInfo()
      
      expect(info.chainId).toBe('tron')
      expect(info.symbol).toBe('TRX')
      expect(info.decimals).toBe(6)
      expect(info.blockTime).toBe(3) // ~3 seconds
      expect(info.confirmations).toBe(19)
    })
  })
})
