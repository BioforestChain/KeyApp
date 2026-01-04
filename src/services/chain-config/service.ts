/**
 * Chain Config Service
 *
 * 提供链配置查询的单一入口。
 * 代码只耦合 chainId，通过此服务获取配置。
 */

import { chainConfigStore, chainConfigSelectors } from '@/stores/chain-config'
import type { ChainConfig } from './types'

/** 默认 RPC 端点（代码内置 fallback） */
const DEFAULT_RPC_URLS: Record<string, string> = {
  ethereum: 'https://ethereum-rpc.publicnode.com',
  binance: 'https://bsc-rpc.publicnode.com',
  tron: 'https://api.trongrid.io',
}

class ChainConfigService {
  /**
   * 获取链配置
   */
  getConfig(chainId: string): ChainConfig | null {
    return chainConfigSelectors.getChainById(chainConfigStore.state, chainId)
  }

  /**
   * 获取链的 RPC URL
   * 优先使用配置中的 api.url，fallback 到代码内置默认值
   */
  getRpcUrl(chainId: string): string {
    const config = this.getConfig(chainId)
    return config?.api?.url ?? DEFAULT_RPC_URLS[chainId] ?? ''
  }

  /**
   * 获取链的 API path (仅 bioforest 链需要)
   */
  getApiPath(chainId: string): string {
    const config = this.getConfig(chainId)
    return config?.api?.path ?? chainId
  }

  /**
   * 获取链的 decimals
   */
  getDecimals(chainId: string): number {
    const config = this.getConfig(chainId)
    return config?.decimals ?? 18
  }

  /**
   * 获取链的 symbol
   */
  getSymbol(chainId: string): string {
    const config = this.getConfig(chainId)
    return config?.symbol ?? ''
  }

  /**
   * 获取区块浏览器 URL
   */
  getExplorerUrl(chainId: string): string | null {
    const config = this.getConfig(chainId)
    return config?.explorer?.url ?? null
  }

  /**
   * 获取交易查询 URL
   */
  getTxQueryUrl(chainId: string, hash: string): string | null {
    const config = this.getConfig(chainId)
    const template = config?.explorer?.queryTx
    if (!template) return null
    return template.replace(':hash', hash).replace(':signature', hash)
  }

  /**
   * 获取地址查询 URL
   */
  getAddressQueryUrl(chainId: string, address: string): string | null {
    const config = this.getConfig(chainId)
    const template = config?.explorer?.queryAddress
    if (!template) return null
    return template.replace(':address', address)
  }
}

export const chainConfigService = new ChainConfigService()
