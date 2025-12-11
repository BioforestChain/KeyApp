/**
 * Mock Staking Service Tests
 */

import { describe, it, expect } from 'vitest'
import {
  mockStakingService,
  mockRechargeConfig,
  mockStakingOverview,
  mockTransactions,
} from './staking.mock'

describe('Mock Staking Service', () => {
  describe('getRechargeConfig', () => {
    it('returns recharge configuration', async () => {
      const config = await mockStakingService.getRechargeConfig()
      expect(config).toEqual(mockRechargeConfig)
      expect(config.bfmeta).toBeDefined()
      expect(config.bfmeta?.USDT).toBeDefined()
      expect(config.bfmeta?.USDT?.supportChain.BSC).toBeDefined()
    })
  })

  describe('getLogoUrls', () => {
    it('returns logo URL map', async () => {
      const logos = await mockStakingService.getLogoUrls()
      expect(logos.BFMeta).toBeDefined()
      expect(logos.BFMeta?.BFM).toBe('/tokens/bfm.svg')
    })
  })

  describe('getOverview', () => {
    it('returns staking overview items', async () => {
      const overview = await mockStakingService.getOverview()
      expect(overview).toEqual(mockStakingOverview)
      expect(overview.length).toBe(3)
      expect(overview[0]?.chain).toBe('BFMeta')
      expect(overview[0]?.assetType).toBe('BFM')
    })
  })

  describe('getTransactions', () => {
    it('returns transactions sorted by date', async () => {
      const transactions = await mockStakingService.getTransactions()
      expect(transactions.length).toBeGreaterThan(0)
      // Verify sorted by createdAt descending
      for (let i = 1; i < transactions.length; i++) {
        expect(transactions[i - 1]?.createdAt).toBeGreaterThanOrEqual(transactions[i]?.createdAt ?? 0)
      }
    })
  })

  describe('getTransaction', () => {
    it('returns transaction by ID', async () => {
      const tx = await mockStakingService.getTransaction('tx-001')
      expect(tx).not.toBeNull()
      expect(tx?.id).toBe('tx-001')
      expect(tx?.type).toBe('mint')
    })

    it('returns null for unknown ID', async () => {
      const tx = await mockStakingService.getTransaction('unknown')
      expect(tx).toBeNull()
    })
  })

  describe('submitMint', () => {
    it('creates pending mint transaction', async () => {
      const initialCount = mockTransactions.length
      const tx = await mockStakingService.submitMint({
        sourceChain: 'BSC',
        sourceAsset: 'USDT',
        amount: '1000000000000000000',
        targetChain: 'BFMeta',
        targetAsset: 'USDT',
      })

      expect(tx.type).toBe('mint')
      expect(tx.status).toBe('pending')
      expect(tx.sourceChain).toBe('BSC')
      expect(tx.targetChain).toBe('BFMeta')
      expect(mockTransactions.length).toBe(initialCount + 1)
    })
  })

  describe('submitBurn', () => {
    it('creates pending burn transaction', async () => {
      const initialCount = mockTransactions.length
      const tx = await mockStakingService.submitBurn({
        sourceChain: 'BFMeta',
        sourceAsset: 'BFM',
        amount: '500000000000000000',
        targetChain: 'ETH',
        targetAsset: 'BFM',
      })

      expect(tx.type).toBe('burn')
      expect(tx.status).toBe('pending')
      expect(tx.sourceChain).toBe('BFMeta')
      expect(tx.targetChain).toBe('ETH')
      expect(mockTransactions.length).toBe(initialCount + 1)
    })
  })
})
