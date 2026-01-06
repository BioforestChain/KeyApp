/**
 * Provider 能力测试
 * 
 * 验证各 provider 的能力声明与实际行为一致
 * 
 * 核心原则：
 * 1. supportsXxx 返回 true 时，调用对应方法应该能返回有意义的数据
 * 2. supportsXxx 返回 false 时，UI 应显示"不支持"而非"暂无数据"
 * 3. API 错误（如 429）应该传递到 UI 显示，而非静默失败
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChainProvider, clearProviderCache } from '../index'
import { isSupported } from '../types'
import type { ChainConfig } from '@/services/chain-config'

const mockGetChainById = vi.fn()
vi.mock('@/stores/chain-config', () => ({
  chainConfigStore: {
    state: {},
  },
  chainConfigSelectors: {
    getChainById: () => mockGetChainById(),
  },
}))

describe('Provider 能力测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearProviderCache()
  })

  describe('blockscout-v1 provider', () => {
    const BLOCKSCOUT_CONFIG: ChainConfig = {
      id: 'ethereum-blockscout-only',
      version: '1.0',
      chainKind: 'evm',
      name: 'Ethereum (blockscout only)',
      symbol: 'ETH',
      decimals: 18,
      enabled: true,
      source: 'manual',
      apis: [{ type: 'blockscout-v1', endpoint: 'https://eth.blockscout.com/api' }],
    }

    it('should support getNativeBalance', () => {
      mockGetChainById.mockReturnValue(BLOCKSCOUT_CONFIG)
      const provider = createChainProvider('ethereum-blockscout-only')
      
      expect(provider.supportsNativeBalance).toBe(true)
    })

    it('should support getTransactionHistory', () => {
      mockGetChainById.mockReturnValue(BLOCKSCOUT_CONFIG)
      const provider = createChainProvider('ethereum-blockscout-only')
      
      expect(provider.supportsTransactionHistory).toBe(true)
    })
  })

  describe('ethereum-rpc provider', () => {
    const RPC_CONFIG: ChainConfig = {
      id: 'ethereum-rpc-only',
      version: '1.0',
      chainKind: 'evm',
      name: 'Ethereum (rpc only)',
      symbol: 'ETH',
      decimals: 18,
      enabled: true,
      source: 'manual',
      apis: [{ type: 'ethereum-rpc', endpoint: 'https://ethereum-rpc.publicnode.com' }],
    }

    it('should support getNativeBalance', () => {
      mockGetChainById.mockReturnValue(RPC_CONFIG)
      const provider = createChainProvider('ethereum-rpc-only')
      
      expect(provider.supportsNativeBalance).toBe(true)
    })

    it('should NOT support getTransactionHistory (RPC has no standard history API)', () => {
      mockGetChainById.mockReturnValue(RPC_CONFIG)
      const provider = createChainProvider('ethereum-rpc-only')
      
      // ethereum-rpc 只支持余额查询，不支持交易历史
      // 标准 Ethereum JSON-RPC 没有交易历史查询 API
      expect(provider.supportsTransactionHistory).toBe(false)
    })

    it('should return supported=false when calling getTransactionHistory', async () => {
      mockGetChainById.mockReturnValue(RPC_CONFIG)
      const provider = createChainProvider('ethereum-rpc-only')
      
      const result = await provider.getTransactionHistory('0x123', 10)
      
      // 应该返回 fallback 结果，表明不支持
      expect(isSupported(result)).toBe(false)
      // 因为 WrappedTransactionProvider 声明了 supportsTransactionHistory = false，
      // 所以没有 candidate，返回 "No provider implements"
      expect(result.reason).toMatch(/No provider implements|not supported/i)
    })
  })

  describe('etherscan-v2 provider', () => {
    const ETHERSCAN_CONFIG: ChainConfig = {
      id: 'ethereum-etherscan-only',
      version: '1.0',
      chainKind: 'evm',
      name: 'Ethereum (etherscan only)',
      symbol: 'ETH',
      decimals: 18,
      enabled: true,
      source: 'manual',
      apis: [{ type: 'etherscan-v2', endpoint: 'https://api.etherscan.io/v2/api' }],
    }

    it('should support getNativeBalance', () => {
      mockGetChainById.mockReturnValue(ETHERSCAN_CONFIG)
      const provider = createChainProvider('ethereum-etherscan-only')
      
      expect(provider.supportsNativeBalance).toBe(true)
    })

    it('should support getTransactionHistory', () => {
      mockGetChainById.mockReturnValue(ETHERSCAN_CONFIG)
      const provider = createChainProvider('ethereum-etherscan-only')
      
      expect(provider.supportsTransactionHistory).toBe(true)
    })
  })

  describe('tron-rpc provider', () => {
    const TRON_RPC_CONFIG: ChainConfig = {
      id: 'tron-rpc-only',
      version: '1.0',
      chainKind: 'tron',
      name: 'Tron (rpc only)',
      symbol: 'TRX',
      decimals: 6,
      enabled: true,
      source: 'manual',
      apis: [{ type: 'tron-rpc', endpoint: 'https://api.trongrid.io' }],
    }

    it('should support getNativeBalance', () => {
      mockGetChainById.mockReturnValue(TRON_RPC_CONFIG)
      const provider = createChainProvider('tron-rpc-only')
      
      expect(provider.supportsNativeBalance).toBe(true)
    })

    it('should support getTransactionHistory', () => {
      mockGetChainById.mockReturnValue(TRON_RPC_CONFIG)
      const provider = createChainProvider('tron-rpc-only')
      
      expect(provider.supportsTransactionHistory).toBe(true)
    })
  })

  describe('tron-rpc-pro provider', () => {
    const TRON_RPC_PRO_CONFIG: ChainConfig = {
      id: 'tron-rpc-pro-only',
      version: '1.0',
      chainKind: 'tron',
      name: 'Tron (rpc-pro only)',
      symbol: 'TRX',
      decimals: 6,
      enabled: true,
      source: 'manual',
      apis: [{ type: 'tron-rpc-pro', endpoint: 'https://api.trongrid.io', config: { apiKeyEnv: 'TRONGRID_API_KEY' } }],
    }

    it('should support getNativeBalance', () => {
      mockGetChainById.mockReturnValue(TRON_RPC_PRO_CONFIG)
      const provider = createChainProvider('tron-rpc-pro-only')
      
      expect(provider.supportsNativeBalance).toBe(true)
    })

    it('should support getTransactionHistory', () => {
      mockGetChainById.mockReturnValue(TRON_RPC_PRO_CONFIG)
      const provider = createChainProvider('tron-rpc-pro-only')
      
      expect(provider.supportsTransactionHistory).toBe(true)
    })
  })
})

describe('API 错误处理', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearProviderCache()
  })

  it('tron-rpc-pro should include API key in request headers', async () => {
    const TRON_PRO_CONFIG: ChainConfig = {
      id: 'tron-pro-test',
      version: '1.0',
      chainKind: 'tron',
      name: 'Tron Pro Test',
      symbol: 'TRX',
      decimals: 6,
      enabled: true,
      source: 'manual',
      apis: [{ 
        type: 'tron-rpc-pro', 
        endpoint: 'https://api.trongrid.io',
        config: { apiKeyEnv: 'TRONGRID_API_KEY' }
      }],
    }
    mockGetChainById.mockReturnValue(TRON_PRO_CONFIG)

    const previousKey = process.env.TRONGRID_API_KEY
    process.env.TRONGRID_API_KEY = 'test-trongrid-key'
    
    // 捕获 fetch 调用
    const originalFetch = global.fetch
    let capturedHeaders: Record<string, string> | null = null
    global.fetch = vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
      capturedHeaders = Object.fromEntries(new Headers(init?.headers).entries())
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ balance: 1000000 }),
      })
    })
    
    try {
      const provider = createChainProvider('tron-pro-test')
      await provider.getNativeBalance('TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9')
      
      // 验证 API key 被包含在请求头中（只要有值就行）
      expect(capturedHeaders).not.toBeNull()
      expect(capturedHeaders!['tron-pro-api-key']).toBeDefined()
      expect(capturedHeaders!['tron-pro-api-key'].length).toBeGreaterThan(0)
    } finally {
      global.fetch = originalFetch
      if (previousKey === undefined) {
        delete process.env.TRONGRID_API_KEY
      } else {
        process.env.TRONGRID_API_KEY = previousKey
      }
    }
  })

  it('should propagate 429 rate limit error in fallback reason for getNativeBalance', async () => {
    // 这个测试验证：当 API 返回 429 错误时，
    // 应该在 fallbackReason 中包含错误信息，而不是静默返回空数据
    
    const TRON_CONFIG: ChainConfig = {
      id: 'tron-test',
      version: '1.0',
      chainKind: 'tron',
      name: 'Tron Test',
      symbol: 'TRX',
      decimals: 6,
      enabled: true,
      source: 'manual',
      apis: [{ type: 'tron-rpc', endpoint: 'https://api.trongrid.io' }],
    }
    mockGetChainById.mockReturnValue(TRON_CONFIG)
    
    // 模拟 fetch 返回 429 错误
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockRejectedValue(new Error('429 Too Many Requests'))
    
    try {
      const provider = createChainProvider('tron-test')
      const result = await provider.getNativeBalance('TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9')
      
      // 应该返回 fallback 结果，并包含错误信息
      expect(isSupported(result)).toBe(false)
      expect(result.reason).toContain('429')
    } finally {
      global.fetch = originalFetch
    }
  })

  it('should propagate 429 rate limit error in fallback reason for getTransactionHistory', async () => {
    // 这个测试验证：当 API 返回 429 错误时，
    // 交易历史应该在 fallbackReason 中包含错误信息
    
    const TRON_CONFIG: ChainConfig = {
      id: 'tron-test-tx',
      version: '1.0',
      chainKind: 'tron',
      name: 'Tron Test',
      symbol: 'TRX',
      decimals: 6,
      enabled: true,
      source: 'manual',
      apis: [{ type: 'tron-rpc', endpoint: 'https://api.trongrid.io' }],
    }
    mockGetChainById.mockReturnValue(TRON_CONFIG)
    
    // 模拟 fetch 返回 429 错误
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockRejectedValue(new Error('429 Too Many Requests'))
    
    try {
      const provider = createChainProvider('tron-test-tx')
      const result = await provider.getTransactionHistory('TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9', 10)
      
      // 应该返回 fallback 结果，并包含错误信息
      expect(isSupported(result)).toBe(false)
      expect(result.reason).toContain('429')
    } finally {
      global.fetch = originalFetch
    }
  })
})
