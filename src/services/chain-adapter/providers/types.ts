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
keyFetch.superjson.registerCustom(
  {
    isApplicable: (v): v is Amount => v instanceof Amount,
    serialize: (v) => v.toJSON() as unknown,
    deserialize: (v) => Amount.fromJSON(v as unknown as AmountJSON),
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

// ==================== 数据类型 ====================

/** 余额信息 */
export interface Balance {
  amount: Amount
  symbol: string
}

/** 代币余额（含 native + 所有资产） */
export interface TokenBalance {
  symbol: string
  name: string
  amount: Amount
  isNative: boolean
}

/** 手续费选项 */
export interface Fee {
  amount: Amount
  estimatedTime: number // seconds
}

/** 手续费估算结果 */
export interface FeeEstimate {
  slow: Fee
  standard: Fee
  fast: Fee
}

/** 转账参数 */
export interface TransferParams {
  from: string
  to: string
  amount: Amount
  memo?: string
}

/** 未签名交易 */
export interface UnsignedTransaction {
  chainId: string
  data: unknown
}

/** 已签名交易 */
export interface SignedTransaction {
  chainId: string
  data: unknown
  signature: string
}

/** 交易状态 */
export interface TransactionStatus {
  status: 'pending' | 'confirming' | 'confirmed' | 'failed'
  confirmations: number
  requiredConfirmations: number
}

// ==================== 标准输出 Schema（强类型）====================

/** Amount 的 Zod Schema */
const AmountSchema = z.custom<Amount>((val) => val instanceof Amount || typeof val === 'object')

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
export interface ApiProvider {
  /** Provider 类型 (来自配置的 key，如 "biowallet-v1") */
  readonly type: string
  /** API 端点 (可为空，如 wrapped provider) */
  readonly endpoint: string
  /** 额外配置 */
  readonly config?: Record<string, unknown>

  // ===== 响应式查询能力（强类型）=====

  /** 原生代币余额 - 参数: { address: string } */
  nativeBalance?: KeyFetchInstance<typeof BalanceOutputSchema>

  /** 所有代币余额 - 参数: { address: string } */
  tokenBalances?: KeyFetchInstance<typeof TokenBalancesOutputSchema>

  /** 交易历史 - 参数: { address: string, limit?: number } */
  transactionHistory?: KeyFetchInstance<typeof TransactionsOutputSchema>

  /** 单笔交易详情 - 参数: { hash: string } */
  transaction?: KeyFetchInstance<typeof TransactionOutputSchema>

  /** 交易状态 - 参数: { hash: string } */
  transactionStatus?: KeyFetchInstance<typeof TransactionStatusOutputSchema>

  /** 当前区块高度 - 参数: {} */
  blockHeight?: KeyFetchInstance<typeof BlockHeightOutputSchema>

  // ===== 非响应式操作（保持方法形式）=====

  /** 估算手续费 */
  estimateFee?(params: TransferParams): Promise<FeeEstimate>

  /** 构建未签名交易 */
  buildTransaction?(params: TransferParams): Promise<UnsignedTransaction>

  /** 签名交易 */
  signTransaction?(unsignedTx: UnsignedTransaction, privateKey: Uint8Array): Promise<SignedTransaction>

  /** 广播已签名交易 */
  broadcastTransaction?(signedTx: SignedTransaction): Promise<string>

  // ===== 身份能力（同步方法）=====

  /** 派生地址 */
  deriveAddress?(seed: Uint8Array, index?: number): Promise<string>

  /** 批量派生地址 */
  deriveAddresses?(seed: Uint8Array, startIndex: number, count: number): Promise<string[]>

  /** 验证地址格式 */
  isValidAddress?(address: string): boolean

  /** 规范化地址 */
  normalizeAddress?(address: string): string
}

/** ApiProvider 可调用的方法名 */
export type ApiProviderMethod = keyof Omit<ApiProvider, 'type' | 'endpoint' | 'config'>

/** ApiProvider 工厂函数 */
export type ApiProviderFactory = (entry: ParsedApiEntry, chainId: string) => ApiProvider | null

