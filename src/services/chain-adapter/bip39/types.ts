/**
 * BIP39 Chain Adapter Types (Bitcoin, Tron)
 */

import type { ChainConfig } from '@/services/chain-config'

export interface Bip39ChainConfig extends ChainConfig {
  chainKind: 'bitcoin'
}

export type Bip39ChainId = 'bitcoin' | 'tron'

export function isSupportedBip39Chain(chainId: string): chainId is Bip39ChainId {
  return chainId === 'bitcoin' || chainId === 'tron'
}
