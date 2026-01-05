/**
 * BIP39 Chain Adapter (Bitcoin, Tron)
 */

import type { ChainConfig, ChainKind } from '@/services/chain-config'
import type { IChainAdapter, IStakingService } from '../types'
import { Bip39IdentityService } from './identity-service'
import { Bip39AssetService } from './asset-service'
import { Bip39TransactionService } from './transaction-service'
import { Bip39ChainService } from './chain-service'

export class Bip39Adapter implements IChainAdapter {
  readonly chainId: string
  readonly chainType: ChainKind = 'bip39'

  readonly identity: Bip39IdentityService
  readonly asset: Bip39AssetService
  readonly transaction: Bip39TransactionService
  readonly chain: Bip39ChainService
  readonly staking: IStakingService | null = null

  private initialized = false

  constructor(config: ChainConfig) {
    this.chainId = config.id
    this.identity = new Bip39IdentityService(config)
    this.asset = new Bip39AssetService(config)
    this.transaction = new Bip39TransactionService(config)
    this.chain = new Bip39ChainService(config)
  }

  async initialize(_config: ChainConfig): Promise<void> {
    if (this.initialized) return
    this.initialized = true
  }

  dispose(): void {
    this.initialized = false
  }
}

export function createBip39Adapter(config: ChainConfig): IChainAdapter {
  return new Bip39Adapter(config)
}
