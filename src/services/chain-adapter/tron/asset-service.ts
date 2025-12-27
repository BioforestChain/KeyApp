/**
 * Tron Asset Service
 */

import type { ChainConfig } from '@/services/chain-config'
import type { IAssetService, Balance, TokenMetadata, Address } from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'
import type { TronAccount } from './types'

/** Default Tron RPC endpoints */
const DEFAULT_RPC_URLS: Record<string, string> = {
  'tron': 'https://tron-rpc.publicnode.com',
  'tron-nile': 'https://nile.trongrid.io',
  'tron-shasta': 'https://api.shasta.trongrid.io',
}

export class TronAssetService implements IAssetService {
  private readonly config: ChainConfig
  private readonly rpcUrl: string

  constructor(config: ChainConfig) {
    this.config = config
    this.rpcUrl = DEFAULT_RPC_URLS[config.id] ?? config.api?.url ?? DEFAULT_RPC_URLS['tron']!
  }

  private async api<T>(endpoint: string, body?: unknown): Promise<T> {
    const url = `${this.rpcUrl}${endpoint}`
    const init: RequestInit = body
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : { method: 'GET' }

    const response = await fetch(url, init)
    if (!response.ok) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        `Tron API error: ${response.status}`,
      )
    }

    return response.json() as Promise<T>
  }

  async getNativeBalance(address: Address): Promise<Balance> {
    try {
      const account = await this.api<TronAccount | Record<string, never>>('/wallet/getaccount', {
        address,
        visible: true,
      })

      // Empty object means account doesn't exist yet (0 balance)
      if (!account || !('balance' in account)) {
        return {
          amount: Amount.fromRaw('0', this.config.decimals, this.config.symbol),
          symbol: this.config.symbol,
        }
      }

      return {
        amount: Amount.fromRaw(account.balance.toString(), this.config.decimals, this.config.symbol),
        symbol: this.config.symbol,
      }
    } catch {
      return {
        amount: Amount.fromRaw('0', this.config.decimals, this.config.symbol),
        symbol: this.config.symbol,
      }
    }
  }

  async getTokenBalance(_address: Address, _tokenAddress: Address): Promise<Balance> {
    // TRC20 token balance requires contract calls - not implemented
    return {
      amount: Amount.fromRaw('0', 18, 'TOKEN'),
      symbol: 'TOKEN',
    }
  }

  async getTokenBalances(_address: Address): Promise<Balance[]> {
    // Would require TronGrid API for full token list
    return []
  }

  async getTokenMetadata(_tokenAddress: Address): Promise<TokenMetadata> {
    // TRC20 token metadata requires contract calls
    return {
      address: _tokenAddress,
      name: 'Unknown',
      symbol: 'UNKNOWN',
      decimals: 18,
    }
  }
}
