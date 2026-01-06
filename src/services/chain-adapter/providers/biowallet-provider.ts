/**
 * BioWallet API Provider
 * 
 * 提供 BioForest 链的余额和交易历史查询能力。
 */

import { z } from 'zod'
import type { ApiProvider, Balance, Transaction, TokenBalance, Action, Direction } from './types'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { fetchJson, observeValueAndInvalidate } from './fetch-json'

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
    type: z.string(),
    senderId: z.string(),
    recipientId: z.string().optional().default(''),
    timestamp: z.number(),
    asset: z.looseObject({
      transferAsset: z.looseObject({
        assetType: z.string(),
        amount: z.string(),
      }).optional(),
      // 其他 BioForest 资产类型
      giftAsset: z.looseObject({
        totalAmount: z.string(),
        assetType: z.string(),
      }).optional(),
      grabAsset: z.looseObject({
        transactionSignature: z.string(),
      }).optional(),
      trustAsset: z.looseObject({
        trustees: z.array(z.string()),
        numberOfSignFor: z.number(),
        assetType: z.string(),
        amount: z.string(),
      }).optional(),
      // BIW / BioForest Meta 其他类型
      signature: z.looseObject({
        publicKey: z.string().optional(),
      }).optional(),
      destroyAsset: z.looseObject({
        assetType: z.string(),
        amount: z.string(),
      }).optional(),
      issueEntity: z.looseObject({
        entityId: z.string().optional(),
      }).optional(),
      issueEntityFactory: z.looseObject({
        factoryId: z.string().optional(),
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
    const url = `${this.baseUrl}/address/asset`
    const json: unknown = await fetchJson(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      },
      {
        cacheKey: `biowallet:${this.path}:assets:${address}`,
        ttlMs: 60_000,
        tags: [`balance:${this.chainId}:${address}`],
      },
    )

    const parsed = BiowalletAssetSchema.safeParse(json)
    if (!parsed.success || !parsed.data.success || !parsed.data.result) {
      throw new Error('Upstream API error')
    }

    // 查找原生代币余额
    for (const magic of Object.values(parsed.data.result.assets)) {
      for (const asset of Object.values(magic)) {
        if (asset.assetType === this.symbol) {
          observeValueAndInvalidate({
            key: `balance:${this.chainId}:${address}`,
            value: asset.assetNumber,
            invalidateTags: [`txhistory:${this.chainId}:${address}`],
          })

          return {
            amount: Amount.fromRaw(asset.assetNumber, this.decimals, this.symbol),
            symbol: this.symbol,
          }
        }
      }
    }

    observeValueAndInvalidate({
      key: `balance:${this.chainId}:${address}`,
      value: '0',
      invalidateTags: [`txhistory:${this.chainId}:${address}`],
    })

    return { amount: Amount.zero(this.decimals, this.symbol), symbol: this.symbol }
  }

  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    const url = `${this.baseUrl}/address/asset`
    const json: unknown = await fetchJson(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      },
      {
        cacheKey: `biowallet:${this.path}:assets:${address}`,
        ttlMs: 60_000,
        tags: [`balance:${this.chainId}:${address}`],
      },
    )

    const parsed = BiowalletAssetSchema.safeParse(json)
    if (!parsed.success || !parsed.data.success || !parsed.data.result) {
      throw new Error('Upstream API error')
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

    tokens.sort((a, b) => {
      if (a.isNative && !b.isNative) return -1
      if (!a.isNative && b.isNative) return 1
      return b.amount.toNumber() - a.amount.toNumber()
    })

    return tokens
  }

  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    const blockJson: unknown = await fetchJson(`${this.baseUrl}/lastblock`, undefined, {
      cacheKey: `biowallet:${this.path}:lastblock`,
      ttlMs: 10_000,
    })
    const blockParsed = BiowalletBlockSchema.safeParse(blockJson)
    if (!blockParsed.success || !blockParsed.data.success || !blockParsed.data.result) {
      throw new Error('Upstream API error')
    }

    const maxHeight = blockParsed.data.result.height

    const json: unknown = await fetchJson(
      `${this.baseUrl}/transactions/query`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxHeight,
          address,
          limit,
        }),
      },
      {
        cacheKey: `biowallet:${this.path}:txs:${address}:${limit}:${maxHeight}`,
        ttlMs: 5 * 60_000,
        tags: [`txhistory:${this.chainId}:${address}`],
      },
    )

    const parsed = BiowalletTxResponseSchema.safeParse(json)
    if (!parsed.success || !parsed.data.success || !parsed.data.result?.trs) {
      throw new Error('Upstream API error')
    }

    const normalizedAddress = address.toLowerCase()

    return parsed.data.result.trs
      .map((item): Transaction | null => {
        const tx = item.transaction
        const action = this.detectAction(tx.type)
        const direction = this.getDirection(tx.senderId, tx.recipientId, normalizedAddress)

        const { value, assetType } = this.extractAssetInfo(tx)
        if (value === null) return null

        return {
          hash: item.signature,
          from: tx.senderId,
          to: tx.recipientId,
          timestamp: tx.timestamp * 1000,
          status: 'confirmed',
          blockNumber: BigInt(item.height),
          action,
          direction,
          assets: [{
            assetType: 'native' as const,
            value,
            symbol: assetType,
            decimals: this.decimals,
          }],
        }
      })
      .filter((tx): tx is Transaction => tx !== null)
  }

  private detectAction(txType: string): Action {
    // BioForest 交易类型映射
    // 格式: {CHAIN}-{NETWORK}-{TYPE}-{VERSION}
    // 例如: BFM-BFMETA-AST-02 = 资产转账
    const typeMap: Record<string, Action> = {
      'AST-01': 'transfer',       // 资产转移 (旧版)
      'AST-02': 'transfer',       // 资产转移
      'AST-03': 'destroyAsset',   // 销毁资产 (BIW)
      'BSE-01': 'signature',      // 签名/签章 (BIW)
      'ETY-01': 'issueEntity',    // 发行实体工厂 (BIW)
      'ETY-02': 'issueEntity',    // 发行实体 (BIW)
      'GFT-01': 'gift',           // 发红包
      'GFT-02': 'gift',           // 发红包 v2
      'GRB-01': 'grab',           // 抢红包
      'GRB-02': 'grab',           // 抢红包 v2
      'TRS-01': 'trust',          // 委托
      'TRS-02': 'trust',          // 委托 v2
      'SGN-01': 'signFor',        // 代签
      'SGN-02': 'signFor',        // 代签 v2
      'EMI-01': 'emigrate',       // 跨链转出
      'EMI-02': 'emigrate',       // 跨链转出 v2
      'IMI-01': 'immigrate',      // 跨链转入
      'IMI-02': 'immigrate',      // 跨链转入 v2
      'ISA-01': 'issueAsset',     // 发行资产
      'ICA-01': 'increaseAsset',  // 增发资产
      'DSA-01': 'destroyAsset',   // 销毁资产
      'ISE-01': 'issueEntity',    // 发行实体
      'DSE-01': 'destroyEntity',  // 销毁实体
      'LNS-01': 'locationName',   // 位名
      'DAP-01': 'dapp',           // DApp 调用
      'CRT-01': 'certificate',    // 证书
      'MRK-01': 'mark',           // 标记
    }
    
    // 提取类型后缀 (例如 "BFM-BFMETA-AST-02" -> "AST-02")
    const parts = txType.split('-')
    if (parts.length >= 4) {
      const suffix = `${parts[parts.length - 2]}-${parts[parts.length - 1]}`
      return typeMap[suffix] ?? 'unknown'
    }
    
    return 'unknown'
  }

  private getDirection(from: string, to: string, address: string): Direction {
    const fromLower = from.toLowerCase()
    const toLower = to.toLowerCase()

    if (!toLower) return fromLower === address ? 'out' : 'in'
    
    if (fromLower === address && toLower === address) {
      return 'self'
    }
    if (fromLower === address) {
      return 'out'
    }
    return 'in'
  }

  private extractAssetInfo(tx: z.infer<typeof BiowalletTxItemSchema>['transaction']): { value: string | null; assetType: string } {
    const asset = tx.asset
    
    // 转账
    if (asset?.transferAsset) {
      return {
        value: asset.transferAsset.amount,
        assetType: asset.transferAsset.assetType,
      }
    }
    
    // 红包
    if (asset?.giftAsset) {
      return {
        value: asset.giftAsset.totalAmount,
        assetType: asset.giftAsset.assetType,
      }
    }
    
    // 委托
    if (asset?.trustAsset) {
      return {
        value: asset.trustAsset.amount,
        assetType: asset.trustAsset.assetType,
      }
    }
    
    // 抢红包 (金额需要从其他地方获取)
    if (asset?.grabAsset) {
      return {
        value: '0',
        assetType: this.symbol,
      }
    }

    // 销毁资产
    if (asset?.destroyAsset) {
      return {
        value: asset.destroyAsset.amount,
        assetType: asset.destroyAsset.assetType,
      }
    }

    // 发行实体 / 发行实体工厂：无金额，用 0 占位
    if (asset?.issueEntity || asset?.issueEntityFactory) {
      return {
        value: '0',
        assetType: this.symbol,
      }
    }

    // 签名/签章：无金额，用 0 占位
    if (asset?.signature) {
      return {
        value: '0',
        assetType: this.symbol,
      }
    }

    // 销毁资产
    if (asset?.destroyAsset) {
      return {
        value: asset.destroyAsset.amount,
        assetType: asset.destroyAsset.assetType,
      }
    }

    // 发行实体/实体工厂
    if (asset?.issueEntity || asset?.issueEntityFactory) {
      return {
        value: '0',
        assetType: this.symbol,
      }
    }

    // 签名
    if (asset?.signature) {
      return {
        value: '0',
        assetType: this.symbol,
      }
    }
    
    return { value: null, assetType: this.symbol }
  }

  async getBlockHeight(): Promise<bigint> {
    const json: unknown = await fetchJson(`${this.baseUrl}/lastblock`, undefined, {
      cacheKey: `biowallet:${this.path}:lastblock`,
      ttlMs: 10_000,
    })
    const parsed = BiowalletBlockSchema.safeParse(json)
    if (!parsed.success || !parsed.data.success || !parsed.data.result) {
      throw new Error('Upstream API error')
    }
    return BigInt(parsed.data.result.height)
  }
}

/** 工厂函数 */
export function createBiowalletProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type.startsWith('biowallet-')) {
    return new BiowalletProvider(entry, chainId)
  }
  return null
}
