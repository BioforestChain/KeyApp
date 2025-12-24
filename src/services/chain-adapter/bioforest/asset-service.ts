/**
 * BioForest Asset Service
 *
 * Migrated from mpay: libs/wallet-base/services/wallet/chain-base/bioforest-chain.base.ts
 */

import type { ChainConfig } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import type { IAssetService, Address, Balance, TokenMetadata } from '../types'
import { ChainServiceError, ChainErrorCodes } from '../types'

/**
 * mpay API response format for getAddressAssets
 * POST /wallet/{chainId}/address/asset
 */
interface BioforestAddressAssetsResponse {
  success: boolean
  result?: {
    address: string
    assets: {
      [magic: string]: {
        [assetType: string]: {
          assetNumber: string
          assetType: string
          sourceChainMagic: string
          sourceChainName: string
          iconUrl?: string
        }
      }
    }
  }
}

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

  async getNativeBalance(address: Address): Promise<Balance> {
    const balances = await this.getTokenBalances(address)
    const native = balances.find((b) => b.symbol === this.config.symbol)

    if (native) return native

    return {
      amount: Amount.zero(this.config.decimals, this.config.symbol),
      symbol: this.config.symbol,
    }
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
      // No RPC URL configured, return empty balance
      return [
        {
          amount: Amount.zero(this.config.decimals, this.config.symbol),
          symbol: this.config.symbol,
        },
      ]
    }

    try {
      // mpay API: POST /wallet/{chainApiPath}/address/asset
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

      const json = (await response.json()) as BioforestAddressAssetsResponse

      if (!json.success || !json.result) {
        // API returned success=false or no result, return empty
        return [
          {
            amount: Amount.zero(this.config.decimals, this.config.symbol),
            symbol: this.config.symbol,
          },
        ]
      }

      // Parse mpay response format: assets[magic][assetType].assetNumber
      const balances: Balance[] = []
      const { assets } = json.result

      for (const magic of Object.keys(assets)) {
        const magicAssets = assets[magic]
        if (!magicAssets) continue

        for (const assetType of Object.keys(magicAssets)) {
          const asset = magicAssets[assetType]
          if (!asset) continue

          // BioForest chains use fixed 8 decimals
          const decimals = this.config.decimals
          const amount = Amount.fromRaw(asset.assetNumber, decimals, asset.assetType)

          balances.push({
            amount,
            symbol: asset.assetType,
          })
        }
      }

      // If no balances found, return zero balance for native token
      if (balances.length === 0) {
        return [
          {
            amount: Amount.zero(this.config.decimals, this.config.symbol),
            symbol: this.config.symbol,
          },
        ]
      }

      return balances
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
