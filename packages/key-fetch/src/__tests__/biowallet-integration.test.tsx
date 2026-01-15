/**
 * BiowalletProvider Integration Tests
 * 
 * Tests the exact structure of biowallet-provider to ensure
 * nativeBalance derived from addressAsset works correctly
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { z } from 'zod'
import { keyFetch, fallback, derive, transform } from '../index'
import { postBody } from '../plugins/params'
import { ttl } from '../plugins/ttl'
import '@biochain/key-fetch/react'  // Enable React support

// Mock fetch globally
const mockFetch = vi.fn()
const originalFetch = global.fetch
beforeEach(() => {
    global.fetch = mockFetch as unknown as typeof fetch
    vi.clearAllMocks()
})
afterEach(() => {
    global.fetch = originalFetch
})

/** Helper to create mock Response */
function createMockResponse(data: unknown, ok = true, status = 200): Response {
    const jsonData = JSON.stringify(data)
    return new Response(jsonData, {
        status,
        statusText: ok ? 'OK' : 'Error',
        headers: { 'Content-Type': 'application/json' },
    })
}

describe('BiowalletProvider exact structure', () => {
    // Exact schemas from biowallet-provider.ts
    const BiowalletAssetItemSchema = z.object({
        assetNumber: z.string(),
        assetType: z.string(),
    }).passthrough()

    const AssetResponseSchema = z.object({
        success: z.boolean(),
        result: z.object({
            address: z.string(),
            assets: z.record(z.string(), z.record(z.string(), BiowalletAssetItemSchema)),
        }).nullish(), // Changed from optional to nullish to handle null
    })

    const AddressParamsSchema = z.object({
        address: z.string(),
    })

    // From types.ts
    const BalanceOutputSchema = z.object({
        amount: z.any(), // In real code this is Amount class
        symbol: z.string(),
    })

    test('should correctly derive nativeBalance from addressAsset', async () => {
        // Real API response format
        const realApiResponse = {
            success: true,
            result: {
                address: 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j',
                assets: {
                    'LLLQL': {
                        'BFM': {
                            sourceChainMagic: 'LLLQL',
                            assetType: 'BFM',
                            sourceChainName: 'bfmeta',
                            assetNumber: '100005012',
                            iconUrl: 'https://example.com/icon.png'
                        },
                        'CPCC': {
                            sourceChainMagic: 'LLLQL',
                            assetType: 'CPCC',
                            assetNumber: '99999968'
                        }
                    }
                },
                forgingRewards: '0'
            }
        }
        mockFetch.mockImplementation(async (_url, init) => {
            console.log('[Test] Fetch called with:', _url, init?.body)
            return createMockResponse(realApiResponse)
        })

        const chainId = 'bfmeta'
        const symbol = 'BFM'
        const decimals = 8
        const baseUrl = 'https://walletapi.bfmeta.info/wallet/bfm'

        // Create addressAsset exactly like biowallet-provider
        const addressAsset = keyFetch.create({
            name: `biowallet.${chainId}.addressAsset.test`,
            schema: AssetResponseSchema,
            paramsSchema: AddressParamsSchema,
            url: `${baseUrl}/address/asset`,
            method: 'POST',
            use: [postBody(), ttl(60_000)],
        })

        // Create nativeBalance derived from addressAsset
        const nativeBalance = derive({
            name: `biowallet.${chainId}.nativeBalance.test`,
            source: addressAsset,
            schema: BalanceOutputSchema,
            use: [
                transform<z.infer<typeof AssetResponseSchema>, z.infer<typeof BalanceOutputSchema>>({
                    transform: (raw) => {
                        console.log('[Test] Transform called with raw data:', raw)
                        if (!raw.result?.assets) {
                            console.log('[Test] No assets found, returning zero')
                            return { amount: '0', symbol }
                        }
                        // 遍历嵌套结构 assets[magic][assetType]
                        for (const magic of Object.values(raw.result.assets)) {
                            for (const asset of Object.values(magic)) {
                                if (asset.assetType === symbol) {
                                    console.log('[Test] Found asset:', asset)
                                    return {
                                        amount: asset.assetNumber,
                                        symbol,
                                    }
                                }
                            }
                        }
                        console.log('[Test] Asset not found, returning zero')
                        return { amount: '0', symbol }
                    },
                }),
            ],
        })

        // First test: Direct fetch
        const directResult = await addressAsset.fetch({ address: 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j' })
        console.log('[Test] Direct addressAsset.fetch result:', directResult)
        expect(directResult.success).toBe(true)
        expect(directResult.result?.assets).toBeDefined()

        // Second test: Derived fetch
        const derivedResult = await nativeBalance.fetch({ address: 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j' })
        console.log('[Test] nativeBalance.fetch result:', derivedResult)
        expect(derivedResult.amount).toBe('100005012')
        expect(derivedResult.symbol).toBe('BFM')
    })

    test('ChainProvider.nativeBalance through merge', async () => {
        const realApiResponse = {
            success: true,
            result: {
                address: 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j',
                assets: {
                    'LLLQL': {
                        'BFM': { assetType: 'BFM', assetNumber: '100005012' }
                    }
                }
            }
        }
        mockFetch.mockImplementation(async () => createMockResponse(realApiResponse))

        const chainId = 'bfmeta'
        const symbol = 'BFM'
        const baseUrl = 'https://walletapi.bfmeta.info/wallet/bfm'

        // Simulate BiowalletProvider
        const addressAsset = keyFetch.create({
            name: `biowallet.${chainId}.addressAsset.cp`,
            schema: AssetResponseSchema,
            paramsSchema: AddressParamsSchema,
            url: `${baseUrl}/address/asset`,
            method: 'POST',
            use: [postBody(), ttl(60_000)],
        })

        const nativeBalance = derive({
            name: `biowallet.${chainId}.nativeBalance.cp`,
            source: addressAsset,
            schema: BalanceOutputSchema,
            use: [
                transform<z.infer<typeof AssetResponseSchema>, z.infer<typeof BalanceOutputSchema>>({
                    transform: (raw) => {
                        if (!raw.result?.assets) {
                            return { amount: '0', symbol }
                        }
                        for (const magic of Object.values(raw.result.assets)) {
                            for (const asset of Object.values(magic)) {
                                if (asset.assetType === symbol) {
                                    return { amount: asset.assetNumber, symbol }
                                }
                            }
                        }
                        return { amount: '0', symbol }
                    },
                }),
            ],
        })

        // Simulate ChainProvider.nativeBalance (merge of provider balances)
        const chainNativeBalance = fallback({
            name: `${chainId}.nativeBalance.cp`,
            sources: [nativeBalance],
        })

        // Test useState like WalletTab does
        const address = 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j'

        const { result } = renderHook(() =>
            chainNativeBalance.useState(
                { address },
                { enabled: !!address }
            )
        )

        console.log('[Test] Initial state:', result.current)
        expect(result.current.isLoading).toBe(true)

        await waitFor(() => {
            console.log('[Test] Waiting for isLoading to be false, current:', result.current)
            expect(result.current.isLoading).toBe(false)
        }, { timeout: 5000 })

        console.log('[Test] Final result:', result.current)
        expect(result.current.data).toBeDefined()
        expect(result.current.data?.amount).toBe('100005012')
    })

    test('should handle null result correctly', async () => {
        const nullResponse = {
            success: true,
            result: null
        }
        mockFetch.mockImplementation(async () => createMockResponse(nullResponse))

        const chainId = 'bfmetav2'
        const symbol = 'BFM'

        const addressAsset = keyFetch.create({
            name: `biowallet.${chainId}.addressAsset.null`,
            schema: AssetResponseSchema,
            url: 'https://walletapi.bf-meta.org/wallet/bfmetav2/address/asset',
            method: 'POST',
            use: [postBody(), ttl(60_000)],
        })

        const nativeBalance = derive({
            name: `biowallet.${chainId}.nativeBalance.null`,
            source: addressAsset,
            schema: BalanceOutputSchema,
            use: [
                transform<z.infer<typeof AssetResponseSchema>, z.infer<typeof BalanceOutputSchema>>({
                    transform: (raw) => {
                        if (!raw.result?.assets) {
                            return { amount: '0', symbol }
                        }
                        return { amount: '0', symbol }
                    },
                }),
            ],
        })

        const chainNativeBalance = fallback({
            name: `${chainId}.nativeBalance.null`,
            sources: [nativeBalance],
        })

        const { result } = renderHook(() =>
            chainNativeBalance.useState(
                { address: 'test' },
                { enabled: true }
            )
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        }, { timeout: 5000 })

        expect(result.current.data).toEqual({ amount: '0', symbol: 'BFM' })
        expect(result.current.error).toBeUndefined()
    })
})
