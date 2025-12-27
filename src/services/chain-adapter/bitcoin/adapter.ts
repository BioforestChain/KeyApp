/**
 * Bitcoin Chain Adapter
 * 
 * Full adapter for Bitcoin network using mempool.space API
 */

import type { ChainConfig, ChainConfigType } from '@/services/chain-config'
import type { IChainAdapter, IStakingService } from '../types'
import { BitcoinIdentityService } from './identity-service'
import { BitcoinAssetService } from './asset-service'
import { BitcoinChainService } from './chain-service'
import { BitcoinTransactionService } from './transaction-service'

export class BitcoinAdapter implements IChainAdapter {
  readonly config: ChainConfig
  readonly identity: BitcoinIdentityService
  readonly asset: BitcoinAssetService
  readonly chain: BitcoinChainService
  readonly transaction: BitcoinTransactionService
  readonly staking: IStakingService | null = null

  constructor(config: ChainConfig) {
    this.config = config
    this.identity = new BitcoinIdentityService(config)
    this.asset = new BitcoinAssetService(config)
    this.chain = new BitcoinChainService(config)
    this.transaction = new BitcoinTransactionService(config)
  }

  get chainId(): string {
    return this.config.id
  }

  get chainType(): ChainConfigType {
    return 'bip39'
  }

  async initialize(_config: ChainConfig): Promise<void> {
    // No async initialization needed
  }

  dispose(): void {
    // No cleanup needed
  }
}
