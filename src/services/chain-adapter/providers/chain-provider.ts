/**
 * Chain Provider
 * 
 * 聚合多个 ApiProvider，通过能力发现动态代理方法调用。
 */

import type { 
  ApiProvider, 
  ApiProviderMethod, 
  Balance, 
  TokenBalance,
  Transaction, 
  TransactionStatus,
  FeeEstimate,
  TransferParams,
  UnsignedTransaction,
  SignedTransaction,
} from './types'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'

const SYNC_METHODS = new Set<ApiProviderMethod>(['isValidAddress', 'normalizeAddress'])

const READ_METHODS = new Set<ApiProviderMethod>([
  'getNativeBalance',
  'getTokenBalances',
  'getTransactionHistory',
  'getTransaction',
  'getTransactionStatus',
  'getBlockHeight',
])

export class ChainProvider {
  readonly chainId: string
  private readonly providers: ApiProvider[]

  constructor(chainId: string, providers: ApiProvider[]) {
    this.chainId = chainId
    this.providers = providers
  }

  /**
   * 检查是否有 Provider 支持某方法
   */
  supports(method: ApiProviderMethod): boolean {
    return this.providers.some(p => typeof p[method] === 'function')
  }

  /**
   * 查找实现了某方法的 Provider，返回自动 fallback 的方法
   */
  private getMethod<K extends ApiProviderMethod>(method: K): ApiProvider[K] | undefined {
    const candidates = this.providers.filter((p) => typeof p[method] === 'function')
    if (candidates.length === 0) return undefined

    const first = candidates[0]
    const firstFn = first[method]
    if (typeof firstFn !== 'function') return undefined

    if (SYNC_METHODS.has(method)) {
      return firstFn.bind(first) as ApiProvider[K]
    }

    const fn = (async (...args: unknown[]) => {
      let lastError: unknown = null

      for (const provider of candidates) {
        const impl = provider[method]
        if (typeof impl !== 'function') continue
        try {
          return await (impl as (...args: unknown[]) => Promise<unknown>).apply(provider, args)
        } catch (error) {
          lastError = error
        }
      }

      if (READ_METHODS.has(method)) {
        return this.getReadDefault(method)
      }

      throw lastError instanceof Error ? lastError : new Error('All providers failed')
    }) as ApiProvider[K]

    return fn
  }

  private getReadDefault(method: ApiProviderMethod): unknown {
    switch (method) {
      case 'getNativeBalance': {
        const decimals = chainConfigService.getDecimals(this.chainId)
        const symbol = chainConfigService.getSymbol(this.chainId)
        const balance: Balance = {
          amount: Amount.zero(decimals, symbol),
          symbol,
        }
        return balance
      }
      case 'getTokenBalances':
        return [] as TokenBalance[]
      case 'getTransactionHistory':
        return [] as Transaction[]
      case 'getTransaction':
        return null as Transaction | null
      case 'getTransactionStatus': {
        const status: TransactionStatus = {
          status: 'pending',
          confirmations: 0,
          requiredConfirmations: 1,
        }
        return status
      }
      case 'getBlockHeight':
        return 0n
      default:
        return null
    }
  }

  // ===== 便捷属性：检查查询能力 =====

  get supportsNativeBalance(): boolean {
    return this.supports('getNativeBalance')
  }

  get supportsTokenBalances(): boolean {
    return this.supports('getTokenBalances')
  }

  get supportsTransactionHistory(): boolean {
    return this.supports('getTransactionHistory')
  }

  get supportsTransaction(): boolean {
    return this.supports('getTransaction')
  }

  get supportsBlockHeight(): boolean {
    return this.supports('getBlockHeight')
  }

  // ===== 便捷属性：检查交易能力 =====

  get supportsFeeEstimate(): boolean {
    return this.supports('estimateFee')
  }

  get supportsBuildTransaction(): boolean {
    return this.supports('buildTransaction')
  }

  get supportsSignTransaction(): boolean {
    return this.supports('signTransaction')
  }

  get supportsBroadcast(): boolean {
    return this.supports('broadcastTransaction')
  }

  /** 是否支持完整交易流程 (构建 + 签名 + 广播) */
  get supportsFullTransaction(): boolean {
    return this.supportsBuildTransaction && this.supportsSignTransaction && this.supportsBroadcast
  }

  // ===== 便捷属性：检查身份能力 =====

  get supportsDeriveAddress(): boolean {
    return this.supports('deriveAddress')
  }

  get supportsAddressValidation(): boolean {
    return this.supports('isValidAddress')
  }

  // ===== 代理方法：查询 =====

  get getNativeBalance(): ((address: string) => Promise<Balance>) | undefined {
    return this.getMethod('getNativeBalance')
  }

  get getTokenBalances(): ((address: string) => Promise<TokenBalance[]>) | undefined {
    return this.getMethod('getTokenBalances')
  }

  get getTransactionHistory(): ((address: string, limit?: number) => Promise<Transaction[]>) | undefined {
    return this.getMethod('getTransactionHistory')
  }

  get getTransaction(): ((hash: string) => Promise<Transaction | null>) | undefined {
    return this.getMethod('getTransaction')
  }

  get getTransactionStatus(): ((hash: string) => Promise<TransactionStatus>) | undefined {
    return this.getMethod('getTransactionStatus')
  }

  get getBlockHeight(): (() => Promise<bigint>) | undefined {
    return this.getMethod('getBlockHeight')
  }

  // ===== 代理方法：交易 =====

  get estimateFee(): ((params: TransferParams) => Promise<FeeEstimate>) | undefined {
    return this.getMethod('estimateFee')
  }

  get buildTransaction(): ((params: TransferParams) => Promise<UnsignedTransaction>) | undefined {
    return this.getMethod('buildTransaction')
  }

  get signTransaction(): ((unsignedTx: UnsignedTransaction, privateKey: Uint8Array) => Promise<SignedTransaction>) | undefined {
    return this.getMethod('signTransaction')
  }

  get broadcastTransaction(): ((signedTx: SignedTransaction) => Promise<string>) | undefined {
    return this.getMethod('broadcastTransaction')
  }

  // ===== 代理方法：身份 =====

  get deriveAddress(): ((seed: Uint8Array, index?: number) => Promise<string>) | undefined {
    return this.getMethod('deriveAddress')
  }

  get deriveAddresses(): ((seed: Uint8Array, startIndex: number, count: number) => Promise<string[]>) | undefined {
    return this.getMethod('deriveAddresses')
  }

  get isValidAddress(): ((address: string) => boolean) | undefined {
    return this.getMethod('isValidAddress')
  }

  get normalizeAddress(): ((address: string) => string) | undefined {
    return this.getMethod('normalizeAddress')
  }

  // ===== 工具方法 =====

  /** 获取所有 Provider */
  getProviders(): readonly ApiProvider[] {
    return this.providers
  }

  /** 获取指定类型的 Provider */
  getProviderByType(type: string): ApiProvider | undefined {
    return this.providers.find(p => p.type === type)
  }
}
