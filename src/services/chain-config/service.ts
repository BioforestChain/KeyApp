/**
 * Chain Config Service
 *
 * 提供链配置查询的单一入口。
 * 代码只耦合 chainId，通过此服务获取配置。
 */

import { chainConfigStore, chainConfigSelectors } from '@/stores/chain-config'
import { toChecksumAddress } from '@/lib/crypto'
import type { ChainConfig, ParsedApiEntry } from './types'

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
    return config?.apis ?? []
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

  // ========== 便捷方法 (用于 Adapter) ==========

  /**
   * 获取 RPC URL (匹配 *-rpc 类型的 provider)
   */
  getRpcUrl(chainId: string): string {
    const api = this.getApiByPattern(chainId, '*-rpc')
    return api?.endpoint ?? ''
  }

  /**
   * 获取 BioWallet API endpoint (匹配 biowallet-* 类型)
   * endpoint 已包含完整路径，如 https://walletapi.bfmeta.info/wallet/bfm
   */
  getBiowalletApi(chainId: string): string | null {
    const api = this.getApiByPattern(chainId, 'biowallet-*')
    return api?.endpoint ?? null
  }

  /**
   * 获取 BioWallet API 的 genesisBlock 配置路径
   * 路径是相对于 default-chains.json 的位置
   */
  getBiowalletGenesisBlock(chainId: string): string | null {
    const api = this.getApiByPattern(chainId, 'biowallet-*')
    const config = api?.config as { genesisBlock?: string } | undefined
    return config?.genesisBlock ?? null
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

  /**
   * 获取链名称
   */
  getName(chainId: string): string {
    const config = this.getConfig(chainId)
    return config?.name ?? chainId
  }

  /**
   * 获取链图标 URL (已解析为完整 URL)
   */
  getIcon(chainId: string): string | null {
    const config = this.getConfig(chainId)
    return config?.icon ?? null
  }

  /**
   * 根据合约地址获取代币图标 URL
   * 使用 tokenIconContract 配置模板，替换 $address 占位符
   * 
   * @param chainId 链 ID
   * @param contractAddress 合约地址（会自动转换为 checksum 格式）
   * @returns 图标 URL 或 null
   */
  getTokenIconByContract(chainId: string, contractAddress: string): string | null {
    const config = this.getConfig(chainId)
    const templates = config?.tokenIconContract
    if (!templates || templates.length === 0) return null

    try {
      const checksumAddress = toChecksumAddress(contractAddress)
      return templates[0].replace('$address', checksumAddress)
    } catch {
      return null
    }
  }
}

export const chainConfigService = new ChainConfigService()
