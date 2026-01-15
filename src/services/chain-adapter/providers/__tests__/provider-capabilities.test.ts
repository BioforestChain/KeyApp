/**
 * Provider 能力测试
 * 
 * 验证各 provider 的能力声明与实际行为一致
 * 
 * 核心原则：
 * 1. supportsXxx 返回 true 时，调用对应方法应该能返回有意义的数据
 * 2. supportsXxx 返回 false 时，调用 .fetch() 应抛出 NoSupportError
 * 3. API 错误（如 429）应该传递到 UI 显示，而非静默失败
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { clearProviderCache } from '../index'
import { ChainProvider } from '../chain-provider'
import { EtherscanProvider, TronRpcProvider } from '../index'
import type { ParsedApiEntry } from '@/services/chain-config'
import { keyFetch, NoSupportError } from '@biochain/key-fetch'

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getConfig: vi.fn(),
    getApi: vi.fn(),
    getSymbol: vi.fn().mockReturnValue('TEST'),
    getDecimals: vi.fn().mockReturnValue(18),
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

describe('Provider 能力测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    keyFetch.clear()
    clearProviderCache()
  })

  describe('etherscan-v2 provider', () => {
    const entry: ParsedApiEntry = {
      type: 'etherscan-v2',
      endpoint: 'https://api.etherscan.io/v2/api',
    }

    it('should support nativeBalance', () => {
      const provider = new EtherscanProvider(entry, 'ethereum')
      const chainProvider = new ChainProvider('ethereum', [provider])

      expect(chainProvider.supportsNativeBalance).toBe(true)
    })

    it('should support transactionHistory', () => {
      const provider = new EtherscanProvider(entry, 'ethereum')
      const chainProvider = new ChainProvider('ethereum', [provider])

      expect(chainProvider.supportsTransactionHistory).toBe(true)
    })

    it('should fetch balance when API succeeds', async () => {
      mockFetch.mockResolvedValue(createMockResponse({
        status: '1',
        message: 'OK',
        result: '1000000000000000000',
      }))

      const provider = new EtherscanProvider(entry, 'ethereum')
      const chainProvider = new ChainProvider('ethereum', [provider])

      const balance = await chainProvider.nativeBalance.fetch({ address: '0x123' })

      expect(balance.symbol).toBe('TEST')
    })
  })

  describe('tron-rpc provider', () => {
    const entry: ParsedApiEntry = {
      type: 'tron-rpc',
      endpoint: 'https://api.trongrid.io',
    }

    it('should support nativeBalance', () => {
      const provider = new TronRpcProvider(entry, 'tron')
      const chainProvider = new ChainProvider('tron', [provider])

      expect(chainProvider.supportsNativeBalance).toBe(true)
    })

    it('should support transactionHistory', () => {
      const provider = new TronRpcProvider(entry, 'tron')
      const chainProvider = new ChainProvider('tron', [provider])

      expect(chainProvider.supportsTransactionHistory).toBe(true)
    })
  })

  describe('no provider configured', () => {
    it('should throw NoSupportError when no provider supports nativeBalance', async () => {
      // 创建空 ChainProvider (没有任何 provider)
      const chainProvider = new ChainProvider('empty-chain', [])

      expect(chainProvider.supportsNativeBalance).toBe(false)

      await expect(
        chainProvider.nativeBalance.fetch({ address: '0x123' })
      ).rejects.toThrow(NoSupportError)
    })

    it('should throw NoSupportError when no provider supports transactionHistory', async () => {
      const chainProvider = new ChainProvider('empty-chain', [])

      expect(chainProvider.supportsTransactionHistory).toBe(false)

      await expect(
        chainProvider.transactionHistory.fetch({ address: '0x123' })
      ).rejects.toThrow(NoSupportError)
    })
  })
})

describe('API 错误处理', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    keyFetch.clear()
    clearProviderCache()
  })

  it('should propagate 429 rate limit error when fetching balance', async () => {
    const entry: ParsedApiEntry = {
      type: 'tron-rpc',
      endpoint: 'https://api.trongrid.io',
    }

    // 模拟 fetch 返回 429 错误
    mockFetch.mockRejectedValue(new Error('429 Too Many Requests'))

    const provider = new TronRpcProvider(entry, 'tron')
    const chainProvider = new ChainProvider('tron', [provider])

    // 新 API: 应该抛出错误包含 429
    await expect(
      chainProvider.nativeBalance.fetch({ address: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9' })
    ).rejects.toThrow('429')
  })

  it('should propagate 429 rate limit error when fetching transaction history', async () => {
    const entry: ParsedApiEntry = {
      type: 'tron-rpc',
      endpoint: 'https://api.trongrid.io',
    }

    // 模拟 fetch 返回 429 错误
    mockFetch.mockRejectedValue(new Error('429 Too Many Requests'))

    const provider = new TronRpcProvider(entry, 'tron')
    const chainProvider = new ChainProvider('tron', [provider])

    // 新 API: 应该抛出错误包含 429
    await expect(
      chainProvider.transactionHistory.fetch({ address: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9' })
    ).rejects.toThrow('429')
  })
})
