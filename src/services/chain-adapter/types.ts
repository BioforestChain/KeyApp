/**
 * 链适配器类型定义
 */

import type { ChainKind } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { z } from 'zod'

// ==================== 基础类型 ====================

export type Address = string
export type TransactionHash = string
export type Signature = string

// ==================== 余额 ====================

export interface Balance {
  amount: Amount
  symbol: string
}

// ==================== 代币 ====================

export interface TokenMetadata {
  address: Address | null // null for native token
  name: string
  symbol: string
  decimals: number
  logoUri?: string
}

// ==================== Gas/Fee ====================

export interface FeeEstimate {
  slow: Fee
  standard: Fee
  fast: Fee
}

export interface Fee {
  amount: Amount
  estimatedTime: number // seconds
}

// ==================== 交易意图 ====================

/** 交易意图基础接口 */
interface TransactionIntentBase {
  from: Address
}

/** 转账意图 */
export interface TransferIntent extends TransactionIntentBase {
  type: 'transfer'
  to: Address
  amount: Amount
  tokenAddress?: Address
  memo?: string
  // BioChain 扩展
  bioAssetType?: string
}

/** 销毁资产意图（BioChain） */
export interface DestroyIntent extends TransactionIntentBase {
  type: 'destroy'
  recipientId: Address  // 资产发行者地址
  amount: Amount
  bioAssetType: string
}

/** 设置支付密码意图（BioChain） */
export interface SetPayPasswordIntent extends TransactionIntentBase {
  type: 'setPayPassword'
  // 新密码在 SignOptions 中提供
}

/** 合约调用意图（EVM/Tron） */
export interface ContractCallIntent extends TransactionIntentBase {
  type: 'contractCall'
  contractAddress: Address
  data: Uint8Array
  value?: Amount
}

/** 交易意图联合类型 */
export type TransactionIntent =
  | TransferIntent
  | DestroyIntent
  | SetPayPasswordIntent
  | ContractCallIntent

// ==================== 签名选项 ====================

/** 签名选项 - 包含链特定的签名配置 */
export interface SignOptions {
  /** 通用：私钥 */
  privateKey?: Uint8Array

  // ===== BioChain 扩展 =====
  /** 主密钥（助记词） */
  bioSecret?: string
  /** 支付密码（二次签名验证） */
  bioPaySecret?: string
  /** 新支付密码（用于 setPayPassword 交易） */
  bioNewPaySecret?: string
}

// ==================== 未签名/已签名交易 ====================

export interface UnsignedTransaction {
  chainId: string
  /** 交易意图类型 */
  intentType: TransactionIntent['type']
  /** 链特定的交易数据 */
  data: unknown
  /** 估算的手续费（可选，由 estimateFee 填充） */
  estimatedFee?: Amount
}

export interface SignedTransaction {
  chainId: string
  data: unknown
  signature: Signature
}

/** SignedTransaction 的 Zod Schema（用于运行时验证和 IndexedDB 存储） */
export const SignedTransactionSchema = z.object({
  chainId: z.string(),
  data: z.unknown(),
  signature: z.string(),
})

export type TransactionStatusType = 'pending' | 'confirming' | 'confirmed' | 'failed'

export interface TransactionStatus {
  status: TransactionStatusType
  confirmations: number
  requiredConfirmations: number
  error?: string
}

export interface Transaction {
  hash: TransactionHash
  from: Address
  to: Address
  amount: Amount
  fee: Amount
  status: TransactionStatus
  timestamp: number
  blockNumber?: bigint | undefined
  memo?: string | undefined
  type: TransactionType
  rawType?: string | undefined  // Original chain-specific transaction type (e.g., 'BSE-01', 'AST-02')
}

export type TransactionType = 'transfer' | 'token-transfer' | 'contract-call' | 'stake' | 'unstake'

// ==================== 链信息 ====================

export interface ChainInfo {
  chainId: string
  name: string
  symbol: string
  decimals: number
  blockTime: number // average seconds per block
  confirmations: number // recommended confirmations
  explorerUrl?: string | undefined
}

export interface GasPrice {
  slow: Amount
  standard: Amount
  fast: Amount
  baseFee?: Amount | undefined
  lastUpdated: number
}

export interface HealthStatus {
  isHealthy: boolean
  latency: number
  blockHeight: bigint
  isSyncing: boolean
  lastUpdated: number
}

// ==================== 服务接口 ====================

export interface IIdentityService {
  deriveAddress(seed: Uint8Array, index?: number): Promise<Address>
  deriveAddresses(seed: Uint8Array, startIndex: number, count: number): Promise<Address[]>
  isValidAddress(address: string): boolean
  normalizeAddress(address: string): Address
  signMessage(message: string | Uint8Array, privateKey: Uint8Array): Promise<Signature>
  verifyMessage(message: string | Uint8Array, signature: Signature, address: Address): Promise<boolean>
}

/**
 * 资产服务接口
 * 
 * 注意：余额查询通过 key-fetch 响应式属性提供（nativeBalance, tokenBalances）
 * 此接口只保留非响应式的方法
 */
export interface IAssetService {
  /** 获取代币元数据（非响应式，按需获取）*/
  getTokenMetadata(tokenAddress: Address): Promise<TokenMetadata>
}

/**
 * 交易服务接口
 * 
 * 流程：buildTransaction -> estimateFee -> signTransaction -> broadcastTransaction
 */
