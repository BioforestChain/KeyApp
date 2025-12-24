import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BnqklWalletBioforestApi } from '../api'
import { ApiError, type FetchFn } from '../../client'

function createMockFetch(response: unknown, options?: { ok?: boolean; status?: number }): FetchFn {
  return vi.fn<FetchFn>().mockResolvedValue({
    ok: options?.ok ?? true,
    status: options?.status ?? 200,
    json: () => Promise.resolve(response),
  } as Response)
}

describe('BnqklWalletBioforestApi', () => {
  let api: BnqklWalletBioforestApi
  let mockFetch: FetchFn

  beforeEach(() => {
    mockFetch = createMockFetch({ success: true, result: {} })
    api = new BnqklWalletBioforestApi({
      chainPath: 'bfm',
      fetch: mockFetch,
    })
  })

  describe('getLastBlock', () => {
    it('should fetch last block info', async () => {
      const blockInfo = {
        height: 1000,
        timestamp: 1234567890,
        magic: 'bfm',
        signature: 'abc123',
      }
      mockFetch = createMockFetch({ success: true, result: blockInfo })
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: mockFetch })

      const result = await api.getLastBlock()

      expect(result).toEqual(blockInfo)
      expect(vi.mocked(mockFetch)).toHaveBeenCalledWith(
        'https://walletapi.bfmeta.info/wallet/bfm/lastblock',
        expect.objectContaining({ method: 'GET' }),
      )
    })

    it('should use custom base URL', async () => {
      mockFetch = createMockFetch({ success: true, result: { height: 1 } })
      api = new BnqklWalletBioforestApi({
        baseUrl: 'https://custom.api.com',
        chainPath: 'ccchain',
        fetch: mockFetch,
      })

      await api.getLastBlock()

      expect(vi.mocked(mockFetch)).toHaveBeenCalledWith(
        'https://custom.api.com/wallet/ccchain/lastblock',
        expect.any(Object),
      )
    })

    it('should throw ApiError on failure', async () => {
      mockFetch = createMockFetch(
        { success: false, message: 'Server error' },
        { ok: false, status: 500 },
      )
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: mockFetch })

      await expect(api.getLastBlock()).rejects.toThrow(ApiError)
    })
  })

  describe('getAddressInfo', () => {
    it('should fetch address info with secondPublicKey', async () => {
      const addressInfo = {
        address: 'cDtest123',
        secondPublicKey: 'pubkey123',
        accountStatus: 0,
      }
      mockFetch = createMockFetch({ success: true, result: addressInfo })
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: mockFetch })

      const result = await api.getAddressInfo('cDtest123')

      expect(result).toEqual(addressInfo)
      expect(vi.mocked(mockFetch)).toHaveBeenCalledWith(
        'https://walletapi.bfmeta.info/wallet/bfm/address/info',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ address: 'cDtest123' }),
        }),
      )
    })

    it('should return null for non-existent address', async () => {
      mockFetch = createMockFetch({ success: true, result: null })
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: mockFetch })

      const result = await api.getAddressInfo('unknown')

      expect(result).toBeNull()
    })
  })

  describe('getBalance', () => {
    it('should fetch balance', async () => {
      mockFetch = createMockFetch({ success: true, result: { amount: '1000000000' } })
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: mockFetch })

      const result = await api.getBalance({
        address: 'cDtest123',
        magic: 'bfm',
        assetType: 'BFM',
      })

      expect(result.amount).toBe('1000000000')
    })
  })

  describe('getAddressAssets', () => {
    it('should fetch address assets', async () => {
      const assets = {
        address: 'cDtest123',
        assets: {
          bfm: {
            BFM: {
              assetType: 'BFM',
              assetNumber: '1000000000',
              sourceChainMagic: 'bfm',
              sourceChainName: 'bfmeta',
            },
          },
        },
      }
      mockFetch = createMockFetch({ success: true, result: assets })
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: mockFetch })

      const result = await api.getAddressAssets('cDtest123')

      expect(result).toEqual(assets)
    })
  })

  describe('broadcastTransaction', () => {
    it('should broadcast transaction successfully', async () => {
      mockFetch = createMockFetch({ success: true, result: { success: true } })
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: mockFetch })

      const tx = { signature: 'sig123', senderId: 'cD1', recipientId: 'cD2' }
      const result = await api.broadcastTransaction(tx)

      expect(result.success).toBe(true)
      expect(vi.mocked(mockFetch)).toHaveBeenCalledWith(
        'https://walletapi.bfmeta.info/wallet/bfm/transactions/broadcast',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(tx),
        }),
      )
    })

    it('should return minFee on insufficient fee error', async () => {
      mockFetch = createMockFetch({
        success: true,
        result: { success: false, minFee: '50000', message: 'Insufficient fee' },
      })
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: mockFetch })

      const result = await api.broadcastTransaction({})

      expect(result.success).toBe(false)
      expect(result.minFee).toBe('50000')
    })
  })

  describe('queryTransactions', () => {
    it('should query transactions with pagination', async () => {
      const txList = {
        trs: [
          {
            transaction: { signature: 'sig1', senderId: 'cD1', recipientId: 'cD2', timestamp: 123, type: 'transfer', fee: '1000' },
            height: 100,
            dateCreated: '2024-01-01',
          },
        ],
        cmdLimitPerQuery: 100,
        count: 1,
      }
      mockFetch = createMockFetch({ success: true, result: txList })
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: mockFetch })

      const result = await api.queryTransactions({
        address: 'cDtest123',
        maxHeight: 1000,
        page: 1,
        pageSize: 20,
      })

      expect(result.trs).toHaveLength(1)
      expect(result.count).toBe(1)
    })
  })

  describe('queryPendingTransactions', () => {
    it('should query pending transactions', async () => {
      const pendingList = [
        {
          state: 1,
          trJson: { signature: 'sig1', senderId: 'cD1', recipientId: 'cD2', timestamp: 123, fee: '1000' },
          createdTime: '2024-01-01T00:00:00Z',
        },
      ]
      mockFetch = createMockFetch({ success: true, result: pendingList })
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: mockFetch })

      const result = await api.queryPendingTransactions({ senderId: 'cDtest123' })

      expect(result).toHaveLength(1)
      expect(result[0]!.state).toBe(1)
    })
  })

  describe('queryTokenList', () => {
    it('should query token list', async () => {
      const tokenList = {
        dataList: [{ assetType: 'BFM', decimals: 8 }],
        hasMore: false,
        page: 1,
        pageSize: 20,
        total: 1,
      }
      mockFetch = createMockFetch({ success: true, result: tokenList })
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: mockFetch })

      const result = await api.queryTokenList({ page: 1, pageSize: 20 })

      expect(result.dataList).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })

  describe('queryTokenDetail', () => {
    it('should query token detail', async () => {
      const detail = { assetType: 'BFM', decimals: 8 }
      mockFetch = createMockFetch({ success: true, result: detail })
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: mockFetch })

      const result = await api.queryTokenDetail({ assetType: 'BFM', address: 'cDtest' })

      expect(result.assetType).toBe('BFM')
      expect(result.decimals).toBe(8)
    })
  })

  describe('error handling', () => {
    it('should throw ApiError with message on API failure', async () => {
      mockFetch = createMockFetch(
        { success: false, message: 'Invalid address format' },
        { ok: true, status: 200 },
      )
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: mockFetch })

      await expect(api.getAddressInfo('invalid')).rejects.toThrow('Invalid address format')
    })

    it('should throw ApiError on network error', async () => {
      const errorFetch: FetchFn = vi.fn<FetchFn>().mockRejectedValue(new Error('Network error'))
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: errorFetch })

      await expect(api.getLastBlock()).rejects.toThrow('Network error')
    })

    it('should throw ApiError on timeout', async () => {
      const timeoutFetch: FetchFn = vi.fn<FetchFn>().mockImplementation(() => {
        const error = new Error('Timeout')
        error.name = 'AbortError'
        return Promise.reject(error)
      })
      api = new BnqklWalletBioforestApi({ chainPath: 'bfm', fetch: timeoutFetch, timeout: 100 })

      await expect(api.getLastBlock()).rejects.toThrow('Request timeout')
    })
  })
})
