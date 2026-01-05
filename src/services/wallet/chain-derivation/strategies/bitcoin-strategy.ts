/**
 * Bitcoin Derivation Strategy
 *
 * Bitcoin 地址派生策略 - BIP84 Native SegWit (bc1q...)
 * 注意：此策略接收的 keyMaterial 应来自 BIP84 路径 m/84'/0'/account'/0/0
 */

import { sha256 } from '@noble/hashes/sha2.js'
import { ripemd160 } from '@noble/hashes/legacy.js'
import { bech32 } from '@scure/base'
import type { ChainConfig } from '@/services/chain-config'
import type { DerivationStrategy, DerivationParams, ChainAddress } from '../types'

/**
 * 从压缩公钥生成 BIP84 Native SegWit 地址 (bc1q...)
 */
function publicKeyToNativeSegwitAddress(publicKey: Uint8Array, network: 'mainnet' | 'testnet' = 'mainnet'): string {
  // P2WPKH: HASH160(compressed pubkey)
  const pubKeyHash = ripemd160(sha256(publicKey))

  // Encode as bech32 with witness version 0
  const words = bech32.toWords(pubKeyHash)
  const prefix = network === 'mainnet' ? 'bc' : 'tb'
  return bech32.encode(prefix, [0, ...words])
}

export class BitcoinStrategy implements DerivationStrategy {
  readonly chainKind = 'bitcoin' as const

  supports(config: ChainConfig): boolean {
    return config.chainKind === 'bitcoin'
  }

  derive(params: DerivationParams): ChainAddress {
    const { keyMaterial, config } = params
    const address = publicKeyToNativeSegwitAddress(keyMaterial.publicKey)

    return {
      chainId: config.id,
      address,
    }
  }
}
