/**
 * BioForest Chain Service
 */

import type { ChainConfig } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import type { IChainService, ChainInfo, GasPrice, HealthStatus } from '../types'
import { ChainServiceError, ChainErrorCodes } from '../types'
import type { BioforestBlockInfo, BioforestFeeInfo } from './types'

export class BioforestChainService implements IChainService {
  private readonly chainId: string
  private config: ChainConfig | null = null
  private apiUrl: string = ''
  private apiPath: string = ''

  constructor(chainId: string) {
    this.chainId = chainId
  }

  private getConfig(): ChainConfig {
    if (!this.config) {
      const config = chainConfigService.getConfig(this.chainId)
      if (!config) {
        throw new ChainServiceError(
          ChainErrorCodes.CHAIN_NOT_FOUND,
          `Chain config not found: ${this.chainId}`,
        )
      }
      this.config = config
      const biowalletApi = chainConfigService.getBiowalletApi(config.id)
      this.apiUrl = biowalletApi?.endpoint ?? ''
      this.apiPath = biowalletApi?.path ?? config.id
    }
    return this.config
  }

  getChainInfo(): ChainInfo {
    const config = this.getConfig()
    const info: ChainInfo = {
      chainId: config.id,
      name: config.name,
      symbol: config.symbol,
      decimals: config.decimals,
      blockTime: 10, // BioForest ~10s block time
      confirmations: 1, // BioForest usually 1 confirmation is enough
    }
    if (config.explorer?.url) {
      info.explorerUrl = config.explorer.url
    }
    return info
  }

  async getBlockHeight(): Promise<bigint> {
    this.getConfig() // Ensure config is loaded
    if (!this.apiUrl) {
      return 0n
    }

    try {
      const response = await fetch(`${this.apiUrl}/wallet/${this.apiPath}/lastblock`, {
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
    const config = this.getConfig()
    const { decimals, symbol } = config

    if (!this.apiUrl) {
      // Return default fees - BioForest minimum is around 500 (0.000005 BFM)
      const defaultFee = Amount.fromRaw('1000', decimals, symbol) // 0.00001 BFM
      return {
        slow: defaultFee,
        standard: defaultFee.mul(2),
        fast: defaultFee.mul(5),
        lastUpdated: Date.now(),
      }
    }

    try {
      const response = await fetch(`${this.apiUrl}/wallet/${this.apiPath}/blockAveFee`, {
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
        // Return default fees on API error - BioForest minimum is around 500
        const defaultFee = Amount.fromRaw('1000', decimals, symbol)
        return {
          slow: defaultFee,
          standard: defaultFee.mul(2),
          fast: defaultFee.mul(5),
          lastUpdated: Date.now(),
        }
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
      // Return default on error - BioForest minimum is around 500
      const defaultFee = Amount.fromRaw('1000', decimals, symbol)
      return {
        slow: defaultFee,
        standard: defaultFee.mul(2),
        fast: defaultFee.mul(5),
        lastUpdated: Date.now(),
      }
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    this.getConfig() // Ensure config is loaded
    if (!this.apiUrl) {
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
      const response = await fetch(`${this.apiUrl}/wallet/${this.apiPath}/lastblock`, {
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
