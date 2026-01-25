/**
 * Bitcoin Chain Service
 * 
 * Uses mempool.space API for fee estimates and block info
 */

import type { ChainConfig } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config/service';
import type { IChainService, ChainInfo, GasPrice, HealthStatus } from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'
import type { BitcoinFeeEstimates } from './types'

/** mempool.space API 默认端点 (fallback) */
const DEFAULT_API_URL = 'https://mempool.space/api'

export class BitcoinChainService implements IChainService {
  private readonly config: ChainConfig
  private readonly apiUrl: string

  constructor(config: ChainConfig) {
    this.config = config
    // 使用 mempool-* API 配置
    this.apiUrl = chainConfigService.getMempoolApi(config.id) ?? DEFAULT_API_URL
  }

  private async api<T>(endpoint: string): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        `Bitcoin API error: ${response.status}`,
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
      blockTime: 600, // ~10 minutes
      confirmations: 6,
      explorerUrl: this.config.explorer?.url,
    }
  }

  async getBlockHeight(): Promise<bigint> {
    const height = await this.api<number>('/blocks/tip/height')
    return BigInt(height)
  }

  async getGasPrice(): Promise<GasPrice> {
    try {
      const fees = await this.api<BitcoinFeeEstimates>('/v1/fees/recommended')
      
      // Convert sat/vB to Amount (for a typical 250 vB transaction)
      const typicalSize = 250n
      const slow = Amount.fromRaw((BigInt(fees.hourFee) * typicalSize).toString(), this.config.decimals, this.config.symbol)
      const standard = Amount.fromRaw((BigInt(fees.halfHourFee) * typicalSize).toString(), this.config.decimals, this.config.symbol)
      const fast = Amount.fromRaw((BigInt(fees.fastestFee) * typicalSize).toString(), this.config.decimals, this.config.symbol)

      return {
        slow,
        standard,
        fast,
        lastUpdated: Date.now(),
      }
    } catch {
      // Default fees if API fails
      const defaultFee = Amount.fromRaw('5000', this.config.decimals, this.config.symbol)
      return {
        slow: defaultFee,
        standard: defaultFee,
        fast: defaultFee,
        lastUpdated: Date.now(),
      }
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    const start = Date.now()
    try {
      const height = await this.api<number>('/blocks/tip/height')
      return {
        isHealthy: true,
        latency: Date.now() - start,
        blockHeight: BigInt(height),
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

  /** Get recommended fee rates in sat/vB */
  async getFeeRates(): Promise<BitcoinFeeEstimates> {
    return this.api<BitcoinFeeEstimates>('/v1/fees/recommended')
  }
}
