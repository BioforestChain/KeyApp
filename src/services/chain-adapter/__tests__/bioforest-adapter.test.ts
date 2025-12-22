import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import type { ChainConfig } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { createBioforestKeypair, publicKeyToBioforestAddress, verifySignature, hexToBytes } from '@/lib/crypto'
import { BioforestAdapter, createBioforestAdapter } from '../bioforest'
import { getAdapterRegistry, resetAdapterRegistry, setupAdapters } from '../index'

// Generate a valid test address
const testKeypair = createBioforestKeypair('test-secret')
const validAddress = publicKeyToBioforestAddress(testKeypair.publicKey, 'b')

const mockBfmetaConfig: ChainConfig = {
  id: 'bfmeta',
  version: '1.0',
  type: 'bioforest',
  name: 'BFMeta',
  symbol: 'BFM',
  prefix: 'b',
  decimals: 8,
  enabled: true,
  source: 'default',
}

describe('BioforestAdapter', () => {
  describe('constructor', () => {
    it('creates adapter with correct chainId and type', () => {
      const adapter = new BioforestAdapter(mockBfmetaConfig)

      expect(adapter.chainId).toBe('bfmeta')
      expect(adapter.chainType).toBe('bioforest')
    })

    it('initializes all services', () => {
      const adapter = new BioforestAdapter(mockBfmetaConfig)

      expect(adapter.identity).toBeDefined()
      expect(adapter.asset).toBeDefined()
      expect(adapter.transaction).toBeDefined()
      expect(adapter.chain).toBeDefined()
      expect(adapter.staking).toBeNull() // Not implemented yet
    })
  })

  describe('identity service', () => {
    it('validates bioforest address format', () => {
      const adapter = new BioforestAdapter(mockBfmetaConfig)

      expect(adapter.identity.isValidAddress(validAddress)).toBe(true)
      expect(adapter.identity.isValidAddress('invalid')).toBe(false)
      expect(adapter.identity.isValidAddress('0x1234')).toBe(false)
    })

    it('normalizes address without changes', () => {
      const adapter = new BioforestAdapter(mockBfmetaConfig)

      expect(adapter.identity.normalizeAddress(validAddress)).toBe(validAddress)
    })
  })

  describe('chain service', () => {
    it('returns correct chain info', () => {
      const adapter = new BioforestAdapter(mockBfmetaConfig)
      const info = adapter.chain.getChainInfo()

      expect(info.chainId).toBe('bfmeta')
      expect(info.name).toBe('BFMeta')
      expect(info.symbol).toBe('BFM')
      expect(info.decimals).toBe(8)
      expect(info.confirmations).toBe(1)
    })
  })

  describe('lifecycle', () => {
    it('initializes without error', async () => {
      const adapter = new BioforestAdapter(mockBfmetaConfig)

      await expect(adapter.initialize(mockBfmetaConfig)).resolves.not.toThrow()
    })

    it('disposes without error', () => {
      const adapter = new BioforestAdapter(mockBfmetaConfig)

      expect(() => adapter.dispose()).not.toThrow()
    })
  })
})

describe('createBioforestAdapter', () => {
  it('creates adapter instance', () => {
    const adapter = createBioforestAdapter(mockBfmetaConfig)

    expect(adapter).toBeInstanceOf(BioforestAdapter)
    expect(adapter.chainId).toBe('bfmeta')
  })
})

describe('AdapterRegistry', () => {
  beforeEach(() => {
    resetAdapterRegistry()
  })

  afterEach(() => {
    resetAdapterRegistry()
  })

  it('registers bioforest adapter factory', () => {
    setupAdapters()
    const registry = getAdapterRegistry()

    // Set config first
    ;(registry as { setChainConfigs: (configs: ChainConfig[]) => void }).setChainConfigs([
      mockBfmetaConfig,
    ])

    expect(registry.hasAdapter('bfmeta')).toBe(true)
  })

  it('returns null for unknown chain', () => {
    setupAdapters()
    const registry = getAdapterRegistry()

    expect(registry.getAdapter('unknown-chain')).toBeNull()
  })

  it('creates and caches adapter', () => {
    setupAdapters()
    const registry = getAdapterRegistry()

    ;(registry as { setChainConfigs: (configs: ChainConfig[]) => void }).setChainConfigs([
      mockBfmetaConfig,
    ])

    const adapter1 = registry.getAdapter('bfmeta')
    const adapter2 = registry.getAdapter('bfmeta')

    expect(adapter1).toBe(adapter2) // Same instance
  })

  it('disposes all adapters', () => {
    setupAdapters()
    const registry = getAdapterRegistry()

    ;(registry as { setChainConfigs: (configs: ChainConfig[]) => void }).setChainConfigs([
      mockBfmetaConfig,
    ])

    registry.getAdapter('bfmeta') // Create adapter
    expect(registry.listAdapters()).toContain('bfmeta')

    registry.disposeAll()
    expect(registry.listAdapters()).toHaveLength(0)
  })
})

