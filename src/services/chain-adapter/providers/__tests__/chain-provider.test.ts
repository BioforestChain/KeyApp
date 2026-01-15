/**
 * ChainProvider 测试
 * 
 * 使用 KeyFetch 架构
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { ChainProvider } from '../chain-provider'
import type { ApiProvider, Balance, Transaction } from '../types'
import { BalanceOutputSchema, TransactionsOutputSchema } from '../types'
import { Amount } from '@/types/amount'
import { keyFetch, NoSupportError } from '@biochain/key-fetch'
import type { KeyFetchInstance } from '@biochain/key-fetch'

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: () => 'TEST',
    getDecimals: () => 8,
  },
}))

// Mock fetch
const mockFetch = vi.fn()
const originalFetch = global.fetch
Object.assign(global, { fetch: mockFetch })

afterAll(() => {
  Object.assign(global, { fetch: originalFetch })
})

function createMockResponse<T>(data: T, ok = true, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    statusText: ok ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

// 创建 mock KeyFetchInstance
function createMockKeyFetchInstance<T>(_mockData: T): KeyFetchInstance<any> {
  return keyFetch.create({
    name: `mock.${Date.now()}`,
    schema: BalanceOutputSchema,
    url: 'https://mock.api/test',
    use: [],
  })
}

// Mock ApiProvider with KeyFetch instances
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
    keyFetch.clear()
  })

  describe('supports', () => {
    it('returns true for nativeBalance when a provider has the property', () => {
      const mockBalance: Balance = {
        amount: Amount.fromRaw('1000000', 8, 'TEST'),
        symbol: 'TEST',
      }
      mockFetch.mockResolvedValue(createMockResponse(mockBalance))

      // 创建一个带 nativeBalance 的 mock provider
      const nativeBalanceFetcher = keyFetch.create({
        name: 'test.nativeBalance',
        schema: BalanceOutputSchema,
        url: 'https://mock.api/balance',
      })

      const provider = createMockProvider({
        nativeBalance: nativeBalanceFetcher,
      })
      const chainProvider = new ChainProvider('test', [provider])

      expect(chainProvider.supports('nativeBalance')).toBe(true)
    })

    it('returns false when no provider has the capability', () => {
      const provider = createMockProvider()
      const chainProvider = new ChainProvider('test', [provider])

      expect(chainProvider.supports('nativeBalance')).toBe(false)
    })

    it('returns true when any provider has the capability', () => {
      const provider1 = createMockProvider({ type: 'p1' })

      const txHistoryFetcher = keyFetch.create({
        name: 'test.transactionHistory',
        schema: TransactionsOutputSchema,
        url: 'https://mock.api/txs',
      })

      const provider2 = createMockProvider({
        type: 'p2',
        transactionHistory: txHistoryFetcher,
      })
      const chainProvider = new ChainProvider('test', [provider1, provider2])

      expect(chainProvider.supportsTransactionHistory).toBe(true)
    })
  })

  describe('KeyFetch property delegation', () => {
    it('nativeBalance.fetch() returns balance from provider', async () => {
      const mockBalance: Balance = {
        amount: Amount.fromRaw('1000000', 8, 'TEST'),
        symbol: 'TEST',
      }
      mockFetch.mockResolvedValue(createMockResponse(mockBalance))

      const nativeBalanceFetcher = keyFetch.create({
        name: 'test.nativeBalance',
        schema: BalanceOutputSchema,
        url: 'https://mock.api/balance',
      })

      const provider = createMockProvider({
        nativeBalance: nativeBalanceFetcher,
      })
      const chainProvider = new ChainProvider('test', [provider])

      const result = await chainProvider.nativeBalance.fetch({ address: '0x123' })

      expect(result.symbol).toBe('TEST')
    })

    it('transactionHistory.fetch() returns transactions from provider', async () => {
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
      mockFetch.mockResolvedValue(createMockResponse(mockTxs))

      const txHistoryFetcher = keyFetch.create({
        name: 'test.transactionHistory',
        schema: TransactionsOutputSchema,
        url: 'https://mock.api/txs',
      })

      const provider = createMockProvider({
        transactionHistory: txHistoryFetcher,
      })
      const chainProvider = new ChainProvider('test', [provider])

      const result = await chainProvider.transactionHistory.fetch({ address: '0x123' })

      expect(result).toHaveLength(1)
      expect(result[0].hash).toBe('0xabc')
    })

    it('throws NoSupportError when no provider has the capability', async () => {
      const provider = createMockProvider()
      const chainProvider = new ChainProvider('test', [provider])

      await expect(
        chainProvider.nativeBalance.fetch({ address: '0x123' })
      ).rejects.toThrow(NoSupportError)
    })
  })

  describe('convenience properties', () => {
    it('supportsNativeBalance reflects provider capabilities', () => {
      const nativeBalanceFetcher = keyFetch.create({
        name: 'test.nativeBalance.2',
        schema: BalanceOutputSchema,
        url: 'https://mock.api/balance',
      })

      const provider = createMockProvider({
        nativeBalance: nativeBalanceFetcher,
      })
      const chainProvider = new ChainProvider('test', [provider])

      expect(chainProvider.supportsNativeBalance).toBe(true)
      expect(chainProvider.supportsTransactionHistory).toBe(false)
    })

    it('supportsTransactionHistory reflects provider capabilities', () => {
      const txHistoryFetcher = keyFetch.create({
        name: 'test.transactionHistory.2',
        schema: TransactionsOutputSchema,
        url: 'https://mock.api/txs',
      })

      const provider = createMockProvider({
        transactionHistory: txHistoryFetcher,
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

  describe('legacy method proxies', () => {
    it('estimateFee is proxied from provider', async () => {
      const mockFeeEstimate = {
        standard: { amount: Amount.fromRaw('1000', 8, 'TEST'), symbol: 'TEST' },
      }

      const provider = createMockProvider({
        estimateFee: vi.fn().mockResolvedValue(mockFeeEstimate),
      })
      const chainProvider = new ChainProvider('test', [provider])

      const result = await chainProvider.estimateFee!({
        from: 'a',
        to: 'b',
        amount: Amount.fromRaw('1', 8, 'TEST'),
      })

      expect(result).toEqual(mockFeeEstimate)
    })
  })
})
