/**
 * EVM Chain Service
 */

import type { ChainConfig } from '@/services/chain-config'
import type { IChainService, ChainInfo, GasPrice, HealthStatus } from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'

export class EvmChainService implements IChainService {
  private readonly config: ChainConfig
  private readonly apiUrl: string
  private readonly apiPath: string

  constructor(config: ChainConfig) {
    this.config = config
    this.apiUrl = config.api?.url ?? 'https://walletapi.bfmeta.info'
    this.apiPath = config.api?.path ?? config.id
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${this.apiUrl}/wallet/${this.apiPath}${endpoint}`
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
    return {
      chainId: this.config.id,
      name: this.config.name,
      symbol: this.config.symbol,
      decimals: this.config.decimals,
      blockTime: 12, // ~12 seconds for Ethereum
      confirmations: 12,
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
    try {
      const result = await this.fetch<{ gasPrice: string; baseFee?: string }>('/gasprice')
      const gasPrice = Amount.fromRaw(result.gasPrice, 9, 'Gwei') // Gas price in Gwei

      return {
        slow: gasPrice,
        standard: gasPrice,
        fast: gasPrice,
        baseFee: result.baseFee ? Amount.fromRaw(result.baseFee, 9, 'Gwei') : undefined,
        lastUpdated: Date.now(),
      }
    } catch {
      // Return default gas prices
      const defaultGas = Amount.fromRaw('20000000000', 9, 'Gwei') // 20 Gwei
      return {
        slow: defaultGas,
        standard: defaultGas,
        fast: defaultGas,
        lastUpdated: Date.now(),
      }
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
