/**
 * API Provider 类型定义
 * 
 * 每个 ApiProvider 实现特定 API 的部分能力。
 * ChainProvider 聚合多个 ApiProvider，通过能力发现动态代理方法调用。
 */

import type { Amount } from '@/types/amount'
import type { ParsedApiEntry } from '@/services/chain-config'

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

// ==================== Provider 接口 ====================

/**
 * API Provider 接口
 * 
 * 每个方法都是可选的，Provider 只实现它支持的方法。
 * ChainProvider 通过 `supports()` 检查是否有 Provider 实现了某方法。
 */
export interface ApiProvider {
  /** Provider 类型 (来自配置的 key，如 "biowallet-v1") */
  readonly type: string
  /** API 端点 (可为空，如 wrapped provider) */
  readonly endpoint: string
  /** 额外配置 */
  readonly config?: Record<string, unknown>

  // ===== 查询能力 =====
  
  /** 查询原生代币余额 */
  getNativeBalance?(address: string): Promise<Balance>
  
  /** 查询所有代币余额（native + 资产） */
  getTokenBalances?(address: string): Promise<TokenBalance[]>
  
  /** 查询交易历史 */
  getTransactionHistory?(address: string, limit?: number): Promise<Transaction[]>
  
  /** 查询单笔交易 */
  getTransaction?(hash: string): Promise<Transaction | null>
  
  /** 获取交易状态 */
  getTransactionStatus?(hash: string): Promise<TransactionStatus>
  
  /** 获取当前区块高度 */
  getBlockHeight?(): Promise<bigint>

  // ===== 交易能力 =====
  
  /** 估算手续费 */
  estimateFee?(params: TransferParams): Promise<FeeEstimate>
  
  /** 构建未签名交易 */
  buildTransaction?(params: TransferParams): Promise<UnsignedTransaction>
  
  /** 签名交易 */
  signTransaction?(unsignedTx: UnsignedTransaction, privateKey: Uint8Array): Promise<SignedTransaction>
  
  /** 广播已签名交易 */
  broadcastTransaction?(signedTx: SignedTransaction): Promise<string>

  // ===== 身份能力 =====
  
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
