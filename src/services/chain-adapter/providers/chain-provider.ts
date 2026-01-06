/**
 * Chain Provider
 * 
 * 聚合多个 ApiProvider，通过能力发现动态代理方法调用。
 * 
 * 查询方法返回 ProviderResult<T>，区分"查询成功"与"fallback到默认值"。
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
  ProviderResult,
} from './types'
import { createSupportedResult, createFallbackResult } from './types'
import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'

const SYNC_METHODS = new Set<ApiProviderMethod>(['isValidAddress', 'normalizeAddress'])

import { TransactionSchema } from './types'
import { InvalidDataError } from './errors'

export class ChainProvider {
  readonly chainId: string
  private readonly providers: ApiProvider[]

  constructor(chainId: string, providers: ApiProvider[]) {
    this.chainId = chainId
    this.providers = providers
  }

  /**
   * 检查是否有 Provider 支持某方法
   * 
   * 除了检查方法是否存在，还会检查 provider 是否有对应的 supportsXxx 属性。
   * 如果 supportsXxx 明确为 false，则认为该 provider 不支持此方法。
   */
  supports(method: ApiProviderMethod): boolean {
    return this.getCandidates(method).length > 0
  }

  /**
   * 获取真正支持某方法的 Provider 列表
   * 
   * 过滤掉明确声明不支持的 provider（supportsXxx = false）
   */
  private getCandidates(method: ApiProviderMethod): ApiProvider[] {
    return this.providers.filter(p => {
      if (typeof p[method] !== 'function') return false
      
      // 检查是否有明确的能力声明
      // 例如: getTransactionHistory -> supportsTransactionHistory
      const methodName = method.startsWith('get') ? method.slice(3) : method
      const capabilityKey = `supports${methodName.charAt(0).toUpperCase()}${methodName.slice(1)}` as keyof ApiProvider
      const capability = p[capabilityKey]
      if (typeof capability === 'boolean') {
        return capability
      }
      
      return true
    })
  }

  /**
   * 查找实现了某方法的 Provider，返回自动 fallback 的方法（用于非查询方法）
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

  // ===== 查询方法的默认值 =====

  private getDefaultBalance(): Balance {
    const decimals = chainConfigService.getDecimals(this.chainId)
    const symbol = chainConfigService.getSymbol(this.chainId)
    return {
      amount: Amount.zero(decimals, symbol),
      symbol,
    }
  }

  private getDefaultTransactionStatus(): TransactionStatus {
    return {
      status: 'pending',
      confirmations: 0,
      requiredConfirmations: 1,
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

  // ===== 查询方法（返回 ProviderResult<T>） =====

  /**
   * 查询原生代币余额
   * @returns ProviderResult<Balance> - supported: true 表示查询成功，false 表示 fallback 到默认值
   */
  async getNativeBalance(address: string): Promise<ProviderResult<Balance>> {
    const candidates = this.providers.filter(p => typeof p.getNativeBalance === 'function')
    
    if (candidates.length === 0) {
      return createFallbackResult(
        this.getDefaultBalance(),
        'No provider implements getNativeBalance'
      )
    }

    let lastError: unknown = null
    for (const provider of candidates) {
      try {
        const balance = await provider.getNativeBalance!(address)
        return createSupportedResult(balance)
      } catch (error) {
        lastError = error
      }
    }

    const errorMsg = lastError instanceof Error ? lastError.message : 'Unknown error'
    return createFallbackResult(
      this.getDefaultBalance(),
      `All ${candidates.length} provider(s) failed. Last error: ${errorMsg}`
    )
  }

  /**
   * 查询所有代币余额
   * @returns ProviderResult<TokenBalance[]> - supported: true 表示查询成功，false 表示 fallback 到默认值
   */
  async getTokenBalances(address: string): Promise<ProviderResult<TokenBalance[]>> {
    const candidates = this.providers.filter(p => typeof p.getTokenBalances === 'function')
    
    if (candidates.length === 0) {
      return createFallbackResult(
        [],
        'No provider implements getTokenBalances'
      )
    }

    let lastError: unknown = null
    for (const provider of candidates) {
      try {
        const tokens = await provider.getTokenBalances!(address)
        return createSupportedResult(tokens)
      } catch (error) {
        lastError = error
      }
    }

    const errorMsg = lastError instanceof Error ? lastError.message : 'Unknown error'
    return createFallbackResult(
      [],
      `All ${candidates.length} provider(s) failed. Last error: ${errorMsg}`
    )
  }

  /**
   * 查询交易历史（带数据验证）
   * @returns ProviderResult<Transaction[]> - supported: true 表示查询成功，false 表示 fallback 到默认值
   */
  async getTransactionHistory(address: string, limit = 20): Promise<ProviderResult<Transaction[]>> {
    const candidates = this.getCandidates('getTransactionHistory')
    
    if (candidates.length === 0) {
      return createFallbackResult(
        [],
        'No provider implements getTransactionHistory'
      )
    }

    let lastError: unknown = null
    for (const provider of candidates) {
      try {
        const raw: unknown = await provider.getTransactionHistory!(address, limit)
        
        // 数据验证
        if (!Array.isArray(raw)) {
          console.warn('[ChainProvider] Invalid transaction history payload (not array)', {
            chainId: this.chainId,
            method: 'getTransactionHistory',
          })
          continue
        }

        const parsed: Transaction[] = []
        let invalidCount = 0
        let firstIssue: unknown = null

        for (const item of raw) {
          const result = TransactionSchema.safeParse(item)
          if (result.success) {
            parsed.push(result.data)
          } else {
            invalidCount += 1
            if (!firstIssue) firstIssue = result.error.issues[0]
          }
        }

        if (invalidCount > 0) {
          console.warn('[ChainProvider] Dropped invalid transactions from history', {
            chainId: this.chainId,
            method: 'getTransactionHistory',
            invalidCount,
            totalCount: raw.length,
            firstIssue,
          })
        }

        return createSupportedResult(parsed)
      } catch (error) {
        lastError = error
      }
    }

    const errorMsg = lastError instanceof Error ? lastError.message : 'Unknown error'
    return createFallbackResult(
      [],
      `All ${candidates.length} provider(s) failed. Last error: ${errorMsg}`
    )
  }

  /**
   * 查询单笔交易（带数据验证）
   * @returns ProviderResult<Transaction | null> - supported: true 表示查询成功，false 表示 fallback 到默认值
   */
  async getTransaction(hash: string): Promise<ProviderResult<Transaction | null>> {
    const candidates = this.providers.filter(p => typeof p.getTransaction === 'function')
    
    if (candidates.length === 0) {
      return createFallbackResult(
        null,
        'No provider implements getTransaction'
      )
    }

    let lastError: unknown = null
    for (const provider of candidates) {
      try {
        const raw: unknown = await provider.getTransaction!(hash)
        if (raw === null || raw === undefined) {
          return createSupportedResult(null)
        }

        const parsed = TransactionSchema.safeParse(raw)
        if (!parsed.success) {
          throw new InvalidDataError({
            source: 'provider',
            chainId: this.chainId,
            method: 'getTransaction',
            issues: parsed.error.issues,
          })
        }

        return createSupportedResult(parsed.data)
      } catch (error) {
        lastError = error
      }
    }

    const errorMsg = lastError instanceof Error ? lastError.message : 'Unknown error'
    return createFallbackResult(
      null,
      `All ${candidates.length} provider(s) failed. Last error: ${errorMsg}`
    )
  }

  /**
   * 获取交易状态
   * @returns ProviderResult<TransactionStatus> - supported: true 表示查询成功，false 表示 fallback 到默认值
   */
  async getTransactionStatus(hash: string): Promise<ProviderResult<TransactionStatus>> {
    const candidates = this.providers.filter(p => typeof p.getTransactionStatus === 'function')
    
    if (candidates.length === 0) {
      return createFallbackResult(
        this.getDefaultTransactionStatus(),
        'No provider implements getTransactionStatus'
      )
    }

    let lastError: unknown = null
    for (const provider of candidates) {
      try {
        const status = await provider.getTransactionStatus!(hash)
        return createSupportedResult(status)
      } catch (error) {
        lastError = error
      }
    }

    const errorMsg = lastError instanceof Error ? lastError.message : 'Unknown error'
    return createFallbackResult(
      this.getDefaultTransactionStatus(),
      `All ${candidates.length} provider(s) failed. Last error: ${errorMsg}`
    )
  }

  /**
   * 获取当前区块高度
   * @returns ProviderResult<bigint> - supported: true 表示查询成功，false 表示 fallback 到默认值
   */
  async getBlockHeight(): Promise<ProviderResult<bigint>> {
    const candidates = this.providers.filter(p => typeof p.getBlockHeight === 'function')
    
    if (candidates.length === 0) {
      return createFallbackResult(
        0n,
        'No provider implements getBlockHeight'
      )
    }

    let lastError: unknown = null
    for (const provider of candidates) {
      try {
        const height = await provider.getBlockHeight!()
        return createSupportedResult(height)
      } catch (error) {
        lastError = error
      }
    }

    const errorMsg = lastError instanceof Error ? lastError.message : 'Unknown error'
    return createFallbackResult(
      0n,
      `All ${candidates.length} provider(s) failed. Last error: ${errorMsg}`
    )
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
