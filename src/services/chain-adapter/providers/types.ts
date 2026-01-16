/**
 * API Provider 类型定义
 * 
 * 响应式设计：使用 KeyFetchInstance 替代异步方法
 * 每个属性是一个可订阅的数据源，支持：
 * - fetch(params) - 单次获取
 * - subscribe(params, callback) - 订阅变化
 * - useState(params) - React Hook
 * 
 * 类型安全：所有 KeyFetchInstance 使用强类型 Schema
 * Provider 内部通过 transform 插件转换为标准输出类型
 */

import { Amount, type AmountJSON } from '@/types/amount'
import type { ParsedApiEntry } from '@/services/chain-config'
import type { KeyFetchInstance } from '@biochain/key-fetch'
import { keyFetch } from '@biochain/key-fetch'
import { z } from 'zod'

// ==================== 注册 Amount 类型序列化 ====================
// 使用 superjson 的 registerCustom 使 Amount 对象能正确序列化/反序列化
// 注：Amount 使用 private constructor，所以用 registerCustom 而非 registerClass
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- superjson 内部处理 JSON 序列化
keyFetch.superjson.registerCustom<Amount, any>(
  {
    isApplicable: (v): v is Amount => v instanceof Amount,
    serialize: (v) => v.toJSON(),
    deserialize: (v) => Amount.fromJSON(v as AmountJSON),
  },
  'Amount'
)

// 导出 ProviderResult 类型
export {
  type ProviderResult,
  createSupportedResult,
  createFallbackResult,
  isSupported,
  unwrapResult,
} from '@/types/provider-result'

// 从 transaction-schema 导出 Transaction 相关类型
export {
  type Transaction,
  type Asset,
  type NativeAsset,
  type TokenAsset,
  type NftAsset,
  type Action,
  type Direction,
  type AssetType,
  type TxStatus,
  type FeeInfo,
  type ContractInfo,
  TransactionSchema,
  AssetSchema,
  ActionSchema,
  DirectionSchema,
  getPrimaryAsset,
  isNativeAsset,
  isTokenAsset,
  isNftAsset,
  parseTransaction,
  parseTransactions,
} from './transaction-schema'

// ==================== 通用 API 参数 Schema ====================

/** 地址查询参数（余额、资产） */
export const AddressParamsSchema = z.object({
  address: z.string(),
})
export type AddressParams = z.infer<typeof AddressParamsSchema>

/** 交易历史查询参数 */
export const TxHistoryParamsSchema = z.object({
  address: z.string(),
  limit: z.number().optional().default(20),
  page: z.number().optional(),
})
export type TxHistoryParams = z.infer<typeof TxHistoryParamsSchema>

/** 单笔交易查询参数 */
export const TransactionParamsSchema = z.object({
  txHash: z.string(),
})
export type TransactionParams = z.infer<typeof TransactionParamsSchema>

/** 交易状态查询参数 */
export const TransactionStatusParamsSchema = z.object({
  txHash: z.string(),
})
export type TransactionStatusParams = z.infer<typeof TransactionStatusParamsSchema>

// ==================== 数据类型 ====================

/** 余额信息 */
export interface Balance {
  amount: Amount
  symbol: string
}

/** 代币余额（含 native + 所有资产）
 * 
 * 继承自老代码 Token 类型的核心字段：
 * - amount: 余额（Amount 对象）
 * - decimals: 精度（从老代码 Token.decimals 继承）
 * - icon: 图标 URL（可选，从老代码 Token.icon 继承）
 * - contractAddress: 合约地址（可选，从老代码 Token.contractAddress 继承）
 */
export interface TokenBalance {
  symbol: string
  name: string
  amount: Amount
  isNative: boolean
  /** 代币精度 */
  decimals: number
  /** 代币图标 URL */
  icon?: string
  /** 合约地址（ERC20/TRC20 等）*/
  contractAddress?: string
}

// ==================== 从 ../types 统一导入交易相关类型 ====================
// 避免重复定义，确保单一数据源

import type { ITransactionService, IIdentityService, IAssetService, IBioAccountService } from '../types'

export type {
  Fee,
  FeeEstimate,
  UnsignedTransaction,
  SignedTransaction,
  TransactionStatus,
  TransactionIntent,
  TransferIntent,
  DestroyIntent,
  SetPayPasswordIntent,
  ContractCallIntent,
  SignOptions,
  // BioChain 专属类型
  BioAccountInfo,
  BioVerifyPayPasswordParams,
} from '../types'

// ==================== 标准输出 Schema（强类型）====================

