/**
 * EVM Derivation Strategy
 *
 * EVM 链（Ethereum/BSC/Polygon 等）地址派生策略
 */

import { secp256k1 } from '@noble/curves/secp256k1.js'
import { keccak_256 } from '@noble/hashes/sha3.js'
import { bytesToHex } from '@noble/hashes/utils.js'
import type { ChainConfig } from '@/services/chain-config'
import type { DerivationStrategy, DerivationParams, ChainAddress } from '../types'

function privateKeyToEvmAddress(privateKey: Uint8Array): string {
  const uncompressedPubKey = secp256k1.getPublicKey(privateKey, false)
  const pubKeyWithoutPrefix = uncompressedPubKey.slice(1)
  const hash = keccak_256(pubKeyWithoutPrefix)
  const address = hash.slice(-20)
  return '0x' + bytesToHex(address)
}

function toChecksumAddress(address: string): string {
  const addr = address.toLowerCase().replace('0x', '')
  const encoder = new TextEncoder()
  const hash = bytesToHex(keccak_256(encoder.encode(addr)))

  let checksumAddress = '0x'
  for (let i = 0; i < addr.length; i++) {
    if (parseInt(hash[i]!, 16) >= 8) {
      checksumAddress += addr[i]!.toUpperCase()
    } else {
      checksumAddress += addr[i]!
    }
  }

  return checksumAddress
}

export class EvmStrategy implements DerivationStrategy {
  readonly chainKind = 'evm' as const

  supports(config: ChainConfig): boolean {
    return config.chainKind === 'evm'
  }

  derive(params: DerivationParams): ChainAddress {
    const { keyMaterial, config } = params
    const rawAddress = privateKeyToEvmAddress(keyMaterial.privateKey)
    const address = toChecksumAddress(rawAddress)

    return {
      chainId: config.id,
      address,
    }
  }
}
