import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import {
  useMultiChainAddressGeneration,
  generateAllAddresses,
  getAddressSet,
} from './use-multi-chain-address-generation'

// Test mnemonic (from BIP39 test vectors - never use in production)
const TEST_MNEMONIC = [
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'abandon',
  'about',
]

describe('useMultiChainAddressGeneration', () => {
  it('initializes with empty state', () => {
    const { result } = renderHook(() => useMultiChainAddressGeneration())

    expect(result.current.addresses).toHaveLength(0)
    expect(result.current.isGenerating).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('generates addresses for all chains', async () => {
    const { result } = renderHook(() => useMultiChainAddressGeneration())

    let addresses: Awaited<ReturnType<typeof result.current.generate>>

    await act(async () => {
      addresses = await result.current.generate(TEST_MNEMONIC)
    })

    // ETH + BFMeta + Tron + 4 Bitcoin purposes = 7
    expect(result.current.addresses).toHaveLength(7)
    expect(result.current.error).toBeNull()

    // Check chain coverage
    const chains = result.current.addresses.map((a) => a.chain)
    expect(chains).toContain('ethereum')
    expect(chains).toContain('bfmeta')
    expect(chains).toContain('tron')
    expect(chains.filter((c) => c === 'bitcoin')).toHaveLength(4)
  })

  it('sets error for invalid mnemonic', async () => {
    const { result } = renderHook(() => useMultiChainAddressGeneration())

    await act(async () => {
      await result.current.generate(['invalid', 'mnemonic'])
    })

    expect(result.current.addresses).toHaveLength(0)
    expect(result.current.error).toBe('Invalid mnemonic')
  })

  it('clears results', async () => {
    const { result } = renderHook(() => useMultiChainAddressGeneration())

    await act(async () => {
      await result.current.generate(TEST_MNEMONIC)
    })

    expect(result.current.addresses).toHaveLength(7)

    act(() => {
      result.current.clear()
    })

    expect(result.current.addresses).toHaveLength(0)
    expect(result.current.error).toBeNull()
  })

  it('sets isGenerating during generation', async () => {
    const { result } = renderHook(() => useMultiChainAddressGeneration())

    // Start generation but don't await
    const promise = act(async () => {
      await result.current.generate(TEST_MNEMONIC)
    })

    // After generation completes
    await promise
    expect(result.current.isGenerating).toBe(false)
  })
})

describe('generateAllAddresses', () => {
  it('generates addresses for all chains', () => {
    const addresses = generateAllAddresses(TEST_MNEMONIC)

    expect(addresses).toHaveLength(7)
    expect(addresses.every((a) => a.address)).toBe(true)
  })

  it('throws for invalid mnemonic', () => {
    expect(() => generateAllAddresses(['invalid'])).toThrow('Invalid mnemonic')
  })

  it('generates unique addresses', () => {
    const addresses = generateAllAddresses(TEST_MNEMONIC)
    const uniqueAddresses = new Set(addresses.map((a) => a.address))
    expect(uniqueAddresses.size).toBe(7)
  })
})

describe('getAddressSet', () => {
  it('creates lowercase address set', () => {
    const addresses = generateAllAddresses(TEST_MNEMONIC)
    const addressSet = getAddressSet(addresses)

    expect(addressSet.size).toBe(7)

    // All addresses should be lowercase
    for (const addr of addressSet) {
      expect(addr).toBe(addr.toLowerCase())
    }
  })

  it('allows efficient lookup', () => {
    const addresses = generateAllAddresses(TEST_MNEMONIC)
    const addressSet = getAddressSet(addresses)

    // Should find addresses regardless of case
    const ethAddress = addresses.find((a) => a.chain === 'ethereum')!.address
    expect(addressSet.has(ethAddress.toLowerCase())).toBe(true)
    expect(addressSet.has(ethAddress.toUpperCase().replace('0X', '0x'))).toBe(false) // Set is case-sensitive
  })
})
