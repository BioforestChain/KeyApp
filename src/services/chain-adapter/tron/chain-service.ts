/**
 * Tron Chain Service
 */

import type { ChainConfig } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config/service';
import type { IChainService, ChainInfo, GasPrice, HealthStatus } from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'
import type { TronBlock, TronAccountResource } from './types'

/** Default Tron RPC 端点 (fallback) */
const DEFAULT_RPC_URL = 'https://api.trongrid.io'

export class TronChainService implements IChainService {
  private readonly config: ChainConfig
  private readonly rpcUrl: string

  constructor(config: ChainConfig) {
    this.config = config
    // 使用 *-rpc API 配置
    this.rpcUrl = chainConfigService.getRpcUrl(config.id) || DEFAULT_RPC_URL
  }

  private async api<T>(endpoint: string, body?: unknown): Promise<T> {
    const url = `${this.rpcUrl}${endpoint}`
    const init: RequestInit = body
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : { method: 'GET' }

    const response = await fetch(url, init)
    if (!response.ok) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        `Tron API error: ${response.status}`,
      )
    }

    return response.json() as Promise<T>
  }

  getChainInfo(): ChainInfo {
    return {
      chainId: this.config.id,
      name: this.config.name,
      symbol: this.config.symbol,
      decimals: this.config.decimals,
      blockTime: 3,
      confirmations: 19,
      explorerUrl: this.config.explorer?.url,
    }
  }

  async getBlockHeight(): Promise<bigint> {
    const block = await this.api<TronBlock>('/wallet/getnowblock')
    return BigInt(block.block_header.raw_data.number)
  }

  async getGasPrice(): Promise<GasPrice> {
    // Tron uses bandwidth/energy, not gas
    // 1000 SUN per bandwidth unit
    const price = Amount.fromRaw('1000', this.config.decimals, this.config.symbol)
    return {
      slow: price,
      standard: price,
      fast: price,
      lastUpdated: Date.now(),
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    const start = Date.now()
    try {
      const block = await this.api<TronBlock>('/wallet/getnowblock')
      return {
        isHealthy: true,
        latency: Date.now() - start,
        blockHeight: BigInt(block.block_header.raw_data.number),
        isSyncing: false,
        lastUpdated: Date.now(),
      }
    } catch {
      return {
        isHealthy: false,
        latency: Date.now() - start,
        blockHeight: 0n,
        isSyncing: false,
        lastUpdated: Date.now(),
      }
    }
  }

  async getAccountResources(address: string): Promise<TronAccountResource> {
    return this.api<TronAccountResource>('/wallet/getaccountresource', {
      address,
      visible: true,
    })
  }
}
