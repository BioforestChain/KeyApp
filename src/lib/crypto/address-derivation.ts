/**
 * Unified Address Derivation
 * 
 * Supports deriving addresses for all chain types:
 * - bioforest: Ed25519-based chains (BFMeta, CCChain, etc.)
 * - evm: Ethereum-compatible chains (Ethereum, BSC, etc.)
 * - bip39: BIP44-based chains (Bitcoin, Tron)
 */

import type { ChainConfig } from '@/services/chain-config'
import { deriveBioforestAddressesFromChainConfigs } from './bioforest'
import { deriveKey, deriveBitcoinKey, type BitcoinPurpose } from './derivation'

export interface DerivedAddress {
  chainId: string
  address: string
  /** 公钥 (hex) */
  publicKey: string
}

/**
 * Derive addresses for multiple chains based on their type
 * 
 * @param secret - Mnemonic phrase or secret key
 * @param chainConfigs - Array of chain configurations to derive addresses for
 * @returns Array of derived addresses with their chain IDs
 */
export function deriveAddressesForChains(
  secret: string,
  chainConfigs: readonly ChainConfig[],
): DerivedAddress[] {
  const results: DerivedAddress[] = []

  // Group chains by type
  const bioforestChains = chainConfigs.filter((c) => c.chainKind === 'bioforest')
  const evmChains = chainConfigs.filter((c) => c.chainKind === 'evm')
  const bip39Chains = chainConfigs.filter((c) => c.chainKind === 'bitcoin')

  // Derive bioforest addresses (Ed25519-based, same address for all chains with same prefix)
  if (bioforestChains.length > 0) {
    const bioforestAddresses = deriveBioforestAddressesFromChainConfigs(secret, bioforestChains)
    results.push(...bioforestAddresses)
  }

  // Derive EVM addresses (secp256k1-based, same address for all EVM chains)
  if (evmChains.length > 0) {
    const evmKey = deriveKey(secret, 'ethereum', 0, 0)
    for (const chain of evmChains) {
      results.push({
        chainId: chain.id,
        address: evmKey.address,
        publicKey: evmKey.publicKey,
      })
    }
  }

  // Derive BIP39 addresses (chain-specific derivation paths)
  for (const chain of bip39Chains) {
    const derived = deriveBip39Key(secret, chain)
    if (derived) {
      results.push({
        chainId: chain.id,
        address: derived.address,
        publicKey: derived.publicKey,
      })
    }
  }

  return results
}

/**
 * Derive key for a BIP39-based chain
 */
function deriveBip39Key(secret: string, chain: ChainConfig): { address: string; publicKey: string } | null {
  switch (chain.id) {
    case 'bitcoin': {
      // Use Native SegWit (BIP84) as default for Bitcoin
      const btcKey = deriveBitcoinKey(secret, 84 as BitcoinPurpose, 0, 0)
      return { address: btcKey.address, publicKey: btcKey.publicKey }
    }
    case 'tron': {
      const tronKey = deriveKey(secret, 'tron', 0, 0)
      return { address: tronKey.address, publicKey: tronKey.publicKey }
    }
    default:
      // Unknown BIP39 chain - skip
      console.warn(`[deriveAddressesForChains] Unknown BIP39 chain: ${chain.id}`)
      return null
  }
}

/**
 * Check if a mnemonic can derive addresses for the given chain type
 */
export function canDeriveForChainType(chainType: ChainConfig['type']): boolean {
  return chainType === 'bioforest' || chainType === 'evm' || chainType === 'bip39'
}