/** Amount 的 Zod Schema */
const AmountSchema = z.custom<Amount>((val) => val instanceof Amount)

/** 余额输出 Schema - ApiProvider 契约 */
export const BalanceOutputSchema = z.object({
  amount: AmountSchema,
  symbol: z.string(),
})
export type BalanceOutput = z.infer<typeof BalanceOutputSchema>

/** 代币余额列表输出 Schema - ApiProvider 契约 */
export const TokenBalancesOutputSchema = z.array(z.object({
  symbol: z.string(),
  name: z.string(),
  amount: AmountSchema,
  isNative: z.boolean(),
  decimals: z.number(),
  icon: z.string().optional(),
  contractAddress: z.string().optional(),
}))
export type TokenBalancesOutput = z.infer<typeof TokenBalancesOutputSchema>

/** 交易历史输出 Schema - ApiProvider 契约 */

// 使用 transaction-schema.ts 中定义的 TransactionSchema
import { TransactionSchema as TxSchema } from './transaction-schema'
export const TransactionsOutputSchema = z.array(TxSchema)
export type TransactionsOutput = z.infer<typeof TransactionsOutputSchema>

/** 交易详情输出 Schema */
export const TransactionOutputSchema = TxSchema.nullable()
export type TransactionOutput = z.infer<typeof TransactionOutputSchema>

/** 交易状态输出 Schema */
export const TransactionStatusOutputSchema = z.object({
  status: z.enum(['pending', 'confirming', 'confirmed', 'failed']),
  confirmations: z.number(),
  requiredConfirmations: z.number(),
})
export type TransactionStatusOutput = z.infer<typeof TransactionStatusOutputSchema>

/** 区块高度输出 Schema */
export const BlockHeightOutputSchema = z.bigint()
export type BlockHeightOutput = z.infer<typeof BlockHeightOutputSchema>

// ==================== 响应式 Provider 接口 ====================

/**
 * 响应式 API Provider 接口
 * 
 * 每个属性是一个 KeyFetchInstance，输出类型是强类型的。
 * Provider 实现需要确保输出符合标准 Schema。
 * 
 * @example
 * ```ts
 * // 单次获取 - data 类型为 BalanceOutput
 * const data = await provider.nativeBalance?.fetch({ address: '0x...' })
 * 
 * // React Hook - data 类型为 BalanceOutput | undefined
 * const { data } = provider.nativeBalance?.useState({ address }) ?? {}
 * ```
 */
export interface ApiProvider extends Partial<ITransactionService & IIdentityService & IAssetService & IBioAccountService> {
  /** Provider 类型 (来自配置的 key，如 "biowallet-v1") */
  readonly type: string
  /** API 端点 (可为空，如 wrapped provider) */
  readonly endpoint: string
  /** 额外配置 */
  readonly config?: Record<string, unknown>

  // ===== 响应式查询能力（强类型）=====

  /** 原生代币余额 - 参数: { address: string } */
  nativeBalance?: KeyFetchInstance<BalanceOutput, AddressParams>

  /** 所有代币余额 - 参数: { address: string } */
  tokenBalances?: KeyFetchInstance<TokenBalancesOutput, AddressParams>

  /** 交易历史 - 参数: { address: string, limit?: number } */
  transactionHistory?: KeyFetchInstance<TransactionsOutput, TxHistoryParams>

  /** 单笔交易详情 - 参数: { hash: string } */
  transaction?: KeyFetchInstance<TransactionOutput, TransactionParams>

  /** 交易状态 - 参数: { hash: string } */
  transactionStatus?: KeyFetchInstance<TransactionStatusOutput, TransactionStatusParams>

  /** 当前区块高度 - 参数: {} */
  blockHeight?: KeyFetchInstance<BlockHeightOutput>

  // ===== 服务接口方法（通过 extends Partial<ITransactionService & IIdentityService & IAssetService> 继承）=====
  // - ITransactionService: buildTransaction, estimateFee, signTransaction, broadcastTransaction
  // - IIdentityService: deriveAddress, deriveAddresses, isValidAddress, normalizeAddress, signMessage, verifyMessage
  // - IAssetService: getNativeBalance, getTokenBalance, getTokenBalances, getTokenMetadata
  // 无需重复声明
}

/** ApiProvider 可调用的方法名 */
export type ApiProviderMethod = keyof Omit<ApiProvider, 'type' | 'endpoint' | 'config'>

/** ApiProvider 工厂函数 */
export type ApiProviderFactory = (entry: ParsedApiEntry, chainId: string) => ApiProvider | null

