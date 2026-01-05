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
