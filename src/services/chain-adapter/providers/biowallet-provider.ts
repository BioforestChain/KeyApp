/**
 * BioWallet API Provider
 * 
 * 使用 Mixin 继承模式组合 Identity 和 Transaction 能力
 */

import { z } from 'zod'
import { keyFetch, ttl, derive, transform, postBody, interval, deps, combine } from '@biochain/key-fetch'
import type { KeyFetchInstance } from '@biochain/key-fetch'
import type { ApiProvider, Balance, TokenBalance, Transaction, Direction, Action, BalanceOutput, BlockHeightOutput, TokenBalancesOutput, TransactionOutput, TransactionsOutput, AddressParams, TxHistoryParams, TransactionParams } from './types'
import {
  BalanceOutputSchema,
  TokenBalancesOutputSchema,
  TransactionsOutputSchema,
  TransactionOutputSchema,
  BlockHeightOutputSchema,
  AddressParamsSchema,
  TxHistoryParamsSchema,
} from './types'
import {
  setForgeInterval,
} from '../bioforest/fetch'
import type { ParsedApiEntry } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { BioforestIdentityMixin } from '../bioforest/identity-mixin'
import { BioforestTransactionMixin } from '../bioforest/transaction-mixin'
import { BioforestAccountMixin } from '../bioforest/account-mixin'
import { fetchGenesisBlock } from '@/services/bioforest-sdk'

// ==================== 参数 Schema 定义 ====================

// ==================== 参数 Schema 定义 ====================
// 使用 shared types 中的 Definitions


// ==================== 内部 API Schema（原始响应格式，来自 main 分支）====================

// 资产余额项（嵌套结构：assets[magic][assetType] = { assetNumber, assetType }）
const BiowalletAssetItemSchema = z.object({
  assetNumber: z.string(),
  assetType: z.string(),
}).passthrough()

const AssetResponseSchema = z.object({
  success: z.boolean(),
  result: z.object({
    address: z.string(),
    assets: z.record(z.string(), z.record(z.string(), BiowalletAssetItemSchema)),
  }).nullish(),  // API returns null for addresses without assets
})

// 交易项 - 支持所有 BioForest 交易类型
const BiowalletTxItemSchema = z.object({
  height: z.number(),
  signature: z.string(), // 这是区块签名，不是交易签名
  transaction: z.object({
    type: z.string(),
    senderId: z.string(),
    recipientId: z.string().optional().default(''),
    timestamp: z.number(),
    signature: z.string(), // 这才是真正的交易签名/ID
    asset: z.object({
      transferAsset: z.object({
        assetType: z.string(),
        amount: z.string(),
      }).optional(),
      // 其他 BioForest 资产类型
      giftAsset: z.object({
        totalAmount: z.string(),
        assetType: z.string(),
      }).passthrough().optional(),
      grabAsset: z.object({
        transactionSignature: z.string(),
      }).passthrough().optional(),
      trustAsset: z.object({
        trustees: z.array(z.string()),
        numberOfSignFor: z.number(),
        assetType: z.string(),
        amount: z.string(),
      }).passthrough().optional(),
      // BIW / BioForest Meta 其他类型
      signature: z.object({
        publicKey: z.string().optional(),
      }).passthrough().optional(),
      destroyAsset: z.object({
        assetType: z.string(),
        amount: z.string(),
      }).passthrough().optional(),
      issueEntity: z.object({
        entityId: z.string().optional(),
      }).passthrough().optional(),
      issueEntityFactory: z.object({
        factoryId: z.string().optional(),
      }).passthrough().optional(),
    }).passthrough().optional(),
  }).passthrough(),
}).passthrough()

const TxListResponseSchema = z.object({
  success: z.boolean(),
  result: z.object({
    trs: z.array(BiowalletTxItemSchema),
    count: z.number().optional(),
  }).optional(),
})

const BlockResponseSchema = z.object({
  success: z.boolean(),
  result: z.object({
    height: z.number(),
  }).optional(),
})

// Pending 交易查询参数
const PendingTrParamsSchema = z.object({
  senderId: z.string(),
  sort: z.number().optional(),
})

