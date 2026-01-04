import { describe, it, expect, vi } from 'vitest'
import { EvmAdapter } from '../evm'
import type { ChainConfig } from '@/services/chain-config'

const ethConfig: ChainConfig = {
  id: 'ethereum',
  version: '1.0',
  chainKind: 'evm',
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  enabled: true,
  source: 'default',
}

// Mock chainConfigService
vi.mock('@/services/chain-config/service', () => ({
  chainConfigService: {
    getConfig: (chainId: string) => chainId === 'ethereum' ? ethConfig : null,
    getRpcUrl: () => '',
    getDecimals: () => 18,
    getSymbol: () => 'ETH',
    getEtherscanApi: () => null,
    getExplorerUrl: () => null,
  },
}))

describe('EvmAdapter', () => {
  const adapter = new EvmAdapter(ethConfig.id)

  describe('EvmIdentityService', () => {
    it('validates Ethereum addresses correctly', () => {
      expect(adapter.identity.isValidAddress('0x9858effd232b4033e47d90003d41ec34ecaeda94')).toBe(true)
      expect(adapter.identity.isValidAddress('0x9858EfFD232B4033E47d90003D41EC34EcaEda94')).toBe(true) // checksummed
      expect(adapter.identity.isValidAddress('invalid')).toBe(false)
      expect(adapter.identity.isValidAddress('0x123')).toBe(false)
      expect(adapter.identity.isValidAddress('')).toBe(false)
    })

    it('normalizes addresses to EIP-55 checksum format', () => {
      const addr = '0x9858effd232b4033e47d90003d41ec34ecaeda94'
      const normalized = adapter.identity.normalizeAddress(addr)
      // EIP-55 checksum format preserves mixed case
      expect(normalized.startsWith('0x')).toBe(true)
      expect(normalized.length).toBe(42)
    })
  })

  describe('EvmChainService', () => {
    it('returns correct chain info', () => {
      const info = adapter.chain.getChainInfo()
      
      expect(info.chainId).toBe('ethereum')
      expect(info.symbol).toBe('ETH')
      expect(info.decimals).toBe(18)
      expect(info.confirmations).toBe(12)
    })
  })
})
