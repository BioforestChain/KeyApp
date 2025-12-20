/**
 * BioForest Chain Adapter
 */

import type { ChainConfig, ChainConfigType } from '@/services/chain-config'
import type { IChainAdapter, IStakingService } from '../types'
import { BioforestIdentityService } from './identity-service'
import { BioforestAssetService } from './asset-service'
import { BioforestTransactionService } from './transaction-service'
import { BioforestChainService } from './chain-service'

export class BioforestAdapter implements IChainAdapter {
  readonly chainId: string
  readonly chainType: ChainConfigType = 'bioforest'

  readonly identity: BioforestIdentityService
  readonly asset: BioforestAssetService
  readonly transaction: BioforestTransactionService
  readonly chain: BioforestChainService
  readonly staking: IStakingService | null = null // TODO: Implement staking

  private initialized = false

  constructor(config: ChainConfig) {
    this.chainId = config.id
    this.identity = new BioforestIdentityService(config)
    this.asset = new BioforestAssetService(config)
    this.transaction = new BioforestTransactionService(config)
    this.chain = new BioforestChainService(config)
  }

  async initialize(_config: ChainConfig): Promise<void> {
    if (this.initialized) return

    // Perform any async initialization
    // e.g., load chain-specific SDK, verify connection

    this.initialized = true
  }

  dispose(): void {
    // Clean up resources
    this.initialized = false
  }
}

export function createBioforestAdapter(config: ChainConfig): IChainAdapter {
  return new BioforestAdapter(config)
}
