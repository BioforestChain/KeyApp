/**
 * BioWallet API Provider
 * 
 * 提供 BioForest 链的余额和交易历史查询能力。
 */

import { z } from 'zod'
import type { ApiProvider, Balance, Transaction, TokenBalance } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'

const BiowalletAssetItemSchema = z.looseObject({
  assetNumber: z.string(),
  assetType: z.string(),
})

const BiowalletAssetSchema = z.looseObject({
  success: z.boolean(),
  result: z.looseObject({
    address: z.string(),
    assets: z.record(z.string(), z.record(z.string(), BiowalletAssetItemSchema)),
  }).optional(),
})

const BiowalletTxItemSchema = z.looseObject({
  height: z.number(),
  signature: z.string(),
  transaction: z.looseObject({
    senderId: z.string(),
    recipientId: z.string(),
    timestamp: z.number(),
    asset: z.looseObject({
      transferAsset: z.looseObject({
        assetType: z.string(),
        amount: z.string(),
      }).optional(),
    }).optional(),
  }),
})

const BiowalletTxResponseSchema = z.looseObject({
  success: z.boolean(),
  result: z.looseObject({
    trs: z.array(BiowalletTxItemSchema),
    count: z.number(),
  }).optional(),
})

const BiowalletBlockSchema = z.looseObject({
  success: z.boolean(),
  result: z.looseObject({
    height: z.number(),
  }).optional(),
})

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

      const json: unknown = await response.json()
      const parsed = BiowalletAssetSchema.safeParse(json)
      
      if (!parsed.success || !parsed.data.success || !parsed.data.result) {
        return { amount: Amount.zero(this.decimals, this.symbol), symbol: this.symbol }
      }

      // 查找原生代币余额
      for (const magic of Object.values(parsed.data.result.assets)) {
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

  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      const response = await fetch(`${this.baseUrl}/address/asset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const json: unknown = await response.json()
      const parsed = BiowalletAssetSchema.safeParse(json)
      
      if (!parsed.success || !parsed.data.success || !parsed.data.result) {
        return []
      }

      const tokens: TokenBalance[] = []

      for (const magic of Object.values(parsed.data.result.assets)) {
        for (const asset of Object.values(magic)) {
          const isNative = asset.assetType === this.symbol
          tokens.push({
            symbol: asset.assetType,
            name: asset.assetType,
            amount: Amount.fromRaw(asset.assetNumber, this.decimals, asset.assetType),
            isNative,
          })
        }
      }

      // Sort: native first, then by amount descending
      tokens.sort((a, b) => {
        if (a.isNative && !b.isNative) return -1
        if (!a.isNative && b.isNative) return 1
        return b.amount.toNumber() - a.amount.toNumber()
      })

      return tokens
    } catch (error) {
      console.warn('[BiowalletProvider] Error fetching token balances:', error)
      return []
    }
  }

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    try {
      // 先获取最新区块高度
      const blockResponse = await fetch(`${this.baseUrl}/lastblock`)
      if (!blockResponse.ok) return []
      
      const blockJson: unknown = await blockResponse.json()
      const blockParsed = BiowalletBlockSchema.safeParse(blockJson)
      if (!blockParsed.success || !blockParsed.data.success || !blockParsed.data.result) return []
      
      const maxHeight = blockParsed.data.result.height

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

      const json: unknown = await response.json()
      const parsed = BiowalletTxResponseSchema.safeParse(json)
      
      if (!parsed.success || !parsed.data.success || !parsed.data.result?.trs) return []

      return parsed.data.result.trs
        .filter(item => item.transaction?.asset?.transferAsset)
        .map((item): Transaction => {
          const tx = item.transaction
          const transfer = tx.asset!.transferAsset!
          return {
            hash: item.signature,
            from: tx.senderId,
            to: tx.recipientId,
            value: transfer.amount,
            symbol: transfer.assetType,
            timestamp: tx.timestamp * 1000,
            status: 'confirmed',
            blockNumber: BigInt(item.height),
          }
        })
    } catch (error) {
      console.warn('[BiowalletProvider] Error fetching transactions:', error)
      return []
    }
  }

  async getBlockHeight(): Promise<bigint> {
    try {
      const response = await fetch(`${this.baseUrl}/lastblock`)
      if (!response.ok) return 0n
      
      const json: unknown = await response.json()
      const parsed = BiowalletBlockSchema.safeParse(json)
      if (!parsed.success || !parsed.data.success || !parsed.data.result) return 0n
      
      return BigInt(parsed.data.result.height)
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
