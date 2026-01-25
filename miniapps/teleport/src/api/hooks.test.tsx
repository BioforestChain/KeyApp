import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  useTransmitAssetTypeList,
  useTransmit,
  useTransmitRecords,
  useTransmitRecordDetail,
  queryKeys,
} from './hooks'
import * as client from './client'

vi.mock('./client')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('Teleport API Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useTransmitAssetTypeList', () => {
    it('should fetch and transform asset list', async () => {
      const mockData = {
        transmitSupport: {
          ETH: {
            ETH: {
              enable: true,
              isAirdrop: false,
              assetType: 'ETH',
              recipientAddress: '0x123',
              targetChain: 'BFMCHAIN' as const,
              targetAsset: 'BFM' as const,
              ratio: { numerator: 1, denominator: 1 },
              transmitDate: {
                startDate: '2020-01-01',
                endDate: '2030-12-31',
              },
            },
          },
        },
      }

      vi.mocked(client.getTransmitAssetTypeList).mockResolvedValue(mockData)

      const { result } = renderHook(() => useTransmitAssetTypeList(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toHaveLength(1)
      expect(result.current.data?.[0]).toMatchObject({
        chain: 'ETH',
        symbol: 'ETH',
        targetChain: 'BFMCHAIN',
      })
    })

    it('should filter disabled assets', async () => {
      const mockData = {
        transmitSupport: {
          ETH: {
            ETH: {
              enable: false,
              isAirdrop: false,
              assetType: 'ETH',
              recipientAddress: '0x123',
              targetChain: 'BFMCHAIN' as const,
              targetAsset: 'BFM' as const,
              ratio: { numerator: 1, denominator: 1 },
              transmitDate: {
                startDate: '2020-01-01',
                endDate: '2030-12-31',
              },
            },
          },
        },
      }

      vi.mocked(client.getTransmitAssetTypeList).mockResolvedValue(mockData)

      const { result } = renderHook(() => useTransmitAssetTypeList(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toHaveLength(0)
    })

    it('should filter expired assets', async () => {
      const mockData = {
        transmitSupport: {
          ETH: {
            ETH: {
              enable: true,
              isAirdrop: false,
              assetType: 'ETH',
              recipientAddress: '0x123',
              targetChain: 'BFMCHAIN' as const,
              targetAsset: 'BFM' as const,
              ratio: { numerator: 1, denominator: 1 },
              transmitDate: {
                startDate: '2020-01-01',
                endDate: '2020-12-31', // Expired
              },
            },
          },
        },
      }

      vi.mocked(client.getTransmitAssetTypeList).mockResolvedValue(mockData)

      const { result } = renderHook(() => useTransmitAssetTypeList(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toHaveLength(0)
    })
  })

  describe('useTransmit', () => {
    it('should submit transmit request', async () => {
      const mockResponse = { orderId: 'order-123' }
      vi.mocked(client.transmit).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useTransmit(), {
        wrapper: createWrapper(),
      })

      result.current.mutate({
        fromTrJson: { eth: { signTransData: '0x123' } },
        toTrInfo: {
          chainName: 'BFMCHAIN',
          address: '0xabc',
          assetType: 'BFM',
        },
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockResponse)
    })
  })

  describe('useTransmitRecords', () => {
    it('should fetch records', async () => {
      const mockData = {
        page: 1,
        pageSize: 10,
        dataList: [
          {
            orderId: '1',
            state: 3,
            orderState: 4,
            createdTime: '2024-01-01T00:00:00.000Z',
            fromTxInfo: {
              chainName: 'ETH' as const,
              amount: '0.1',
              asset: 'ETH',
              decimals: 18,
            },
            toTxInfo: {
              chainName: 'BFMCHAIN' as const,
              amount: '0.1',
              asset: 'BFM',
              decimals: 8,
            },
          },
        ],
      }

      vi.mocked(client.getTransmitRecords).mockResolvedValue(mockData)

      const { result } = renderHook(
        () => useTransmitRecords({ page: 1, pageSize: 10 }),
        { wrapper: createWrapper() }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.dataList).toHaveLength(1)
    })
  })

  describe('useTransmitRecordDetail', () => {
    it('should fetch record detail', async () => {
      const mockData = {
        state: 3,
        orderState: 4,
        swapRatio: 1,
        updatedTime: '2024-01-01T00:00:00.000Z',
        fromTxInfo: {
          chainName: 'ETH' as const,
          address: '0x123',
        },
        toTxInfo: {
          chainName: 'BFMCHAIN' as const,
          address: 'bfm123',
        },
      }

      vi.mocked(client.getTransmitRecordDetail).mockResolvedValue(mockData)

      const { result } = renderHook(
        () => useTransmitRecordDetail('order-123'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockData)
    })

    it('should not fetch when orderId is empty', () => {
      const { result } = renderHook(
        () => useTransmitRecordDetail('', { enabled: false }),
        { wrapper: createWrapper() }
      )

      expect(result.current.isFetching).toBe(false)
    })
  })

  describe('queryKeys', () => {
    it('should generate correct query keys', () => {
      expect(queryKeys.assetTypeList).toEqual(['transmit', 'assetTypeList'])
      expect(queryKeys.records({ page: 1, pageSize: 10 })).toEqual([
        'transmit',
        'records',
        { page: 1, pageSize: 10 },
      ])
      expect(queryKeys.recordDetail('order-123')).toEqual([
        'transmit',
        'recordDetail',
        'order-123',
      ])
    })
  })
})
