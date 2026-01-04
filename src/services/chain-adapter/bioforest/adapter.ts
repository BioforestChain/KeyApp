/**
 * BioForest Chain Adapter
 */

import type { ChainConfigType } from '@/services/chain-config'
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
  readonly staking: IStakingService | null = null

  private initialized = false

  constructor(chainId: string) {
    this.chainId = chainId
    this.identity = new BioforestIdentityService(chainId)
    this.asset = new BioforestAssetService(chainId)
    this.transaction = new BioforestTransactionService(chainId)
    this.chain = new BioforestChainService(chainId)
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    this.initialized = true
  }

  dispose(): void {
    this.initialized = false
  }
}

export function createBioforestAdapter(chainId: string): IChainAdapter {
  return new BioforestAdapter(chainId)
}
