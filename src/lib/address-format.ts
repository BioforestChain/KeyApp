/**
 * Address Format Detection
 *
 * Detects chain type from address format patterns.
 */

import type { ChainType } from '@/stores'
import { chainConfigService } from '@/services/chain-config/service'
import { isValidBioforestAddress, isBioforestChain, type BioforestChainType } from './crypto'

/** Address format detection result */
export interface AddressFormatInfo {
  /** Detected chain type, or null if unknown */
  chainType: ChainType | null
  /** Whether the address format is valid */
  isValid: boolean
  /** Human-readable format description */
  formatDescription: string
}

/** BioForest chain prefixes (values are ChainType that are also BioforestChainType) */
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

/** Type guard to check if chainType is a BioforestChainType */
function asBioforestChain(chain: ChainType): BioforestChainType | undefined {
  return isBioforestChain(chain) ? chain : undefined
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
    if (chainType) {
      const bioforestChain = asBioforestChain(chainType)
      const isValid = isValidBioforestAddress(trimmed, bioforestChain)
      if (isValid) {
        return {
          chainType,
          isValid: true,
          formatDescription: `BioForest (${firstChar}...)`,
        }
      }
    }
  }

  // Generic BioForest address check (any valid prefix)
  if (isValidBioforestAddress(trimmed)) {
    const detectedChain = firstChar ? BIOFOREST_PREFIXES[firstChar] : null
    return {
      chainType: detectedChain ?? null,
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
  const config = chainConfigService.getConfig(chainType)
  if (config) {
    if (config.chainKind === 'bioforest') {
      return isValidBioforestAddress(address)
    }

    const info = detectAddressFormat(address)
    if (!info.isValid || info.chainType === null) return false

    switch (config.chainKind) {
      case 'evm':
        return info.chainType === 'ethereum'
      case 'tron':
        return info.chainType === 'tron'
      case 'bitcoin':
        return info.chainType === 'bitcoin'
      default:
        return false
    }
  }

  const info = detectAddressFormat(address)
  if (!info.isValid) return false
  if (info.chainType === null) return false
  
  // 完全匹配
  if (info.chainType === chainType) return true
  
  // BioForest 链之间互相兼容（共享相同密钥体系）
  if (isBioforestChain(info.chainType) && isBioforestChain(chainType)) {
    return true
  }
  
  // Ethereum 和 BSC 地址格式相同
  if ((info.chainType === 'ethereum' || info.chainType === 'binance') && 
      (chainType === 'ethereum' || chainType === 'binance')) {
    return true
  }
  
  return false
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
