/**
 * Chain ID utilities
 * Maps between KeyApp internal chain IDs and standard chain IDs
 */

/** EVM Chain ID mapping (decimal) */
export const EVM_CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  binance: 56,
  // Future chains
  // polygon: 137,
  // arbitrum: 42161,
  // optimism: 10,
} as const

/** Reverse mapping: EVM chainId -> KeyApp chain ID */
export const EVM_CHAIN_ID_TO_KEYAPP: Record<number, string> = Object.fromEntries(
  Object.entries(EVM_CHAIN_IDS).map(([key, value]) => [value, key])
)

/** API chain name to KeyApp chain ID mapping */
export const API_CHAIN_TO_KEYAPP: Record<string, string> = {
  ETH: 'ethereum',
  BSC: 'binance',
  TRON: 'tron',
  BFMCHAIN: 'bfmeta',
  BFCHAIN: 'bfchain',
  // Lowercase variants
  eth: 'ethereum',
  bsc: 'binance',
  tron: 'tron',
  bfmchain: 'bfmeta',
  bfchain: 'bfchain',
} as const

/**
 * Convert decimal chain ID to hex string (EIP-155 format)
 * @example toHexChainId(56) => '0x38'
 */
export function toHexChainId(chainId: number): string {
  return `0x${chainId.toString(16)}`
}

/**
 * Parse hex chain ID to decimal
 * @example parseHexChainId('0x38') => 56
 */
export function parseHexChainId(hexChainId: string): number {
  if (!hexChainId.startsWith('0x')) {
    throw new Error(`Invalid hex chain ID: ${hexChainId}`)
  }
  return parseInt(hexChainId, 16)
}

/**
 * Get KeyApp chain ID from EVM hex chain ID
 * @example getKeyAppChainId('0x38') => 'binance'
 */
export function getKeyAppChainId(hexChainId: string): string | null {
  const decimal = parseHexChainId(hexChainId)
  return EVM_CHAIN_ID_TO_KEYAPP[decimal] ?? null
}

/**
 * Get EVM hex chain ID from KeyApp chain ID
 * @example getEvmChainId('binance') => '0x38'
 */
export function getEvmChainId(keyAppChainId: string): string | null {
  const decimal = EVM_CHAIN_IDS[keyAppChainId]
  return decimal ? toHexChainId(decimal) : null
}

/**
 * Check if a chain is EVM compatible
 */
export function isEvmChain(chainId: string): boolean {
  return chainId in EVM_CHAIN_IDS
}

/**
 * Normalize API chain name to KeyApp chain ID
 * @example normalizeChainId('BSC') => 'binance'
 */
export function normalizeChainId(chainName: string): string {
  return API_CHAIN_TO_KEYAPP[chainName] ?? chainName.toLowerCase()
}
