/**
 * Chain Provider Factory (Effect TS)
 * 
 * 为不同链创建对应的 ChainProvider，聚合多个 ApiProvider。
 */

// 导出类型
export type { Transaction, Balance, TokenBalance, Direction, Action, ApiProvider } from './types';

// 导出错误类
export { InvalidDataError } from './errors';

// 导出 ChainProvider
export { ChainProvider } from './chain-provider';

// 导出 Effect 版本的 Providers
export { EtherscanV1ProviderEffect, createEtherscanV1ProviderEffect } from './etherscan-v1-provider.effect';
export { EtherscanV2ProviderEffect, createEtherscanV2ProviderEffect } from './etherscan-v2-provider.effect';
export { EvmRpcProviderEffect, createEvmRpcProviderEffect } from './evm-rpc-provider.effect';
export { BiowalletProviderEffect, createBiowalletProviderEffect } from './biowallet-provider.effect';
export { BscWalletProviderEffect, createBscWalletProviderEffect } from './bscwallet-provider.effect';
export { TronRpcProviderEffect, createTronRpcProviderEffect } from './tron-rpc-provider.effect';
export { MempoolProviderEffect, createMempoolProviderEffect } from './mempool-provider.effect';
export { EthWalletProviderEffect, createEthwalletProviderEffect } from './ethwallet-provider.effect';
export { TronWalletProviderEffect, createTronwalletProviderEffect } from './tronwallet-provider.effect';
export { BtcWalletProviderEffect, createBtcwalletProviderEffect } from './btcwallet-provider.effect';
export { MoralisProviderEffect, createMoralisProviderEffect } from './moralis-provider.effect';

// 工厂函数
import type { ApiProvider, ApiProviderFactory } from './types';
import type { ParsedApiEntry } from '@/services/chain-config';
import { chainConfigService } from '@/services/chain-config';
import { ChainProvider } from './chain-provider';

import { createEtherscanV1ProviderEffect } from './etherscan-v1-provider.effect';
import { createEtherscanV2ProviderEffect } from './etherscan-v2-provider.effect';
import { createEvmRpcProviderEffect } from './evm-rpc-provider.effect';
import { createBiowalletProviderEffect } from './biowallet-provider.effect';
import { createBscWalletProviderEffect } from './bscwallet-provider.effect';
import { createTronRpcProviderEffect } from './tron-rpc-provider.effect';
import { createMempoolProviderEffect } from './mempool-provider.effect';
import { createEthwalletProviderEffect } from './ethwallet-provider.effect';
import { createTronwalletProviderEffect } from './tronwallet-provider.effect';
import { createBtcwalletProviderEffect } from './btcwallet-provider.effect';
import { createMoralisProviderEffect } from './moralis-provider.effect';

/** 所有 Provider 工厂函数 */
const PROVIDER_FACTORIES: ApiProviderFactory[] = [
  createMoralisProviderEffect,
  createBiowalletProviderEffect,
  createBscWalletProviderEffect,
  createEtherscanV2ProviderEffect,
  createEtherscanV1ProviderEffect,
  createEvmRpcProviderEffect,
  createTronRpcProviderEffect,
  createMempoolProviderEffect,
  createEthwalletProviderEffect,
  createTronwalletProviderEffect,
  createBtcwalletProviderEffect,
];

/**
 * 从配置创建 ApiProvider
 */
function createApiProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  for (const factory of PROVIDER_FACTORIES) {
    const provider = factory(entry, chainId);
    if (provider) return provider;
  }
  return null;
}

/**
 * 为指定链创建 ChainProvider
 */
export function createChainProvider(chainId: string): ChainProvider {
  const entries = chainConfigService.getApi(chainId);
  const providers: ApiProvider[] = [];

  for (const entry of entries) {
    const provider = createApiProvider(entry, chainId);
    if (provider) {
      providers.push(provider);
    }
  }

  return new ChainProvider(chainId, providers);
}

/** ChainProvider 缓存 */
const providerCache = new Map<string, ChainProvider>();

/**
 * 获取或创建 ChainProvider（带缓存）
 */
export function getChainProvider(chainId: string): ChainProvider {
  let provider = providerCache.get(chainId);
  if (!provider) {
    provider = createChainProvider(chainId);
    providerCache.set(chainId, provider);
  }
  return provider;
}

/**
 * 清除 ChainProvider 缓存
 */
export function clearProviderCache(): void {
  providerCache.clear();
}
