/**
 * Bitcoin Chain Adapter
 *
 * Full adapter for Bitcoin network using mempool.space API
 */

import type { ChainKind } from '@/services/chain-config'
import type { IChainAdapter, IStakingService } from '../types'
import { BitcoinIdentityService } from './identity-service'
import { BitcoinAssetService } from './asset-service'
import { BitcoinChainService } from './chain-service'
import { BitcoinTransactionService } from './transaction-service'

export class BitcoinAdapter implements IChainAdapter {
  readonly chainId: string
  readonly chainType: ChainKind = 'bitcoin'
  readonly identity: BitcoinIdentityService
  readonly asset: BitcoinAssetService
  readonly chain: BitcoinChainService
  readonly transaction: BitcoinTransactionService
  readonly staking: IStakingService | null = null

  constructor(chainId: string) {
    this.chainId = chainId
    this.identity = new BitcoinIdentityService(chainId)
    this.asset = new BitcoinAssetService(chainId)
    this.chain = new BitcoinChainService(chainId)
    this.transaction = new BitcoinTransactionService(chainId)
  }

  async initialize(): Promise<void> {}

  dispose(): void {}
}

export function createBitcoinAdapter(chainId: string): IChainAdapter {
  return new BitcoinAdapter(chainId)
}
