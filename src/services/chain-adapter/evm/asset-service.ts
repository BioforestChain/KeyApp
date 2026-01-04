/**
 * EVM Asset Service
 *
 * Provides balance queries for EVM chains via public JSON-RPC endpoints.
 */

import type { ChainConfig } from '@/services/chain-config'
import type { IAssetService, Address, Balance, TokenMetadata } from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'

/** Default public RPC endpoints for EVM chains */
const DEFAULT_RPC_URLS: Record<string, string> = {
  ethereum: 'https://ethereum-rpc.publicnode.com',
  binance: 'https://bsc-rpc.publicnode.com',
}

interface JsonRpcResponse<T> {
  jsonrpc: string
  id: number
  result?: T
  error?: { code: number; message: string }
}

export class EvmAssetService implements IAssetService {
  private readonly config: ChainConfig
  private readonly rpcUrl: string

  constructor(config: ChainConfig) {
    this.config = config
    this.rpcUrl = DEFAULT_RPC_URLS[config.id] ?? config.api?.url ?? DEFAULT_RPC_URLS['ethereum']!
  }

  private async rpc<T>(method: string, params: unknown[]): Promise<T> {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: 1,
      }),
    })

    if (!response.ok) {
      throw new ChainServiceError(
        ChainErrorCodes.NETWORK_ERROR,
        `HTTP ${response.status}: ${response.statusText}`,
      )
    }

    const json = (await response.json()) as JsonRpcResponse<T>
    if (json.error) {
      throw new ChainServiceError(ChainErrorCodes.NETWORK_ERROR, json.error.message)
    }

    return json.result as T
  }

  async getNativeBalance(address: Address): Promise<Balance> {
    try {
      const hexBalance = await this.rpc<string>('eth_getBalance', [address, 'latest'])
      const balance = BigInt(hexBalance).toString()
      return {
        amount: Amount.fromRaw(balance, this.config.decimals, this.config.symbol),
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
    try {
      // ERC20 balanceOf(address) selector: 0x70a08231
      const data = `0x70a08231000000000000000000000000${address.slice(2).toLowerCase()}`
      const hexBalance = await this.rpc<string>('eth_call', [{ to: tokenAddress, data }, 'latest'])
      const balance = BigInt(hexBalance).toString()
      return {
        amount: Amount.fromRaw(balance, 18, 'TOKEN'),
        symbol: 'TOKEN',
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
    // ERC20 metadata queries would require multiple eth_call requests
    // Return minimal info for now
    return {
      address: tokenAddress,
      name: 'Unknown Token',
      symbol: 'UNKNOWN',
      decimals: 18,
    }
  }
}
