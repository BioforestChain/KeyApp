/**
 * Chain Provider
 * 
 * 聚合多个 ApiProvider，通过能力发现动态代理方法调用。
 */

import type { ApiProvider, ApiProviderMethod, Balance, Transaction, FeeEstimate } from './types'
import type { Amount } from '@/types/amount'

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
   * 查找实现了某方法的 Provider，返回绑定好的方法
   */
  private getMethod<K extends ApiProviderMethod>(method: K): ApiProvider[K] | undefined {
    const provider = this.providers.find(p => typeof p[method] === 'function')
    if (!provider) return undefined
    const fn = provider[method]
    if (typeof fn !== 'function') return undefined
    return fn.bind(provider) as ApiProvider[K]
  }

  // ===== 便捷属性：检查能力 =====

  get supportsNativeBalance(): boolean {
    return this.supports('getNativeBalance')
  }

  get supportsTransactionHistory(): boolean {
    return this.supports('getTransactionHistory')
  }

  get supportsTransaction(): boolean {
    return this.supports('getTransaction')
  }

  get supportsFeeEstimate(): boolean {
    return this.supports('estimateFee')
  }

  get supportsBroadcast(): boolean {
    return this.supports('broadcastTransaction')
  }

  get supportsBlockHeight(): boolean {
    return this.supports('getBlockHeight')
  }

  // ===== 代理方法 =====

  get getNativeBalance(): ((address: string) => Promise<Balance>) | undefined {
    return this.getMethod('getNativeBalance')
  }

  get getTransactionHistory(): ((address: string, limit?: number) => Promise<Transaction[]>) | undefined {
    return this.getMethod('getTransactionHistory')
  }

  get getTransaction(): ((hash: string) => Promise<Transaction | null>) | undefined {
    return this.getMethod('getTransaction')
  }

  get estimateFee(): ((from: string, to: string, amount: Amount) => Promise<FeeEstimate>) | undefined {
    return this.getMethod('estimateFee')
  }

  get broadcastTransaction(): ((signedTx: string) => Promise<string>) | undefined {
    return this.getMethod('broadcastTransaction')
  }

  get getBlockHeight(): (() => Promise<bigint>) | undefined {
    return this.getMethod('getBlockHeight')
  }

  /** 获取所有 Provider */
  getProviders(): readonly ApiProvider[] {
    return this.providers
  }

  /** 获取指定类型的 Provider */
  getProviderByType(type: string): ApiProvider | undefined {
    return this.providers.find(p => p.type === type)
  }
}
