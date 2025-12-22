/**
 * 链适配器类型定义
 */

import type { ChainConfig, ChainConfigType } from '@/services/chain-config'
import { Amount } from '@/types/amount'

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

// ==================== 交易 ====================

export interface TransferParams {
  from: Address
  to: Address
  amount: Amount
  tokenAddress?: Address
  memo?: string
}

export interface UnsignedTransaction {
  chainId: string
  data: unknown // chain-specific transaction data
}

export interface SignedTransaction {
  chainId: string
  data: unknown
  signature: Signature
}

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

export interface IAssetService {
  getNativeBalance(address: Address): Promise<Balance>
  getTokenBalance(address: Address, tokenAddress: Address): Promise<Balance>
  getTokenBalances(address: Address): Promise<Balance[]>
  getTokenMetadata(tokenAddress: Address): Promise<TokenMetadata>
}

export interface ITransactionService {
  estimateFee(params: TransferParams): Promise<FeeEstimate>
  buildTransaction(params: TransferParams): Promise<UnsignedTransaction>
  signTransaction(unsignedTx: UnsignedTransaction, privateKey: Uint8Array): Promise<SignedTransaction>
  broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash>
  getTransactionStatus(hash: TransactionHash): Promise<TransactionStatus>
  getTransaction(hash: TransactionHash): Promise<Transaction | null>
  getTransactionHistory(address: Address, limit?: number): Promise<Transaction[]>
}

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
  readonly chainType: ChainConfigType

  readonly identity: IIdentityService
  readonly asset: IAssetService
  readonly transaction: ITransactionService
  readonly chain: IChainService
  readonly staking: IStakingService | null

  initialize(config: ChainConfig): Promise<void>
  dispose(): void
}

export type AdapterFactory = (config: ChainConfig) => IChainAdapter

export interface IAdapterRegistry {
  register(type: ChainConfigType, factory: AdapterFactory): void
  setChainConfigs(configs: ChainConfig[]): void
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
  NETWORK_ERROR: 'NETWORK_ERROR',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_FEE: 'INSUFFICIENT_FEE',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  TRANSACTION_REJECTED: 'TRANSACTION_REJECTED',
  TRANSACTION_TIMEOUT: 'TRANSACTION_TIMEOUT',

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