// Pending 交易响应 Schema
const PendingTrItemSchema = z.object({
  state: z.number(), // InternalTransStateID
  trJson: BiowalletTxItemSchema.shape.transaction,
  signature: z.string().optional(), // 从外层提取
  createdTime: z.string(),
})

const PendingTrResponseSchema = z.object({
  success: z.boolean(),
  result: z.array(PendingTrItemSchema).optional(),
})

type AssetResponse = z.infer<typeof AssetResponseSchema>
type TxListResponse = z.infer<typeof TxListResponseSchema>
type BiowalletTxItem = z.infer<typeof BiowalletTxItemSchema>

// ==================== 工具函数 ====================

function getDirection(from: string, to: string, address: string): Direction {
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()
  const addrLower = address.toLowerCase()

  if (!toLower) return fromLower === addrLower ? 'out' : 'in'
  if (fromLower === addrLower && toLower === addrLower) return 'self'
  if (fromLower === addrLower) return 'out'
  return 'in'
}

// BFM 链的 epoch 时间（2017-01-01T00:00:00Z 的毫秒时间戳）
// BFM timestamp 是从这个时间点开始的秒数偏移量
const BFM_EPOCH_MS = new Date('2017-01-01T00:00:00Z').getTime()

/** 
 * 检测 BioForest 交易类型并映射到标准 Action
 * 格式: {CHAIN}-{NETWORK}-{TYPE}-{VERSION}
 * 例如: BFM-BFMETA-AST-02 = 资产转账
 */
