/**
 * BIP39 Chain Service (Bitcoin)
 */

import type { ChainConfig } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import type { IChainService, ChainInfo, GasPrice, HealthStatus } from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'

export class Bip39ChainService implements IChainService {
  private readonly config: ChainConfig
  private readonly apiUrl: string

  constructor(config: ChainConfig) {
    this.config = config
    // 使用 mempool-* API
    this.apiUrl = chainConfigService.getMempoolApi(config.id) ?? 'https://mempool.space/api'
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        `HTTP ${response.status}: ${response.statusText}`,
      )
    }

    const json = await response.json() as { success: boolean; result?: T; error?: { message: string } }
    if (!json.success) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        json.error?.message ?? 'API request failed',
      )
    }

    return json.result as T
  }

  getChainInfo(): ChainInfo {
    const blockTime = this.config.id === 'bitcoin' ? 600 : 3 // BTC ~10min, TRX ~3s
    const confirmations = this.config.id === 'bitcoin' ? 6 : 19

    return {
      chainId: this.config.id,
      name: this.config.name,
      symbol: this.config.symbol,
      decimals: this.config.decimals,
      blockTime,
      confirmations,
      explorerUrl: this.config.explorer?.url,
    }
  }

  async getBlockHeight(): Promise<bigint> {
    try {
      const result = await this.fetch<{ height: number }>('/lastblock')
      return BigInt(result.height)
    } catch {
      return 0n
    }
  }

  async getGasPrice(): Promise<GasPrice> {
    // Bitcoin uses sat/vB, Tron uses bandwidth/energy
    const defaultFee = Amount.fromRaw('1000', this.config.decimals, this.config.symbol)
    return {
      slow: defaultFee,
      standard: defaultFee,
      fast: defaultFee,
      lastUpdated: Date.now(),
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now()
    try {
      const height = await this.getBlockHeight()
      return {
        isHealthy: true,
        latency: Date.now() - startTime,
        blockHeight: height,
        isSyncing: false,
        lastUpdated: Date.now(),
      }
    } catch {
      return {
        isHealthy: false,
        latency: Date.now() - startTime,
        blockHeight: 0n,
        isSyncing: false,
        lastUpdated: Date.now(),
      }
    }
  }
}
