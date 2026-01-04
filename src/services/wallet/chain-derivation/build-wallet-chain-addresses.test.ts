/**
 * buildWalletChainAddresses Tests
 */

import { describe, it, expect } from 'vitest'
import { buildWalletChainAddresses } from './build-wallet-chain-addresses'
import type { ChainConfig } from '@/services/chain-config'

const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

const mockChainConfigs: ChainConfig[] = [
  {
    id: 'bfmeta',
    version: '1.0',
    chainKind: 'bioforest',
    name: 'BFMeta',
    symbol: 'BFM',
    decimals: 8,
    prefix: 'b',
    enabled: true,
    source: 'default',
  },
  {
    id: 'ethereum',
    version: '1.0',
    chainKind: 'evm',
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    enabled: true,
    source: 'default',
  },
  {
    id: 'binance',
    version: '1.0',
    chainKind: 'evm',
    name: 'BSC',
    symbol: 'BNB',
    decimals: 18,
    enabled: true,
    source: 'default',
  },
  {
    id: 'tron',
    version: '1.0',
    chainKind: 'tron',
    name: 'Tron',
    symbol: 'TRX',
    decimals: 6,
    enabled: true,
    source: 'default',
  },
  {
    id: 'bitcoin',
    version: '1.0',
    chainKind: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 8,
    enabled: true,
    source: 'default',
  },
]

describe('buildWalletChainAddresses', () => {
  it('should return empty array when no chains selected', () => {
    const result = buildWalletChainAddresses({
      mnemonic: TEST_MNEMONIC,
      selectedChainIds: [],
      chainConfigs: mockChainConfigs,
    })
    expect(result).toEqual([])
  })

  it('should derive Tron address when tron is selected', () => {
    const result = buildWalletChainAddresses({
      mnemonic: TEST_MNEMONIC,
      selectedChainIds: ['tron'],
      chainConfigs: mockChainConfigs,
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.chainId).toBe('tron')
    // Tron address format: starts with T, base58check, 34 chars
    expect(result[0]?.address).toMatch(/^T[1-9A-HJ-NP-Za-km-z]{33}$/)
  })

  it('should derive same EVM address for multiple EVM chains', () => {
    const result = buildWalletChainAddresses({
      mnemonic: TEST_MNEMONIC,
      selectedChainIds: ['ethereum', 'binance'],
      chainConfigs: mockChainConfigs,
    })

    expect(result).toHaveLength(2)
    const ethAddress = result.find(r => r.chainId === 'ethereum')?.address
    const bscAddress = result.find(r => r.chainId === 'binance')?.address

    // EVM chains share the same address
    expect(ethAddress).toBe(bscAddress)
    // EVM address format: 0x + 40 hex chars
    expect(ethAddress).toMatch(/^0x[a-fA-F0-9]{40}$/)
  })

  it('should derive BioForest address', () => {
    const result = buildWalletChainAddresses({
      mnemonic: TEST_MNEMONIC,
      selectedChainIds: ['bfmeta'],
      chainConfigs: mockChainConfigs,
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.chainId).toBe('bfmeta')
    // BioForest address: prefix + base58check
    expect(result[0]?.address).toMatch(/^b[1-9A-HJ-NP-Za-km-z]+$/)
  })

  it('should derive Bitcoin address', () => {
    const result = buildWalletChainAddresses({
      mnemonic: TEST_MNEMONIC,
      selectedChainIds: ['bitcoin'],
      chainConfigs: mockChainConfigs,
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.chainId).toBe('bitcoin')
    // Bitcoin P2PKH address: starts with 1 or 3
    expect(result[0]?.address).toMatch(/^[13][1-9A-HJ-NP-Za-km-z]{25,34}$/)
  })

  it('should be deterministic (same input same output)', () => {
    const params = {
      mnemonic: TEST_MNEMONIC,
      selectedChainIds: ['tron', 'ethereum', 'bfmeta'],
      chainConfigs: mockChainConfigs,
    }

    const result1 = buildWalletChainAddresses(params)
    const result2 = buildWalletChainAddresses(params)

    expect(result1).toEqual(result2)
  })

  it('should respect selectedChainIds order', () => {
    const result = buildWalletChainAddresses({
      mnemonic: TEST_MNEMONIC,
      selectedChainIds: ['tron', 'ethereum', 'bfmeta'],
      chainConfigs: mockChainConfigs,
    })

    expect(result).toHaveLength(3)
    expect(result[0]?.chainId).toBe('tron')
    expect(result[1]?.chainId).toBe('ethereum')
    expect(result[2]?.chainId).toBe('bfmeta')
  })

  it('should skip unknown chainIds', () => {
    const result = buildWalletChainAddresses({
      mnemonic: TEST_MNEMONIC,
      selectedChainIds: ['tron', 'unknown-chain'],
      chainConfigs: mockChainConfigs,
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.chainId).toBe('tron')
  })

  it('should skip custom chainKind', () => {
    const configsWithCustom: ChainConfig[] = [
      ...mockChainConfigs,
      {
        id: 'my-custom',
        version: '1.0',
        chainKind: 'custom',
        name: 'My Custom',
        symbol: 'CUSTOM',
        decimals: 18,
        enabled: true,
        source: 'manual',
      },
    ]

    const result = buildWalletChainAddresses({
      mnemonic: TEST_MNEMONIC,
      selectedChainIds: ['my-custom', 'tron'],
      chainConfigs: configsWithCustom,
    })

    // custom chain should be skipped
    expect(result).toHaveLength(1)
    expect(result[0]?.chainId).toBe('tron')
  })

  it('should handle all chain kinds together', () => {
    const result = buildWalletChainAddresses({
      mnemonic: TEST_MNEMONIC,
      selectedChainIds: ['bfmeta', 'ethereum', 'tron', 'bitcoin'],
      chainConfigs: mockChainConfigs,
    })

    expect(result).toHaveLength(4)
    expect(result.map(r => r.chainId)).toEqual(['bfmeta', 'ethereum', 'tron', 'bitcoin'])

    // Each address has the correct format
    const bfmeta = result.find(r => r.chainId === 'bfmeta')
    const ethereum = result.find(r => r.chainId === 'ethereum')
    const tron = result.find(r => r.chainId === 'tron')
    const bitcoin = result.find(r => r.chainId === 'bitcoin')

    expect(bfmeta?.address).toMatch(/^b[1-9A-HJ-NP-Za-km-z]+$/)
    expect(ethereum?.address).toMatch(/^0x[a-fA-F0-9]{40}$/)
    expect(tron?.address).toMatch(/^T[1-9A-HJ-NP-Za-km-z]{33}$/)
    expect(bitcoin?.address).toMatch(/^[13][1-9A-HJ-NP-Za-km-z]{25,34}$/)
  })
})
