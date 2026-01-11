export type TruncationMode = 'full' | 'auto' | 'compact' | 'standard' | 'detailed'

export interface TruncationPreset {
  start: number
  end: number
}

export const TRUNCATION_PRESETS: Record<Exclude<TruncationMode, 'full' | 'auto'>, TruncationPreset> = {
  compact: { start: 6, end: 4 },
  standard: { start: 8, end: 6 },
  detailed: { start: 10, end: 8 },
}

export function truncateAddress(
  address: string,
  mode: TruncationMode | TruncationPreset = 'standard',
): string {
  if (!address) return ''
  
  if (mode === 'full') return address
  
  if (mode === 'auto') {
    return address
  }
  
  const preset = typeof mode === 'string' ? TRUNCATION_PRESETS[mode] : mode
  const { start, end } = preset
  const ellipsis = '...'
  
  if (address.length <= start + end + ellipsis.length) {
    return address
  }
  
  return `${address.slice(0, start)}${ellipsis}${address.slice(-end)}`
}

export function truncateAddressAuto(
  address: string,
  maxWidth: number,
  font: string,
  measureFn: (text: string, font: string) => number,
): string {
  const ellipsis = '...'
  const fullWidth = measureFn(address, font)

  if (fullWidth <= maxWidth) return address

  const ellipsisWidth = measureFn(ellipsis, font)
  const availableWidth = maxWidth - ellipsisWidth

  if (availableWidth <= 0) return ellipsis

  const charWidth = measureFn(address.charAt(0), font)
  const totalCharsAvailable = Math.floor(availableWidth / charWidth)

  let startChars: number
  let endChars: number
  const minChars = 4

  if (totalCharsAvailable < minChars * 2) {
    startChars = Math.max(2, Math.floor(totalCharsAvailable / 2))
    endChars = Math.max(2, totalCharsAvailable - startChars)
  } else {
    startChars = Math.ceil(totalCharsAvailable * 0.55)
    endChars = totalCharsAvailable - startChars
  }

  const maxStart = address.length - endChars - 1
  startChars = Math.min(startChars, maxStart)

  if (startChars + endChars >= address.length) return address

  return `${address.slice(0, startChars)}${ellipsis}${address.slice(-endChars)}`
}
