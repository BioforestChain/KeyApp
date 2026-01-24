/**
 * Tron address helpers
 *
 * - Base58Check <-> Hex (41-prefixed) conversion
 * - Normalization helpers for comparisons
 */

import { base58check } from '@scure/base'
import { sha256 } from '@noble/hashes/sha2.js'

const tronBase58 = base58check(sha256)

function stripHexPrefix(value: string): string {
  return value.startsWith('0x') || value.startsWith('0X') ? value.slice(2) : value
}

function isHex(value: string): boolean {
  return /^[0-9a-fA-F]+$/.test(value)
}

function hexToBytes(hex: string): Uint8Array {
  const normalized = stripHexPrefix(hex)
  if (normalized.length % 2 !== 0 || !isHex(normalized)) {
    throw new Error(`Invalid hex: ${hex}`)
  }
  const bytes = new Uint8Array(normalized.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(normalized.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export function tronAddressToHex(address: string): string {
  const trimmed = address.trim()
  const noPrefix = stripHexPrefix(trimmed)

  if (noPrefix.length === 42 && isHex(noPrefix) && noPrefix.startsWith('41')) {
    return noPrefix
  }

  if (!trimmed.startsWith('T')) {
    throw new Error(`Invalid Tron address: ${address}`)
  }

  const decoded = tronBase58.decode(trimmed)
  // base58check decode returns payload without checksum; Tron payload is 21 bytes (41 + 20)
  if (decoded.length !== 21) {
    throw new Error(`Invalid Tron address length: ${address}`)
  }
  return bytesToHex(decoded)
}

export function tronHexToAddress(hex: string): string {
  const normalized = stripHexPrefix(hex).toLowerCase()
  if (!isHex(normalized)) {
    throw new Error(`Invalid Tron hex address: ${hex}`)
  }
  const withPrefix = normalized.length === 40 ? `41${normalized}` : normalized
  if (withPrefix.length !== 42) {
    throw new Error(`Invalid Tron hex length: ${hex}`)
  }
  const bytes = hexToBytes(withPrefix)
  return tronBase58.encode(bytes)
}

export function normalizeTronAddress(address: string): string {
  const trimmed = address.trim()
  if (trimmed.startsWith('T')) {
    return trimmed
  }
  return tronHexToAddress(trimmed)
}

export function normalizeTronHex(address: string): string {
  return tronAddressToHex(address).toLowerCase()
}
