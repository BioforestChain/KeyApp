/**
 * Asset display types
 * Based on mpay $AddressAssetsTypeV2 pattern
 */

/** Single asset/token information */
export interface AssetInfo {
  /** Token identifier (ETH, USDT, BFM, etc.) */
  assetType: string
  /** Balance as string for decimal precision */
  amount: string
  /** Decimal places for formatting */
  decimals: number
  /** Token icon URL (optional, fallback to letter) */
  logoUrl?: string | undefined
  /** Smart contract address (for ERC20 tokens) */
  contractAddress?: string | undefined
  /** Display name (optional, defaults to assetType) */
  name?: string | undefined
}

/** Chain with its assets */
export interface ChainAssets {
  /** Chain identifier */
  chain: string
  /** Wallet address on this chain */
  address: string
  /** Assets on this chain */
  assets: AssetInfo[]
}

/** Asset store state */
export interface AssetState {
  /** Assets grouped by chain address */
  chainAssets: ChainAssets[]
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
}

/** Format raw amount with decimals */
export function formatAssetAmount(amount: string, decimals: number): string {
  if (!amount || amount === '0') return '0'

  const value = BigInt(amount)
  const divisor = BigInt(10 ** decimals)
  const integerPart = value / divisor
  const fractionalPart = value % divisor

  if (fractionalPart === 0n) {
    return integerPart.toString()
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  // Trim trailing zeros
  const trimmed = fractionalStr.replace(/0+$/, '')

  return `${integerPart}.${trimmed}`
}
