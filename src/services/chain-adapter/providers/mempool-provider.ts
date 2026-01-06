/**
 * Mempool.space API Provider
 * 
 * 提供 Bitcoin 链的余额、交易历史和区块高度查询能力。
 */

import { z } from 'zod'
import type { ApiProvider, Balance, Transaction, Direction } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { fetchJson, observeValueAndInvalidate } from './fetch-json'

interface MempoolAddressInfo {
  address: string
  chain_stats: {
    funded_txo_sum: number
    spent_txo_sum: number
  }
  mempool_stats: {
    funded_txo_sum: number
    spent_txo_sum: number
  }
}

interface MempoolTx {
  txid: string
  status: {
    confirmed: boolean
    block_height?: number
    block_time?: number
  }
  vin: Array<{
    prevout?: {
      scriptpubkey_address?: string
      value: number
    }
  }>
  vout: Array<{
    scriptpubkey_address?: string
    value: number
  }>
}

const MempoolAddressInfoSchema = z.looseObject({
  address: z.string().optional(),
  chain_stats: z.looseObject({
    funded_txo_sum: z.number(),
    spent_txo_sum: z.number(),
  }),
  mempool_stats: z.looseObject({
    funded_txo_sum: z.number(),
    spent_txo_sum: z.number(),
  }),
})

const MempoolTxSchema = z.looseObject({
  txid: z.string(),
  status: z.looseObject({
    confirmed: z.boolean(),
    block_height: z.number().optional(),
    block_time: z.number().optional(),
  }),
  vin: z.array(
    z.looseObject({
      prevout: z
        .looseObject({
          scriptpubkey_address: z.string().optional(),
          value: z.number(),
        })
        .optional(),
    })
  ),
  vout: z.array(
    z.looseObject({
      scriptpubkey_address: z.string().optional(),
      value: z.number(),
    })
  ),
})

export class MempoolProvider implements ApiProvider {
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

  private async api<T>(path: string, schema: z.ZodType<T>): Promise<T> {
    const url = `${this.endpoint}${path}`
    const json: unknown = await fetchJson(url, undefined, {
      cacheKey: `mempool:${url}`,
      ttlMs: 30_000,
    })
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      throw new Error('Invalid API response')
    }
    return parsed.data
  }

  async getNativeBalance(address: string): Promise<Balance> {
    const url = `${this.endpoint}/address/${address}`
    const info = await fetchJson(url, undefined, {
      cacheKey: `mempool:balance:${address}`,
      ttlMs: 60_000,
      tags: [`balance:${this.chainId}:${address}`],
    }).then((json) => {
      const parsed = MempoolAddressInfoSchema.safeParse(json)
      if (!parsed.success) throw new Error('Invalid API response')
      return parsed.data
    })

    const confirmed = info.chain_stats.funded_txo_sum - info.chain_stats.spent_txo_sum
    const unconfirmed = info.mempool_stats.funded_txo_sum - info.mempool_stats.spent_txo_sum
    const total = confirmed + unconfirmed

    observeValueAndInvalidate({
      key: `balance:${this.chainId}:${address}`,
      value: total.toString(),
      invalidateTags: [`txhistory:${this.chainId}:${address}`],
    })

    return {
      amount: Amount.fromRaw(total.toString(), this.decimals, this.symbol),
      symbol: this.symbol,
    }
  }

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    const url = `${this.endpoint}/address/${address}/txs`
    const txs = await fetchJson(url, undefined, {
      cacheKey: `mempool:txs:${address}`,
      ttlMs: 5 * 60_000,
      tags: [`txhistory:${this.chainId}:${address}`],
    }).then((json) => {
      const parsed = z.array(MempoolTxSchema).safeParse(json)
      if (!parsed.success) throw new Error('Invalid API response')
      return parsed.data
    })

    return txs.slice(0, limit).map((tx): Transaction => {
        // 判断是发送还是接收
        const isOutgoing = tx.vin.some(vin => 
          vin.prevout?.scriptpubkey_address === address
        )
        
        // 计算金额
        let value = 0n
        if (isOutgoing) {
          // 发送：计算发送给其他地址的金额
          for (const vout of tx.vout) {
            if (vout.scriptpubkey_address && vout.scriptpubkey_address !== address) {
              value += BigInt(vout.value)
            }
          }
        } else {
          // 接收：计算收到的金额
          for (const vout of tx.vout) {
            if (vout.scriptpubkey_address === address) {
              value += BigInt(vout.value)
            }
          }
        }

        // 获取对方地址
        const counterparty = isOutgoing
          ? tx.vout.find(v => v.scriptpubkey_address !== address)?.scriptpubkey_address ?? ''
          : tx.vin[0]?.prevout?.scriptpubkey_address ?? ''

        const from = isOutgoing ? address : counterparty
        const to = isOutgoing ? counterparty : address
        const direction: Direction = isOutgoing ? 'out' : 'in'

        return {
          hash: tx.txid,
          from,
          to,
          timestamp: (tx.status.block_time ?? Math.floor(Date.now() / 1000)) * 1000,
          status: tx.status.confirmed ? 'confirmed' : 'pending',
          blockNumber: tx.status.block_height ? BigInt(tx.status.block_height) : undefined,
          action: 'transfer' as const,
          direction,
          assets: [{
            assetType: 'native' as const,
            value: value.toString(),
            symbol: this.symbol,
            decimals: this.decimals,
          }],
        }
      })
  }

  async getBlockHeight(): Promise<bigint> {
    const height = await this.api('/blocks/tip/height', z.number())
    return BigInt(height)
  }
}

/** 工厂函数 */
export function createMempoolProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type.startsWith('mempool-')) {
    return new MempoolProvider(entry, chainId)
  }
  return null
}
