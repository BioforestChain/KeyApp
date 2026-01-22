/**
 * Chain Provider Factory
 * 
 * 为不同链创建对应的 ChainProvider，聚合多个 ApiProvider。
 */

// 导出类型
export type { Transaction, Balance, TokenBalance, Direction, Action, ApiProvider } from './types';

// 导出错误类
export { InvalidDataError } from './errors';

// 导出所有 Provider 实现
export { ChainProvider } from './chain-provider';
export { EtherscanV1Provider, createEtherscanV1Provider } from './etherscan-v1-provider';
export { EtherscanV2Provider, createEtherscanV2Provider } from './etherscan-v2-provider';
export { EvmRpcProvider, createEvmRpcProvider } from './evm-rpc-provider';
export { BiowalletProvider, createBiowalletProvider } from './biowallet-provider';
export { BscWalletProvider, createBscWalletProvider } from './bscwallet-provider';
export { TronRpcProvider, createTronRpcProvider } from './tron-rpc-provider';
export { MempoolProvider, createMempoolProvider } from './mempool-provider';
export { EthWalletProvider, createEthwalletProvider } from './ethwallet-provider';
export { TronWalletProvider, createTronwalletProvider } from './tronwallet-provider';
export { BtcWalletProvider, createBtcwalletProvider } from './btcwallet-provider';
export { MoralisProvider, createMoralisProvider } from './moralis-provider';

// 工厂函数
import type { ApiProvider, ApiProviderFactory } from './types';
import type { ParsedApiEntry } from '@/services/chain-config';
import { chainConfigService } from '@/services/chain-config';
import { ChainProvider } from './chain-provider';

import { createEtherscanV1Provider } from './etherscan-v1-provider';
import { createEtherscanV2Provider } from './etherscan-v2-provider';
import { createEvmRpcProvider } from './evm-rpc-provider';
import { createBiowalletProvider } from './biowallet-provider';
import { createBscWalletProvider } from './bscwallet-provider';
import { createTronRpcProvider } from './tron-rpc-provider';
import { createMempoolProvider } from './mempool-provider';
import { createEthwalletProvider } from './ethwallet-provider';
import { createTronwalletProvider } from './tronwallet-provider';
import { createBtcwalletProvider } from './btcwallet-provider';
import { createMoralisProvider } from './moralis-provider';

/** 所有 Provider 工厂函数 */
const PROVIDER_FACTORIES: ApiProviderFactory[] = [
  createMoralisProvider,  // Moralis 优先（支持 tokenBalances）
  createBiowalletProvider,
  createBscWalletProvider,
  createEtherscanV2Provider,
  createEtherscanV1Provider,
  createEvmRpcProvider,
  createTronRpcProvider,
  createMempoolProvider,
  createEthwalletProvider,
  createTronwalletProvider,
  createBtcwalletProvider,
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
 *
 * 根据链配置中的 api 条目，创建对应的 ApiProvider 并聚合到 ChainProvider。
 * 
 * 注意：TronRpcProvider 已通过 Mixin 继承方式内置 Identity 和 Transaction 能力。
 * 其他链的 Provider 后续将逐步迁移到同样的模式。
 */
export function createChainProvider(chainId: string): ChainProvider {
  const entries = chainConfigService.getApi(chainId);
  const providers: ApiProvider[] = [];

  // 添加 API Providers
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
