export interface FormatAmountResult {
  formatted: string
  isNegative: boolean
  isZero: boolean
  numValue: number
}

export interface FormatAmountOptions {
  decimals?: number
  compact?: boolean
}

export function formatAmount(
  value: string | number,
  options: FormatAmountOptions = {},
): FormatAmountResult {
  const { decimals = 8, compact = false } = options
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) {
    return { formatted: '0', isNegative: false, isZero: true, numValue: 0 }
  }

  const isNegative = num < 0
  const isZero = num === 0
  const absNum = Math.abs(num)

  let formatted: string

  if (isZero) {
    formatted = '0'
  } else if (compact && absNum >= 1_000_000_000) {
    formatted = (absNum / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'B'
  } else if (compact && absNum >= 1_000_000) {
    formatted = (absNum / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M'
  } else if (compact && absNum >= 1_000) {
    formatted = (absNum / 1_000).toFixed(2).replace(/\.?0+$/, '') + 'K'
  } else {
    formatted = absNum.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    })
  }

  return { formatted, isNegative, isZero, numValue: num }
}

export function formatNumberToString(
  num: number,
  minDecimals: number,
  maxDecimals: number,
): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  })
}

export function getEffectiveDecimals(num: number, maxDecimals: number): number {
  if (num === 0) return 0
  const str = Math.abs(num).toFixed(maxDecimals)
  const decimalPart = str.split('.')[1] || ''
  const trimmed = decimalPart.replace(/0+$/, '')
  return trimmed.length
}
