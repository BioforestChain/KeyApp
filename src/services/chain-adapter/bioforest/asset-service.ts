/**
 * BioForest Asset Service
 *
 * Migrated from mpay: libs/wallet-base/services/wallet/chain-base/bioforest-chain.base.ts
 */

import { chainConfigService, type ChainConfig } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import type { IAssetService, Address, Balance, TokenMetadata } from '../types'
import { ChainServiceError, ChainErrorCodes } from '../types'
import { AddressAssetsResponseSchema } from './schema'

export class BioforestAssetService implements IAssetService {
  private readonly chainId: string
  private config: ChainConfig | null = null

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
    }
    return this.config
  }

  private getEmptyNativeBalance(): Balance {
    const config = this.getConfig()
    return {
      amount: Amount.zero(config.decimals, config.symbol),
      symbol: config.symbol,
    }
  }

  async getNativeBalance(address: Address): Promise<Balance> {
    const balances = await this.getTokenBalances(address)
    const config = this.getConfig()
    const native = balances.find((b) => b.symbol === config.symbol)
    return native ?? this.getEmptyNativeBalance()
  }

  async getTokenBalance(address: Address, tokenAddress: Address): Promise<Balance> {
    // In BioForest, tokenAddress is actually assetType
    const assetType = tokenAddress
    const balances = await this.getTokenBalances(address)
    const token = balances.find((b) => b.symbol === assetType)

    if (token) return token

    const config = this.getConfig()
    return {
      amount: Amount.zero(config.decimals, assetType),
      symbol: assetType,
    }
  }

  async getTokenBalances(address: Address): Promise<Balance[]> {
    const config = this.getConfig()
    const baseUrl = chainConfigService.getBiowalletApi(config.id)

    if (!baseUrl) {
      return [this.getEmptyNativeBalance()]
    }

    try {
      // 直接使用 fetch 获取余额（后续可通过 React 层使用 keyFetch 订阅）
      const response = await fetch(`${baseUrl}/address/asset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const json = await response.json()
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

          const decimals = config.decimals
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
    const config = this.getConfig()
    return {
      address: null,
      name: tokenAddress,
      symbol: tokenAddress,
      decimals: config.decimals,
    }
  }
}
