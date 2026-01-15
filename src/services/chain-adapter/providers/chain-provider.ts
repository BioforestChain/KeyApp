/**
 * Chain Provider
 * 
 * 聚合多个 ApiProvider，通过能力发现动态代理方法调用。
 * 
 * 响应式设计：使用 KeyFetchInstance 属性替代异步方法
 * 错误处理：NoSupportError 表示不支持，AggregateError 表示全部失败
 */

import { merge, type KeyFetchInstance } from '@biochain/key-fetch'
import type {
  ApiProvider,
  ApiProviderMethod,
  FeeEstimate,
  TransactionIntent,
  SignOptions,
  UnsignedTransaction,
  SignedTransaction,
} from './types'
import {
  BalanceOutputSchema,
  TokenBalancesOutputSchema,
  TransactionsOutputSchema,
  TransactionOutputSchema,
  BlockHeightOutputSchema,
} from './types'

const SYNC_METHODS = new Set<ApiProviderMethod>(['isValidAddress', 'normalizeAddress'])

export class ChainProvider {
  readonly chainId: string
  private readonly providers: ApiProvider[]

  constructor(chainId: string, providers: ApiProvider[]) {
    this.chainId = chainId
    this.providers = providers
  }
  /**
   * 检查是否有 Provider 支持某能力
   */
  supports(capability: 'nativeBalance' | 'tokenBalances' | 'transactionHistory' | 'blockHeight' | ApiProviderMethod): boolean {
    // 响应式属性检查
    if (capability === 'nativeBalance') {
      return this.providers.some(p => p.nativeBalance !== undefined)
    }
    if (capability === 'tokenBalances') {
      return this.providers.some(p => p.tokenBalances !== undefined)
    }
    if (capability === 'transactionHistory') {
      return this.providers.some(p => p.transactionHistory !== undefined)
    }
    if (capability === 'blockHeight') {
      return this.providers.some(p => p.blockHeight !== undefined)
    }

    // 方法检查（包括 ITransactionService 方法，通过 extends Partial 继承）
    return this.providers.some(p => typeof p[capability as ApiProviderMethod] === 'function')
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

      throw lastError instanceof Error ? lastError : new Error('All providers failed')
    }) as ApiProvider[K]

    return fn
  }

  // ===== 默认值 =====

  // Preserved for potential future use
  // private _getDefaultBalance(): Balance {
  //   const decimals = chainConfigService.getDecimals(this.chainId)
  //   const symbol = chainConfigService.getSymbol(this.chainId)
  //   return {
  //     amount: Amount.zero(decimals, symbol),
  //     symbol,
  //   }
  // }


  // ===== 便捷属性：检查能力 =====

  get supportsNativeBalance(): boolean {
    return this.supports('nativeBalance')
  }

  get supportsTokenBalances(): boolean {
    return this.supports('tokenBalances')
  }

  get supportsTransactionHistory(): boolean {
    return this.supports('transactionHistory')
  }

  get supportsBlockHeight(): boolean {
    return this.supports('blockHeight')
  }

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

  get supportsFullTransaction(): boolean {
    return this.supportsBuildTransaction && this.supportsSignTransaction && this.supportsBroadcast
  }

  get supportsDeriveAddress(): boolean {
    return this.supports('deriveAddress')
  }

  get supportsAddressValidation(): boolean {
    return this.supports('isValidAddress')
  }

  // ===== 响应式查询：获取 KeyFetchInstance =====

  /**
     * 获取第一个支持 nativeBalance 的 Provider 的 KeyFetchInstance
     * 使用 merge() 实现 auto-fallback，返回非可空类型
     */
  get nativeBalance(): KeyFetchInstance<typeof BalanceOutputSchema> {
    const sources = this.providers
      .map(p => p.nativeBalance)
      .filter((f): f is NonNullable<typeof f> => f !== undefined)
    return merge({
      name: `${this.chainId}.nativeBalance`,
      sources,
    })
  }

  get tokenBalances(): KeyFetchInstance<typeof TokenBalancesOutputSchema> {
    const sources = this.providers
      .map(p => p.tokenBalances)
      .filter((f): f is NonNullable<typeof f> => f !== undefined)
    return merge({
      name: `${this.chainId}.tokenBalances`,
      sources,
    })
  }

  get transactionHistory(): KeyFetchInstance<typeof TransactionsOutputSchema> {
    const sources = this.providers
      .map(p => p.transactionHistory)
      .filter((f): f is NonNullable<typeof f> => f !== undefined)
    return merge({
      name: `${this.chainId}.transactionHistory`,
      sources,
    })
  }

  get transaction(): KeyFetchInstance<typeof TransactionOutputSchema> {
    const sources = this.providers
      .map(p => p.transaction)
      .filter((f): f is NonNullable<typeof f> => f !== undefined)
    return merge({
      name: `${this.chainId}.transaction`,
      sources,
    })
  }

  get blockHeight(): KeyFetchInstance<typeof BlockHeightOutputSchema> {
    const sources = this.providers
      .map(p => p.blockHeight)
      .filter((f): f is NonNullable<typeof f> => f !== undefined)
    return merge({
      name: `${this.chainId}.blockHeight`,
      sources,
    })
  }

  // 错误处理：
  // - 空数组 → NoSupportError (isSupported = !(error instanceof NoSupportError))
  // - 全部失败 → AggregateError (错误列表显示)

  // ===== 代理方法：交易（ITransactionService）=====

  get buildTransaction(): ((intent: TransactionIntent) => Promise<UnsignedTransaction>) | undefined {
    return this.getMethod('buildTransaction')
  }

  get estimateFee(): ((unsignedTx: UnsignedTransaction) => Promise<FeeEstimate>) | undefined {
    return this.getMethod('estimateFee')
  }

  get signTransaction(): ((unsignedTx: UnsignedTransaction, options: SignOptions) => Promise<SignedTransaction>) | undefined {
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

  // ===== IBioAccountService 代理（BioChain 专属）=====

  get bioGetAccountInfo() {
    return this.getMethod('bioGetAccountInfo')
  }

  get bioVerifyPayPassword() {
    return this.getMethod('bioVerifyPayPassword')
  }

  get supportsBioAccountInfo(): boolean {
    return this.supports('bioGetAccountInfo')
  }

  // ===== 工具方法 =====

  getProviders(): readonly ApiProvider[] {
    return this.providers
  }

  getProviderByType(type: string): ApiProvider | undefined {
    return this.providers.find(p => p.type === type)
  }
}
