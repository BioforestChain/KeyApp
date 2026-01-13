/**
 * BioForest Chain Service
 */

import type { ChainConfig } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import type { IChainService, ChainInfo, GasPrice, HealthStatus } from '../types'
import { ChainServiceError, ChainErrorCodes } from '../types'
import type { BioforestBlockInfo } from './types'
import { getTransferMinFee } from '@/services/bioforest-sdk'
import { keyFetch } from '@biochain/key-fetch'

export class BioforestChainService implements IChainService {
  private readonly chainId: string
  private config: ChainConfig | null = null
  private baseUrl: string = ''

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
      this.baseUrl = chainConfigService.getBiowalletApi(config.id) ?? ''
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
    if (!this.baseUrl) {
      return 0n
    }

    try {
      // 使用 keyFetch 获取区块高度（利用缓存和响应式轮询）
      const json = await keyFetch<{ success: boolean; result: BioforestBlockInfo }>(
        `${this.baseUrl}/lastblock`
      )

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

    if (!this.baseUrl) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        'RPC URL not configured for BioForest chain',
      )
    }

    try {
      // Use SDK to calculate minimum fee dynamically
      // Note: This is a base fee without considering specific sender's pay password status
      // For more accurate fee, use transaction-service.estimateFee() with sender address
      const minFeeRaw = await getTransferMinFee(
        this.baseUrl,
        config.id,
        undefined, // No specific sender - base fee calculation
      )

      const minFee = Amount.fromRaw(minFeeRaw, decimals, symbol)

      return {
        slow: minFee,
        standard: minFee,
        fast: minFee.mul(2),
        lastUpdated: Date.now(),
      }
    } catch (error) {
      if (error instanceof ChainServiceError) throw error
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        'Failed to calculate minimum fee from SDK',
        undefined,
        error instanceof Error ? error : undefined,
      )
    }
  }

  async healthCheck(): Promise<HealthStatus> {
    this.getConfig() // Ensure config is loaded
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
      const response = await fetch(`${this.baseUrl}/lastblock`, {
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