describe('BioforestTransactionService', () => {
  const adapter = new BioforestAdapter(mockBfmetaConfig)
  const recipientKeypair = createBioforestKeypair('recipient-secret')
  const recipientAddress = publicKeyToBioforestAddress(recipientKeypair.publicKey, 'b')

  describe('estimateFee', () => {
    it('returns three fee tiers', async () => {
      const fees = await adapter.transaction.estimateFee({
        from: validAddress,
        to: recipientAddress,
        amount: Amount.fromRaw('1000000', 8, 'BFM'),
      })

      expect(fees.slow).toBeDefined()
      expect(fees.standard).toBeDefined()
      expect(fees.fast).toBeDefined()
      expect(fees.slow.estimatedTime).toBeGreaterThan(fees.fast.estimatedTime)
    })
  })

  describe('buildTransaction', () => {
    it('builds unsigned transaction with required fields', async () => {
      const tx = await adapter.transaction.buildTransaction({
        from: validAddress,
        to: recipientAddress,
        amount: Amount.fromRaw('1000000', 8, 'BFM'),
        memo: 'test transfer',
      })

      expect(tx.chainId).toBe('bfmeta')
      expect(tx.data).toBeDefined()
      const data = tx.data as Record<string, unknown>
      expect(data.type).toBe('transfer')
      expect(data.from).toBe(validAddress)
      expect(data.to).toBe(recipientAddress)
      expect(data.amount).toBe('1000000')
      expect(data.memo).toBe('test transfer')
    })
  })

  describe('signTransaction', () => {
    it('signs transaction with valid signature', async () => {
      const tx = await adapter.transaction.buildTransaction({
        from: validAddress,
        to: recipientAddress,
        amount: Amount.fromRaw('1000000', 8, 'BFM'),
      })

      const signedTx = await adapter.transaction.signTransaction(tx, testKeypair.secretKey)

      expect(signedTx.signature).toBeDefined()
      expect(signedTx.signature.length).toBe(128) // 64 bytes as hex
      expect(signedTx.chainId).toBe('bfmeta')
    })

    it('produces valid Ed25519 signature', async () => {
      const tx = await adapter.transaction.buildTransaction({
        from: validAddress,
        to: recipientAddress,
        amount: Amount.fromRaw('1000000', 8, 'BFM'),
      })

      const signedTx = await adapter.transaction.signTransaction(tx, testKeypair.secretKey)
      const txData = tx.data as Record<string, unknown>

      // Reconstruct the signed message
      const signableData = JSON.stringify({
        type: txData.type,
        from: txData.from,
        to: txData.to,
        amount: txData.amount,
        assetType: txData.assetType,
        fee: txData.fee,
        timestamp: txData.timestamp,
        memo: txData.memo ?? '',
      })

      // Verify signature
      const signatureBytes = hexToBytes(signedTx.signature)
      const isValid = verifySignature(signableData, signatureBytes, testKeypair.publicKey)
      expect(isValid).toBe(true)
    })
  })

  describe('asset service', () => {
    it('returns mock balance when no RPC configured', async () => {
      const balance = await adapter.asset.getNativeBalance(validAddress)

      expect(balance.amount.isZero()).toBe(true)
      expect(balance.symbol).toBe('BFM')
      expect(balance.amount.decimals).toBe(8)
    })
  })

  describe('transaction history', () => {
    it('returns empty array when no RPC configured', async () => {
      const history = await adapter.transaction.getTransactionHistory(validAddress)

      expect(history).toEqual([])
    })
  })
})