function detectAction(txType: string): Action {
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

/** 从交易资产中提取金额和类型 */
function extractAssetInfo(
  asset: BiowalletTxItem['transaction']['asset'],
  defaultSymbol: string
): { value: string | null; assetType: string } {
  if (!asset) return { value: null, assetType: defaultSymbol }

  // 转账
  if (asset.transferAsset) {
    return {
      value: asset.transferAsset.amount,
      assetType: asset.transferAsset.assetType,
    }
  }

  // 红包
  if (asset.giftAsset) {
    return {
      value: asset.giftAsset.totalAmount,
      assetType: asset.giftAsset.assetType,
    }
  }

  // 委托
  if (asset.trustAsset) {
    return {
      value: asset.trustAsset.amount,
      assetType: asset.trustAsset.assetType,
    }
  }

  // 抢红包 (金额需要从其他地方获取)
  if (asset.grabAsset) {
    return { value: '0', assetType: defaultSymbol }
  }

  // 销毁资产
  if (asset.destroyAsset) {
    return {
      value: asset.destroyAsset.amount,
      assetType: asset.destroyAsset.assetType,
    }
  }

  // 发行实体 / 发行实体工厂：无金额，用 0 占位
  if (asset.issueEntity || asset.issueEntityFactory) {
    return { value: '0', assetType: defaultSymbol }
  }

  // 签名/签章：无金额，用 0 占位
  if (asset.signature) {
    return { value: '0', assetType: defaultSymbol }
  }

  return { value: null, assetType: defaultSymbol }
}

/**
 * 统一的 BioChain 交易转换函数
 * 将 BioChain 的交易格式转换为 KeyApp 的 Transaction 格式
 */
function convertBioTransactionToTransaction(
  bioTx: BiowalletTxItem['transaction'],
  options: {
    signature: string
    height?: number
    status: 'pending' | 'confirmed' | 'failed'
    createdTime?: string  // pending 交易的创建时间
    address?: string      // 当前钱包地址，用于判断方向
  }
): Transaction {
  const { signature, height, status, createdTime, address = '' } = options

  // 提取资产信息
  const { value, assetType } = extractAssetInfo(bioTx.asset, 'BFM')

  // 计算时间戳
  const timestamp = createdTime
    ? new Date(createdTime).getTime()
    : BFM_EPOCH_MS + bioTx.timestamp * 1000

  // 判断方向
  const direction = address
    ? getDirection(bioTx.senderId, bioTx.recipientId ?? '', address)
    : 'out'

  return {
    hash: signature,
    from: bioTx.senderId,
    to: bioTx.recipientId ?? '',
    timestamp,
    status,
    blockNumber: height !== undefined ? BigInt(height) : undefined,
    action: detectAction(bioTx.type),
    direction,
    assets: [{
      assetType: 'native' as const,
      value: value ?? '0',
      symbol: assetType,
      decimals: 8, // TODO: 从 chainConfig 获取
    }],
  }
}


// ==================== Base Class for Mixins ====================

class BiowalletBase {
  readonly chainId: string
  readonly type: string
  readonly endpoint: string
  readonly config?: Record<string, unknown>

  constructor(entry: ParsedApiEntry, chainId: string) {
    this.type = entry.type
    this.endpoint = entry.endpoint
    this.config = entry.config
    this.chainId = chainId
  }
}

// ==================== Provider 实现 (使用 Mixin 继承) ====================

export class BiowalletProvider extends BioforestAccountMixin(BioforestIdentityMixin(BioforestTransactionMixin(BiowalletBase))) implements ApiProvider {
  private readonly symbol: string
  private readonly decimals: number
  private forgeInterval: number = 15000 // 默认 15s

  // ==================== 私有基础 Fetcher ====================

  readonly #addressAsset: KeyFetchInstance<AssetResponse, AddressParams>
  readonly #txList: KeyFetchInstance<TxListResponse, TxHistoryParams>

  // ==================== 公开响应式数据源（派生视图）====================

  readonly nativeBalance: KeyFetchInstance<BalanceOutput, AddressParams>
  readonly tokenBalances: KeyFetchInstance<TokenBalancesOutput, AddressParams>
  readonly transactionHistory: KeyFetchInstance<TransactionsOutput, TxHistoryParams>
  readonly blockHeight: KeyFetchInstance<BlockHeightOutput>
  readonly transaction: KeyFetchInstance<TransactionOutput, TransactionParams>

  constructor(entry: ParsedApiEntry, chainId: string) {
    super(entry, chainId)
    this.symbol = chainConfigService.getSymbol(chainId)
    this.decimals = chainConfigService.getDecimals(chainId)

    const baseUrl = this.endpoint
    const symbol = this.symbol
    const decimals = this.decimals

    // ==================== 链配置读取（创世块） ====================

    // 从静态配置中读取创世块以获取 forgeInterval
    const genesisPath = chainConfigService.getBiowalletGenesisBlock(chainId)
    if (genesisPath) {
      fetchGenesisBlock(chainId, genesisPath)
        .then(genesis => {
          // Genesis Block JSON 可能直接包含 forgeInterval
          const interval = genesis.asset.genesisAsset.forgeInterval
          if (typeof interval === 'number') {
            this.forgeInterval = interval * 1000
            setForgeInterval(chainId, this.forgeInterval)
          }
        })
        .catch(err => {
          console.warn('Failed to fetch genesis block:', err)
        })
    }

    // ==================== 区块高度（必须先创建，供其他 fetcher 依赖）====================

    const blockApi = keyFetch.create({
      name: `biowallet.${chainId}.blockApi`,
      outputSchema: BlockResponseSchema,
      url: `${baseUrl}/block/lastblock`,
      // 动态获取 interval 和 TTL
      use: [
        interval(() => this.forgeInterval),
        ttl(() => Math.max(1000, this.forgeInterval - 2000)) // TTL 略小于 interval，确保能触发重新获取
      ],
    })

    // ==================== 基础 Fetcher（私有）====================
    // 使用 postBody 插件将 params 作为 JSON body 发送
    // 使用 inputSchema 进行类型推导
    // 使用 deps(blockApi) 在区块高度变化时自动刷新

    this.#addressAsset = keyFetch.create({
      name: `biowallet.${chainId}.addressAsset`,
      outputSchema: AssetResponseSchema,
      inputSchema: AddressParamsSchema,
      url: `${baseUrl}/address/asset`,
      method: 'POST',
    }).use(deps(blockApi), postBody())

    this.#txList = keyFetch.create({
      name: `biowallet.${chainId}.txList`,
      outputSchema: TxListResponseSchema,
      inputSchema: TxHistoryParamsSchema,
      url: `${baseUrl}/transactions/query`,
      method: 'POST',
      use: [
        deps(blockApi),
        // 转换通用参数到 BioChain 格式
        postBody({
          transform: (params) => ({
            address: params.address,
            page: params.page ?? 1,
            pageSize: params.limit ?? 50,
            sort: -1, // BioChain 需要 -1 表示逆序（最新在前）
          }),
        }),
        // 移除 TTL，确保与 blockApi 同步
      ],
    })

    // 派生 blockHeight 视图
    this.blockHeight = derive({
      name: `biowallet.${chainId}.blockHeight`,
      source: blockApi,
      outputSchema: BlockHeightOutputSchema,
      use: [
        transform<z.infer<typeof BlockResponseSchema>, bigint>({
          transform: (raw) => {
            if (!raw.result?.height) return BigInt(0)
            return BigInt(raw.result.height)
          },
        }),
      ],
    })

    // ==================== 派生视图（使用 use 插件系统）====================

    // 原生余额：从 #addressAsset 派生
    // 原版逻辑：遍历 assets[magic][assetType]，找到 assetType === symbol
    this.nativeBalance = derive({
      name: `biowallet.${chainId}.nativeBalance`,
      source: this.#addressAsset,
      outputSchema: BalanceOutputSchema,
      use: [
        transform<AssetResponse, Balance>({
          transform: (raw) => {
            if (!raw.result?.assets) {
              return { amount: Amount.zero(decimals, symbol), symbol }
            }
            // 遍历嵌套结构 assets[magic][assetType]
            for (const magic of Object.values(raw.result.assets)) {
              for (const asset of Object.values(magic)) {
                if (asset.assetType === symbol) {
                  return {
                    amount: Amount.fromRaw(asset.assetNumber, decimals, symbol),
                    symbol,
                  }
                }
              }
            }
            return { amount: Amount.zero(decimals, symbol), symbol }
          },
        }),
      ],
    })

    // 代币余额列表：从 #addressAsset 派生
    this.tokenBalances = derive({
      name: `biowallet.${chainId}.tokenBalances`,
      source: this.#addressAsset,
      outputSchema: TokenBalancesOutputSchema,
      use: [
        transform<AssetResponse, TokenBalance[]>({
          transform: (raw) => {
            if (!raw.result?.assets) return []
            const tokens: TokenBalance[] = []
            // 遍历嵌套结构 assets[magic][assetType]
            for (const magic of Object.values(raw.result.assets)) {
              for (const asset of Object.values(magic)) {
                const isNative = asset.assetType === symbol
                tokens.push({
                  symbol: asset.assetType,
                  name: asset.assetType,
                  amount: Amount.fromRaw(asset.assetNumber, decimals, asset.assetType),
                  isNative,
                  decimals,
                  icon: (asset as Record<string, unknown>).iconUrl as string | undefined,
                })
              }
            }
            // 原生代币排前面
            tokens.sort((a, b) => {
              if (a.isNative && !b.isNative) return -1
              if (!a.isNative && b.isNative) return 1
              return b.amount.toNumber() - a.amount.toNumber()
            })
            return tokens
          },
        }),
      ],
    })

    // 交易历史：从 #txList 派生
    // 原版逻辑：使用 detectAction 和 extractAssetInfo
    this.transactionHistory = derive({
      name: `biowallet.${chainId}.transactionHistory`,
      source: this.#txList,
      outputSchema: TransactionsOutputSchema,
    }).use(transform({
      transform: (raw: TxListResponse, ctx) => {
        if (!raw.result?.trs) return []
        const address = ctx.params.address
        const normalizedAddress = address.toLowerCase()

        return raw.result.trs
          .map((item): Transaction | null => {
            const tx = item.transaction
            const action = detectAction(tx.type)
            const direction = getDirection(tx.senderId, tx.recipientId ?? '', normalizedAddress)

            const { value, assetType } = extractAssetInfo(tx.asset, symbol)
            if (value === null) return null

            return {
              // 使用 transaction.signature (交易签名)，而不是 item.signature (区块签名)
              hash: tx.signature ?? item.signature,
              from: tx.senderId,
              to: tx.recipientId ?? '',
              timestamp: BFM_EPOCH_MS + tx.timestamp * 1000, // BFM timestamp 是从 2017-01-01 开始的秒数
              status: 'confirmed',
              blockNumber: BigInt(item.height),
              action,
              direction,
              assets: [{
                assetType: 'native' as const,
                value,
                symbol: assetType,
                decimals,
              }],
            }
          })
          .filter((tx): tx is Transaction => tx !== null)
          .sort((a, b) => b.timestamp - a.timestamp) as Transaction[]// 最新交易在前
      },
    }),)

    // Pending 交易列表（独立 fetcher）
    const bioPendingTr = keyFetch.create({
      name: `biowallet.${chainId}.pendingTr`,
      outputSchema: PendingTrResponseSchema,
      inputSchema: PendingTrParamsSchema,
      url: `${baseUrl}/pendingTr`,
      method: 'POST',
      use: [
        deps(blockApi),
        postBody({
          transform: (params) => ({
            senderId: params.senderId,
            sort: -1,
          }),
        }),
        // 移除 TTL，确保与 blockApi/txList 同步
      ],
    })

    // 单笔交易查询内部 fetcher（使用 signature 参数）
    const singleTxApi = keyFetch.create({
      name: `biowallet.${chainId}.singleTx`,
      outputSchema: TxListResponseSchema,
      inputSchema: z.object({
        txHash: z.string().optional(),
      }),
      url: `${baseUrl}/transactions/query`,
      method: 'POST',
      use: [
        deps(blockApi), // 由 blockApi 驱动，确保交易状态实时更新
        postBody({
          transform: (params) => ({
            signature: (params as { txHash?: string }).txHash,
          }),
        }),
      ],
    })

    // transaction: 使用 combine 合并 pendingTr 和 singleTx 的结果
    this.transaction = combine({
      name: `biowallet.${chainId}.transaction`,
      outputSchema: TransactionOutputSchema,
      sources: {
        pending: bioPendingTr,
        confirmed: singleTxApi,
      },
      // 自定义 inputSchema：外部只需要传 txHash 和 senderId
      inputSchema: z.object({
        txHash: z.string(),
        senderId: z.string().optional(),
      }),
      // 将外部 params 转换为各个 source 需要的格式
      transformParams: (params) => ({
        pending: { senderId: params.senderId ?? '' },
        confirmed: { txHash: params.txHash },
      }),

    }).use(transform({
      transform: (results: {
        pending?: z.infer<typeof PendingTrResponseSchema>,
        confirmed?: TxListResponse
      }, ctx) => {
        // 返回 pending 状态的交易
        if (results.pending?.result && results.pending.result.length > 0) {
          const pendingTx = results.pending.result.find(tx => tx.signature === ctx.params.txHash)
          if (pendingTx) {
            return convertBioTransactionToTransaction(pendingTx.trJson, {
              // 使用 trJson.signature (交易签名)，而不是 pendingTx.signature
              signature: pendingTx.trJson.signature ?? pendingTx.signature ?? '',
              status: 'pending',
              createdTime: pendingTx.createdTime,
            })
          }
        }
        // 优先返回 confirmed 交易
        if (results.confirmed?.result?.trs?.length) {
          const item = results.confirmed.result.trs[0]
          return convertBioTransactionToTransaction(item.transaction, {
            // 使用 transaction.signature (交易签名)，而不是 item.signature (区块签名)
            signature: item.transaction.signature ?? item.signature,
            height: item.height,
            status: 'confirmed',
          })
        }

        // 都没找到
        return null
      },
    }));
  }
}

export function createBiowalletProvider(entry: ParsedApiEntry, chainId: string): ApiProvider | null {
  if (entry.type === 'biowallet-v1') {
    return new BiowalletProvider(entry, chainId)
  }
  return null
}
