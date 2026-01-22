/**
 * Transaction Schema - 多维度分类的交易类型系统
 * 
 * 使用 Zod 定义 schema，自动推导 TypeScript 类型。
 * 交易通过 AssetType × Action × Direction 三个维度组合分类。
 */

import { z } from 'zod'

// ==================== 维度枚举 ====================

/** 资产类型 */
export const AssetTypeSchema = z.enum([
  'native',    // 原生代币 (ETH, BNB, BTC, BFM, TRX)
  'token',     // 同质化代币 (ERC20, BEP20, TRC20)
  'nft',       // 非同质化代币 (ERC721, ERC1155)
])

/** 操作类型 */
export const ActionSchema = z.enum([
  // 通用操作
  'transfer',      // 转账
  'swap',          // 兑换
  'exchange',      // 交换 (BioForest legacy)
  'approve',       // 授权
  'revoke',        // 撤销授权
  'signature',     // 签名/签章
  
  // 质押相关
  'stake',         // 质押
  'unstake',       // 解除质押
  'claim',         // 领取收益
  
  // 资产操作
  'mint',          // 铸造
  'burn',          // 销毁
  
  // BioForest 特有
  'gift',          // 发红包
  'grab',          // 抢红包
  'trust',         // 委托
  'signFor',       // 代签
  'emigrate',      // 跨链转出
  'immigrate',     // 跨链转入
  'issueAsset',    // 发行资产
  'increaseAsset', // 增发资产
  'destroyAsset',  // 销毁资产
  'issueEntity',   // 发行实体
  'destroyEntity', // 销毁实体
  'locationName',  // 位名
  'dapp',          // DApp 调用
  'certificate',   // 证书
  'mark',          // 标记
  
  // 兜底
  'contract',      // 未识别的合约调用
  'unknown',       // 未知操作
])

/** 方向 */
export const DirectionSchema = z.enum([
  'in',    // 收入
  'out',   // 支出
  'self',  // 自己到自己
])

/** 交易状态 */
export const TxStatusSchema = z.enum([
  'pending',
  'confirmed',
  'failed',
])

// ==================== 资产信息 ====================

/** 原生代币资产 */
export const NativeAssetSchema = z.object({
  assetType: z.literal('native'),
  value: z.string(),
  symbol: z.string(),
  decimals: z.number(),
})

/** 同质化代币资产 (ERC20/BEP20/TRC20) */
export const TokenAssetSchema = z.object({
  assetType: z.literal('token'),
  value: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  contractAddress: z.string(),
  name: z.string().optional(),
  logoUrl: z.string().optional(),
})

/** 非同质化代币资产 (ERC721/ERC1155) */
export const NftAssetSchema = z.object({
  assetType: z.literal('nft'),
  tokenId: z.string(),
  contractAddress: z.string(),
  name: z.string().optional(),
  imageUrl: z.string().optional(),
  collection: z.string().optional(),
})

/** 资产联合类型 */
export const AssetSchema = z.discriminatedUnion('assetType', [
  NativeAssetSchema,
  TokenAssetSchema,
  NftAssetSchema,
])

// ==================== 手续费 ====================

/** 手续费信息 */
export const FeeInfoSchema = z.object({
  value: z.string(),
  symbol: z.string(),
  decimals: z.number(),
})

// ==================== 合约信息 ====================

/** 合约调用信息 */
export const ContractInfoSchema = z.object({
  address: z.string(),
  method: z.string().optional(),
  methodId: z.string().optional(),
})

// ==================== 交易主体 ====================

/** 交易 Schema */
export const TransactionSchema = z.object({
  // 基础信息
  hash: z.string(),
  from: z.string(),
  to: z.string(),
  timestamp: z.number(),
  status: TxStatusSchema,
  blockNumber: z.coerce.bigint().optional(),
  
  // 多维度分类
  action: ActionSchema,
  direction: DirectionSchema,
  
  // 涉及的资产 (可能多个，如 swap 有 in/out 两个资产)
  assets: z.array(AssetSchema).min(1),
  
  // 手续费 (原生代币，可选)
  fee: FeeInfoSchema.optional(),
  
  // 合约信息 (合约调用时，可选)
  contract: ContractInfoSchema.optional(),
  
  // 扩展信息 (来自 Moralis 等高级 API)
  fromEntity: z.string().optional(),  // 如 "Binance"
  toEntity: z.string().optional(),
  summary: z.string().optional(),     // 如 "Received 0.1 ETH from Binance"
})

// ==================== 类型导出 ====================

export type AssetType = z.infer<typeof AssetTypeSchema>
export type Action = z.infer<typeof ActionSchema>
export type Direction = z.infer<typeof DirectionSchema>
export type TxStatus = z.infer<typeof TxStatusSchema>
export type NativeAsset = z.infer<typeof NativeAssetSchema>
export type TokenAsset = z.infer<typeof TokenAssetSchema>
export type NftAsset = z.infer<typeof NftAssetSchema>
export type Asset = z.infer<typeof AssetSchema>
export type FeeInfo = z.infer<typeof FeeInfoSchema>
export type ContractInfo = z.infer<typeof ContractInfoSchema>
export type Transaction = z.infer<typeof TransactionSchema>

// ==================== 工具函数 ====================

/** 获取主资产 (第一个资产) */
export function getPrimaryAsset(tx: Transaction): Asset {
  return tx.assets[0]
}

/** 判断是否为原生资产 */
export function isNativeAsset(asset: Asset): asset is NativeAsset {
  return asset.assetType === 'native'
}

/** 判断是否为代币资产 */
export function isTokenAsset(asset: Asset): asset is TokenAsset {
  return asset.assetType === 'token'
}

/** 判断是否为 NFT 资产 */
export function isNftAsset(asset: Asset): asset is NftAsset {
  return asset.assetType === 'nft'
}

/** 安全解析交易 */
export function parseTransaction(data: unknown): Transaction | null {
  const result = TransactionSchema.safeParse(data)
  return result.success ? result.data : null
}

/** 解析交易数组 */
export function parseTransactions(data: unknown[]): Transaction[] {
  return data
    .map(item => parseTransaction(item))
    .filter((tx): tx is Transaction => tx !== null)
}
