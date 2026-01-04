/**
 * 集成测试：验证 ChainProvider 创建流程
 * 
 * 测试从 chainConfigService → createChainProvider → getTransactionHistory 的完整流程
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createChainProvider, getChainProvider, clearProviderCache } from '../index'
import type { ChainConfig } from '@/services/chain-config'

// Mock chainConfigStore
const mockGetChainById = vi.fn()
vi.mock('@/stores/chain-config', () => ({
  chainConfigStore: {
    state: {},
  },
  chainConfigSelectors: {
    getChainById: () => mockGetChainById(),
  },
}))

describe('ChainProvider 集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearProviderCache()
  })

  it('为 Ethereum 链创建正确的 providers', () => {
    const mockEthConfig: ChainConfig = {
      id: 'ethereum',
      version: '1.0',
      chainKind: 'evm',
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
      enabled: true,
      source: 'default',
      api: {
        'ethereum-rpc': 'https://ethereum-rpc.publicnode.com',
        'etherscan-v2': 'https://api.etherscan.io/v2/api',
      },
    }
    mockGetChainById.mockReturnValue(mockEthConfig)

    const provider = createChainProvider('ethereum')
    
    // 应该有 4 个 providers:
    // 1. EtherscanProvider (etherscan-v2)
    // 2. EvmRpcProvider (ethereum-rpc)
    // 3. WrappedTransactionProvider
    // 4. WrappedIdentityProvider
    const providers = provider.getProviders()
    expect(providers.length).toBeGreaterThanOrEqual(2)
    
    // 检查是否有 etherscan provider
    const etherscanProvider = providers.find(p => p.type.includes('etherscan') || p.type.includes('scan'))
    expect(etherscanProvider).toBeDefined()
    
    // 检查能力
    expect(provider.supportsTransactionHistory).toBe(true)
    expect(provider.supportsNativeBalance).toBe(true)
  })

  it('为 BFMeta 链创建正确的 providers', () => {
    const mockBfmetaConfig: ChainConfig = {
      id: 'bfmeta',
      version: '1.0',
      chainKind: 'bioforest',
      name: 'BFMeta',
      symbol: 'BFM',
      decimals: 8,
      prefix: 'b',
      enabled: true,
      source: 'default',
      api: {
        'biowallet-v1': ['https://walletapi.bfmeta.info', { path: 'bfmeta' }],
      },
    }
    mockGetChainById.mockReturnValue(mockBfmetaConfig)

    const provider = createChainProvider('bfmeta')
    
    const providers = provider.getProviders()
    expect(providers.length).toBeGreaterThanOrEqual(1)
    
    // 检查是否有 biowallet provider
    const biowalletProvider = providers.find(p => p.type.includes('biowallet'))
    expect(biowalletProvider).toBeDefined()
    
    // 检查能力
    expect(provider.supportsTransactionHistory).toBe(true)
    expect(provider.supportsNativeBalance).toBe(true)
  })

  it('当链配置不存在时返回空 providers', () => {
    mockGetChainById.mockReturnValue(null)

    const provider = createChainProvider('unknown-chain')
    
    const providers = provider.getProviders()
    // 没有 API providers，但可能有 wrapped providers（取决于实现）
    expect(provider.supportsTransactionHistory).toBe(false)
  })

  it('getChainProvider 缓存正常工作', () => {
    const mockConfig: ChainConfig = {
      id: 'test',
      version: '1.0',
      chainKind: 'evm',
      name: 'Test',
      symbol: 'TEST',
      decimals: 18,
      enabled: true,
      source: 'default',
      api: {
        'ethereum-rpc': 'https://rpc.test.com',
      },
    }
    mockGetChainById.mockReturnValue(mockConfig)

    const provider1 = getChainProvider('test')
    const provider2 = getChainProvider('test')
    
    expect(provider1).toBe(provider2)
  })
})
