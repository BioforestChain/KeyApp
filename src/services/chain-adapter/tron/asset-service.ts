/**
 * Tron Asset Service
 */

import { chainConfigService } from '@/services/chain-config/service'
import type { IAssetService, Balance, TokenMetadata, Address } from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'
import type { TronAccount } from './types'

export class TronAssetService implements IAssetService {
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

  private async api<T>(endpoint: string, body?: unknown): Promise<T> {
    const url = `${this.rpcUrl}${endpoint}`
    const init: RequestInit = body
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : { method: 'GET' }

    const response = await fetch(url, init)
    if (!response.ok) {
      throw new ChainServiceError(ChainErrorCodes.NETWORK_ERROR, `Tron API error: ${response.status}`)
    }

    return response.json() as Promise<T>
  }

  async getNativeBalance(address: Address): Promise<Balance> {
    try {
      const account = await this.api<TronAccount | Record<string, never>>('/wallet/getaccount', {
        address,
        visible: true,
      })

      if (!account || !('balance' in account)) {
        return {
          amount: Amount.fromRaw('0', this.decimals, this.symbol),
          symbol: this.symbol,
        }
      }

      return {
        amount: Amount.fromRaw(account.balance.toString(), this.decimals, this.symbol),
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
      const result = await this.api<{ trc20: Array<Record<string, string>> } | undefined>(
        '/wallet/getaccount',
        { address, visible: true },
      )

      if (result?.trc20) {
        for (const token of result.trc20) {
          if (token[tokenAddress]) {
            return {
              amount: Amount.fromRaw(token[tokenAddress]!, 18, 'TOKEN'),
              symbol: 'TOKEN',
            }
          }
        }
      }

      return {
        amount: Amount.fromRaw('0', 18, 'TOKEN'),
        symbol: 'TOKEN',
      }
    } catch {
      return {
        amount: Amount.fromRaw('0', 18, 'TOKEN'),
        symbol: 'TOKEN',
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
      name: 'TRC20 Token',
      symbol: 'TOKEN',
      decimals: 18,
    }
  }
}
