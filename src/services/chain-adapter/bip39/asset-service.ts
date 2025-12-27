/**
 * BIP39 Asset Service (Bitcoin, Tron)
 */

import type { ChainConfig } from '@/services/chain-config'
import type { IAssetService, Address, Balance, TokenMetadata } from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'

export class Bip39AssetService implements IAssetService {
  private readonly config: ChainConfig
  private readonly apiUrl: string
  private readonly apiPath: string

  constructor(config: ChainConfig) {
    this.config = config
    this.apiUrl = config.api?.url ?? 'https://walletapi.bfmeta.info'
    this.apiPath = config.api?.path ?? config.id
  }

  private async fetch<T>(endpoint: string, body?: unknown): Promise<T> {
    const url = `${this.apiUrl}/wallet/${this.apiPath}${endpoint}`
    const init: RequestInit = body
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : { method: 'GET' }
    const response = await fetch(url, init)

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

  async getNativeBalance(address: Address): Promise<Balance> {
    try {
      const result = await this.fetch<{ balance: string }>('/address/balance', { address })
      return {
        amount: Amount.fromRaw(result.balance, this.config.decimals, this.config.symbol),
        symbol: this.config.symbol,
      }
    } catch {
      return {
        amount: Amount.fromRaw('0', this.config.decimals, this.config.symbol),
        symbol: this.config.symbol,
      }
    }
  }

  async getTokenBalance(address: Address, tokenAddress: Address): Promise<Balance> {
    // Bitcoin doesn't have tokens, Tron has TRC20
    if (this.config.id !== 'tron') {
      return {
        amount: Amount.fromRaw('0', 18, 'UNKNOWN'),
        symbol: 'UNKNOWN',
      }
    }

    try {
      const result = await this.fetch<{ balance: string; decimals: number; symbol: string }>(
        '/token/balance',
        { address, tokenAddress },
      )
      return {
        amount: Amount.fromRaw(result.balance, result.decimals, result.symbol),
        symbol: result.symbol,
      }
    } catch {
      return {
        amount: Amount.fromRaw('0', 18, 'UNKNOWN'),
        symbol: 'UNKNOWN',
      }
    }
  }

  async getTokenBalances(address: Address): Promise<Balance[]> {
    const nativeBalance = await this.getNativeBalance(address)
    return [nativeBalance]
  }

  async getTokenMetadata(tokenAddress: Address): Promise<TokenMetadata> {
    return {
      address: tokenAddress,
      name: 'Unknown Token',
      symbol: 'UNKNOWN',
      decimals: 18,
    }
  }
}
