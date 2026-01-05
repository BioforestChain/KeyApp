/**
 * Handler Context
 * 管理小程序回调的注册中心，支持多实例
 */

import type { BioAccount, BioSignedTransaction, BioUnsignedTransaction, TransferParams } from '../types'

/** EVM 交易请求类型 */
export interface EvmTransactionRequest {
  from: string
  to?: string
  value?: string
  data?: string
  gas?: string
  gasPrice?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  nonce?: string
  chainId?: string
}

/** TRON 交易类型 */
export interface TronTransaction {
  txID: string
  raw_data: unknown
  raw_data_hex: string
  signature?: string[]
}

/** 小程序信息（用于在 Sheet 中显示） */
export interface MiniappInfo {
  name: string
  icon?: string
}

/** 签名参数 */
export interface SigningParams {
  message: string
  address: string
  app: MiniappInfo
}

/** 签名结果 */
export interface SigningResult {
  signature: string
  publicKey: string
}

/** 交易签名参数 */
export interface SignTransactionParams {
  from: string
  chain: string
  unsignedTx: BioUnsignedTransaction
  app: MiniappInfo
}

/** EVM 签名参数 */
export interface EvmSigningParams {
  message: string
  address: string
  appName: string
}

/** EVM 交易参数 */
export interface EvmTransactionParams {
  tx: EvmTransactionRequest
  appName: string
}

/** TRON 签名参数 */
export interface TronSigningParams {
  transaction: TronTransaction
  appName: string
}

/** Handler 回调接口 */
export interface HandlerCallbacks {
  // Bio (BioChain) callbacks
  showWalletPicker: (opts?: { chain?: string; exclude?: string; app?: MiniappInfo }) => Promise<BioAccount | null>
  getConnectedAccounts: () => BioAccount[]
  showSigningDialog: (params: SigningParams) => Promise<SigningResult | null>
  showTransferDialog: (params: TransferParams & { app: MiniappInfo }) => Promise<{ txHash: string } | null>
  showSignTransactionDialog: (params: SignTransactionParams) => Promise<BioSignedTransaction | null>

  // EVM (Ethereum/BSC) callbacks
  showEvmWalletPicker?: (opts: { chainId: string }) => Promise<BioAccount | null>
  showEvmSigningDialog?: (params: EvmSigningParams) => Promise<{ signature: string } | null>
  showEvmTransactionDialog?: (params: EvmTransactionParams) => Promise<{ txHash: string } | null>

  // TRON callbacks
  showTronWalletPicker?: () => Promise<BioAccount | null>
  showTronSigningDialog?: (params: TronSigningParams) => Promise<{ signedTransaction: TronTransaction } | null>
}

/** 回调注册表 */
const callbackRegistry = new Map<string, HandlerCallbacks>()

/**
 * Handler 上下文管理
 */
export const HandlerContext = {
  /**
   * 注册回调
   */
  register(appId: string, callbacks: HandlerCallbacks): void {
    callbackRegistry.set(appId, callbacks)
    console.log('[HandlerContext] Registered callbacks for:', appId)
  },

  /**
   * 注销回调
   */
  unregister(appId: string): void {
    callbackRegistry.delete(appId)
    console.log('[HandlerContext] Unregistered callbacks for:', appId)
  },

  /**
   * 获取回调
   */
  get(appId: string): HandlerCallbacks | undefined {
    return callbackRegistry.get(appId)
  },

  /**
   * 检查是否有注册的回调
   */
  has(appId: string): boolean {
    return callbackRegistry.has(appId)
  },

  /**
   * 获取所有已注册的 appId
   */
  getRegisteredApps(): string[] {
    return Array.from(callbackRegistry.keys())
  },

  /**
   * 清除所有回调（用于测试）
   */
  clear(): void {
    callbackRegistry.clear()
  },
}

/**
 * 获取指定应用的回调，如果不存在则抛出错误
 */
export function getCallbacksOrThrow(appId: string): HandlerCallbacks {
  const callbacks = HandlerContext.get(appId)
  if (!callbacks) {
    throw new Error(`No callbacks registered for app: ${appId}`)
  }
  return callbacks
}
