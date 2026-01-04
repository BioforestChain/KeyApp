/**
 * Chain Providers
 * 
 * 导出 ChainProvider 和各个 ApiProvider 实现。
 */

export * from './types'
export { ChainProvider } from './chain-provider'

// Provider 实现
export { EtherscanProvider, createEtherscanProvider } from './etherscan-provider'
export { EvmRpcProvider, createEvmRpcProvider } from './evm-rpc-provider'
export { BiowalletProvider, createBiowalletProvider } from './biowallet-provider'
export { TronRpcProvider, createTronRpcProvider } from './tron-rpc-provider'
export { MempoolProvider, createMempoolProvider } from './mempool-provider'

// 工厂函数
import type { ApiProvider, ApiProviderFactory } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { ChainProvider } from './chain-provider'

import { createEtherscanProvider } from './etherscan-provider'
import { createEvmRpcProvider } from './evm-rpc-provider'
import { createBiowalletProvider } from './biowallet-provider'
import { createTronRpcProvider } from './tron-rpc-provider'
import { createMempoolProvider } from './mempool-provider'

/** 所有 Provider 工厂函数 */
const PROVIDER_FACTORIES: ApiProviderFactory[] = [
  createBiowalletProvider,
  createEtherscanProvider,
  createEvmRpcProvider,
  createTronRpcProvider,
  createMempoolProvider,
]

/**
 * 从配置创建 ApiProvider
 */
function createProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  for (const factory of PROVIDER_FACTORIES) {
    const provider = factory(entry, chainId)
    if (provider) return provider
  }
  return null
}

/**
 * 为指定链创建 ChainProvider
 * 
 * 根据链配置中的 api 条目，创建对应的 ApiProvider 并聚合到 ChainProvider。
 */
export function createChainProvider(chainId: string): ChainProvider {
  const entries = chainConfigService.getApi(chainId)
  const providers: ApiProvider[] = []

  for (const entry of entries) {
    const provider = createProvider(entry, chainId)
    if (provider) {
      providers.push(provider)
    }
  }

  return new ChainProvider(chainId, providers)
}

/** ChainProvider 缓存 */
const providerCache = new Map<string, ChainProvider>()

/**
 * 获取或创建 ChainProvider（带缓存）
 */
export function getChainProvider(chainId: string): ChainProvider {
  let provider = providerCache.get(chainId)
  if (!provider) {
    provider = createChainProvider(chainId)
    providerCache.set(chainId, provider)
  }
  return provider
}

/**
 * 清除 ChainProvider 缓存
 */
export function clearProviderCache(): void {
  providerCache.clear()
}
