/**
 * Bitcoin Identity Service
 * 
 * Supports multiple address types:
 * - P2WPKH (Native SegWit, bc1q...) - Default, BIP84
 * - P2TR (Taproot, bc1p...) - BIP86
 * - P2PKH (Legacy, 1...) - BIP44
 */

import type { IIdentityService, Address, Signature } from '../types'
import { sha256 } from '@noble/hashes/sha2.js'
import { ripemd160 } from '@noble/hashes/legacy.js'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { bytesToHex } from '@noble/hashes/utils.js'
import { HDKey } from '@scure/bip32'
import { bech32, bech32m, base58check } from '@scure/base'

export class BitcoinIdentityService implements IIdentityService {
  constructor(_chainId: string) {}

  async deriveAddress(seed: Uint8Array, index = 0): Promise<Address> {
    // Default to Native SegWit (P2WPKH) - BIP84: m/84'/0'/0'/0/index
    const hdKey = HDKey.fromMasterSeed(seed)
    const derived = hdKey.derive(`m/84'/0'/0'/0/${index}`)
    
    if (!derived.publicKey) {
      throw new Error('Failed to derive public key')
    }

    // P2WPKH: HASH160(compressed pubkey)
    const pubKeyHash = ripemd160(sha256(derived.publicKey))
    
    // Encode as bech32 (bc1q...)
    const words = bech32.toWords(pubKeyHash)
    return bech32.encode('bc', [0, ...words])
  }

  async deriveAddresses(seed: Uint8Array, startIndex: number, count: number): Promise<Address[]> {
    const addresses: Address[] = []
    for (let i = 0; i < count; i++) {
      addresses.push(await this.deriveAddress(seed, startIndex + i))
    }
    return addresses
  }

  isValidAddress(address: string): boolean {
    try {
      // Legacy P2PKH (starts with 1) or P2SH (starts with 3)
      if (address.startsWith('1') || address.startsWith('3')) {
        const decoded = base58check(sha256).decode(address)
        return decoded.length === 21 // 1 version + 20 hash
      }
      
      // Native SegWit P2WPKH (bc1q...)
      if (address.toLowerCase().startsWith('bc1q')) {
        const addr = address.toLowerCase() as `${string}1${string}`
        const decoded = bech32.decode(addr)
        const data = bech32.fromWords(decoded.words.slice(1))
        return decoded.prefix === 'bc' && decoded.words[0] === 0 && data.length === 20
      }
      
      // Taproot P2TR (bc1p...)
      if (address.toLowerCase().startsWith('bc1p')) {
        const addr = address.toLowerCase() as `${string}1${string}`
        const decoded = bech32m.decode(addr)
        const data = bech32m.fromWords(decoded.words.slice(1))
        return decoded.prefix === 'bc' && decoded.words[0] === 1 && data.length === 32
      }
      
      return false
    } catch {
      return false
    }
  }

  normalizeAddress(address: string): Address {
    if (address.startsWith('bc1') || address.startsWith('BC1')) {
      return address.toLowerCase()
    }
    return address
  }

  async signMessage(message: string | Uint8Array, privateKey: Uint8Array): Promise<Signature> {
    const msgBytes = typeof message === 'string' 
      ? new TextEncoder().encode(message)
      : message
    
    // Bitcoin message signing format
    const prefix = new TextEncoder().encode('\x18Bitcoin Signed Message:\n')
    const msgLen = new Uint8Array([msgBytes.length])
    const fullMsg = new Uint8Array([...prefix, ...msgLen, ...msgBytes])
    const hash = sha256(sha256(fullMsg))
    
    const sig = secp256k1.sign(hash, privateKey, { prehash: false, format: 'recovered' })
    return bytesToHex(sig)
  }

  async verifyMessage(_message: string | Uint8Array, _signature: Signature, _address: Address): Promise<boolean> {
    return false
  }
}
