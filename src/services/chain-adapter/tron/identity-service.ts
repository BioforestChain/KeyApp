/**
 * Tron Identity Service
 *
 * Uses unified derivation from @/lib/crypto/derivation.ts
 */

import type { IIdentityService, Address, Signature } from '../types'
import { deriveKey } from '@/lib/crypto'
import { sha256 } from '@noble/hashes/sha2.js'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { keccak_256 } from '@noble/hashes/sha3.js'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'

/** Base58 alphabet used by Tron */
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

export class TronIdentityService implements IIdentityService {
  

  async deriveAddress(seed: Uint8Array, index = 0): Promise<Address> {
    // seed is UTF-8 encoded mnemonic string
    const mnemonic = new TextDecoder().decode(seed)
    const derived = deriveKey(mnemonic, 'tron', index)
    return derived.address
  }

  async deriveAddresses(seed: Uint8Array, startIndex: number, count: number): Promise<Address[]> {
    const mnemonic = new TextDecoder().decode(seed)
    const addresses: Address[] = []
    for (let i = 0; i < count; i++) {
      const derived = deriveKey(mnemonic, 'tron', startIndex + i)
      addresses.push(derived.address)
    }
    return addresses
  }

  isValidAddress(address: string): boolean {
    // Tron addresses start with 'T' and are 34 characters
    if (!address.startsWith('T') || address.length !== 34) {
      return false
    }

    // Validate base58 characters
    for (const char of address) {
      if (!ALPHABET.includes(char)) {
        return false
      }
    }

    // Validate checksum
    try {
      const decoded = this.decodeBase58(address)
      if (decoded.length !== 25) return false

      const payload = decoded.slice(0, 21)
      const checksum = decoded.slice(21)
      const hash = sha256(sha256(payload))
      
      return checksum.every((byte, i) => byte === hash[i])
    } catch {
      return false
    }
  }

  private decodeBase58(str: string): Uint8Array {
    let num = BigInt(0)
    for (const char of str) {
      const index = ALPHABET.indexOf(char)
      if (index === -1) throw new Error(`Invalid base58 character: ${char}`)
      num = num * 58n + BigInt(index)
    }

    const hex = num.toString(16).padStart(50, '0')
    const bytes = new Uint8Array(25)
    for (let i = 0; i < 25; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    }
    return bytes
  }

  normalizeAddress(address: string): Address {
    return address
  }

  async signMessage(message: string | Uint8Array, privateKey: Uint8Array): Promise<Signature> {
    const msgBytes = typeof message === 'string' 
      ? new TextEncoder().encode(message)
      : message
    
    // Tron uses keccak256 for message hashing
    const prefix = new TextEncoder().encode('\x19TRON Signed Message:\n' + msgBytes.length)
    const hash = keccak_256(new Uint8Array([...prefix, ...msgBytes]))
    
    const sig = secp256k1.sign(hash, privateKey, { prehash: false, format: 'recovered' })
    return bytesToHex(sig)
  }

  async verifyMessage(message: string | Uint8Array, signature: Signature, address: Address): Promise<boolean> {
    try {
      const msgBytes = typeof message === 'string' 
        ? new TextEncoder().encode(message)
        : message
      
      const prefix = new TextEncoder().encode('\x19TRON Signed Message:\n' + msgBytes.length)
      const hash = keccak_256(new Uint8Array([...prefix, ...msgBytes]))
      
      // Parse signature bytes (65 bytes: r[32] + s[32] + v[1])
      const sigBytes = hexToBytes(signature)
      const recoveredPubKey = secp256k1.recoverPublicKey(hash, sigBytes)
      if (!recoveredPubKey) return false

      // Derive address from recovered public key and compare
      const pubKeyHash = keccak_256(recoveredPubKey.slice(1))
      const addressBytes = pubKeyHash.slice(-20)
      
      // Add Tron prefix (0x41) and encode to base58check
      const payload = new Uint8Array([0x41, ...addressBytes])
      const checksum = sha256(sha256(payload)).slice(0, 4)
      const full = new Uint8Array([...payload, ...checksum])
      const recoveredAddress = this.encodeBase58(full)
      
      return recoveredAddress === address
    } catch {
      return false
    }
  }

  private encodeBase58(bytes: Uint8Array): string {
    let num = BigInt(0)
    for (const byte of bytes) {
      num = num * 256n + BigInt(byte)
    }

    let result = ''
    while (num > 0n) {
      const rem = Number(num % 58n)
      num = num / 58n
      result = ALPHABET[rem] + result
    }

    // Handle leading zeros
    for (const byte of bytes) {
      if (byte === 0) {
        result = ALPHABET[0] + result
      } else {
        break
      }
    }

    return result
  }
}
