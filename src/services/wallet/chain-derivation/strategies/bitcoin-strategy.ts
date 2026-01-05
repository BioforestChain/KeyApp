/**
 * Bitcoin Derivation Strategy
 *
 * Bitcoin 地址派生策略（P2PKH - Legacy）
 */

import { sha256 } from '@noble/hashes/sha2.js'
import { ripemd160 } from '@noble/hashes/legacy.js'
import type { ChainConfig } from '@/services/chain-config'
import type { DerivationStrategy, DerivationParams, ChainAddress } from '../types'

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function base58Encode(bytes: Uint8Array): string {
  const digits = [0]

  for (const byte of bytes) {
    let carry = byte
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i]! << 8
      digits[i] = carry % 58
      carry = (carry / 58) | 0
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = (carry / 58) | 0
    }
  }

  let result = ''
  for (const byte of bytes) {
    if (byte === 0) result += BASE58_ALPHABET[0]!
    else break
  }

  for (let i = digits.length - 1; i >= 0; i--) {
    result += BASE58_ALPHABET[digits[i]!]
  }

  return result
}

function publicKeyToBitcoinAddress(publicKey: Uint8Array, network: 'mainnet' | 'testnet' = 'mainnet'): string {
  const sha = sha256(publicKey)
  const hash160 = ripemd160(sha)

  const prefix = network === 'mainnet' ? 0x00 : 0x6f
  const prefixed = new Uint8Array([prefix, ...hash160])

  const checksum = sha256(sha256(prefixed)).slice(0, 4)
  const full = new Uint8Array([...prefixed, ...checksum])

  return base58Encode(full)
}

export class BitcoinStrategy implements DerivationStrategy {
  readonly chainKind = 'bitcoin' as const

  supports(config: ChainConfig): boolean {
    return config.chainKind === 'bitcoin'
  }

  derive(params: DerivationParams): ChainAddress {
    const { keyMaterial, config } = params
    const address = publicKeyToBitcoinAddress(keyMaterial.publicKey)

    return {
      chainId: config.id,
      address,
    }
  }
}
