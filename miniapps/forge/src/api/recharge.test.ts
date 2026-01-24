import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { rechargeApi, ApiError } from '@/api'

const mockFetch = vi.fn()
// @ts-expect-error - mock fetch for testing
global.fetch = mockFetch

describe('Forge rechargeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_COT_API_BASE_URL', 'https://walletapi.bf-meta.org')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should unwrap { success, result } responses', async () => {
    const mockResult = {
      recharge: {
        bfmeta: {
          BFM: {
            enable: true,
            chainName: 'bfmeta',
            assetType: 'BFM',
            applyAddress: 'bfm-apply-addr',
            supportChain: {},
          },
        },
      },
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, result: mockResult }),
    })

    const result = await rechargeApi.getSupport()
    expect(result).toEqual(mockResult)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://walletapi.bf-meta.org/cot/recharge/support',
      expect.any(Object),
    )
  })

  it('should throw ApiError when success is false', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: false, message: 'Not allowed', result: null }),
    })

    const promise = rechargeApi.getSupport()
    await expect(promise).rejects.toThrow(ApiError)
    await expect(promise).rejects.toThrow('Not allowed')
  })

  it('should throw ApiError when success is false without result', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: false, message: 'Bad Request', error: { code: 400 } }),
    })

    const promise = rechargeApi.getSupport()
    await expect(promise).rejects.toThrow(ApiError)
    await expect(promise).rejects.toThrow('Bad Request')
  })
})
