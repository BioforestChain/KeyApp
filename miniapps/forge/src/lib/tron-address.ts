/**
 * TRON Address Conversion Utilities
 * 
 * Converts between TRON Hex format (41...) and Base58 format (T...)
 */

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/**
 * Base58 encode a buffer
 */
function encodeBase58(buffer: Uint8Array): string {
  const digits: number[] = [0]

  for (const byte of buffer) {
    let carry = byte
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i] << 8
      digits[i] = carry % 58
      carry = (carry / 58) | 0
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = (carry / 58) | 0
    }
  }

  // Handle leading zeros
  let leadingZeros = ''
  for (const byte of buffer) {
    if (byte === 0) {
      leadingZeros += BASE58_ALPHABET[0]
    } else {
      break
    }
  }

  return leadingZeros + digits.toReversed().map(d => BASE58_ALPHABET[d]).join('')
}

/**
 * SHA256 hash using Web Crypto API
 */
async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer)
  return new Uint8Array(hashBuffer)
}

/**
 * Check if address is TRON Hex format (41 + 40 hex chars)
 */
export function isTronHexAddress(address: string): boolean {
  return /^41[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Check if address is valid TRON Base58 format (starts with T, 34 chars)
 */
export function isValidTronBase58Address(address: string): boolean {
  if (!address || address.length !== 34 || !address.startsWith('T')) {
    return false
  }
  for (const char of address) {
    if (!BASE58_ALPHABET.includes(char)) {
      return false
    }
  }
  return true
}

/**
 * Convert TRON Hex address to Base58 format
 * 
 * @param hexAddress - TRON hex address (41 + 40 hex chars)
 * @returns Base58 encoded address (starts with T)
 * @throws Error if invalid hex format
 */
export async function tronHexToBase58(hexAddress: string): Promise<string> {
  let hex = hexAddress.toLowerCase()
  if (hex.startsWith('0x')) {
    hex = hex.slice(2)
  }

  if (!isTronHexAddress(hex)) {
    throw new Error(`Invalid TRON hex address: ${hexAddress}`)
  }

  // Convert hex to bytes
  const addressBytes = new Uint8Array(hex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)))

  // Calculate checksum: SHA256(SHA256(address)) first 4 bytes
  const hash1 = await sha256(addressBytes)
  const hash2 = await sha256(hash1)
  const checksum = hash2.slice(0, 4)

  // Concatenate address + checksum
  const payload = new Uint8Array(addressBytes.length + checksum.length)
  payload.set(addressBytes)
  payload.set(checksum, addressBytes.length)

  return encodeBase58(payload)
}
