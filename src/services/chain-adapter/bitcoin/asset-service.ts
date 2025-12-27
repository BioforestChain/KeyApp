/**
 * Bitcoin Asset Service
 * 
 * Uses mempool.space API for address balance and UTXO queries
 */

import type { ChainConfig } from '@/services/chain-config'
import type { IAssetService, Balance, TokenMetadata, Address } from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'
import type { BitcoinAddressInfo, BitcoinUtxo } from './types'

/** mempool.space API endpoints */
const API_URLS: Record<string, string> = {
  'bitcoin': 'https://mempool.space/api',
  'bitcoin-testnet': 'https://mempool.space/testnet/api',
  'bitcoin-signet': 'https://mempool.space/signet/api',
}

export class BitcoinAssetService implements IAssetService {
  private readonly config: ChainConfig
  private readonly apiUrl: string

  constructor(config: ChainConfig) {
    this.config = config
    this.apiUrl = API_URLS[config.id] ?? API_URLS['bitcoin']!
  }

  private async api<T>(endpoint: string): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        `Bitcoin API error: ${response.status}`,
      )
    }

    return response.json() as Promise<T>
  }

  async getNativeBalance(address: Address): Promise<Balance> {
    try {
      const info = await this.api<BitcoinAddressInfo>(`/address/${address}`)
      
      // Balance = funded - spent (confirmed + mempool)
      const confirmedBalance = info.chain_stats.funded_txo_sum - info.chain_stats.spent_txo_sum
      const mempoolBalance = info.mempool_stats.funded_txo_sum - info.mempool_stats.spent_txo_sum
      const totalBalance = confirmedBalance + mempoolBalance

      return {
        amount: Amount.fromRaw(totalBalance.toString(), this.config.decimals, this.config.symbol),
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
    // Bitcoin doesn't have native tokens (BRC-20 would require indexer)
    return {
      amount: Amount.fromRaw('0', 8, 'TOKEN'),
      symbol: 'TOKEN',
    }
  }

  async getTokenBalances(_address: Address): Promise<Balance[]> {
    return []
  }

  async getTokenMetadata(_tokenAddress: Address): Promise<TokenMetadata> {
    return {
      address: _tokenAddress,
      name: 'Unknown',
      symbol: 'UNKNOWN',
      decimals: 8,
    }
  }

  /** Get UTXOs for an address (used for transaction building) */
  async getUtxos(address: Address): Promise<BitcoinUtxo[]> {
    return this.api<BitcoinUtxo[]>(`/address/${address}/utxo`)
  }
}