export interface ITransactionService {
  /** 构建未签名交易 - 基于意图 */
  buildTransaction(intent: TransactionIntent): Promise<UnsignedTransaction>

  /** 估算手续费 - 基于已构建的未签名交易 */
  estimateFee(unsignedTx: UnsignedTransaction): Promise<FeeEstimate>

  /** 签名交易 */
  signTransaction(unsignedTx: UnsignedTransaction, options: SignOptions): Promise<SignedTransaction>

  /** 广播已签名交易 */
  broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash>
}

// ==================== BioChain 专属服务接口 ====================
// bio* 前缀表示 BioChain 专属功能，类似于 CSS 的 webkit 前缀
// 如果未来被其他链采纳，可以移除前缀

/**
 * BioChain 账户信息
 */
export interface BioAccountInfo {
  /** 地址 */
  address: string
  /** 支付密码公钥，null 表示未设置支付密码 */
  secondPublicKey: string | null
  /** 账户余额（可选） */
  balance?: string
  /** 是否多重签名账户 */
  isMultisig?: boolean
}

/**
 * 验证支付密码参数
 */
export interface BioVerifyPayPasswordParams {
  /** 主密钥（助记词） */
  mainSecret: string
  /** 支付密码 */
  paySecret: string
  /** 支付密码公钥 */
  publicKey: string
}

/**
 * BioChain 资产详情
 */
export interface BioAssetDetail {
  /** 资产类型 */
  assetType: string
  /** 资产发行者地址（用于销毁交易的 recipientId） */
  applyAddress: string
  /** 资产名称 */
  assetName?: string
  /** 资产精度 */
  precision?: number
}

/**
 * BioChain 账户服务接口（bio* 前缀表示 BioChain 专属）
 * 
 * 提供 BioChain 特有的账户功能：
 * - 支付密码（二次验证）
 * - 账户信息查询
 * - 资产详情查询
 */
export interface IBioAccountService {
  /** 获取账户信息（含支付密码公钥等 BioChain 特有字段） */
  bioGetAccountInfo(address: Address): Promise<BioAccountInfo>

  /** 验证支付密码是否正确 */
  bioVerifyPayPassword(params: BioVerifyPayPasswordParams): Promise<boolean>

  /** 获取资产详情（用于销毁交易获取发行者地址） */
  bioGetAssetDetail(assetType: string, holderAddress: string): Promise<BioAssetDetail | null>
}

// 查询操作说明：使用 Provider 层的 keyFetch
// - getTransactionStatus: 通过 Provider.transactionStatus fetcher 获取
// - getTransaction: 通过 Provider.transaction fetcher 获取
// - getTransactionHistory: 通过 Provider.transactionHistory fetcher 获取

export interface IChainService {
  getChainInfo(): ChainInfo
  getBlockHeight(): Promise<bigint>
  getGasPrice(): Promise<GasPrice>
  healthCheck(): Promise<HealthStatus>
}

export interface IStakingService {
  // Placeholder for staking operations
  getStakingInfo(address: Address): Promise<unknown>
}

// ==================== 适配器接口 ====================

export interface IChainAdapter {
  readonly chainId: string
  readonly chainType: ChainKind

  readonly identity: IIdentityService
  readonly asset: IAssetService
  readonly transaction: ITransactionService
  readonly chain: IChainService
  readonly staking: IStakingService | null

  initialize(): Promise<void>
  dispose(): void
}

export type AdapterFactory = (chainId: string) => IChainAdapter

export interface IAdapterRegistry {
  register(type: ChainKind, factory: AdapterFactory): void
  registerChain(chainId: string, type: ChainKind): void
  getAdapter(chainId: string): IChainAdapter | null
  hasAdapter(chainId: string): boolean
  listAdapters(): string[]
  disposeAll(): void
}

// ==================== 错误类型 ====================

export class ChainServiceError extends Error {
  readonly code: string
  readonly details: Record<string, unknown> | undefined

  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown> | undefined,
    cause?: Error | undefined,
  ) {
    super(message, { cause })
    this.name = 'ChainServiceError'
    this.code = code
    this.details = details
  }
}

export const ChainErrorCodes = {
  // 通用
  CHAIN_NOT_SUPPORTED: 'CHAIN_NOT_SUPPORTED',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_FEE: 'INSUFFICIENT_FEE',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  TRANSACTION_REJECTED: 'TRANSACTION_REJECTED',
  TRANSACTION_TIMEOUT: 'TRANSACTION_TIMEOUT',
  TX_BUILD_FAILED: 'TX_BUILD_FAILED',
  TX_BROADCAST_FAILED: 'TX_BROADCAST_FAILED',
  SIGNATURE_FAILED: 'SIGNATURE_FAILED',

  // BioForest
  ADDRESS_FROZEN: 'ADDRESS_FROZEN',
  PAYSECRET_REQUIRED: 'PAYSECRET_REQUIRED',

  // Tron
  ADDRESS_NOT_ACTIVATED: 'ADDRESS_NOT_ACTIVATED',
  ENERGY_INSUFFICIENT: 'ENERGY_INSUFFICIENT',

  // EVM
  NONCE_TOO_LOW: 'NONCE_TOO_LOW',
  GAS_TOO_LOW: 'GAS_TOO_LOW',

  // Bitcoin
  UTXO_INSUFFICIENT: 'UTXO_INSUFFICIENT',
} as const
