/**
 * BioWallet API Provider
 * 
 * 提供 BioForest 链的余额和交易历史查询能力。
 */

import type { ApiProvider, Balance, Transaction } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'

interface BiowalletAssetResponse {
  success: boolean
  result?: {
    address: string
    assets: Record<string, Record<string, { assetNumber: string; assetType: string }>>
  }
}

interface BiowalletTxResponse {
  success: boolean
  result?: {
    transactions: Array<{
      signature: string
      senderAddress: string
      receiverAddress: string
      amount: string
      assetType: string
      timestamp: number
      applyBlockHeight: number
    }>
  }
}

interface BiowalletBlockResponse {
  success: boolean
  result?: { height: number }
}

export class BiowalletProvider implements ApiProvider {
  readonly type: string
  readonly endpoint: string
  readonly config?: Record<string, unknown>
  
  private readonly chainId: string
  private readonly path: string
  private readonly symbol: string
  private readonly decimals: number

  constructor(entry: ParsedApiEntry, chainId: string) {
    this.type = entry.type
    this.endpoint = entry.endpoint
    this.config = entry.config
    this.chainId = chainId
    this.path = (entry.config?.path as string) ?? chainId
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)
  }

  private get baseUrl(): string {
    return `${this.endpoint}/wallet/${this.path}`
  }

  async getNativeBalance(address: string): Promise<Balance> {
    try {
      const response = await fetch(`${this.baseUrl}/address/asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const json = await response.json() as BiowalletAssetResponse
      
      if (!json.success || !json.result) {
        return { amount: Amount.zero(this.decimals, this.symbol), symbol: this.symbol }
      }

      // 查找原生代币余额
      for (const magic of Object.values(json.result.assets)) {
        for (const asset of Object.values(magic)) {
          if (asset.assetType === this.symbol) {
            return {
              amount: Amount.fromRaw(asset.assetNumber, this.decimals, this.symbol),
              symbol: this.symbol,
            }
          }
        }
      }

      return { amount: Amount.zero(this.decimals, this.symbol), symbol: this.symbol }
    } catch (error) {
      console.warn('[BiowalletProvider] Error fetching balance:', error)
      return { amount: Amount.zero(this.decimals, this.symbol), symbol: this.symbol }
    }
  }

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    try {
      // 先获取最新区块高度
      const blockResponse = await fetch(`${this.baseUrl}/lastblock`)
      if (!blockResponse.ok) return []
      
      const blockJson = await blockResponse.json() as BiowalletBlockResponse
      if (!blockJson.success || !blockJson.result) return []
      
      const maxHeight = blockJson.result.height

      // 查询交易
      const response = await fetch(`${this.baseUrl}/transactions/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxHeight,
          address,
          limit,
        }),
      })

      if (!response.ok) return []

      const json = await response.json() as BiowalletTxResponse
      
      if (!json.success || !json.result?.transactions) return []

      return json.result.transactions.map((tx): Transaction => ({
        hash: tx.signature,
        from: tx.senderAddress,
        to: tx.receiverAddress,
        value: tx.amount,
        symbol: tx.assetType,
        timestamp: tx.timestamp,
        status: 'confirmed',
        blockNumber: BigInt(tx.applyBlockHeight),
      }))
    } catch (error) {
      console.warn('[BiowalletProvider] Error fetching transactions:', error)
      return []
    }
  }

  async getBlockHeight(): Promise<bigint> {
    try {
      const response = await fetch(`${this.baseUrl}/lastblock`)
      if (!response.ok) return 0n
      
      const json = await response.json() as BiowalletBlockResponse
      if (!json.success || !json.result) return 0n
      
      return BigInt(json.result.height)
    } catch {
      return 0n
    }
  }
}

/** 工厂函数 */
export function createBiowalletProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type.startsWith('biowallet-')) {
    return new BiowalletProvider(entry, chainId)
  }
  return null
}
