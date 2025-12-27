/**
 * EVM Chain Adapter
 */

import type { ChainConfig, ChainConfigType } from '@/services/chain-config'
import type { IChainAdapter, IStakingService } from '../types'
import { EvmIdentityService } from './identity-service'
import { EvmAssetService } from './asset-service'
import { EvmTransactionService } from './transaction-service'
import { EvmChainService } from './chain-service'

export class EvmAdapter implements IChainAdapter {
  readonly chainId: string
  readonly chainType: ChainConfigType = 'evm'

  readonly identity: EvmIdentityService
  readonly asset: EvmAssetService
  readonly transaction: EvmTransactionService
  readonly chain: EvmChainService
  readonly staking: IStakingService | null = null

  private initialized = false

  constructor(config: ChainConfig) {
    this.chainId = config.id
    this.identity = new EvmIdentityService(config)
    this.asset = new EvmAssetService(config)
    this.transaction = new EvmTransactionService(config)
    this.chain = new EvmChainService(config)
  }

  async initialize(_config: ChainConfig): Promise<void> {
    if (this.initialized) return
    this.initialized = true
  }

  dispose(): void {
    this.initialized = false
  }
}

export function createEvmAdapter(config: ChainConfig): IChainAdapter {
  return new EvmAdapter(config)
}
