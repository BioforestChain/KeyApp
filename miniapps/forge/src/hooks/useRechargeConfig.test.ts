import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useRechargeConfig } from './useRechargeConfig'
import type { RechargeSupportResDto } from '@/api/types'

vi.mock('@/api', () => ({
  rechargeApi: {
    getSupport: vi.fn(),
  },
}))

import { rechargeApi } from '@/api'

const mockConfig: RechargeSupportResDto = {
  recharge: {
    bfmeta: {
      BFM: {
        enable: true,
        chainName: 'bfmeta',
        assetType: 'BFM',
        applyAddress: 'bfm-apply-addr',
        logo: 'bfm.png',
        supportChain: {
          ETH: {
            enable: true,
            assetType: 'ETH',
            depositAddress: '0x123',
            logo: 'eth.png',
          },
          BSC: {
            enable: true,
            assetType: 'BNB',
            depositAddress: '0x456',
          },
          TRON: {
            enable: false,
            assetType: 'TRX',
            depositAddress: 'T123',
          },
        },
      },
    },
    bfchain: {
      BFC: {
        enable: false,
        chainName: 'bfchain',
        assetType: 'BFC',
        applyAddress: 'bfc-apply-addr',
        supportChain: {},
      },
    },
  },
}

describe('useRechargeConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch config on mount', async () => {
    vi.mocked(rechargeApi.getSupport).mockResolvedValue(mockConfig)

    const { result } = renderHook(() => useRechargeConfig())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(rechargeApi.getSupport).toHaveBeenCalledTimes(1)
    expect(result.current.config).toEqual(mockConfig.recharge)
  })

  it('should parse forge options correctly', async () => {
    vi.mocked(rechargeApi.getSupport).mockResolvedValue(mockConfig)

    const { result } = renderHook(() => useRechargeConfig())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const options = result.current.forgeOptions
    expect(options).toHaveLength(2) // ETH and BSC enabled, TRON disabled

    expect(options[0]).toMatchObject({
      externalChain: 'ETH',
      externalAsset: 'ETH',
      internalChain: 'bfmeta',
      internalAsset: 'BFM',
    })

    expect(options[1]).toMatchObject({
      externalChain: 'BSC',
      externalAsset: 'BNB',
      internalChain: 'bfmeta',
      internalAsset: 'BFM',
    })
  })

  it('should handle API errors', async () => {
    vi.mocked(rechargeApi.getSupport).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useRechargeConfig())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.config).toBeNull()
    expect(result.current.forgeOptions).toHaveLength(0)
  })

  it('should refetch on demand', async () => {
    vi.mocked(rechargeApi.getSupport).mockResolvedValue(mockConfig)

    const { result } = renderHook(() => useRechargeConfig())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(rechargeApi.getSupport).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(rechargeApi.getSupport).toHaveBeenCalledTimes(2)
    })
  })

  it('should filter disabled assets', async () => {
    const configWithDisabled: RechargeSupportResDto = {
      recharge: {
        bfmeta: {
          BFM: {
            enable: true,
            chainName: 'bfmeta',
            assetType: 'BFM',
            applyAddress: 'bfm-apply',
            supportChain: {
              ETH: { enable: true, assetType: 'ETH', depositAddress: '0x1' },
              BSC: { enable: false, assetType: 'BNB', depositAddress: '0x2' },
            },
          },
          DISABLED: {
            enable: false,
            chainName: 'bfmeta',
            assetType: 'DISABLED',
            applyAddress: 'disabled-apply',
            supportChain: {
              ETH: { enable: true, assetType: 'ETH', depositAddress: '0x3' },
            },
          },
        },
      },
    }

    vi.mocked(rechargeApi.getSupport).mockResolvedValue(configWithDisabled)

    const { result } = renderHook(() => useRechargeConfig())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.forgeOptions).toHaveLength(1)
    expect(result.current.forgeOptions[0].externalChain).toBe('ETH')
  })
})
