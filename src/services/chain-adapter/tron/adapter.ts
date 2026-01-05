/**
 * Tron Chain Adapter
 *
 * Full adapter for Tron network using PublicNode HTTP API
 */

import type { ChainKind } from '@/services/chain-config'
import type { IChainAdapter, IStakingService } from '../types'
import { TronIdentityService } from './identity-service'
import { TronAssetService } from './asset-service'
import { TronChainService } from './chain-service'
import { TronTransactionService } from './transaction-service'

export class TronAdapter implements IChainAdapter {
  readonly chainId: string
  readonly chainType: ChainKind = 'tron'
  readonly identity: TronIdentityService
  readonly asset: TronAssetService
  readonly chain: TronChainService
  readonly transaction: TronTransactionService
  readonly staking: IStakingService | null = null

  constructor(chainId: string) {
    this.chainId = chainId
    this.identity = new TronIdentityService(chainId)
    this.asset = new TronAssetService(chainId)
    this.chain = new TronChainService(chainId)
    this.transaction = new TronTransactionService(chainId)
  }

  async initialize(): Promise<void> {}

  dispose(): void {}
}

export function createTronAdapter(chainId: string): IChainAdapter {
  return new TronAdapter(chainId)
}
