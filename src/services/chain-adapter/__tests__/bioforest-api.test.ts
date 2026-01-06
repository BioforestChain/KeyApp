/**
 * BioForest Chain Adapter API Tests
 *
 * Tests API response parsing with mocked fetch.
 * All BioForest APIs return { success: boolean, result: T } format.
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import type { ChainConfig } from '@/services/chain-config'
import { BioforestAdapter } from '../bioforest'

const mockConfigWithRpc: ChainConfig = {
  id: 'bfmeta',
  version: '1.0',
  chainKind: 'bioforest',
  name: 'BFMeta',
  symbol: 'BFM',
  prefix: 'b',
  decimals: 8,
  enabled: true,
  source: 'default',
  apis: [{ type: 'biowallet-v1', endpoint: 'https://walletapi.bfmeta.info', config: { path: 'bfm' } }],
}

// Mock chainConfigService
vi.mock('@/services/chain-config/service', () => ({
  chainConfigService: {
    getConfig: (chainId: string) => chainId === 'bfmeta' ? mockConfigWithRpc : null,
    getRpcUrl: () => '',
    getDecimals: () => 8,
    getSymbol: () => 'BFM',
    getBiowalletApi: () => ({ endpoint: 'https://walletapi.bfmeta.info', path: 'bfm' }),
  },
}))

// Helper to create mock Response
function mockResponse(data: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(data),
  } as Response
}

describe('BioForest API Response Parsing', () => {
  let adapter: BioforestAdapter
  let fetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    adapter = new BioforestAdapter(mockConfigWithRpc.id)
    fetchSpy = vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  describe('ChainService', () => {
    describe('getBlockHeight', () => {
      it('parses { success, result: { height } } format', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: { height: 1274934, timestamp: 21951840 },
          })
        )

        const height = await adapter.chain.getBlockHeight()

        expect(height).toBe(1274934n)
        expect(fetchSpy).toHaveBeenCalledWith(
          'https://walletapi.bfmeta.info/wallet/bfm/lastblock',
          expect.any(Object)
        )
      })

      it('throws on success=false', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: false,
            error: { message: 'API error' },
          })
        )

        await expect(adapter.chain.getBlockHeight()).rejects.toThrow()
      })
    })

    describe('getGasPrice', () => {
      it('parses { success, result: { minFee, avgFee } } format', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: { minFee: '10000000', avgFee: '15000000' },
          })
        )

        const gasPrice = await adapter.chain.getGasPrice()

        expect(gasPrice.slow.toRawString()).toBe('10000000')
        expect(gasPrice.standard.toRawString()).toBe('15000000')
      })

      it('returns default on API error', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({ success: false }, true)
        )

        const gasPrice = await adapter.chain.getGasPrice()

        expect(gasPrice.slow).toBeDefined()
        expect(gasPrice.standard).toBeDefined()
      })
    })

    describe('healthCheck', () => {
      it('parses successful health check', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: { height: 1274934, timestamp: 21951840 },
          })
        )

        const health = await adapter.chain.healthCheck()

        expect(health.isHealthy).toBe(true)
        expect(health.blockHeight).toBe(1274934n)
      })

      it('returns unhealthy on success=false', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({ success: false })
        )

        const health = await adapter.chain.healthCheck()

        expect(health.isHealthy).toBe(false)
        expect(health.blockHeight).toBe(0n)
      })
    })
  })

  describe('TransactionService', () => {
    describe('getTransactionHistory', () => {
      it('parses { success, result: { trs: [...] } } format', async () => {
        // Mock lastblock call
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: { height: 1274934, timestamp: 21951840 },
          })
        )
        // Mock transactions/query call
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: {
              trs: [
                {
                  height: 1274442,
                  signature: 'block-sig-1',
                  tIndex: 0,
                  transaction: {
                    signature: 'tx-sig-1',
                    senderId: 'bSender123',
                    recipientId: 'bRecipient456',
                    fee: '10000000',
                    timestamp: 21951000,
                    type: 'BFM-AST-02',
                    asset: {
                      transferAsset: {
                        amount: '100000000',
                        assetType: 'BFM',
                      },
                    },
                  },
                },
              ],
              count: 1,
            },
          })
        )

        const history = await adapter.transaction.getTransactionHistory('bTest123')

        expect(history).toHaveLength(1)
        const tx = history[0]!
        expect(tx.hash).toBe('tx-sig-1')
        expect(tx.from).toBe('bSender123')
        expect(tx.to).toBe('bRecipient456')
        expect(tx.amount.toRawString()).toBe('100000000')
        expect(tx.fee?.toRawString()).toBe('10000000')
        expect(tx.blockNumber).toBe(1274442n)
      })

      it('returns empty array on success=false', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: { height: 1274934 },
          })
        )
        fetchSpy.mockResolvedValueOnce(
          mockResponse({ success: false })
        )

        const history = await adapter.transaction.getTransactionHistory('bTest123')

        expect(history).toEqual([])
      })

      it('returns empty array when trs is empty', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: { height: 1274934 },
          })
        )
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: { trs: [], count: 0 },
          })
        )

        const history = await adapter.transaction.getTransactionHistory('bTest123')

        expect(history).toEqual([])
      })
    })

    describe('getTransactionStatus', () => {
      it('returns confirmed when trs has height', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: {
              trs: [{ height: 1274442 }],
            },
          })
        )

        const status = await adapter.transaction.getTransactionStatus('tx-sig-1')

        expect(status.status).toBe('confirmed')
        expect(status.confirmations).toBe(1)
      })

      it('returns pending when trs is empty', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: { trs: [] },
          })
        )

        const status = await adapter.transaction.getTransactionStatus('tx-sig-1')

        expect(status.status).toBe('pending')
        expect(status.confirmations).toBe(0)
      })
    })

    describe('getTransaction', () => {
      it('parses transaction details from trs array', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: {
              trs: [
                {
                  height: 1274442,
                  transaction: {
                    signature: 'tx-sig-1',
                    senderId: 'bSender123',
                    recipientId: 'bRecipient456',
                    fee: '10000000',
                    timestamp: 21951000,
                    asset: {
                      transferAsset: { amount: '100000000' },
                    },
                  },
                },
              ],
            },
          })
        )

        const tx = await adapter.transaction.getTransaction('tx-sig-1')

        expect(tx).not.toBeNull()
        expect(tx!.hash).toBe('tx-sig-1')
        expect(tx!.from).toBe('bSender123')
        expect(tx!.to).toBe('bRecipient456')
        expect(tx!.amount.toRawString()).toBe('100000000')
        expect(tx!.blockNumber).toBe(1274442n)
      })

      it('returns null when trs is empty', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: { trs: [] },
          })
        )

        const tx = await adapter.transaction.getTransaction('tx-sig-1')

        expect(tx).toBeNull()
      })
    })

    describe('broadcastTransaction', () => {
      it('returns signature on success', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: {},
          })
        )

        const hash = await adapter.transaction.broadcastTransaction({
          chainId: 'bfmeta',
          data: { type: 'transfer' },
          signature: 'my-tx-signature',
        })

        expect(hash).toBe('my-tx-signature')
      })

      it('throws on success=false with error message', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: false,
            error: { message: 'Insufficient balance' },
          })
        )

        await expect(
          adapter.transaction.broadcastTransaction({
            chainId: 'bfmeta',
            data: { type: 'transfer' },
            signature: 'my-tx-signature',
          })
        ).rejects.toThrow('Insufficient balance')
      })
    })
  })

  describe('AssetService', () => {
    describe('getNativeBalance', () => {
      it('parses nested assets object format', async () => {
        // API returns: { success, result: { assets: { [magic]: { [assetType]: {...} } } } }
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: {
              address: 'bTest123',
              assets: {
                nxOGQ: {
                  BFM: {
                    sourceChainMagic: 'nxOGQ',
                    sourceChainName: 'BFMeta',
                    assetType: 'BFM',
                    assetNumber: '1000000000',
                  },
                },
              },
            },
          })
        )

        const balance = await adapter.asset.getNativeBalance('bTest123')

        expect(balance.amount.toRawString()).toBe('1000000000')
        expect(balance.symbol).toBe('BFM')
      })

      it('returns zero balance when assets array is empty', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: { assets: [] },
          })
        )

        const balance = await adapter.asset.getNativeBalance('bTest123')

        expect(balance.amount.isZero()).toBe(true)
      })

      it('returns zero balance on success=false', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({ success: false })
        )

        const balance = await adapter.asset.getNativeBalance('bTest123')

        expect(balance.amount.isZero()).toBe(true)
      })
    })

    describe('getTokenBalances', () => {
      it('parses multiple assets from nested object', async () => {
        fetchSpy.mockResolvedValueOnce(
          mockResponse({
            success: true,
            result: {
              address: 'bTest123',
              assets: {
                nxOGQ: {
                  BFM: {
                    sourceChainMagic: 'nxOGQ',
                    sourceChainName: 'BFMeta',
                    assetType: 'BFM',
                    assetNumber: '1000000000',
                  },
                  USDT: {
                    sourceChainMagic: 'nxOGQ',
                    sourceChainName: 'BFMeta',
                    assetType: 'USDT',
                    assetNumber: '500000000',
                  },
                },
              },
            },
          })
        )

        const balances = await adapter.asset.getTokenBalances('bTest123')

        expect(balances).toHaveLength(2)
        const symbols = balances.map((b) => b.symbol)
        expect(symbols).toContain('BFM')
        expect(symbols).toContain('USDT')
      })
    })
  })
})
