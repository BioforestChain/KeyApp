/**
 * BioForest Asset Service
 *
 * Migrated from mpay: libs/wallet-base/services/wallet/chain-base/bioforest-chain.base.ts
 */

import type { ChainConfig } from '@/services/chain-config'
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

/**
 * Chain ID to API path mapping (from mpay)
 * Most chains use their full ID as path, only BFMeta uses 'bfm'
 */
const CHAIN_API_PATHS: Record<string, string> = {
  bfmeta: 'bfm',
  // All other chains use their chain ID as-is
}

export class BioforestAssetService implements IAssetService {
  private readonly config: ChainConfig
  private readonly baseUrl: string
  private readonly apiPath: string

  constructor(config: ChainConfig) {
    this.config = config
    this.baseUrl = config.rpcUrl ?? ''
    this.apiPath = CHAIN_API_PATHS[config.id] ?? config.id
  }

  async getNativeBalance(address: Address): Promise<Balance> {
    const balances = await this.getTokenBalances(address)
    const native = balances.find((b) => b.symbol === this.config.symbol)

    if (native) return native

    return {
      raw: 0n,
      formatted: '0',
      symbol: this.config.symbol,
      decimals: this.config.decimals,
    }
  }

  async getTokenBalance(address: Address, tokenAddress: Address): Promise<Balance> {
    // In BioForest, tokenAddress is actually assetType
    const assetType = tokenAddress
    const balances = await this.getTokenBalances(address)
    const token = balances.find((b) => b.symbol === assetType)

    if (token) return token

    return {
      raw: 0n,
      formatted: '0',
      symbol: assetType,
      decimals: this.config.decimals,
    }
  }

  async getTokenBalances(address: Address): Promise<Balance[]> {
    if (!this.baseUrl) {
      // No RPC URL configured, return empty balance
      return [
        {
          raw: 0n,
          formatted: '0',
          symbol: this.config.symbol,
          decimals: this.config.decimals,
        },
      ]
    }

    try {
      // mpay API: POST /wallet/{chainApiPath}/address/asset
      const response = await fetch(`${this.baseUrl}/wallet/${this.apiPath}/address/asset`, {
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
            raw: 0n,
            formatted: '0',
            symbol: this.config.symbol,
            decimals: this.config.decimals,
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

          const raw = BigInt(asset.assetNumber)
          // BioForest chains use fixed 8 decimals
          const decimals = this.config.decimals

          balances.push({
            raw,
            formatted: this.formatAmount(raw, decimals),
            symbol: asset.assetType,
            decimals,
          })
        }
      }

      // If no balances found, return zero balance for native token
      if (balances.length === 0) {
        return [
          {
            raw: 0n,
            formatted: '0',
            symbol: this.config.symbol,
            decimals: this.config.decimals,
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

  private formatAmount(raw: bigint, decimals: number): string {
    const divisor = BigInt(10 ** decimals)
    const integerPart = raw / divisor
    const fractionalPart = raw % divisor

    // 始终显示完整的小数位（如 0.00000000）
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
    return `${integerPart}.${fractionalStr}`
  }
}
