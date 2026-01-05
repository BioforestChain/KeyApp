/**
 * 链适配器注册表
 */

import type { ChainKind } from '@/services/chain-config'
import type { IChainAdapter, IAdapterRegistry, AdapterFactory } from './types'
import { ChainServiceError, ChainErrorCodes } from './types'

class AdapterRegistry implements IAdapterRegistry {
  private factories = new Map<ChainKind, AdapterFactory>()
  private adapters = new Map<string, IChainAdapter>()
  private chainTypes = new Map<string, ChainKind>()

  register(type: ChainKind, factory: AdapterFactory): void {
    this.factories.set(type, factory)
  }

  registerChain(chainId: string, type: ChainKind): void {
    this.chainTypes.set(chainId, type)
  }

  getAdapter(chainId: string): IChainAdapter | null {
    const cached = this.adapters.get(chainId)
    if (cached) return cached

    const type = this.chainTypes.get(chainId)
    if (!type) return null

    const factory = this.factories.get(type)
    if (!factory) {
      throw new ChainServiceError(
        ChainErrorCodes.CHAIN_NOT_SUPPORTED,
        `No adapter factory registered for chain type: ${type}`,
      )
    }

    const adapter = factory(chainId)
    this.adapters.set(chainId, adapter)
    return adapter
  }

  hasAdapter(chainId: string): boolean {
    if (this.adapters.has(chainId)) return true

    const type = this.chainTypes.get(chainId)
    if (!type) return false

    return this.factories.has(type)
  }

  listAdapters(): string[] {
    return [...this.adapters.keys()]
  }

  disposeAll(): void {
    for (const adapter of this.adapters.values()) {
      adapter.dispose()
    }
    this.adapters.clear()
  }
}

let registryInstance: AdapterRegistry | null = null

export function getAdapterRegistry(): IAdapterRegistry {
  if (!registryInstance) {
    registryInstance = new AdapterRegistry()
  }
  return registryInstance
}

export function resetAdapterRegistry(): void {
  if (registryInstance) {
    registryInstance.disposeAll()
    registryInstance = null
  }
}
