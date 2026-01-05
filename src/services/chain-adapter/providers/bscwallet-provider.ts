/**
 * BSC Wallet API Provider
 * 
 * 使用 walletapi.bfmeta.info 提供的 BSC API
 * 支持余额查询和交易历史
 */

import { z } from 'zod'
import type { ApiProvider, Balance, Transaction } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'

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
  readonly baseUrl: string
  readonly decimals: number
  readonly symbol: string

  constructor(entry: ParsedApiEntry, chainDecimals: number, chainSymbol: string) {
    this.type = entry.key
    this.baseUrl = entry.url.replace(/\/$/, '')
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
    try {
      const response = await fetch(`${this.baseUrl}/balance?address=${address}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const json: unknown = await response.json()
      const parsed = BalanceResponseSchema.safeParse(json)

      if (!parsed.success || !parsed.data.success) {
        return { amount: Amount.zero(this.decimals, this.symbol), symbol: this.symbol }
      }

      return {
        amount: Amount.fromRaw(parsed.data.result, this.decimals, this.symbol),
        symbol: this.symbol,
      }
    } catch (error) {
      console.warn('[BscWalletProvider] Error fetching balance:', error)
      return { amount: Amount.zero(this.decimals, this.symbol), symbol: this.symbol }
    }
  }

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/trans/normal/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          page: 1,
          offset: limit,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const json: unknown = await response.json()
      const parsed = TxHistoryResponseSchema.safeParse(json)

      if (!parsed.success || !parsed.data.success || parsed.data.result.status !== '1') {
        return []
      }

      return parsed.data.result.result.map((tx): Transaction => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        symbol: this.symbol,
        timestamp: Number(tx.timeStamp) * 1000,
        status: tx.isError === '1' ? 'failed' : 'confirmed',
        blockNumber: BigInt(tx.blockNumber),
      }))
    } catch (error) {
      console.warn('[BscWalletProvider] Error fetching transactions:', error)
      return []
    }
  }
}

/**
 * 工厂函数：识别 bscwallet-v1 类型的 API entry
 */
export function createBscWalletProvider(entry: ParsedApiEntry, chainId: string): BscWalletProvider | null {
  if (entry.key !== 'bscwallet-v1') return null
  
  const decimals = chainConfigService.getDecimals(chainId)
  const symbol = chainConfigService.getSymbol(chainId)
  
  return new BscWalletProvider(entry, decimals, symbol)
}
