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
  /** Current price in USD (for fiat value calculation) */
  priceUsd?: number | undefined
  /** 24-hour price change percentage (e.g., 2.5 for +2.5%, -1.3 for -1.3%) */
  priceChange24h?: number | undefined
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

/** Currency configuration for fiat formatting */
export interface CurrencyConfig {
  code: string
  locale: string
}

/** Default currency configs */
export const currencyConfigs: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', locale: 'en-US' },
  CNY: { code: 'CNY', locale: 'zh-CN' },
  EUR: { code: 'EUR', locale: 'de-DE' },
  JPY: { code: 'JPY', locale: 'ja-JP' },
  KRW: { code: 'KRW', locale: 'ko-KR' },
}

/**
 * Calculate and format fiat value from asset amount and price
 * @param amount Raw amount string (in smallest unit)
 * @param decimals Token decimal places
 * @param priceUsd Price per token in USD
 * @param currency Target currency code (default: USD)
 * @returns Formatted fiat value string (e.g., "$1,234.56")
 */
export function formatFiatValue(
  amount: string,
  decimals: number,
  priceUsd: number,
  currency: string = 'USD'
): string {
  if (!amount || amount === '0' || !priceUsd) return '$0.00'

  // Convert to number for calculation
  const value = Number(amount) / 10 ** decimals
  const fiatValue = value * priceUsd

  // Get currency config with fallback to USD
  const config: CurrencyConfig = currencyConfigs[currency] ?? { code: 'USD', locale: 'en-US' }

  // Format with Intl.NumberFormat
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(fiatValue)
}

/**
 * Format 24h price change percentage
 * @param change Percentage change (e.g., 2.5 for +2.5%, -1.3 for -1.3%)
 * @returns Formatted string with sign (e.g., "+2.50%", "-1.30%")
 */
export function formatPriceChange(change: number | undefined): string {
  if (change === undefined || change === null) return ''
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}
