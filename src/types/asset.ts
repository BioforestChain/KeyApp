/**
 * Asset display types
 * Based on mpay $AddressAssetsTypeV2 pattern
 */

import { Amount } from './amount'

/** Single asset/token information */
export interface AssetInfo {
  /** Token identifier (ETH, USDT, BFM, etc.) */
  assetType: string
  /** Balance as Amount object */
  amount: Amount
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
 * @param amount Amount object or raw string
 * @param decimals Token decimal places (only used if amount is string)
 * @param priceUsd Price per token in USD
 * @param options Formatting options
 * @returns Formatted fiat value string (e.g., "$1,234.56")
 */
export function formatFiatValue(
  amount: Amount | string,
  decimals: number,
  priceUsd: number,
  options?: FormatFiatOptions | string
): string {
  const opts: FormatFiatOptions =
    typeof options === 'string' ? { currency: options } : options ?? {}

  const { currency = 'USD', exchangeRate, locale } = opts

  const config: CurrencyConfig = currencyConfigs[currency] ?? {
    code: 'USD',
    locale: 'en-US',
  }

  const formatLocale = locale ?? config.locale

  // Convert Amount or string to number
  let value: number
  if (amount instanceof Amount) {
    value = amount.toNumber()
  } else {
    if (!amount || amount === '0') {
      value = 0
    } else {
      value = Number(amount) / 10 ** decimals
    }
  }

  if (value === 0 || !priceUsd) {
    return new Intl.NumberFormat(formatLocale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(0)
  }

  let fiatValue = value * priceUsd

  if (exchangeRate !== undefined && currency !== 'USD') {
    fiatValue = convertFiat(fiatValue, exchangeRate)
  }

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

/**
 * Create AssetInfo from raw data (e.g., from API)
 */
export function createAssetInfo(data: {
  assetType: string
  amount: string // raw or formatted string
  decimals: number
  logoUrl?: string
  contractAddress?: string
  name?: string
  priceUsd?: number
  priceChange24h?: number
}): AssetInfo {
  return {
    assetType: data.assetType,
    amount: Amount.parse(data.amount, data.decimals, data.assetType),
    decimals: data.decimals,
    logoUrl: data.logoUrl,
    contractAddress: data.contractAddress,
    name: data.name,
    priceUsd: data.priceUsd,
    priceChange24h: data.priceChange24h,
  }
}
