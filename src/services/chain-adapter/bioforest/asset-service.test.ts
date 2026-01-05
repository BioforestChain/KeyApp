/**
 * BioforestAssetService 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AddressAssetsResponseSchema } from './schema'
import { BioforestAssetService } from './asset-service'

// Mock chainConfigService
vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getConfig: vi.fn((chainId: string) => {
      if (chainId === 'bfmeta') {
        return {
          id: 'bfmeta',
          chainKind: 'bioforest',
          name: 'BFMeta',
          symbol: 'BFM',
          decimals: 8,
          api: {
            url: 'https://walletapi.bfmeta.info',
            path: 'bfm',
          },
        }
      }
      return null
    }),
  },
}))

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

describe('BioforestAssetService', () => {
  let service: BioforestAssetService

  beforeEach(() => {
    service = new BioforestAssetService('bfmeta')
  })

  it('should get config from chainConfigService', () => {
    // getEmptyNativeBalance uses getConfig internally
    const balance = (service as any).getEmptyNativeBalance()
    
    expect(balance.symbol).toBe('BFM')
    expect(balance.amount.decimals).toBe(8)
  })

  it('should throw error for unknown chainId', () => {
    const unknownService = new BioforestAssetService('unknown-chain')
    
    expect(() => (unknownService as any).getConfig()).toThrow('Chain config not found: unknown-chain')
  })

  it('should return balance with valid symbol from getEmptyNativeBalance', () => {
    const balance = (service as any).getEmptyNativeBalance()
    
    expect(balance.symbol).toBe('BFM')
    expect(balance.symbol).not.toBeUndefined()
    expect(balance.amount.symbol).toBe('BFM')
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
