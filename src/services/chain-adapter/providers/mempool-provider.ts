/**
 * Mempool.space API Provider
 * 
 * 提供 Bitcoin 链的余额、交易历史和区块高度查询能力。
 */

import type { ApiProvider, Balance, Transaction } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'

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

  private async api<T>(path: string): Promise<T> {
    const response = await fetch(`${this.endpoint}${path}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return response.json() as Promise<T>
  }

  async getNativeBalance(address: string): Promise<Balance> {
    try {
      const info = await this.api<MempoolAddressInfo>(`/address/${address}`)
      
      // 计算余额：已收到 - 已花费
      const confirmed = info.chain_stats.funded_txo_sum - info.chain_stats.spent_txo_sum
      const unconfirmed = info.mempool_stats.funded_txo_sum - info.mempool_stats.spent_txo_sum
      const total = confirmed + unconfirmed
      
      return {
        amount: Amount.fromRaw(total.toString(), this.decimals, this.symbol),
        symbol: this.symbol,
      }
    } catch (error) {
      console.warn('[MempoolProvider] Error fetching balance:', error)
      return {
        amount: Amount.zero(this.decimals, this.symbol),
        symbol: this.symbol,
      }
    }
  }

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    try {
      const txs = await this.api<MempoolTx[]>(`/address/${address}/txs`)
      
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

        return {
          hash: tx.txid,
          from: isOutgoing ? address : counterparty,
          to: isOutgoing ? counterparty : address,
          value: value.toString(),
          symbol: this.symbol,
          timestamp: (tx.status.block_time ?? Math.floor(Date.now() / 1000)) * 1000,
          status: tx.status.confirmed ? 'confirmed' : 'pending',
          blockNumber: tx.status.block_height ? BigInt(tx.status.block_height) : undefined,
        }
      })
    } catch (error) {
      console.warn('[MempoolProvider] Error fetching transactions:', error)
      return []
    }
  }

  async getBlockHeight(): Promise<bigint> {
    try {
      const height = await this.api<number>('/blocks/tip/height')
      return BigInt(height)
    } catch {
      return 0n
    }
  }
}

/** 工厂函数 */
export function createMempoolProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type.startsWith('mempool-')) {
    return new MempoolProvider(entry, chainId)
  }
  return null
}
