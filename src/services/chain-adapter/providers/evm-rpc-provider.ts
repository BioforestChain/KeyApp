/**
 * EVM RPC Provider
 * 
 * 提供 EVM 链的余额查询和区块高度查询能力。
 * 使用标准 Ethereum JSON-RPC API。
 */

import { z } from 'zod'
import type { ApiProvider, Balance } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { fetchJson } from './fetch-json'

const JsonRpcResponseSchema = z.looseObject({
  result: z.unknown().optional(),
  error: z
    .looseObject({
      message: z.string(),
    })
    .optional(),
})

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

  private async rpc<T>(method: string, resultSchema: z.ZodType<T>, params: unknown[] = []): Promise<T> {
    const body = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    })

    const cacheable = method === 'eth_getBalance' || method === 'eth_blockNumber'
    const json: unknown = await fetchJson(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }, {
      cacheKey: `evm-rpc:${this.endpoint}:${method}:${JSON.stringify(params)}`,
      ttlMs: cacheable ? 10_000 : 0,
    })

    const parsed = JsonRpcResponseSchema.safeParse(json)
    if (!parsed.success) {
      throw new Error('Invalid JSON-RPC response')
    }

    if (parsed.data.error) {
      throw new Error(parsed.data.error.message)
    }

    const resultParsed = resultSchema.safeParse(parsed.data.result)
    if (!resultParsed.success) {
      throw new Error('Invalid JSON-RPC result')
    }

    return resultParsed.data
  }

  async getNativeBalance(address: string): Promise<Balance> {
    const balanceHex = await this.rpc('eth_getBalance', z.string(), [address, 'latest'])
    const balanceWei = BigInt(balanceHex)

    return {
      amount: Amount.fromRaw(balanceWei.toString(), this.decimals, this.symbol),
      symbol: this.symbol,
    }
  }

  async getBlockHeight(): Promise<bigint> {
    const blockHex = await this.rpc('eth_blockNumber', z.string())
    return BigInt(blockHex)
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
