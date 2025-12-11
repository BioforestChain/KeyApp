/**
 * Staking types tests
 */

import { describe, it, expect } from 'vitest'
import {
  ExternalChainSchema,
  InternalChainSchema,
  ExternalAssetInfoSchema,
  ChainSupportSchema,
  RechargeConfigItemSchema,
  StakingTxTypeSchema,
  StakingTxStatusSchema,
  StakingTransactionSchema,
  MintRequestSchema,
  BurnRequestSchema,
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

  describe('StakingTransactionSchema', () => {
    it('validates complete transaction', () => {
      const tx: StakingTransaction = {
        id: 'tx-001',
        type: 'mint',
        sourceChain: 'BSC',
        sourceAsset: 'USDT',
        sourceAmount: '1000000000000000000',
        targetChain: 'BFMeta',
        targetAsset: 'USDT',
        targetAmount: '1000000000000000000',
        status: 'confirmed',
        txHash: '0x1234567890abcdef',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      expect(StakingTransactionSchema.parse(tx)).toEqual(tx)
    })

    it('allows optional txHash and errorMessage', () => {
      const tx = {
        id: 'tx-002',
        type: 'burn',
        sourceChain: 'BFMeta',
        sourceAsset: 'BFM',
        sourceAmount: '500000000',
        targetChain: 'ETH',
        targetAsset: 'BFM',
        targetAmount: '500000000',
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      expect(StakingTransactionSchema.parse(tx)).toEqual(tx)
    })
  })

  describe('MintRequestSchema', () => {
    it('validates mint request', () => {
      const request = {
        sourceChain: 'ETH' as ExternalChain,
        sourceAsset: 'USDT',
        amount: '1000000',
        targetChain: 'BFMeta' as InternalChain,
        targetAsset: 'USDT',
      }
      expect(MintRequestSchema.parse(request)).toEqual(request)
    })
  })

  describe('BurnRequestSchema', () => {
    it('validates burn request', () => {
      const request = {
        sourceChain: 'BFMeta' as InternalChain,
        sourceAsset: 'BFM',
        amount: '1000000000',
        targetChain: 'BSC' as ExternalChain,
        targetAsset: 'BFM',
      }
      expect(BurnRequestSchema.parse(request)).toEqual(request)
    })
  })
})
