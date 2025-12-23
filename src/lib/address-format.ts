/**
 * Address Format Detection
 *
 * Detects chain type from address format patterns.
 */

import type { ChainType } from '@/stores'
import { isValidBioforestAddress } from './crypto'

/** Address format detection result */
export interface AddressFormatInfo {
  /** Detected chain type, or null if unknown */
  chainType: ChainType | null
  /** Whether the address format is valid */
  isValid: boolean
  /** Human-readable format description */
  formatDescription: string
}

/** BioForest chain prefixes */
const BIOFOREST_PREFIXES: Record<string, ChainType> = {
  b: 'bfmeta',
  c: 'ccchain',
  p: 'pmchain',
  B: 'bfchainv2',
  g: 'btgmeta',
  w: 'biwmeta',
  e: 'ethmeta',
  m: 'malibu',
}

/**
 * Detect chain type from address format
 */
export function detectAddressFormat(address: string): AddressFormatInfo {
  if (!address || typeof address !== 'string') {
    return { chainType: null, isValid: false, formatDescription: 'Empty' }
  }

  const trimmed = address.trim()

  // Ethereum-like address (0x prefix, 40 hex chars)
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return { chainType: 'ethereum', isValid: true, formatDescription: 'Ethereum (0x...)' }
  }

  // TRON address (T prefix, 33 base58 chars)
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) {
    return { chainType: 'tron', isValid: true, formatDescription: 'TRON (T...)' }
  }

  // Bitcoin Legacy (1 prefix)
  if (/^1[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(trimmed)) {
    return { chainType: 'bitcoin', isValid: true, formatDescription: 'Bitcoin Legacy (1...)' }
  }

  // Bitcoin P2SH (3 prefix)
  if (/^3[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(trimmed)) {
    return { chainType: 'bitcoin', isValid: true, formatDescription: 'Bitcoin P2SH (3...)' }
  }

  // Bitcoin Bech32 (bc1 prefix)
  if (/^bc1[a-zA-HJ-NP-Z0-9]{25,89}$/.test(trimmed)) {
    return { chainType: 'bitcoin', isValid: true, formatDescription: 'Bitcoin Bech32 (bc1...)' }
  }

  // BioForest chain addresses
  const firstChar = trimmed[0]
  if (firstChar && firstChar in BIOFOREST_PREFIXES) {
    const chainType = BIOFOREST_PREFIXES[firstChar]
    const isValid = isValidBioforestAddress(trimmed, chainType)
    if (isValid) {
      return {
        chainType,
        isValid: true,
        formatDescription: `BioForest (${firstChar}...)`,
      }
    }
  }

  // Generic BioForest address check (any valid prefix)
  if (isValidBioforestAddress(trimmed)) {
    const chainType = BIOFOREST_PREFIXES[firstChar] ?? null
    return {
      chainType,
      isValid: true,
      formatDescription: 'BioForest',
    }
  }

  // Unknown format
  return { chainType: null, isValid: false, formatDescription: 'Unknown' }
}

/**
 * Check if address is valid for a specific chain
 */
export function isValidAddressForChain(address: string, chainType: ChainType): boolean {
  const info = detectAddressFormat(address)
  if (!info.isValid) return false
  if (info.chainType === null) return false
  return info.chainType === chainType
}

/**
 * Get all compatible chain types for an address
 */
export function getCompatibleChains(address: string): ChainType[] {
  const info = detectAddressFormat(address)
  if (!info.isValid || info.chainType === null) return []

  // Ethereum addresses are compatible with Ethereum and BSC
  if (info.chainType === 'ethereum') {
    return ['ethereum', 'binance']
  }

  return [info.chainType]
}
