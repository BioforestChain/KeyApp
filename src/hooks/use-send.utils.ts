export function parseAmountToBigInt(value: string, decimals: number): bigint | null {
  const input = value.trim()
  if (!input) return null

  const parts = input.split('.')
  if (parts.length > 2) return null

  const wholeRaw = parts[0] ?? ''
  const fractionRaw = parts[1] ?? ''
  const whole = wholeRaw === '' ? '0' : wholeRaw

  if (!/^[0-9]+$/.test(whole)) return null
  if (fractionRaw && !/^[0-9]+$/.test(fractionRaw)) return null
  if (fractionRaw.length > decimals) return null

  const fraction = fractionRaw.padEnd(decimals, '0')
  const combined = `${whole}${fraction}`.replace(/^0+/, '') || '0'

  return BigInt(combined)
}
