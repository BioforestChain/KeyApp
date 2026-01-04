/**
 * EVM RPC Provider
 * 
 * 提供 EVM 链的余额查询和区块高度查询能力。
 * 使用标准 Ethereum JSON-RPC API。
 */

import type { ApiProvider, Balance } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'

export class EvmRpcProvider implements ApiProvider {
  readonly type: string
  readonly endpoint: string
  readonly config?: Record<string, unknown>
  
  private readonly chainId: string
  private readonly symbol: string
  private readonly decimals: number

  constructor(entry: ParsedApiEntry, chainId: string) {
    this.type = entry.type
    this.endpoint = entry.endpoint
    this.config = entry.config
    this.chainId = chainId
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)
  }

  private async rpc<T>(method: string, params: unknown[] = []): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const json = await response.json() as { result?: T; error?: { message: string } }
    if (json.error) {
      throw new Error(json.error.message)
    }

    return json.result as T
  }

  async getNativeBalance(address: string): Promise<Balance> {
    try {
      const balanceHex = await this.rpc<string>('eth_getBalance', [address, 'latest'])
      const balanceWei = BigInt(balanceHex)
      
      return {
        amount: Amount.fromRaw(balanceWei.toString(), this.decimals, this.symbol),
        symbol: this.symbol,
      }
    } catch (error) {
      console.warn('[EvmRpcProvider] Error fetching balance:', error)
      return {
        amount: Amount.zero(this.decimals, this.symbol),
        symbol: this.symbol,
      }
    }
  }

  async getBlockHeight(): Promise<bigint> {
    try {
      const blockHex = await this.rpc<string>('eth_blockNumber')
      return BigInt(blockHex)
    } catch {
      return 0n
    }
  }
}

/** 工厂函数 */
export function createEvmRpcProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  // 匹配 *-rpc 类型且是 EVM 链 (ethereum, bsc 等)
  if (entry.type.endsWith('-rpc') && (entry.type.includes('ethereum') || entry.type.includes('bsc'))) {
    return new EvmRpcProvider(entry, chainId)
  }
  return null
}
