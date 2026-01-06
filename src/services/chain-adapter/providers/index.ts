/**
 * Chain Providers
 * 
 * 导出 ChainProvider 和各个 ApiProvider 实现。
 */

export * from './types'
export { ChainProvider } from './chain-provider'

// API Provider 实现
export { EtherscanProvider, createEtherscanProvider } from './etherscan-provider'
export { EvmRpcProvider, createEvmRpcProvider } from './evm-rpc-provider'
export { BiowalletProvider, createBiowalletProvider } from './biowallet-provider'
export { BscWalletProvider, createBscWalletProvider } from './bscwallet-provider'
export { TronRpcProvider, createTronRpcProvider } from './tron-rpc-provider'
export { MempoolProvider, createMempoolProvider } from './mempool-provider'
export { EthWalletProvider, createEthwalletProvider } from './ethwallet-provider'
export { TronWalletProvider, createTronwalletProvider } from './tronwallet-provider'
export { BtcWalletProvider, createBtcwalletProvider } from './btcwallet-provider'

// Wrapped Provider 实现
export { WrappedTransactionProvider } from './wrapped-transaction-provider'
export { WrappedIdentityProvider } from './wrapped-identity-provider'

// 工厂函数
import type { ApiProvider, ApiProviderFactory } from './types'
import type { ParsedApiEntry, ChainConfig } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { ChainProvider } from './chain-provider'

import { createEtherscanProvider } from './etherscan-provider'
import { createEvmRpcProvider } from './evm-rpc-provider'
import { createBiowalletProvider } from './biowallet-provider'
import { createBscWalletProvider } from './bscwallet-provider'
import { createTronRpcProvider } from './tron-rpc-provider'
import { createMempoolProvider } from './mempool-provider'
import { createEthwalletProvider } from './ethwallet-provider'
import { createTronwalletProvider } from './tronwallet-provider'
import { createBtcwalletProvider } from './btcwallet-provider'
import { WrappedTransactionProvider } from './wrapped-transaction-provider'
import { WrappedIdentityProvider } from './wrapped-identity-provider'

// 按需导入 service 工厂
import { EvmIdentityService } from '../evm/identity-service'
import { EvmAssetService } from '../evm/asset-service'
import { EvmTransactionService } from '../evm/transaction-service'
import { TronIdentityService } from '../tron/identity-service'
import { TronAssetService } from '../tron/asset-service'
import { TronTransactionService } from '../tron/transaction-service'
import { BitcoinIdentityService } from '../bitcoin/identity-service'
import { BitcoinAssetService } from '../bitcoin/asset-service'
import { BitcoinTransactionService } from '../bitcoin/transaction-service'
import { BioforestIdentityService } from '../bioforest/identity-service'
import { BioforestAssetService } from '../bioforest/asset-service'
import { BioforestTransactionService } from '../bioforest/transaction-service'

/** 所有 Provider 工厂函数 */
const PROVIDER_FACTORIES: ApiProviderFactory[] = [
  createBiowalletProvider,
  createBscWalletProvider,
  createEtherscanProvider,
  createEvmRpcProvider,
  createTronRpcProvider,
  createMempoolProvider,
  createEthwalletProvider,
  createTronwalletProvider,
  createBtcwalletProvider,
]

/**
 * 从配置创建 ApiProvider
 */
function createApiProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  for (const factory of PROVIDER_FACTORIES) {
    const provider = factory(entry, chainId)
    if (provider) return provider
  }
  return null
}

/**
 * 创建包装的交易和身份 Provider
 */
function createWrappedProviders(config: ChainConfig): ApiProvider[] {
  const providers: ApiProvider[] = []

  switch (config.chainKind) {
    case 'evm': {
      const identity = new EvmIdentityService(config.id)
      const asset = new EvmAssetService(config.id)
      const transaction = new EvmTransactionService(config.id)
      providers.push(
        new WrappedTransactionProvider(`wrapped-evm-tx`, transaction, asset),
        new WrappedIdentityProvider(`wrapped-evm-identity`, identity),
      )
      break
    }
    case 'tron': {
      const identity = new TronIdentityService(config.id)
      const asset = new TronAssetService(config.id)
      const transaction = new TronTransactionService(config.id)
      providers.push(
        new WrappedTransactionProvider(`wrapped-tron-tx`, transaction, asset),
        new WrappedIdentityProvider(`wrapped-tron-identity`, identity),
      )
      break
    }
    case 'bitcoin': {
      const identity = new BitcoinIdentityService(config.id)
      const asset = new BitcoinAssetService(config.id)
      const transaction = new BitcoinTransactionService(config.id)
      providers.push(
        new WrappedTransactionProvider(`wrapped-bitcoin-tx`, transaction, asset),
        new WrappedIdentityProvider(`wrapped-bitcoin-identity`, identity),
      )
      break
    }
    case 'bioforest': {
      const identity = new BioforestIdentityService(config.id)
      const asset = new BioforestAssetService(config.id)
      const transaction = new BioforestTransactionService(config.id)
      providers.push(
        new WrappedTransactionProvider(`wrapped-bioforest-tx`, transaction, asset),
        new WrappedIdentityProvider(`wrapped-bioforest-identity`, identity),
      )
      break
    }
  }

  return providers
}

/**
 * 为指定链创建 ChainProvider
 * 
 * 根据链配置中的 api 条目，创建对应的 ApiProvider 并聚合到 ChainProvider。
 * 同时添加包装的交易和身份 Provider。
 */
export function createChainProvider(chainId: string): ChainProvider {
  const entries = chainConfigService.getApi(chainId)
  const config = chainConfigService.getConfig(chainId)
  const providers: ApiProvider[] = []

  // 添加 API Providers (查询能力)
  for (const entry of entries) {
    const provider = createApiProvider(entry, chainId)
    if (provider) {
      providers.push(provider)
    }
  }

  // 添加 Wrapped Providers (交易 + 身份能力)
  if (config) {
    const wrappedProviders = createWrappedProviders(config)
    providers.push(...wrappedProviders)
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
