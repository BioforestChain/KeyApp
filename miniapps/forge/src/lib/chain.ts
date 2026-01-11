/**
 * Chain utilities for Forge miniapp
 */

import { toHexChainId, EVM_CHAIN_IDS, API_CHAIN_TO_KEYAPP } from '@biochain/bio-sdk'

/** Chain types */
export type ChainType = 'evm' | 'tron' | 'bio'

/** Map API chain names to EVM hex chainId */
export const API_CHAIN_TO_HEX: Record<string, string> = {
  ETH: toHexChainId(EVM_CHAIN_IDS.ethereum),
  BSC: toHexChainId(EVM_CHAIN_IDS.binance),
}

/**
 * Get chain type from API chain name
 */
export function getChainType(apiChainName: string): ChainType {
  const upper = apiChainName.toUpperCase()
  if (upper === 'ETH' || upper === 'BSC') return 'evm'
  if (upper === 'TRON') return 'tron'
  return 'bio'
}

/**
 * Get EVM hex chainId from API chain name
 */
export function getEvmChainIdFromApi(apiChainName: string): string | null {
  return API_CHAIN_TO_HEX[apiChainName.toUpperCase()] ?? null
}

/**
 * Check if chain is EVM compatible
 */
export function isEvmChain(apiChainName: string): boolean {
  return getChainType(apiChainName) === 'evm'
}

/**
 * Check if chain is TRON
 */
export function isTronChain(apiChainName: string): boolean {
  return getChainType(apiChainName) === 'tron'
}

/** Base58 alphabet for TRON addresses */
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

/**
 * Check if address is valid TRON base58 format (starts with T, 34 chars)
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
 * Check if address is TRON hex format (starts with 41, 42 chars)
 */
export function isTronHexAddress(address: string): boolean {
  return /^41[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Check if address is EVM format (starts with 0x, 42 chars)
 */
export function isEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/i.test(address)
}

/**
 * Validate deposit address format for the given chain
 * Returns error message if invalid, null if valid
 */
export function validateDepositAddress(chain: string, address: string): string | null {
  const chainType = getChainType(chain)
  
  if (chainType === 'evm') {
    if (!isEvmAddress(address)) {
      return `Invalid EVM address format: expected 0x... (42 chars), got ${address.slice(0, 10)}...`
    }
  } else if (chainType === 'tron') {
    if (!isValidTronBase58Address(address)) {
      if (isEvmAddress(address)) {
        return `Invalid TRON address: received EVM format (0x...), expected base58 format (T...)`
      }
      if (isTronHexAddress(address)) {
        return `Invalid TRON address: received hex format (41...), expected base58 format (T...)`
      }
      return `Invalid TRON address format: expected T... (34 chars), got ${address.slice(0, 10)}...`
    }
  }
  
  return null
}
