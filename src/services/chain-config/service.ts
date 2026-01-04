/**
 * Chain Config Service
 *
 * 提供链配置查询的单一入口。
 * 代码只耦合 chainId，通过此服务获取配置。
 */

import { chainConfigStore, chainConfigSelectors } from '@/stores/chain-config'
import type { ApiEntry, ChainConfig, ParsedApiEntry } from './types'

class ChainConfigService {
  /**
   * 获取链配置
   */
  getConfig(chainId: string): ChainConfig | null {
    return chainConfigSelectors.getChainById(chainConfigStore.state, chainId)
  }

  /**
   * 获取链的所有 API 配置
   * 返回解析后的 ParsedApiEntry 数组
   */
  getApi(chainId: string): ParsedApiEntry[] {
    const config = this.getConfig(chainId)
    if (!config?.api) return []

    const entries: ParsedApiEntry[] = []
    for (const [type, entry] of Object.entries(config.api)) {
      entries.push(this.parseApiEntry(type, entry as ApiEntry))
    }
    return entries
  }

  /**
   * 获取指定类型的 API 配置
   */
  getApiByType(chainId: string, type: string): ParsedApiEntry | null {
    const entries = this.getApi(chainId)
    return entries.find((e) => e.type === type) ?? null
  }

  /**
   * 查找匹配模式的 API (例如 "*-rpc" 匹配 "ethereum-rpc", "tron-rpc")
   */
  getApiByPattern(chainId: string, pattern: string): ParsedApiEntry | null {
    const entries = this.getApi(chainId)
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$')
    return entries.find((e) => regex.test(e.type)) ?? null
  }

  /**
   * 解析 API 配置项
   */
  private parseApiEntry(type: string, entry: ApiEntry): ParsedApiEntry {
    if (typeof entry === 'string') {
      return { type, endpoint: entry }
    }
    const [endpoint, config] = entry
    return { type, endpoint, config }
  }

  // ========== 便捷方法 (用于 Adapter) ==========

  /**
   * 获取 RPC URL (匹配 *-rpc 类型的 provider)
   */
  getRpcUrl(chainId: string): string {
    const api = this.getApiByPattern(chainId, '*-rpc')
    return api?.endpoint ?? ''
  }

  /**
   * 获取 BioWallet API 配置 (匹配 biowallet-* 类型)
   */
  getBiowalletApi(chainId: string): { endpoint: string; path: string } | null {
    const api = this.getApiByPattern(chainId, 'biowallet-*')
    if (!api) return null
    const path = (api.config?.path as string) ?? chainId
    return { endpoint: api.endpoint, path }
  }

  /**
   * 获取 Etherscan API (匹配 etherscan-* 或 *scan-* 类型)
   */
  getEtherscanApi(chainId: string): string | null {
    // 先尝试 etherscan-*，再尝试 *scan-*
    const api = this.getApiByPattern(chainId, 'etherscan-*') 
      ?? this.getApiByPattern(chainId, '*scan-*')
    return api?.endpoint ?? null
  }

  /**
   * 获取 Mempool API (匹配 mempool-* 类型)
   */
  getMempoolApi(chainId: string): string | null {
    const api = this.getApiByPattern(chainId, 'mempool-*')
    return api?.endpoint ?? null
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
