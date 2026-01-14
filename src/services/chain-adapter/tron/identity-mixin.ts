/**
 * Identity Service Mixin
 * 
 * 使用 Mixin Factory 模式为任意类添加 Identity 服务能力。
 * 
 * @example
 * ```ts
 * class TronRpcProvider extends TronIdentityMixin(TronTransactionMixin(BaseProvider)) {
 *   // 自动获得 deriveAddress、isValidAddress 等方法
 * }
 * ```
 */

import type { IIdentityService, Address, Signature } from '../types'
import { deriveKey } from '@/lib/crypto'
import { sha256 } from '@noble/hashes/sha2.js'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { keccak_256 } from '@noble/hashes/sha3.js'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'

type Constructor<T = object> = new (...args: any[]) => T

/** Base58 alphabet used by Tron */
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/**
 * Tron Identity Mixin - 为任意类添加 Tron 地址派生和验证能力
 */
export function TronIdentityMixin<TBase extends Constructor>(Base: TBase) {
    return class TronIdentity extends Base implements IIdentityService {
        async deriveAddress(seed: Uint8Array, index = 0): Promise<Address> {
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
            if (!address.startsWith('T') || address.length !== 34) {
                return false
            }
            for (const char of address) {
                if (!ALPHABET.includes(char)) {
                    return false
                }
            }
            try {
                const decoded = this.#decodeBase58(address)
                if (decoded.length !== 25) return false
                const payload = decoded.slice(0, 21)
                const checksum = decoded.slice(21)
                const hash = sha256(sha256(payload))
                return checksum.every((byte, i) => byte === hash[i])
            } catch {
                return false
            }
        }

        #decodeBase58(str: string): Uint8Array {
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
                const sigBytes = hexToBytes(signature)
                const recoveredPubKey = secp256k1.recoverPublicKey(hash, sigBytes)
                if (!recoveredPubKey) return false
                const pubKeyHash = keccak_256(recoveredPubKey.slice(1))
                const addressBytes = pubKeyHash.slice(-20)
                const payload = new Uint8Array([0x41, ...addressBytes])
                const checksum = sha256(sha256(payload)).slice(0, 4)
                const full = new Uint8Array([...payload, ...checksum])
                const recoveredAddress = this.#encodeBase58(full)
                return recoveredAddress === address
            } catch {
                return false
            }
        }

        #encodeBase58(bytes: Uint8Array): string {
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
}
