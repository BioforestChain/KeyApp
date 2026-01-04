/**
 * EVM Asset Service
 *
 * Provides balance queries for EVM chains via public JSON-RPC endpoints.
 */

import { chainConfigService } from '@/services/chain-config/service'
import type { IAssetService, Address, Balance, TokenMetadata } from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'

interface JsonRpcResponse<T> {
  jsonrpc: string
  id: number
  result?: T
  error?: { code: number; message: string }
}

export class EvmAssetService implements IAssetService {
  private readonly chainId: string

  constructor(chainId: string) {
    this.chainId = chainId
  }

  private get rpcUrl(): string {
    return chainConfigService.getRpcUrl(this.chainId)
  }

  private get decimals(): number {
    return chainConfigService.getDecimals(this.chainId)
  }

  private get symbol(): string {
    return chainConfigService.getSymbol(this.chainId)
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
        amount: Amount.fromRaw(balance, this.decimals, this.symbol),
        symbol: this.symbol,
      }
    } catch {
      return {
        amount: Amount.fromRaw('0', this.decimals, this.symbol),
        symbol: this.symbol,
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
    return {
      address: tokenAddress,
      name: 'Unknown Token',
      symbol: 'UNKNOWN',
      decimals: 18,
    }
  }
}
