/**
 * Bitcoin Identity Service
 * 
 * Supports multiple address types:
 * - P2WPKH (Native SegWit, bc1q...) - Default, BIP84
 * - P2TR (Taproot, bc1p...) - BIP86
 * - P2PKH (Legacy, 1...) - BIP44
 */

import type { ChainConfig } from '@/services/chain-config'
import type { IIdentityService, Address, Signature } from '../types'
import { sha256 } from '@noble/hashes/sha2.js'
import { ripemd160 } from '@noble/hashes/legacy.js'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { bytesToHex } from '@noble/hashes/utils.js'
import { HDKey } from '@scure/bip32'

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'

export class BitcoinIdentityService implements IIdentityService {
  constructor(_config: ChainConfig) {}

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
    const words = this.convertBits(pubKeyHash, 8, 5, true)
    return this.bech32Encode('bc', [0, ...words])
  }

  /** Convert between bit groups */
  private convertBits(data: Uint8Array, fromBits: number, toBits: number, pad: boolean): number[] {
    let acc = 0
    let bits = 0
    const ret: number[] = []
    const maxv = (1 << toBits) - 1
    
    for (const value of data) {
      acc = (acc << fromBits) | value
      bits += fromBits
      while (bits >= toBits) {
        bits -= toBits
        ret.push((acc >> bits) & maxv)
      }
    }
    
    if (pad && bits > 0) {
      ret.push((acc << (toBits - bits)) & maxv)
    }
    
    return ret
  }

  /** Bech32 polymod for checksum */
  private bech32Polymod(values: number[]): number {
    const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
    let chk = 1
    for (const v of values) {
      const top = chk >> 25
      chk = ((chk & 0x1ffffff) << 5) ^ v
      for (let i = 0; i < 5; i++) {
        if ((top >> i) & 1) chk ^= GEN[i]!
      }
    }
    return chk
  }

  /** Expand HRP for checksum calculation */
  private bech32HrpExpand(hrp: string): number[] {
    const ret: number[] = []
    for (const c of hrp) {
      ret.push(c.charCodeAt(0) >> 5)
    }
    ret.push(0)
    for (const c of hrp) {
      ret.push(c.charCodeAt(0) & 31)
    }
    return ret
  }

  /** Create bech32 checksum */
  private bech32CreateChecksum(hrp: string, data: number[]): number[] {
    const values = [...this.bech32HrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0]
    const polymod = this.bech32Polymod(values) ^ 1
    const ret: number[] = []
    for (let p = 0; p < 6; p++) {
      ret.push((polymod >> (5 * (5 - p))) & 31)
    }
    return ret
  }

  /** Encode to bech32 */
  private bech32Encode(hrp: string, data: number[]): string {
    const combined = [...data, ...this.bech32CreateChecksum(hrp, data)]
    let ret = hrp + '1'
    for (const d of combined) {
      ret += BECH32_CHARSET[d]
    }
    return ret
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
      // Legacy P2PKH (starts with 1)
      if (address.startsWith('1')) {
        return this.validateBase58Check(address, 0x00)
      }
      
      // Legacy P2SH (starts with 3)
      if (address.startsWith('3')) {
        return this.validateBase58Check(address, 0x05)
      }
      
      // Native SegWit P2WPKH (bc1q...) or Taproot P2TR (bc1p...)
      if (address.toLowerCase().startsWith('bc1')) {
        const decoded = this.bech32Decode(address.toLowerCase())
        if (!decoded) return false
        
        // P2WPKH: version 0, 20-byte program
        if (decoded.words[0] === 0) {
          const program = this.convertBits(new Uint8Array(decoded.words.slice(1)), 5, 8, false)
          return program.length === 20
        }
        
        // P2TR: version 1, 32-byte program
        if (decoded.words[0] === 1) {
          const program = this.convertBits(new Uint8Array(decoded.words.slice(1)), 5, 8, false)
          return program.length === 32
        }
        
        return false
      }
      
      return false
    } catch {
      return false
    }
  }

  /** Decode bech32 address */
  private bech32Decode(address: string): { prefix: string; words: number[] } | null {
    const pos = address.lastIndexOf('1')
    if (pos < 1 || pos + 7 > address.length) return null
    
    const prefix = address.slice(0, pos)
    const data = address.slice(pos + 1)
    
    const words: number[] = []
    for (const c of data) {
      const idx = BECH32_CHARSET.indexOf(c)
      if (idx === -1) return null
      words.push(idx)
    }
    
    // Verify checksum
    const values = [...this.bech32HrpExpand(prefix), ...words]
    if (this.bech32Polymod(values) !== 1) return null
    
    // Remove checksum
    return { prefix, words: words.slice(0, -6) }
  }

  private validateBase58Check(address: string, expectedVersion: number): boolean {
    try {
      const decoded = this.decodeBase58(address)
      if (decoded.length !== 25) return false
      if (decoded[0] !== expectedVersion) return false
      
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
    // Bitcoin addresses are case-sensitive for base58, lowercase for bech32
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
    // Bitcoin message verification requires public key recovery
    // For simplicity, return false - can be extended later
    return false
  }
}
