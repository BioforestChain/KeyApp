/**
 * Tron RPC Provider
 * 
 * 提供 Tron 链的余额和区块高度查询能力。
 */

import { z } from 'zod'
import type { ApiProvider, Balance } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'

interface TronAccountResponse {
  balance?: number
  address?: string
}

interface TronBlockResponse {
  block_header?: {
    raw_data?: {
      number?: number
    }
  }
}

const TronAccountSchema = z.looseObject({
  balance: z.number().optional(),
  address: z.string().optional(),
})

const TronNowBlockSchema = z.looseObject({
  block_header: z
    .looseObject({
      raw_data: z
        .looseObject({
          number: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
})

export class TronRpcProvider implements ApiProvider {
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

  private async api<T>(path: string, schema: z.ZodType<T>, body?: unknown): Promise<T> {
    const url = `${this.endpoint}${path}`
    const init: RequestInit = body
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      : { method: 'GET' }

    const response = await fetch(url, init)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const json: unknown = await response.json()
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      throw new Error('Invalid API response')
    }
    return parsed.data
  }

  async getNativeBalance(address: string): Promise<Balance> {
    try {
      // Tron 地址需要转换为 hex 格式或使用 base58
      const account = await this.api('/wallet/getaccount', TronAccountSchema, {
        address,
        visible: true,
      })

      const balanceSun = account.balance ?? 0
      
      return {
        amount: Amount.fromRaw(balanceSun.toString(), this.decimals, this.symbol),
        symbol: this.symbol,
      }
    } catch (error) {
      console.warn('[TronRpcProvider] Error fetching balance:', error)
      return {
        amount: Amount.zero(this.decimals, this.symbol),
        symbol: this.symbol,
      }
    }
  }

  async getBlockHeight(): Promise<bigint> {
    try {
      const block = await this.api('/wallet/getnowblock', TronNowBlockSchema)
      const height = block.block_header?.raw_data?.number ?? 0
      return BigInt(height)
    } catch {
      return 0n
    }
  }
}

/** 工厂函数 */
export function createTronRpcProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'tron-rpc' || entry.type.startsWith('tron-')) {
    return new TronRpcProvider(entry, chainId)
  }
  return null
}
