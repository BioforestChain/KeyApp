/**
 * Unified Address Derivation
 *
 * Supports deriving addresses for all chain kinds:
 * - bioforest: Ed25519-based chains (BFMeta, CCChain, etc.)
 * - evm: Ethereum-compatible chains (Ethereum, BSC, etc.)
 * - bitcoin: BIP84 Native SegWit (bc1q...)
 * - tron: TRC-20 compatible (T...)
 */

import type { ChainConfig, ChainKind } from '@/services/chain-config'
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

  // Group chains by chainKind
  const bioforestChains = chainConfigs.filter((c) => c.chainKind === 'bioforest')
  const evmChains = chainConfigs.filter((c) => c.chainKind === 'evm')
  const bitcoinChains = chainConfigs.filter((c) => c.chainKind === 'bitcoin')
  const tronChains = chainConfigs.filter((c) => c.chainKind === 'tron')

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

  // Derive Bitcoin addresses (BIP84 Native SegWit)
  if (bitcoinChains.length > 0) {
    const btcKey = deriveBitcoinKey(secret, 84 as BitcoinPurpose, 0, 0)
    for (const chain of bitcoinChains) {
      results.push({
        chainId: chain.id,
        address: btcKey.address,
        publicKey: btcKey.publicKey,
      })
    }
  }

  // Derive Tron addresses
  if (tronChains.length > 0) {
    const tronKey = deriveKey(secret, 'tron', 0, 0)
    for (const chain of tronChains) {
      results.push({
        chainId: chain.id,
        address: tronKey.address,
        publicKey: tronKey.publicKey,
      })
    }
  }

  return results
}

/**
 * Check if a mnemonic can derive addresses for the given chain kind
 */
export function canDeriveForChainType(chainKind: ChainKind): boolean {
  return chainKind === 'bioforest' || chainKind === 'evm' || chainKind === 'bitcoin' || chainKind === 'tron'
}
