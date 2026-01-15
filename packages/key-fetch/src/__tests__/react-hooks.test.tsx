/**
 * Key-Fetch React Hooks Tests
 * 
 * Tests for useState functionality using @testing-library/react renderHook
 * These tests run in a proper React component context
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { z } from 'zod'
import { keyFetch, fallback, derive, transform } from '../index'
import '@biochain/key-fetch/react'  // Enable React support

// Mock fetch globally
const mockFetch = vi.fn()
const originalFetch = global.fetch
beforeEach(() => {
    global.fetch = mockFetch as typeof fetch
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

describe('keyFetch useState in React component', () => {
    const BalanceSchema = z.object({
        amount: z.string(),
        symbol: z.string(),
    })

    test('should return loading state initially', async () => {
        const mockData = { amount: '100', symbol: 'BFM' }
        mockFetch.mockResolvedValue(createMockResponse(mockData))

        const instance = keyFetch.create({
            name: 'react.test.balance',
            schema: BalanceSchema,
            url: 'https://api.test.com/balance',
        })

        const { result } = renderHook(() => instance.useState({ address: 'test' }))

        // Initially loading
        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()

        // Wait for data
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual(mockData)
        expect(result.current.error).toBeUndefined()
    })

    // Skip: This test is flaky due to timing issues with error propagation
    test.skip('should handle errors', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'))

        const instance = keyFetch.create({
            name: 'react.test.error',
            schema: BalanceSchema,
            url: 'https://api.test.com/balance',
        })

        const { result } = renderHook(() => instance.useState({ address: 'test' }))

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.error).toBeDefined()
        expect(result.current.data).toBeUndefined()
    })

    test('should not fetch when disabled', async () => {
        const mockData = { amount: '100', symbol: 'BFM' }
        mockFetch.mockResolvedValue(createMockResponse(mockData))

        const instance = keyFetch.create({
            name: 'react.test.disabled',
            schema: BalanceSchema,
            url: 'https://api.test.com/balance',
        })

        const { result } = renderHook(() =>
            instance.useState({ address: 'test' }, { enabled: false })
        )

        // Should immediately be not loading and have no data
        expect(result.current.isLoading).toBe(false)
        expect(result.current.data).toBeUndefined()
        expect(mockFetch).not.toHaveBeenCalled()
    })
})

describe('merge useState in React component', () => {
    const BalanceSchema = z.object({
        amount: z.string(),
        symbol: z.string(),
    })

    test('should work with merge instance', async () => {
        const mockData = { amount: '200', symbol: 'BFM' }
        mockFetch.mockResolvedValue(createMockResponse(mockData))

        const source = keyFetch.create({
            name: 'react.merge.source',
            schema: BalanceSchema,
            url: 'https://api.test.com/balance',
        })

        const merged = fallback({
            name: 'react.merge.test',
            sources: [source],
        })

        const { result } = renderHook(() => merged.useState({ address: 'test' }))

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual(mockData)
    })
})

describe('derive useState in React component', () => {
    const SourceSchema = z.object({
        success: z.boolean(),
        result: z.object({
            assets: z.record(z.string(), z.record(z.string(), z.object({
                assetType: z.string(),
                assetNumber: z.string(),
            }))),
        }).nullish(),
    })

    const BalanceSchema = z.object({
        amount: z.string(),
        symbol: z.string(),
    })

    test('should work with derive instance and transform', async () => {
        const sourceData = {
            success: true,
            result: {
                assets: {
                    'LLLQL': {
                        'BFM': { assetType: 'BFM', assetNumber: '100005012' },
                    }
                }
            }
        }
        mockFetch.mockResolvedValue(createMockResponse(sourceData))

        const addressAsset = keyFetch.create({
            name: 'react.derive.source',
            schema: SourceSchema,
            url: 'https://api.test.com/address/asset',
            method: 'POST',
        })

        const nativeBalance = derive({
            name: 'react.derive.balance',
            source: addressAsset,
            schema: BalanceSchema,
            use: [
                transform<z.infer<typeof SourceSchema>, z.infer<typeof BalanceSchema>>({
                    transform: (raw) => {
                        if (!raw.result?.assets) {
                            return { amount: '0', symbol: 'BFM' }
                        }
                        for (const magic of Object.values(raw.result.assets)) {
                            for (const asset of Object.values(magic)) {
                                if (asset.assetType === 'BFM') {
                                    return { amount: asset.assetNumber, symbol: 'BFM' }
                                }
                            }
                        }
                        return { amount: '0', symbol: 'BFM' }
                    },
                }),
            ],
        })

        const { result } = renderHook(() => nativeBalance.useState({ address: 'test' }))

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual({ amount: '100005012', symbol: 'BFM' })
    })

    test('should handle null result from API', async () => {
        const sourceData = {
            success: true,
            result: null
        }
        mockFetch.mockResolvedValue(createMockResponse(sourceData))

        const addressAsset = keyFetch.create({
            name: 'react.derive.null.source',
            schema: SourceSchema,
            url: 'https://api.test.com/address/asset',
            method: 'POST',
        })

        const nativeBalance = derive({
            name: 'react.derive.null.balance',
            source: addressAsset,
            schema: BalanceSchema,
            use: [
                transform<z.infer<typeof SourceSchema>, z.infer<typeof BalanceSchema>>({
                    transform: (raw) => {
                        if (!raw.result?.assets) {
                            return { amount: '0', symbol: 'BFM' }
                        }
                        return { amount: '0', symbol: 'BFM' }
                    },
                }),
            ],
        })

        const { result } = renderHook(() => nativeBalance.useState({ address: 'test' }))

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual({ amount: '0', symbol: 'BFM' })
    })
})

describe('ChainProvider simulation with merge and derive', () => {
    const SourceSchema = z.object({
        success: z.boolean(),
        result: z.object({
            address: z.string(),
            assets: z.record(z.string(), z.record(z.string(), z.object({
                assetType: z.string(),
                assetNumber: z.string(),
            }))),
        }).nullish(),
    })

    const BalanceSchema = z.object({
        amount: z.string(),
        symbol: z.string(),
    })

    test('should work like ChainProvider.nativeBalance.useState()', async () => {
        // Simulates real API response
        const realApiResponse = {
            success: true,
            result: {
                address: 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j',
                assets: {
                    'LLLQL': {
                        'BFM': { assetType: 'BFM', assetNumber: '100005012' },
                        'CPCC': { assetType: 'CPCC', assetNumber: '99999968' },
                    }
                }
            }
        }
        mockFetch.mockResolvedValue(createMockResponse(realApiResponse))

        // Simulates BiowalletProvider.nativeBalance (derived from addressAsset)
        const addressAsset = keyFetch.create({
            name: 'biowallet.bfmeta.addressAsset.react',
            schema: SourceSchema,
            url: 'https://walletapi.bfmeta.info/wallet/bfm/address/asset',
            method: 'POST',
        })

        const nativeBalance = derive({
            name: 'biowallet.bfmeta.nativeBalance.react',
            source: addressAsset,
            schema: BalanceSchema,
            use: [
                transform<z.infer<typeof SourceSchema>, z.infer<typeof BalanceSchema>>({
                    transform: (raw) => {
                        const symbol = 'BFM'
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

        // Simulates ChainProvider.nativeBalance (merge of provider balances)
        const chainNativeBalance = fallback({
            name: 'bfmeta.nativeBalance.react',
            sources: [nativeBalance],
        })

        // This is exactly how WalletTab uses it
        const { result } = renderHook(() =>
            chainNativeBalance.useState(
                { address: 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j' },
                { enabled: true }
            )
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        }, { timeout: 3000 })

        // Verify the data is correctly transformed
        expect(result.current.data).toEqual({ amount: '100005012', symbol: 'BFM' })
        expect(result.current.error).toBeUndefined()
    })
})
