/**
 * Key-Fetch Derive Tests
 * 
 * Tests for derive functionality including:
 * - subscribe data flow
 * - transform plugin processing
 * - error handling
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { z } from 'zod'
import { keyFetch, derive, transform } from '../index'
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

describe('keyFetch.create basic functionality', () => {
    const TestSchema = z.object({
        success: z.boolean(),
        result: z.object({
            value: z.string(),
        }).nullable(),
    })

    test('should fetch and parse data correctly', async () => {
        const mockData = { success: true, result: { value: 'hello' } }
        mockFetch.mockResolvedValueOnce(createMockResponse(mockData))

        const instance = keyFetch.create({
            name: 'test.basic',
            outputSchema: TestSchema,
            url: 'https://api.test.com/data',
        })

        const result = await instance.fetch({})

        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(result).toEqual(mockData)
    })

    test('should handle null result correctly', async () => {
        const mockData = { success: true, result: null }
        mockFetch.mockResolvedValueOnce(createMockResponse(mockData))

        const instance = keyFetch.create({
            name: 'test.null',
            outputSchema: TestSchema,
            url: 'https://api.test.com/data',
        })

        const result = await instance.fetch({})

        expect(result).toEqual(mockData)
        expect(result.result).toBeNull()
    })

    test('should throw on schema validation failure', async () => {
        const invalidData = { success: 'not-boolean', result: null }
        mockFetch.mockResolvedValueOnce(createMockResponse(invalidData))

        const instance = keyFetch.create({
            name: 'test.invalid',
            outputSchema: TestSchema,
            url: 'https://api.test.com/data',
        })

        await expect(instance.fetch({})).rejects.toThrow()
    })
})

describe('keyFetch subscribe functionality', () => {
    const TestSchema = z.object({
        value: z.number(),
    })

    test('should subscribe and receive data updates', async () => {
        const mockData = { value: 42 }
        mockFetch.mockResolvedValue(createMockResponse(mockData))

        const instance = keyFetch.create({
            name: 'test.subscribe',
            outputSchema: TestSchema,
            url: 'https://api.test.com/data',
        })

        const callback = vi.fn()
        const unsubscribe = instance.subscribe({}, callback)

        // Wait for async subscription to complete
        await new Promise(resolve => setTimeout(resolve, 100))

        expect(callback).toHaveBeenCalled()
        expect(callback).toHaveBeenCalledWith(mockData, expect.any(String))

        unsubscribe()
    })
})

describe('derive functionality', () => {
    // Source schema - simulates biowallet API response
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

    // Output schema - simulates balance
    const BalanceSchema = z.object({
        symbol: z.string(),
        amount: z.string(),
    })

    test('should derive and transform data correctly', async () => {
        const sourceData = {
            success: true,
            result: {
                address: 'testAddress',
                assets: {
                    'MAGIC': {
                        'BFM': { assetType: 'BFM', assetNumber: '100000000' },
                        'CPCC': { assetType: 'CPCC', assetNumber: '50000000' },
                    }
                }
            }
        }
        mockFetch.mockResolvedValue(createMockResponse(sourceData))

        const source = keyFetch.create({
            name: 'test.source',
            outputSchema: SourceSchema,
            url: 'https://api.test.com/address/asset',
            method: 'POST',
        })

        const derived = derive({
            name: 'test.derived.balance',
            source,
            outputSchema: BalanceSchema,
            use: [
                transform<z.infer<typeof SourceSchema>, z.infer<typeof BalanceSchema>>({
                    transform: (raw) => {
                        if (!raw.result?.assets) {
                            return { symbol: 'BFM', amount: '0' }
                        }
                        // Find BFM asset
                        for (const magic of Object.values(raw.result.assets)) {
                            for (const asset of Object.values(magic)) {
                                if (asset.assetType === 'BFM') {
                                    return {
                                        symbol: 'BFM',
                                        amount: asset.assetNumber,
                                    }
                                }
                            }
                        }
                        return { symbol: 'BFM', amount: '0' }
                    },
                }),
            ],
        })

        const result = await derived.fetch({ address: 'testAddress' })

        expect(result).toEqual({ symbol: 'BFM', amount: '100000000' })
    })

    test('should handle null result in source data', async () => {
        const sourceData = {
            success: true,
            result: null
        }
        mockFetch.mockResolvedValue(createMockResponse(sourceData))

        const source = keyFetch.create({
            name: 'test.source.null',
            outputSchema: SourceSchema,
            url: 'https://api.test.com/address/asset',
            method: 'POST',
        })

        const derived = derive({
            name: 'test.derived.null',
            source,
            outputSchema: BalanceSchema,
            use: [
                transform<z.infer<typeof SourceSchema>, z.infer<typeof BalanceSchema>>({
                    transform: (raw) => {
                        if (!raw.result?.assets) {
                            return { symbol: 'BFM', amount: '0' }
                        }
                        return { symbol: 'BFM', amount: '0' }
                    },
                }),
            ],
        })

        const result = await derived.fetch({ address: 'testAddress' })

        expect(result).toEqual({ symbol: 'BFM', amount: '0' })
    })

    test('derive subscribe should receive transformed data', async () => {
        const sourceData = {
            success: true,
            result: {
                address: 'testAddress',
                assets: {
                    'MAGIC': {
                        'BFM': { assetType: 'BFM', assetNumber: '100000000' },
                    }
                }
            }
        }
        mockFetch.mockResolvedValue(createMockResponse(sourceData))

        const source = keyFetch.create({
            name: 'test.source.sub',
            outputSchema: SourceSchema,
            url: 'https://api.test.com/address/asset',
            method: 'POST',
        })

        const derived = derive({
            name: 'test.derived.sub',
            source,
            outputSchema: BalanceSchema,
            use: [
                transform<z.infer<typeof SourceSchema>, z.infer<typeof BalanceSchema>>({
                    transform: (raw) => {
                        if (!raw.result?.assets) {
                            return { symbol: 'BFM', amount: '0' }
                        }
                        for (const magic of Object.values(raw.result.assets)) {
                            for (const asset of Object.values(magic)) {
                                if (asset.assetType === 'BFM') {
                                    return { symbol: 'BFM', amount: asset.assetNumber }
                                }
                            }
                        }
                        return { symbol: 'BFM', amount: '0' }
                    },
                }),
            ],
        })

        const callback = vi.fn()
        const unsubscribe = derived.subscribe({ address: 'testAddress' }, callback)

        // Wait for async subscription to complete
        await new Promise(resolve => setTimeout(resolve, 200))

        expect(callback).toHaveBeenCalled()
        const calledArgs = callback.mock.calls[0]
        expect(calledArgs[0]).toEqual({ symbol: 'BFM', amount: '100000000' })

        unsubscribe()
    })

    test('derive subscribe should handle transform errors gracefully', async () => {
        const sourceData = {
            success: true,
            result: {
                address: 'testAddress',
                assets: {}
            }
        }
        mockFetch.mockResolvedValue(createMockResponse(sourceData))

        const source = keyFetch.create({
            name: 'test.source.err',
            outputSchema: SourceSchema,
            url: 'https://api.test.com/address/asset',
            method: 'POST',
        })

        const derived = derive({
            name: 'test.derived.err',
            source,
            outputSchema: BalanceSchema,
            use: [
                transform<z.infer<typeof SourceSchema>, z.infer<typeof BalanceSchema>>({
                    transform: () => {
                        throw new Error('Transform error')
                    },
                }),
            ],
        })

        const callback = vi.fn()
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

        const unsubscribe = derived.subscribe({ address: 'testAddress' }, callback)

        // Wait for async subscription
        await new Promise(resolve => setTimeout(resolve, 200))

        // Callback should NOT be called due to error
        expect(callback).not.toHaveBeenCalled()
        // Error should be logged
        expect(errorSpy).toHaveBeenCalled()

        unsubscribe()

        // Wait for any pending async operations to settle before restoring mock
        await new Promise(resolve => setTimeout(resolve, 100))

        errorSpy.mockRestore()
    })
})

describe('biowallet-provider simulation', () => {
    // Exact schema from biowallet-provider
    const BiowalletAssetItemSchema = z.object({
        assetNumber: z.string(),
        assetType: z.string(),
    }).passthrough()

    const AssetResponseSchema = z.object({
        success: z.boolean(),
        result: z.object({
            address: z.string(),
            assets: z.record(z.string(), z.record(z.string(), BiowalletAssetItemSchema)),
        }).nullish(),
    })

    const BalanceOutputSchema = z.object({
        amount: z.string(),
        symbol: z.string(),
    })

    test('should process real API response format', async () => {
        // Real API response format from curl test
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
                            sourceChainName: 'bfmeta',
                            assetNumber: '99999968',
                            iconUrl: 'https://example.com/icon2.png'
                        }
                    }
                },
                forgingRewards: '0'
            }
        }
        mockFetch.mockResolvedValue(createMockResponse(realApiResponse))

        const addressAsset = keyFetch.create({
            name: 'biowallet.bfmeta.addressAsset',
            outputSchema: AssetResponseSchema,
            url: 'https://walletapi.bfmeta.info/wallet/bfm/address/asset',
            method: 'POST',
        })

        const nativeBalance = derive({
            name: 'biowallet.bfmeta.nativeBalance',
            source: addressAsset,
            outputSchema: BalanceOutputSchema,
            use: [
                transform<z.infer<typeof AssetResponseSchema>, z.infer<typeof BalanceOutputSchema>>({
                    transform: (raw) => {
                        const symbol = 'BFM'
                        if (!raw.result?.assets) {
                            return { amount: '0', symbol }
                        }
                        for (const magic of Object.values(raw.result.assets)) {
                            for (const asset of Object.values(magic)) {
                                if (asset.assetType === symbol) {
                                    return {
                                        amount: asset.assetNumber,
                                        symbol,
                                    }
                                }
                            }
                        }
                        return { amount: '0', symbol }
                    },
                }),
            ],
        })

        const result = await nativeBalance.fetch({ address: 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j' })

        expect(result).toEqual({ amount: '100005012', symbol: 'BFM' })
    })

    test('subscribe should work with real API response format', async () => {
        const realApiResponse = {
            success: true,
            result: {
                address: 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j',
                assets: {
                    'LLLQL': {
                        'BFM': {
                            sourceChainMagic: 'LLLQL',
                            assetType: 'BFM',
                            assetNumber: '100005012',
                        }
                    }
                }
            }
        }
        mockFetch.mockResolvedValue(createMockResponse(realApiResponse))

        const addressAsset = keyFetch.create({
            name: 'biowallet.bfmeta.addressAsset.sub',
            outputSchema: AssetResponseSchema,
            url: 'https://walletapi.bfmeta.info/wallet/bfm/address/asset',
            method: 'POST',
        })

        const nativeBalance = derive({
            name: 'biowallet.bfmeta.nativeBalance.sub',
            source: addressAsset,
            outputSchema: BalanceOutputSchema,
            use: [
                transform<z.infer<typeof AssetResponseSchema>, z.infer<typeof BalanceOutputSchema>>({
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

        const callback = vi.fn()
        const unsubscribe = nativeBalance.subscribe({ address: 'test' }, callback)

        await new Promise(resolve => setTimeout(resolve, 200))

        expect(callback).toHaveBeenCalled()
        expect(callback.mock.calls[0][0]).toEqual({ amount: '100005012', symbol: 'BFM' })

        unsubscribe()
    })
})
