/**
 * BioForest Derivation Strategy
 *
 * BioForest 链地址派生策略
 * 注意：BioForest 使用 Ed25519 + SHA256 seed，与 BIP44 不同
 */

import { sha256 } from '@noble/hashes/sha2.js'
import { ripemd160 } from '@noble/hashes/legacy.js'
import { ed25519 } from '@noble/curves/ed25519.js'
import type { ChainConfig } from '@/services/chain-config'
import type { DerivationStrategy, ChainAddress } from '../types'

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function base58Encode(bytes: Uint8Array): string {
  const digits: number[] = [0]

  for (const byte of bytes) {
    let carry = byte
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i]! << 8
      digits[i] = carry % 58
      carry = Math.floor(carry / 58)
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = Math.floor(carry / 58)
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

function base58CheckEncode(payload: Uint8Array): string {
  const checksum = sha256(sha256(payload)).slice(0, 4)
  const full = new Uint8Array(payload.length + checksum.length)
  full.set(payload, 0)
  full.set(checksum, payload.length)
  return base58Encode(full)
}

export interface BioforestDerivationParams {
  mnemonic: string
  config: ChainConfig
  accountIndex: number
}

function deriveBioforestAddress(mnemonic: string, prefix = 'b'): string {
  const encoder = new TextEncoder()
  const secretBytes = encoder.encode(mnemonic)
  const seed = sha256(secretBytes)
  const publicKey = ed25519.getPublicKey(seed)
  const hash160 = ripemd160(sha256(publicKey))
  return prefix + base58CheckEncode(hash160)
}

export class BioforestStrategy implements DerivationStrategy {
  readonly chainKind = 'bioforest' as const

  supports(config: ChainConfig): boolean {
    return config.chainKind === 'bioforest'
  }

  /**
   * BioForest 使用不同的派生方式：
   * - 不使用 BIP44 派生的 keyMaterial
   * - 直接用 mnemonic 做 SHA256 生成 Ed25519 keypair
   *
   * 因此这个 strategy 需要特殊处理
   */
  derive(_params: { keyMaterial: { privateKey: Uint8Array; publicKey: Uint8Array }; config: ChainConfig; accountIndex: number }): ChainAddress {
    throw new Error('BioForest uses special derivation. Use deriveBioforest() instead.')
  }

  /**
   * BioForest 专用派生方法
   */
  deriveBioforest(params: BioforestDerivationParams): ChainAddress {
    const { mnemonic, config } = params
    const prefix = config.prefix ?? 'b'
    const address = deriveBioforestAddress(mnemonic, prefix)

    return {
      chainId: config.id,
      address,
    }
  }
}
