/**
 * Tron Chain Adapter
 * 
 * Full adapter for Tron network using PublicNode HTTP API
 */

import type { ChainConfig, ChainConfigType } from '@/services/chain-config'
import type { IChainAdapter, IStakingService } from '../types'
import { TronIdentityService } from './identity-service'
import { TronAssetService } from './asset-service'
import { TronChainService } from './chain-service'
import { TronTransactionService } from './transaction-service'

export class TronAdapter implements IChainAdapter {
  readonly config: ChainConfig
  readonly identity: TronIdentityService
  readonly asset: TronAssetService
  readonly chain: TronChainService
  readonly transaction: TronTransactionService
  readonly staking: IStakingService | null = null

  constructor(config: ChainConfig) {
    this.config = config
    this.identity = new TronIdentityService(config)
    this.asset = new TronAssetService(config)
    this.chain = new TronChainService(config)
    this.transaction = new TronTransactionService(config)
  }

  get chainId(): string {
    return this.config.id
  }

  get chainType(): ChainConfigType {
    return 'tron'
  }

  async initialize(_config: ChainConfig): Promise<void> {
    // No async initialization needed
  }

  dispose(): void {
    // No cleanup needed
  }
}
