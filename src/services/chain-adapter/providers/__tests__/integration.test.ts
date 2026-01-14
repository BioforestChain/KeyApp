/**
 * 集成测试：验证 ChainProvider 创建流程
 * 
 * 测试从 Provider → ChainProvider → 能力检查的完整流程
 * 使用新 KeyFetch API，直接实例化 provider 避免 mock 问题
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChainProvider } from '../chain-provider'
import { EtherscanProvider, EvmRpcProvider, BiowalletProvider, TronRpcProvider } from '../index'
import { clearProviderCache } from '../index'
import type { ParsedApiEntry } from '@/services/chain-config'
import { keyFetch } from '@biochain/key-fetch'

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: vi.fn().mockReturnValue('TEST'),
    getDecimals: vi.fn().mockReturnValue(18),
  },
}))

describe('ChainProvider 集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    keyFetch.clear()
    clearProviderCache()
  })

  it('为 Ethereum 链创建正确的 providers', () => {
    const etherscanEntry: ParsedApiEntry = {
      type: 'etherscan-v2',
      endpoint: 'https://api.etherscan.io/v2/api',
    }
    const rpcEntry: ParsedApiEntry = {
      type: 'ethereum-rpc',
      endpoint: 'https://ethereum-rpc.publicnode.com',
    }

    const etherscanProvider = new EtherscanProvider(etherscanEntry, 'ethereum')
    const rpcProvider = new EvmRpcProvider(rpcEntry, 'ethereum')
    const chainProvider = new ChainProvider('ethereum', [etherscanProvider, rpcProvider])

    const providers = chainProvider.getProviders()
    expect(providers.length).toBe(2)

    // 检查是否有 etherscan provider
    const foundEtherscan = providers.find(p => p.type.includes('etherscan'))
    expect(foundEtherscan).toBeDefined()

    // 检查能力
    expect(chainProvider.supportsTransactionHistory).toBe(true)
    expect(chainProvider.supportsNativeBalance).toBe(true)
  })

  it('为 BFMeta 链创建正确的 providers', () => {
    const biowalletEntry: ParsedApiEntry = {
      type: 'biowallet-v1',
      endpoint: 'https://walletapi.bfmeta.info/wallet/bfm',
    }

    const biowalletProvider = new BiowalletProvider(biowalletEntry, 'bfmeta')
    const chainProvider = new ChainProvider('bfmeta', [biowalletProvider])

    const providers = chainProvider.getProviders()
    expect(providers.length).toBe(1)

    // 检查是否有 biowallet provider
    const foundBiowallet = providers.find(p => p.type.includes('biowallet'))
    expect(foundBiowallet).toBeDefined()

    // 检查能力
    expect(chainProvider.supportsTransactionHistory).toBe(true)
    expect(chainProvider.supportsNativeBalance).toBe(true)
  })

  it('为 Tron 链创建正确的 providers', () => {
    const tronEntry: ParsedApiEntry = {
      type: 'tron-rpc',
      endpoint: 'https://api.trongrid.io',
    }

    const tronProvider = new TronRpcProvider(tronEntry, 'tron')
    const chainProvider = new ChainProvider('tron', [tronProvider])

    const providers = chainProvider.getProviders()
    expect(providers.length).toBe(1)

    // 检查能力
    expect(chainProvider.supportsTransactionHistory).toBe(true)
    expect(chainProvider.supportsNativeBalance).toBe(true)
  })

  it('当没有 providers 时不支持功能', () => {
    const chainProvider = new ChainProvider('unknown-chain', [])

    expect(chainProvider.supportsTransactionHistory).toBe(false)
    expect(chainProvider.supportsNativeBalance).toBe(false)
  })

  it('getProviderByType 正确返回 provider', () => {
    const etherscanEntry: ParsedApiEntry = {
      type: 'etherscan-v2',
      endpoint: 'https://api.etherscan.io/v2/api',
    }
    const rpcEntry: ParsedApiEntry = {
      type: 'ethereum-rpc',
      endpoint: 'https://ethereum-rpc.publicnode.com',
    }

    const etherscanProvider = new EtherscanProvider(etherscanEntry, 'ethereum')
    const rpcProvider = new EvmRpcProvider(rpcEntry, 'ethereum')
    const chainProvider = new ChainProvider('ethereum', [etherscanProvider, rpcProvider])

    expect(chainProvider.getProviderByType('etherscan-v2')).toBe(etherscanProvider)
    expect(chainProvider.getProviderByType('ethereum-rpc')).toBe(rpcProvider)
    expect(chainProvider.getProviderByType('unknown')).toBeUndefined()
  })
})
