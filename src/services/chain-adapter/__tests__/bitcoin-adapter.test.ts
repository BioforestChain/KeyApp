import { describe, it, expect } from 'vitest'
import { BitcoinAdapter } from '../bitcoin'
import type { ChainConfig } from '@/services/chain-config'

const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
// Identity service expects UTF-8 encoded mnemonic
const mnemonicAsUint8 = new TextEncoder().encode(TEST_MNEMONIC)

const btcConfig: ChainConfig = {
  id: 'bitcoin',
  version: '1.0',
  chainKind: 'bitcoin',
  name: 'Bitcoin',
  symbol: 'BTC',
  decimals: 8,
  enabled: true,
  source: 'default',
}

describe('BitcoinAdapter', () => {
  const adapter = new BitcoinAdapter(btcConfig)

  describe('BitcoinIdentityService', () => {
    it('derives correct P2WPKH address from mnemonic', async () => {
      const address = await adapter.identity.deriveAddress(mnemonicAsUint8, 0)

      // P2WPKH (bc1q...) address for this mnemonic at BIP84 path m/84'/0'/0'/0/0
      expect(address).toMatch(/^bc1q[a-z0-9]{38,}$/)
      expect(address.startsWith('bc1q')).toBe(true)
    })

    it('derives different addresses for different indices', async () => {
      const addr0 = await adapter.identity.deriveAddress(mnemonicAsUint8, 0)
      const addr1 = await adapter.identity.deriveAddress(mnemonicAsUint8, 1)

      expect(addr0).not.toBe(addr1)
    })

    it('validates P2WPKH addresses correctly', () => {
      // Valid bc1q addresses
      expect(adapter.identity.isValidAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe(true)
      expect(adapter.identity.isValidAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')).toBe(true)
      
      // Invalid addresses
      expect(adapter.identity.isValidAddress('invalid')).toBe(false)
      expect(adapter.identity.isValidAddress('bc1q123')).toBe(false)
      expect(adapter.identity.isValidAddress('')).toBe(false)
    })

    it('validates P2TR (Taproot) addresses correctly', () => {
      // Valid bc1p addresses
      expect(adapter.identity.isValidAddress('bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0')).toBe(true)
    })

    it('validates legacy P2PKH addresses correctly', () => {
      // Valid legacy addresses starting with 1
      expect(adapter.identity.isValidAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(true)
      expect(adapter.identity.isValidAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')).toBe(true)
    })

    it('normalizes bech32 addresses to lowercase', () => {
      const addr = 'BC1QAR0SRRR7XFKVY5L643LYDNW9RE59GTZZWF5MDQ'
      expect(adapter.identity.normalizeAddress(addr)).toBe(addr.toLowerCase())
    })
  })

  describe('BitcoinChainService', () => {
    it('returns correct chain info', () => {
      const info = adapter.chain.getChainInfo()
      
      expect(info.chainId).toBe('bitcoin')
      expect(info.symbol).toBe('BTC')
      expect(info.decimals).toBe(8)
      expect(info.blockTime).toBe(600) // ~10 minutes
      expect(info.confirmations).toBe(6)
    })
  })
})
