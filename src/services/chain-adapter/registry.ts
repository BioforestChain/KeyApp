/**
 * 链适配器注册表
 */

import type { ChainConfig, ChainConfigType } from '@/services/chain-config'
import type { IChainAdapter, IAdapterRegistry, AdapterFactory } from './types'
import { ChainServiceError, ChainErrorCodes } from './types'

class AdapterRegistry implements IAdapterRegistry {
  private factories = new Map<ChainConfigType, AdapterFactory>()
  private adapters = new Map<string, IChainAdapter>()
  private configs = new Map<string, ChainConfig>()

  register(type: ChainConfigType, factory: AdapterFactory): void {
    this.factories.set(type, factory)
  }

  setChainConfigs(configs: ChainConfig[]): void {
    this.configs.clear()
    for (const config of configs) {
      this.configs.set(config.id, config)
    }
  }

  getAdapter(chainId: string): IChainAdapter | null {
    // Return cached adapter
    const cached = this.adapters.get(chainId)
    if (cached) return cached

    // Get config
    const config = this.configs.get(chainId)
    if (!config) return null

    // Get factory
    const factory = this.factories.get(config.type)
    if (!factory) {
      throw new ChainServiceError(
        ChainErrorCodes.CHAIN_NOT_SUPPORTED,
        `No adapter factory registered for chain type: ${config.type}`,
      )
    }

    // Create and cache adapter
    const adapter = factory(config)
    this.adapters.set(chainId, adapter)
    return adapter
  }

  hasAdapter(chainId: string): boolean {
    if (this.adapters.has(chainId)) return true

    const config = this.configs.get(chainId)
    if (!config) return false

    return this.factories.has(config.type)
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

// Singleton instance
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
