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
 * Convert USD amount to target currency
 * @param usdAmount - Amount in USD
 * @param rate - Exchange rate (1 USD = rate target currency)
 * @returns Converted amount in target currency
 */
export function convertFiat(usdAmount: number, rate: number): number {
  return usdAmount * rate
}

/** Options for formatFiatValue function */
export interface FormatFiatOptions {
  /** Target currency code (default: 'USD') */
  currency?: string
  /** Exchange rate from USD to target currency (1 USD = rate target currency) */
  exchangeRate?: number
  /** Locale for number formatting (defaults to currency's locale) */
  locale?: string
}

/**
 * Calculate and format fiat value from asset amount and price
 *
 * Overload 1: Legacy signature (backward compatible)
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
  currency?: string
): string
/**
 * Overload 2: Extended signature with options object
 * @param amount Raw amount string (in smallest unit)
 * @param decimals Token decimal places
 * @param priceUsd Price per token in USD
 * @param options Formatting options including currency and exchange rate
 * @returns Formatted fiat value string
 */
export function formatFiatValue(
  amount: string,
  decimals: number,
  priceUsd: number,
  options?: FormatFiatOptions
): string
export function formatFiatValue(
  amount: string,
  decimals: number,
  priceUsd: number,
  currencyOrOptions?: string | FormatFiatOptions
): string {
  // Parse options - support both legacy string and new options object
  const options: FormatFiatOptions =
    typeof currencyOrOptions === 'string'
      ? { currency: currencyOrOptions }
      : currencyOrOptions ?? {}

  const { currency = 'USD', exchangeRate, locale } = options

  // Get currency config with fallback to USD
  const config: CurrencyConfig = currencyConfigs[currency] ?? {
    code: 'USD',
    locale: 'en-US',
  }

  // Use provided locale or default to currency's locale
  const formatLocale = locale ?? config.locale

  // Handle zero/empty values - format with target currency
  if (!amount || amount === '0' || !priceUsd) {
    return new Intl.NumberFormat(formatLocale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0)
  }

  // Convert to number for calculation
  const value = Number(amount) / 10 ** decimals
  let fiatValue = value * priceUsd

  // Apply exchange rate if provided and currency is not USD
  if (exchangeRate !== undefined && currency !== 'USD') {
    fiatValue = convertFiat(fiatValue, exchangeRate)
  }

  // Format with Intl.NumberFormat
  return new Intl.NumberFormat(formatLocale, {
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
