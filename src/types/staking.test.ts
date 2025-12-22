/**
 * Staking types tests
 */

import { describe, it, expect } from 'vitest'
import { Amount } from './amount'
import {
  ExternalChainSchema,
  InternalChainSchema,
  ExternalAssetInfoSchema,
  ChainSupportSchema,
  RechargeConfigItemSchema,
  StakingTxTypeSchema,
  StakingTxStatusSchema,
  type ExternalChain,
  type InternalChain,
  type StakingTransaction,
} from './staking'

describe('Staking Types', () => {
  describe('ExternalChainSchema', () => {
    it('accepts valid external chains', () => {
      expect(ExternalChainSchema.parse('ETH')).toBe('ETH')
      expect(ExternalChainSchema.parse('BSC')).toBe('BSC')
      expect(ExternalChainSchema.parse('TRON')).toBe('TRON')
    })

    it('rejects invalid chains', () => {
      expect(() => ExternalChainSchema.parse('INVALID')).toThrow()
      expect(() => ExternalChainSchema.parse('')).toThrow()
    })
  })

  describe('InternalChainSchema', () => {
    it('accepts valid internal chains', () => {
      expect(InternalChainSchema.parse('BFMeta')).toBe('BFMeta')
      expect(InternalChainSchema.parse('BFChain')).toBe('BFChain')
      expect(InternalChainSchema.parse('CCChain')).toBe('CCChain')
      expect(InternalChainSchema.parse('PMChain')).toBe('PMChain')
    })

    it('rejects invalid chains', () => {
      expect(() => InternalChainSchema.parse('ETH')).toThrow()
    })
  })

  describe('ExternalAssetInfoSchema', () => {
    it('validates complete asset info', () => {
      const asset = {
        assetType: 'USDT',
        contract: '0x55d398326f99059ff775485246999027b3197955',
        decimals: 18,
        logo: 'https://example.com/usdt.png',
      }
      expect(ExternalAssetInfoSchema.parse(asset)).toEqual(asset)
    })

    it('allows optional fields', () => {
      const asset = {
        assetType: 'ETH',
        decimals: 18,
      }
      expect(ExternalAssetInfoSchema.parse(asset)).toEqual(asset)
    })

    it('rejects invalid decimals', () => {
      expect(() =>
        ExternalAssetInfoSchema.parse({
          assetType: 'TEST',
          decimals: -1,
        })
      ).toThrow()

      expect(() =>
        ExternalAssetInfoSchema.parse({
          assetType: 'TEST',
          decimals: 19,
        })
      ).toThrow()
    })
  })

  describe('ChainSupportSchema', () => {
    it('validates full chain support', () => {
      const support = {
        BSC: { assetType: 'USDT', decimals: 18 },
        ETH: { assetType: 'USDT', decimals: 6 },
        TRON: { assetType: 'USDT', decimals: 6 },
      }
      expect(ChainSupportSchema.parse(support)).toEqual(support)
    })

    it('allows partial chain support', () => {
      const support = {
        BSC: { assetType: 'BNB', decimals: 18 },
      }
      expect(ChainSupportSchema.parse(support)).toEqual(support)
    })

    it('allows empty support', () => {
      expect(ChainSupportSchema.parse({})).toEqual({})
    })
  })

  describe('RechargeConfigItemSchema', () => {
    it('validates config item', () => {
      const item = {
        assetType: 'BFM',
        logo: 'https://example.com/bfm.png',
        supportChain: {
          BSC: { assetType: 'BFM', decimals: 18 },
        },
      }
      expect(RechargeConfigItemSchema.parse(item)).toEqual(item)
    })
  })

  describe('StakingTxTypeSchema', () => {
    it('accepts mint and burn', () => {
      expect(StakingTxTypeSchema.parse('mint')).toBe('mint')
      expect(StakingTxTypeSchema.parse('burn')).toBe('burn')
    })
  })

  describe('StakingTxStatusSchema', () => {
    it('accepts all valid statuses', () => {
      expect(StakingTxStatusSchema.parse('pending')).toBe('pending')
      expect(StakingTxStatusSchema.parse('confirming')).toBe('confirming')
      expect(StakingTxStatusSchema.parse('confirmed')).toBe('confirmed')
      expect(StakingTxStatusSchema.parse('failed')).toBe('failed')
    })
  })

  describe('StakingTransaction interface', () => {
    it('validates complete transaction with Amount', () => {
      const tx: StakingTransaction = {
        id: 'tx-001',
        type: 'mint',
        sourceChain: 'BSC',
        sourceAsset: 'USDT',
        sourceAmount: Amount.fromRaw('1000000000000000000', 18, 'USDT'),
        targetChain: 'BFMeta',
        targetAsset: 'USDT',
        targetAmount: Amount.fromRaw('1000000000000000000', 18, 'USDT'),
        status: 'confirmed',
        txHash: '0x1234567890abcdef',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      expect(tx.id).toBe('tx-001')
      expect(tx.type).toBe('mint')
      expect(tx.sourceAmount.toRawString()).toBe('1000000000000000000')
    })

    it('allows optional txHash and errorMessage', () => {
      const tx: StakingTransaction = {
        id: 'tx-002',
        type: 'burn',
        sourceChain: 'BFMeta',
        sourceAsset: 'BFM',
        sourceAmount: Amount.fromFormatted('500', 8, 'BFM'),
        targetChain: 'ETH',
        targetAsset: 'BFM',
        targetAmount: Amount.fromFormatted('500', 18, 'BFM'),
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      expect(tx.txHash).toBeUndefined()
      expect(tx.errorMessage).toBeUndefined()
    })
  })

  describe('Type inference', () => {
    it('ExternalChain type is correct', () => {
      const chain: ExternalChain = 'ETH'
      expect(['ETH', 'BSC', 'TRON']).toContain(chain)
    })

    it('InternalChain type is correct', () => {
      const chain: InternalChain = 'BFMeta'
      expect(['BFMeta', 'BFChain', 'CCChain', 'PMChain']).toContain(chain)
    })
  })
})
