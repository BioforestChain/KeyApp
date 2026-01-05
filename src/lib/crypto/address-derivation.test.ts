import { describe, expect, it } from 'vitest'
import { deriveAddressesForChains, canDeriveForChainType } from './address-derivation'
import type { ChainConfig } from '@/services/chain-config'

const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const makeBioforestConfig = (id: string, prefix = 'b'): ChainConfig => ({
  id,
  version: '1.0',
  chainKind: 'bioforest',
  name: id,
  symbol: id.toUpperCase(),
  prefix,
  decimals: 8,
  enabled: true,
  source: 'default',
})

const makeEvmConfig = (id: string): ChainConfig => ({
  id,
  version: '1.0',
  chainKind: 'evm',
  name: id,
  symbol: id.toUpperCase(),
  decimals: 18,
  enabled: true,
  source: 'default',
})

const makeBitcoinConfig = (id: string): ChainConfig => ({
  id,
  version: '1.0',
  chainKind: 'bitcoin',
  name: id,
  symbol: id.toUpperCase(),
  decimals: 8,
  enabled: true,
  source: 'default',
})

const makeTronConfig = (id: string): ChainConfig => ({
  id,
  version: '1.0',
  chainKind: 'tron',
  name: id,
  symbol: id.toUpperCase(),
  decimals: 6,
  enabled: true,
  source: 'default',
})

describe('deriveAddressesForChains', () => {
  describe('bioforest chains', () => {
    it('derives addresses for bioforest chains', () => {
      const configs = [makeBioforestConfig('bfmeta'), makeBioforestConfig('ccchain')]
      const addresses = deriveAddressesForChains(TEST_MNEMONIC, configs)
      
      expect(addresses).toHaveLength(2)
      expect(addresses.every((a) => a.address.startsWith('b'))).toBe(true)
      expect(addresses.map((a) => a.chainId)).toEqual(['bfmeta', 'ccchain'])
    })

    it('derives addresses with correct prefixes', () => {
      const configs = [
        makeBioforestConfig('chain-b', 'b'),
        makeBioforestConfig('chain-c', 'c'),
      ]
      const addresses = deriveAddressesForChains(TEST_MNEMONIC, configs)
      
      expect(addresses).toHaveLength(2)
      expect(addresses[0]!.address.startsWith('b')).toBe(true)
      expect(addresses[1]!.address.startsWith('c')).toBe(true)
      // Same keypair derives to same base address, only prefix differs
      expect(addresses[0]!.address.slice(1)).toBe(addresses[1]!.address.slice(1))
    })
  })

  describe('evm chains', () => {
    it('derives addresses for EVM chains', () => {
      const configs = [makeEvmConfig('ethereum'), makeEvmConfig('binance')]
      const addresses = deriveAddressesForChains(TEST_MNEMONIC, configs)
      
      expect(addresses).toHaveLength(2)
      expect(addresses.every((a) => a.address.startsWith('0x'))).toBe(true)
      // All EVM chains share the same address
      expect(addresses[0]!.address).toBe(addresses[1]!.address)
    })

    it('generates checksum addresses', () => {
      const configs = [makeEvmConfig('ethereum')]
      const addresses = deriveAddressesForChains(TEST_MNEMONIC, configs)
      
      // Checksum address has mixed case
      const address = addresses[0]!.address
      expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/)
      expect(address !== address.toLowerCase()).toBe(true)
    })
  })

  describe('bitcoin chains', () => {
    it('derives Bitcoin address (Native SegWit)', () => {
      const configs = [makeBitcoinConfig('bitcoin')]
      const addresses = deriveAddressesForChains(TEST_MNEMONIC, configs)

      expect(addresses).toHaveLength(1)
      // Native SegWit addresses start with bc1q
      expect(addresses[0]!.address.startsWith('bc1q')).toBe(true)
    })
  })

  describe('tron chains', () => {
    it('derives Tron address', () => {
      const configs = [makeTronConfig('tron')]
      const addresses = deriveAddressesForChains(TEST_MNEMONIC, configs)

      expect(addresses).toHaveLength(1)
      // Tron addresses start with T
      expect(addresses[0]!.address.startsWith('T')).toBe(true)
    })
  })

  describe('mixed chain types', () => {
    it('derives addresses for all chain types', () => {
      const configs = [
        makeBioforestConfig('bfmeta'),
        makeEvmConfig('ethereum'),
        makeBitcoinConfig('bitcoin'),
        makeTronConfig('tron'),
      ]
      const addresses = deriveAddressesForChains(TEST_MNEMONIC, configs)

      expect(addresses).toHaveLength(4)

      const addressMap = new Map(addresses.map((a) => [a.chainId, a.address]))
      expect(addressMap.get('bfmeta')!.startsWith('b')).toBe(true)
      expect(addressMap.get('ethereum')!.startsWith('0x')).toBe(true)
      expect(addressMap.get('bitcoin')!.startsWith('bc1q')).toBe(true)
      expect(addressMap.get('tron')!.startsWith('T')).toBe(true)
    })

    it('returns empty array for empty input', () => {
      const addresses = deriveAddressesForChains(TEST_MNEMONIC, [])
      expect(addresses).toEqual([])
    })
  })
})

describe('canDeriveForChainType', () => {
  it('returns true for all supported chain kinds', () => {
    expect(canDeriveForChainType('bioforest')).toBe(true)
    expect(canDeriveForChainType('evm')).toBe(true)
    expect(canDeriveForChainType('bitcoin')).toBe(true)
    expect(canDeriveForChainType('tron')).toBe(true)
  })
})
