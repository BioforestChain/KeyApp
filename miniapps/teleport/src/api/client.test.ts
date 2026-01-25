import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getTransmitAssetTypeList,
  transmit,
  getTransmitRecords,
  getTransmitRecordDetail,
  retryFromTxOnChain,
  retryToTxOnChain,
  ApiError,
} from './client'

const mockFetch = vi.fn()
// @ts-expect-error - mock fetch for testing
global.fetch = mockFetch

describe('Teleport API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getTransmitAssetTypeList', () => {
    it('should fetch asset type list', async () => {
      const mockResult = {
        transmitSupport: {
          ETH: {
            ETH: {
              enable: true,
              isAirdrop: false,
              assetType: 'ETH',
              recipientAddress: '0x123',
              targetChain: 'BFMCHAIN',
              targetAsset: 'BFM',
              ratio: { numerator: 1, denominator: 1 },
              transmitDate: {
                startDate: '2020-01-01',
                endDate: '2030-12-31',
              },
            },
          },
        },
      }

      const mockResponse = {
        success: true,
        result: mockResult,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      })

      const result = await getTransmitAssetTypeList()
      expect(result).toEqual(mockResult)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.eth-metaverse.com/payment/transmit/assetTypeList',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })

    it('should throw ApiError on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve(JSON.stringify({ message: 'Internal Server Error' })),
      })

      await expect(getTransmitAssetTypeList()).rejects.toThrow(ApiError)
    })

    it('should throw ApiError when success is false without result', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: false, message: 'Not allowed', error: { code: 403 } }),
      })

      const promise = getTransmitAssetTypeList()
      await expect(promise).rejects.toThrow(ApiError)
      await expect(promise).rejects.toThrow('Not allowed')
    })
  })

  describe('transmit', () => {
    it('should send transmit request', async () => {
      const mockRequest = {
        fromTrJson: { eth: { signTransData: '0x123' } },
        toTrInfo: {
          chainName: 'BFMCHAIN' as const,
          address: '0xabc',
          assetType: 'BFM' as const,
        },
      }

      const mockResponse = { orderId: 'order-123' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      })

      const result = await transmit(mockRequest)
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.eth-metaverse.com/payment/transmit',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(mockRequest),
        })
      )
    })
  })

  describe('getTransmitRecords', () => {
    it('should fetch records with pagination', async () => {
      const mockResponse = {
        page: 1,
        pageSize: 10,
        dataList: [
          {
            orderId: '1',
            state: 1,
            orderState: 4,
            createdTime: '2024-01-01T00:00:00.000Z',
            fromTxInfo: {
              chainName: 'ETH',
              amount: '0.1',
              asset: 'ETH',
              decimals: 18,
            },
            toTxInfo: {
              chainName: 'BFMCHAIN',
              amount: '0.1',
              asset: 'BFM',
              decimals: 8,
            },
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      })

      const result = await getTransmitRecords({ page: 1, pageSize: 10 })
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/transmit/records?'),
        expect.any(Object)
      )
    })

    it('should include filter params', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ page: 1, pageSize: 10, dataList: [] })),
      })

      await getTransmitRecords({
        page: 1,
        pageSize: 10,
        fromChain: 'ETH',
        fromAddress: '0x123',
      })

      const url = mockFetch.mock.calls[0][0]
      expect(url).toContain('fromChain=ETH')
      expect(url).toContain('fromAddress=0x123')
    })
  })

  describe('getTransmitRecordDetail', () => {
    it('should fetch record detail', async () => {
      const mockResponse = {
        state: 3,
        orderState: 4,
        swapRatio: 1,
        updatedTime: '2024-01-01T00:00:00.000Z',
        fromTxInfo: {
          chainName: 'ETH',
          address: '0x123',
        },
        toTxInfo: {
          chainName: 'BFMCHAIN',
          address: 'bfm123',
        },
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      })

      const result = await getTransmitRecordDetail('order-123')
      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('orderId=order-123'),
        expect.any(Object)
      )
    })
  })

  describe('retryFromTxOnChain', () => {
    it('should retry from tx', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(true)),
      })

      const result = await retryFromTxOnChain('order-123')
      expect(result).toBe(true)
    })
  })

  describe('retryToTxOnChain', () => {
    it('should retry to tx', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(true)),
      })

      const result = await retryToTxOnChain('order-123')
      expect(result).toBe(true)
    })
  })

  describe('ApiError', () => {
    it('should contain status and data', () => {
      const error = new ApiError('Test error', 400, { detail: 'Bad request' })
      expect(error.message).toBe('Test error')
      expect(error.status).toBe(400)
      expect(error.data).toEqual({ detail: 'Bad request' })
    })
  })
})
