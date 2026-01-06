/**
 * BSC Wallet API Provider
 * 
 * 使用 walletapi.bfmeta.info 提供的 BSC API
 * 支持余额查询和交易历史
 */

import { z } from 'zod'
import type { ApiProvider, Balance, Transaction, Direction } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { fetchJson, observeValueAndInvalidate } from './fetch-json'

const BalanceResponseSchema = z.looseObject({
  success: z.boolean(),
  result: z.string(),
})

const TxItemSchema = z.looseObject({
  hash: z.string(),
  from: z.string(),
  to: z.string(),
  value: z.string(),
  timeStamp: z.string(),
  blockNumber: z.string(),
  isError: z.string().optional(),
})

const TxHistoryResponseSchema = z.looseObject({
  success: z.boolean(),
  result: z.looseObject({
    status: z.string(),
    result: z.array(TxItemSchema),
  }),
})

export class BscWalletProvider implements ApiProvider {
  readonly type: string
  readonly endpoint: string
  readonly decimals: number
  readonly symbol: string
  private readonly chainId: string

  constructor(entry: ParsedApiEntry, chainId: string, chainDecimals: number, chainSymbol: string) {
    this.type = entry.type
    this.endpoint = entry.endpoint.replace(/\/$/, '')
    this.chainId = chainId
    this.decimals = chainDecimals
    this.symbol = chainSymbol
  }

  get supportsNativeBalance() {
    return true
  }

  get supportsTransactionHistory() {
    return true
  }

  async getNativeBalance(address: string): Promise<Balance> {
    const url = `${this.endpoint}/balance?address=${address}`
    const json: unknown = await fetchJson(url, undefined, {
      cacheKey: `bscwallet:balance:${address}`,
      ttlMs: 60_000,
      tags: [`balance:${this.chainId}:${address}`],
    })

    const parsed = BalanceResponseSchema.safeParse(json)
    if (!parsed.success || !parsed.data.success) {
      throw new Error('Upstream API error')
    }

    observeValueAndInvalidate({
      key: `balance:${this.chainId}:${address}`,
      value: parsed.data.result,
      invalidateTags: [`txhistory:${this.chainId}:${address}`],
    })

    return {
      amount: Amount.fromRaw(parsed.data.result, this.decimals, this.symbol),
      symbol: this.symbol,
    }
  }

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    const url = `${this.endpoint}/trans/normal/history`
    const json: unknown = await fetchJson(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          page: 1,
          offset: limit,
        }),
      },
      {
        cacheKey: `bscwallet:txs:${address}:${limit}`,
        ttlMs: 5 * 60_000,
        tags: [`txhistory:${this.chainId}:${address}`],
      },
    )

    const parsed = TxHistoryResponseSchema.safeParse(json)
    if (!parsed.success || !parsed.data.success) {
      throw new Error('Upstream API error')
    }
    if (parsed.data.result.status !== '1') {
      return []
    }

    const normalizedAddress = address.toLowerCase()

    return parsed.data.result.result.map((tx): Transaction => {
      const from = tx.from
      const to = tx.to
      const direction = this.getDirection(from, to, normalizedAddress)

      return {
        hash: tx.hash,
        from,
        to,
        timestamp: Number(tx.timeStamp) * 1000,
        status: tx.isError === '1' ? 'failed' : 'confirmed',
        blockNumber: BigInt(tx.blockNumber),
        action: 'transfer' as const,
        direction,
        assets: [{
          assetType: 'native' as const,
          value: tx.value,
          symbol: this.symbol,
          decimals: this.decimals,
        }],
      }
    })
  }

  private getDirection(from: string, to: string, address: string): Direction {
    const fromLower = from.toLowerCase()
    const toLower = to.toLowerCase()
    
    if (fromLower === address && toLower === address) {
      return 'self'
    }
    if (fromLower === address) {
      return 'out'
    }
    return 'in'
  }
}

/**
 * 工厂函数：识别 bscwallet-v1 类型的 API entry
 */
export function createBscWalletProvider(entry: ParsedApiEntry, chainId: string): BscWalletProvider | null {
  if (entry.type !== 'bscwallet-v1') return null
  
  const decimals = chainConfigService.getDecimals(chainId)
  const symbol = chainConfigService.getSymbol(chainId)
  
  return new BscWalletProvider(entry, chainId, decimals, symbol)
}
