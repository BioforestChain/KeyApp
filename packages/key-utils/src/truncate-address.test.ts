import { describe, it, expect } from 'vitest'
import { truncateAddress, TRUNCATION_PRESETS } from './truncate-address'

describe('truncateAddress', () => {
  const longAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'

  it('returns empty string for empty input', () => {
    expect(truncateAddress('')).toBe('')
  })

  it('returns full address when mode is full', () => {
    expect(truncateAddress(longAddress, 'full')).toBe(longAddress)
  })

  it('truncates with compact preset (6+4)', () => {
    const result = truncateAddress(longAddress, 'compact')
    expect(result).toBe('0x742d...f44e')
  })

  it('truncates with standard preset (8+6)', () => {
    const result = truncateAddress(longAddress, 'standard')
    expect(result).toBe('0x742d35...38f44e')
  })

  it('truncates with detailed preset (10+8)', () => {
    const result = truncateAddress(longAddress, 'detailed')
    expect(result).toBe('0x742d35Cc...4438f44e')
  })

  it('returns short address unchanged', () => {
    const shortAddress = '0x1234'
    expect(truncateAddress(shortAddress, 'compact')).toBe(shortAddress)
  })

  it('supports custom preset', () => {
    const result = truncateAddress(longAddress, { start: 4, end: 4 })
    expect(result).toBe('0x74...f44e')
  })
})

describe('TRUNCATION_PRESETS', () => {
  it('has correct compact preset', () => {
    expect(TRUNCATION_PRESETS.compact).toEqual({ start: 6, end: 4 })
  })

  it('has correct standard preset', () => {
    expect(TRUNCATION_PRESETS.standard).toEqual({ start: 8, end: 6 })
  })

  it('has correct detailed preset', () => {
    expect(TRUNCATION_PRESETS.detailed).toEqual({ start: 10, end: 8 })
  })
})
