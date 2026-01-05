/**
 * EVM Chain Adapter
 */

import type { ChainKind } from '@/services/chain-config'
import type { IChainAdapter, IStakingService } from '../types'
import { EvmIdentityService } from './identity-service'
import { EvmAssetService } from './asset-service'
import { EvmTransactionService } from './transaction-service'
import { EvmChainService } from './chain-service'

export class EvmAdapter implements IChainAdapter {
  readonly chainId: string
  readonly chainType: ChainKind = 'evm'

  readonly identity: EvmIdentityService
  readonly asset: EvmAssetService
  readonly transaction: EvmTransactionService
  readonly chain: EvmChainService
  readonly staking: IStakingService | null = null

  private initialized = false

  constructor(chainId: string) {
    this.chainId = chainId
    this.identity = new EvmIdentityService(chainId)
    this.asset = new EvmAssetService(chainId)
    this.transaction = new EvmTransactionService(chainId)
    this.chain = new EvmChainService(chainId)
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    this.initialized = true
  }

  dispose(): void {
    this.initialized = false
  }
}

export function createEvmAdapter(chainId: string): IChainAdapter {
  return new EvmAdapter(chainId)
}
