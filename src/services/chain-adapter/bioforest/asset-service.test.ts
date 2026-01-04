/**
 * BioforestAssetService 单元测试
 */

import { describe, it, expect } from 'vitest'
import { AddressAssetsResponseSchema } from './schema'

describe('AddressAssetsResponseSchema', () => {
  it('should parse successful response with assets', () => {
    const response = {
      success: true,
      result: {
        address: 'b9gB9NzHKWsDKGYFCaNva6xRnxPwFfGcfx',
        assets: {
          LLLQL: {
            BFM: {
              sourceChainMagic: 'LLLQL',
              assetType: 'BFM',
              sourceChainName: 'bfmeta',
              assetNumber: '998936',
              iconUrl: 'https://example.com/icon.png',
            },
          },
        },
        forgingRewards: '0',
      },
    }

    const parsed = AddressAssetsResponseSchema.safeParse(response)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.success).toBe(true)
      expect(parsed.data.result?.assets.LLLQL?.BFM?.assetType).toBe('BFM')
      expect(parsed.data.result?.assets.LLLQL?.BFM?.assetNumber).toBe('998936')
    }
  })

  it('should parse error response', () => {
    const response = {
      success: false,
      error: {
        code: 500,
        message: 'input address is wrong',
        info: 'Error: input address is wrong',
      },
    }

    const parsed = AddressAssetsResponseSchema.safeParse(response)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.success).toBe(false)
      expect(parsed.data.error?.code).toBe(500)
    }
  })

  it('should reject response with missing required asset fields', () => {
    const response = {
      success: true,
      result: {
        address: 'test',
        assets: {
          LLLQL: {
            BFM: {
              // missing assetType - required field
              assetNumber: '100',
              sourceChainMagic: 'LLLQL',
              sourceChainName: 'bfmeta',
            },
          },
        },
      },
    }

    const parsed = AddressAssetsResponseSchema.safeParse(response)
    expect(parsed.success).toBe(false)
  })

  it('should reject response with empty assetType', () => {
    const response = {
      success: true,
      result: {
        address: 'test',
        assets: {
          LLLQL: {
            BFM: {
              assetType: '', // empty string - should fail min(1)
              assetNumber: '100',
              sourceChainMagic: 'LLLQL',
              sourceChainName: 'bfmeta',
            },
          },
        },
      },
    }

    const parsed = AddressAssetsResponseSchema.safeParse(response)
    expect(parsed.success).toBe(false)
  })
})

describe.skipIf(!process.env.TEST_REAL_API)('BioforestAssetService Integration', () => {
  const API_URL = 'https://walletapi.bfmeta.info'
  const CHAIN_PATH = 'bfm'
  const TEST_ADDRESS = 'b9gB9NzHKWsDKGYFCaNva6xRnxPwFfGcfx'

  it('should parse real API response', async () => {
    const response = await fetch(`${API_URL}/wallet/${CHAIN_PATH}/address/asset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: TEST_ADDRESS }),
    })

    const json: unknown = await response.json()
    const parsed = AddressAssetsResponseSchema.safeParse(json)

    expect(parsed.success).toBe(true)
    if (parsed.success && parsed.data.success && parsed.data.result) {
      expect(parsed.data.result.address).toBe(TEST_ADDRESS)
      // Should have at least native token
      const magicKeys = Object.keys(parsed.data.result.assets)
      expect(magicKeys.length).toBeGreaterThan(0)
    }
  })
})
