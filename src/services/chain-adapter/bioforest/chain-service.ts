/**
 * BioForest Chain Service
 */

import type { ChainConfig } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import type { IChainService, ChainInfo, GasPrice, HealthStatus } from '../types'
import { ChainServiceError, ChainErrorCodes } from '../types'
import type { BioforestBlockInfo, BioforestFeeInfo } from './types'

export class BioforestChainService implements IChainService {
  private readonly config: ChainConfig
  private readonly baseUrl: string

  constructor(config: ChainConfig) {
    this.config = config
    this.baseUrl = config.rpcUrl ?? ''
  }

  getChainInfo(): ChainInfo {
    const info: ChainInfo = {
      chainId: this.config.id,
      name: this.config.name,
      symbol: this.config.symbol,
      decimals: this.config.decimals,
      blockTime: 10, // BioForest ~10s block time
      confirmations: 1, // BioForest usually 1 confirmation is enough
    }
    if (this.config.explorerUrl) {
      info.explorerUrl = this.config.explorerUrl
    }
    return info
  }

  async getBlockHeight(): Promise<bigint> {
    if (!this.baseUrl) {
      return 0n
    }

    try {
      const response = await fetch(`${this.baseUrl}/wallet/${this.config.id}/lastblock`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new ChainServiceError(
          ChainErrorCodes.NETWORK_ERROR,
          `Failed to fetch block height: ${response.status}`,
        )
      }

      const json = (await response.json()) as { success: boolean; result: BioforestBlockInfo }
      if (!json.success) {
        throw new ChainServiceError(ChainErrorCodes.NETWORK_ERROR, 'API returned success=false')
      }
      return BigInt(json.result.height)
    } catch (error) {
      if (error instanceof ChainServiceError) throw error
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        'Failed to fetch block height',
        undefined,
        error instanceof Error ? error : undefined,
      )
    }
  }

  async getGasPrice(): Promise<GasPrice> {
    const { decimals, symbol } = this.config

    if (!this.baseUrl) {
      // Return default fees
      const defaultFee = Amount.fromRaw('10000000', decimals, symbol) // 0.1 in 8 decimals
      return {
        slow: defaultFee,
        standard: defaultFee,
        fast: defaultFee.mul(2),
        lastUpdated: Date.now(),
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/wallet/${this.config.id}/blockAveFee`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new ChainServiceError(
          ChainErrorCodes.NETWORK_ERROR,
          `Failed to fetch fee info: ${response.status}`,
        )
      }

      const json = (await response.json()) as { success: boolean; result: BioforestFeeInfo }
      if (!json.success) {
        throw new ChainServiceError(ChainErrorCodes.NETWORK_ERROR, 'API returned success=false')
      }
      const minFee = Amount.fromRaw(json.result.minFee, decimals, symbol)
      const avgFee = Amount.fromRaw(json.result.avgFee, decimals, symbol)

      return {
        slow: minFee,
        standard: avgFee.gt(minFee) ? avgFee : minFee,
        fast: avgFee.mul(2).gt(minFee) ? avgFee.mul(2) : minFee.mul(2),
        lastUpdated: Date.now(),
      }
    } catch (error) {
      if (error instanceof ChainServiceError) throw error
      // Return default on error
      const defaultFee = Amount.fromRaw('10000000', decimals, symbol)
      return {
        slow: defaultFee,
        standard: defaultFee,
        fast: defaultFee.mul(2),
        lastUpdated: Date.now(),
      }
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    if (!this.baseUrl) {
      return {
        isHealthy: false,
        latency: 0,
        blockHeight: 0n,
        isSyncing: false,
        lastUpdated: Date.now(),
      }
    }

    const startTime = Date.now()

    try {
      const response = await fetch(`${this.baseUrl}/wallet/${this.config.id}/lastblock`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      const latency = Date.now() - startTime

      if (!response.ok) {
        return {
          isHealthy: false,
          latency,
          blockHeight: 0n,
          isSyncing: false,
          lastUpdated: Date.now(),
        }
      }

      const json = (await response.json()) as { success: boolean; result: BioforestBlockInfo }

      return {
        isHealthy: json.success,
        latency,
        blockHeight: json.success ? BigInt(json.result.height) : 0n,
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
