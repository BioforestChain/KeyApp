import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChainProvider } from '../chain-provider'
import type { ApiProvider, Balance, Transaction } from '../types'
import { Amount } from '@/types/amount'

// Mock ApiProvider
function createMockProvider(overrides: Partial<ApiProvider> = {}): ApiProvider {
  return {
    type: 'mock-provider',
    endpoint: 'https://mock.api',
    ...overrides,
  }
}

describe('ChainProvider', () => {
  describe('supports', () => {
    it('returns true when a provider implements the method', () => {
      const provider = createMockProvider({
        getNativeBalance: vi.fn(),
      })
      const chainProvider = new ChainProvider('test', [provider])
      
      expect(chainProvider.supports('getNativeBalance')).toBe(true)
    })

    it('returns false when no provider implements the method', () => {
      const provider = createMockProvider()
      const chainProvider = new ChainProvider('test', [provider])
      
      expect(chainProvider.supports('getNativeBalance')).toBe(false)
    })

    it('returns true when any provider implements the method', () => {
      const provider1 = createMockProvider({ type: 'p1' })
      const provider2 = createMockProvider({ 
        type: 'p2',
        getTransactionHistory: vi.fn(),
      })
      const chainProvider = new ChainProvider('test', [provider1, provider2])
      
      expect(chainProvider.supportsTransactionHistory).toBe(true)
    })
  })

  describe('method delegation', () => {
    it('delegates getNativeBalance to the implementing provider', async () => {
      const mockBalance: Balance = {
        amount: Amount.fromRaw('1000000', 8, 'TEST'),
        symbol: 'TEST',
      }
      const provider = createMockProvider({
        getNativeBalance: vi.fn().mockResolvedValue(mockBalance),
      })
      const chainProvider = new ChainProvider('test', [provider])
      
      const getBalance = chainProvider.getNativeBalance
      expect(getBalance).toBeDefined()
      
      const result = await getBalance!('0x123')
      expect(result).toEqual(mockBalance)
      expect(provider.getNativeBalance).toHaveBeenCalledWith('0x123')
    })

    it('delegates getTransactionHistory to the implementing provider', async () => {
      const mockTxs: Transaction[] = [{
        hash: '0xabc',
        from: '0x1',
        to: '0x2',
        value: '1000',
        symbol: 'TEST',
        timestamp: Date.now(),
        status: 'confirmed',
      }]
      const provider = createMockProvider({
        getTransactionHistory: vi.fn().mockResolvedValue(mockTxs),
      })
      const chainProvider = new ChainProvider('test', [provider])
      
      const getHistory = chainProvider.getTransactionHistory
      expect(getHistory).toBeDefined()
      
      const result = await getHistory!('0x123', 10)
      expect(result).toEqual(mockTxs)
      expect(provider.getTransactionHistory).toHaveBeenCalledWith('0x123', 10)
    })

    it('returns undefined for unimplemented methods', () => {
      const provider = createMockProvider()
      const chainProvider = new ChainProvider('test', [provider])
      
      expect(chainProvider.getNativeBalance).toBeUndefined()
      expect(chainProvider.getTransactionHistory).toBeUndefined()
    })
  })

  describe('convenience properties', () => {
    it('supportsNativeBalance reflects provider capabilities', () => {
      const provider = createMockProvider({
        getNativeBalance: vi.fn(),
      })
      const chainProvider = new ChainProvider('test', [provider])
      
      expect(chainProvider.supportsNativeBalance).toBe(true)
      expect(chainProvider.supportsTransactionHistory).toBe(false)
    })

    it('supportsTransactionHistory reflects provider capabilities', () => {
      const provider = createMockProvider({
        getTransactionHistory: vi.fn(),
      })
      const chainProvider = new ChainProvider('test', [provider])
      
      expect(chainProvider.supportsNativeBalance).toBe(false)
      expect(chainProvider.supportsTransactionHistory).toBe(true)
    })
  })

  describe('getProviderByType', () => {
    it('returns the provider matching the type', () => {
      const provider1 = createMockProvider({ type: 'ethereum-rpc' })
      const provider2 = createMockProvider({ type: 'etherscan-v2' })
      const chainProvider = new ChainProvider('test', [provider1, provider2])
      
      expect(chainProvider.getProviderByType('etherscan-v2')).toBe(provider2)
    })

    it('returns undefined for unknown type', () => {
      const provider = createMockProvider({ type: 'ethereum-rpc' })
      const chainProvider = new ChainProvider('test', [provider])
      
      expect(chainProvider.getProviderByType('unknown')).toBeUndefined()
    })
  })
})
