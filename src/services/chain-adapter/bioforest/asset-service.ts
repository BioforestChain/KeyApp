/**
 * BioForest Asset Service
 *
 * Migrated from mpay: libs/wallet-base/services/wallet/chain-base/bioforest-chain.base.ts
 */

import type { ChainConfig } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import type { IAssetService, Address, Balance, TokenMetadata } from '../types'
import { ChainServiceError, ChainErrorCodes } from '../types'
import { AddressAssetsResponseSchema } from './schema'

export class BioforestAssetService implements IAssetService {
  private readonly config: ChainConfig
  private readonly apiUrl: string
  private readonly apiPath: string

  constructor(config: ChainConfig) {
    this.config = config
    // 使用提供商配置（外部依赖）
    this.apiUrl = config.api?.url ?? ''
    this.apiPath = config.api?.path ?? config.id
  }

  private getEmptyNativeBalance(): Balance {
    return {
      amount: Amount.zero(this.config.decimals, this.config.symbol),
      symbol: this.config.symbol,
    }
  }

  async getNativeBalance(address: Address): Promise<Balance> {
    const balances = await this.getTokenBalances(address)
    const native = balances.find((b) => b.symbol === this.config.symbol)
    return native ?? this.getEmptyNativeBalance()
  }

  async getTokenBalance(address: Address, tokenAddress: Address): Promise<Balance> {
    // In BioForest, tokenAddress is actually assetType
    const assetType = tokenAddress
    const balances = await this.getTokenBalances(address)
    const token = balances.find((b) => b.symbol === assetType)

    if (token) return token

    return {
      amount: Amount.zero(this.config.decimals, assetType),
      symbol: assetType,
    }
  }

  async getTokenBalances(address: Address): Promise<Balance[]> {
    if (!this.apiUrl) {
      return [this.getEmptyNativeBalance()]
    }

    try {
      const response = await fetch(`${this.apiUrl}/wallet/${this.apiPath}/address/asset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        throw new ChainServiceError(
          ChainErrorCodes.NETWORK_ERROR,
          `Failed to fetch balances: ${response.status}`,
        )
      }

      const json: unknown = await response.json()
      const parsed = AddressAssetsResponseSchema.safeParse(json)

      if (!parsed.success) {
        console.warn('[BioforestAssetService] Invalid API response:', parsed.error.message)
        return [this.getEmptyNativeBalance()]
      }

      const { success, result } = parsed.data
      if (!success || !result) {
        return [this.getEmptyNativeBalance()]
      }

      // Parse response: assets[magic][assetType].assetNumber
      const balances: Balance[] = []
      const { assets } = result

      for (const magic of Object.keys(assets)) {
        const magicAssets = assets[magic]
        if (!magicAssets) continue

        for (const assetType of Object.keys(magicAssets)) {
          const asset = magicAssets[assetType]
          if (!asset) continue

          const decimals = this.config.decimals
          const amount = Amount.fromRaw(asset.assetNumber, decimals, asset.assetType)

          balances.push({
            amount,
            symbol: asset.assetType,
          })
        }
      }

      return balances.length > 0 ? balances : [this.getEmptyNativeBalance()]
    } catch (error) {
      if (error instanceof ChainServiceError) throw error
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        'Failed to fetch balances',
        undefined,
        error instanceof Error ? error : undefined,
      )
    }
  }

  async getTokenMetadata(tokenAddress: Address): Promise<TokenMetadata> {
    // In BioForest, tokenAddress is assetType
    return {
      address: null,
      name: tokenAddress,
      symbol: tokenAddress,
      decimals: this.config.decimals,
    }
  }
}
