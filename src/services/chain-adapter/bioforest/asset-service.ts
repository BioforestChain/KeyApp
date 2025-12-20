/**
 * BioForest Asset Service
 */

import type { ChainConfig } from '@/services/chain-config'
import type { IAssetService, Address, Balance, TokenMetadata } from '../types'
import { ChainServiceError, ChainErrorCodes } from '../types'
import type { BioforestBalanceResponse } from './types'

export class BioforestAssetService implements IAssetService {
  private readonly config: ChainConfig
  private readonly baseUrl: string

  constructor(config: ChainConfig) {
    this.config = config
    this.baseUrl = config.rpcUrl ?? ''
  }

  async getNativeBalance(address: Address): Promise<Balance> {
    if (!this.baseUrl) {
      return this.mockBalance(address)
    }

    try {
      const response = await fetch(`${this.baseUrl}/wallet/${this.config.id}/address/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        throw new ChainServiceError(
          ChainErrorCodes.NETWORK_ERROR,
          `Failed to fetch balance: ${response.status}`,
        )
      }

      const data = (await response.json()) as BioforestBalanceResponse
      const nativeAsset = data.assets.find((a) => a.assetType === this.config.symbol)

      const raw = BigInt(nativeAsset?.amount ?? '0')
      const decimals = this.config.decimals

      return {
        raw,
        formatted: this.formatAmount(raw, decimals),
        symbol: this.config.symbol,
        decimals,
      }
    } catch (error) {
      if (error instanceof ChainServiceError) throw error
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        'Failed to fetch balance',
        undefined,
        error instanceof Error ? error : undefined,
      )
    }
  }

  async getTokenBalance(address: Address, tokenAddress: Address): Promise<Balance> {
    // In BioForest, tokenAddress is actually assetType
    const assetType = tokenAddress

    if (!this.baseUrl) {
      return {
        raw: 0n,
        formatted: '0',
        symbol: assetType,
        decimals: this.config.decimals,
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/wallet/${this.config.id}/address/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        throw new ChainServiceError(
          ChainErrorCodes.NETWORK_ERROR,
          `Failed to fetch token balance: ${response.status}`,
        )
      }

      const data = (await response.json()) as BioforestBalanceResponse
      const asset = data.assets.find((a) => a.assetType === assetType)

      const raw = BigInt(asset?.amount ?? '0')
      const decimals = asset?.decimals ?? this.config.decimals

      return {
        raw,
        formatted: this.formatAmount(raw, decimals),
        symbol: assetType,
        decimals,
      }
    } catch (error) {
      if (error instanceof ChainServiceError) throw error
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        'Failed to fetch token balance',
        undefined,
        error instanceof Error ? error : undefined,
      )
    }
  }

  async getTokenBalances(address: Address): Promise<Balance[]> {
    if (!this.baseUrl) {
      return [await this.getNativeBalance(address)]
    }

    try {
      const response = await fetch(`${this.baseUrl}/wallet/${this.config.id}/address/balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        throw new ChainServiceError(
          ChainErrorCodes.NETWORK_ERROR,
          `Failed to fetch balances: ${response.status}`,
        )
      }

      const data = (await response.json()) as BioforestBalanceResponse

      return data.assets.map((asset) => ({
        raw: BigInt(asset.amount),
        formatted: this.formatAmount(BigInt(asset.amount), asset.decimals),
        symbol: asset.assetType,
        decimals: asset.decimals,
      }))
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

    if (fractionalPart === 0n) {
      return integerPart.toString()
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, '0').replace(/0+$/, '')
    return `${integerPart}.${fractionalStr}`
  }

  private mockBalance(_address: Address): Balance {
    return {
      raw: 0n,
      formatted: '0',
      symbol: this.config.symbol,
      decimals: this.config.decimals,
    }
  }
}
