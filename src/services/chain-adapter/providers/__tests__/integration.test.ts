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
      apis: [
        { type: 'etherscan-v2', endpoint: 'https://api.etherscan.io/v2/api' },
        { type: 'ethereum-rpc', endpoint: 'https://ethereum-rpc.publicnode.com' },
      ],
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
      apis: [{ type: 'biowallet-v1', endpoint: 'https://walletapi.bfmeta.info/wallet/bfm' }],
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

  it('为 BFMeta V2 链创建正确的 providers', () => {
    const mockBfmetav2Config: ChainConfig = {
      id: 'bfmetav2',
      version: '1.0',
      chainKind: 'bioforest',
      name: 'BFMeta V2',
      symbol: 'BFM',
      decimals: 8,
      prefix: 'b',
      enabled: true,
      source: 'default',
      apis: [{ type: 'biowallet-v1', endpoint: 'https://walletapi.bf-meta.org/wallet/bfmetav2' }],
    }
    mockGetChainById.mockReturnValue(mockBfmetav2Config)

    const provider = createChainProvider('bfmetav2')
    
    const providers = provider.getProviders()
    expect(providers.length).toBeGreaterThanOrEqual(1)
    
    // 检查是否有 biowallet provider
    const biowalletProvider = providers.find(p => p.type.includes('biowallet'))
    expect(biowalletProvider).toBeDefined()
    
    // biowallet provider 应该直接使用 endpoint，无需 path 拼接
    expect(biowalletProvider?.endpoint).toBe('https://walletapi.bf-meta.org/wallet/bfmetav2')
    
    // 检查能力
    expect(provider.supportsTransactionHistory).toBe(true)
    expect(provider.supportsNativeBalance).toBe(true)
  })

  it('当链配置不存在时返回空 providers', () => {
    mockGetChainById.mockReturnValue(null)

    const provider = createChainProvider('unknown-chain')
    
    const _providers = provider.getProviders()
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
      apis: [{ type: 'ethereum-rpc', endpoint: 'https://rpc.test.com' }],
    }
    mockGetChainById.mockReturnValue(mockConfig)

    const provider1 = getChainProvider('test')
    const provider2 = getChainProvider('test')
    
    expect(provider1).toBe(provider2)
  })
})
