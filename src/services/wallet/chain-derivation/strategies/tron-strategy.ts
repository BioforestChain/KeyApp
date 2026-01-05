/**
 * Tron Derivation Strategy
 *
 * Tron 地址派生策略
 * 使用行业标准路径: m/44'/195'/accountIndex'/0/0
 * 兼容 TronLink、Trust Wallet、Ledger 等主流钱包
 */

import { secp256k1 } from '@noble/curves/secp256k1.js'
import { keccak_256 } from '@noble/hashes/sha3.js'
import { sha256 } from '@noble/hashes/sha2.js'
import type { ChainConfig } from '@/services/chain-config'
import type { DerivationStrategy, DerivationParams, ChainAddress } from '../types'

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

function privateKeyToTronAddress(privateKey: Uint8Array): string {
  const uncompressedPubKey = secp256k1.getPublicKey(privateKey, false)
  const pubKeyWithoutPrefix = uncompressedPubKey.slice(1)

  const hash = keccak_256(pubKeyWithoutPrefix)
  const addressBytes = hash.slice(-20)

  // Tron 主网前缀 0x41
  const prefixed = new Uint8Array([0x41, ...addressBytes])

  // Double SHA256 checksum
  const checksum = sha256(sha256(prefixed)).slice(0, 4)
  const full = new Uint8Array([...prefixed, ...checksum])

  return base58Encode(full)
}

export class TronStrategy implements DerivationStrategy {
  readonly chainKind = 'tron' as const

  supports(config: ChainConfig): boolean {
    return config.chainKind === 'tron'
  }

  derive(params: DerivationParams): ChainAddress {
    const { keyMaterial, config } = params
    const address = privateKeyToTronAddress(keyMaterial.privateKey)

    return {
      chainId: config.id,
      address,
    }
  }
}
