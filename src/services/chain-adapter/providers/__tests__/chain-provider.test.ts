import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChainProvider } from '../chain-provider'
import type { ApiProvider, Balance, Transaction } from '../types'
import { Amount } from '@/types/amount'
import { InvalidDataError } from '../errors'

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: () => 'TEST',
    getDecimals: () => 8,
  },
}))

// Mock ApiProvider
function createMockProvider(overrides: Partial<ApiProvider> = {}): ApiProvider {
  return {
    type: 'mock-provider',
    endpoint: 'https://mock.api',
    ...overrides,
  }
}

describe('ChainProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

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
      const mockTxs: Transaction[] = [
        {
          hash: '0xabc',
          from: '0x1',
          to: '0x2',
          timestamp: Date.now(),
          status: 'confirmed',
          action: 'transfer',
          direction: 'out',
          assets: [
            {
              assetType: 'native',
              value: '1000',
              symbol: 'TEST',
              decimals: 8,
            },
          ],
        },
      ]
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

    it('falls back to the next provider when the first throws', async () => {
      const p1 = createMockProvider({
        type: 'p1',
        getNativeBalance: vi.fn().mockRejectedValue(new Error('p1 down')),
      })
      const mockBalance: Balance = {
        amount: Amount.fromRaw('123', 8, 'TEST'),
        symbol: 'TEST',
      }
      const p2 = createMockProvider({
        type: 'p2',
        getNativeBalance: vi.fn().mockResolvedValue(mockBalance),
      })

      const chainProvider = new ChainProvider('test', [p1, p2])
      const result = await chainProvider.getNativeBalance!('0x123')

      expect(result).toEqual(mockBalance)
      expect(p1.getNativeBalance).toHaveBeenCalledTimes(1)
      expect(p2.getNativeBalance).toHaveBeenCalledTimes(1)
    })

    it('returns safe defaults for read methods when all providers fail', async () => {
      const p1 = createMockProvider({
        type: 'p1',
        getTransactionHistory: vi.fn().mockRejectedValue(new Error('nope')),
      })
      const p2 = createMockProvider({
        type: 'p2',
        getTransactionHistory: vi.fn().mockRejectedValue(new Error('still nope')),
      })

      const chainProvider = new ChainProvider('test', [p1, p2])
      const txs = await chainProvider.getTransactionHistory!('0xabc', 10)

      expect(txs).toEqual([])
    })

    it('rethrows for non-read methods when all providers fail', async () => {
      const p1 = createMockProvider({
        type: 'p1',
        estimateFee: vi.fn().mockRejectedValue(new Error('fee fail')),
      })
      const chainProvider = new ChainProvider('test', [p1])

      await expect(chainProvider.estimateFee!({
        from: 'a',
        to: 'b',
        amount: Amount.fromRaw('1', 8, 'TEST'),
      })).rejects.toThrow('fee fail')
    })

    it('returns undefined for unimplemented methods', () => {
      const provider = createMockProvider()
      const chainProvider = new ChainProvider('test', [provider])
      
      expect(chainProvider.getNativeBalance).toBeUndefined()
      expect(chainProvider.getTransactionHistory).toBeUndefined()
    })
  })

  describe('guard-at-the-gate validation', () => {
    it('filters invalid transactions from getTransactionHistory and warns', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const valid: Transaction = {
        hash: '0xvalid',
        from: '0x1',
        to: '0x2',
        timestamp: Date.now(),
        status: 'confirmed',
        action: 'transfer',
        direction: 'out',
        assets: [
          {
            assetType: 'native',
            value: '1',
            symbol: 'TEST',
            decimals: 18,
          },
        ],
      }

      const provider = createMockProvider({
        getTransactionHistory: vi.fn().mockResolvedValue([valid, { bad: true }]),
      })
      const chainProvider = new ChainProvider('test', [provider])

      const result = await chainProvider.getTransactionHistory!('0x123', 10)
      expect(result).toEqual([valid])
      expect(warnSpy).toHaveBeenCalled()
    })

    it('throws InvalidDataError when getTransaction returns invalid payload', async () => {
      const provider = createMockProvider({
        getTransaction: vi.fn().mockResolvedValue({ bad: true }),
      })
      const chainProvider = new ChainProvider('test', [provider])

      await expect(chainProvider.getTransaction!('0xabc')).rejects.toBeInstanceOf(InvalidDataError)
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
