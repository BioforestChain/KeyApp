/**
 * Key-Fetch v2 Core Tests
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { z } from 'zod'
import { keyFetch, combine, useHttp, useInterval } from '../index'

const mockFetch = vi.fn()
const originalFetch = global.fetch
beforeEach(() => {
    global.fetch = mockFetch as unknown as typeof fetch
    vi.clearAllMocks()
})
afterEach(() => {
    global.fetch = originalFetch
})

function createMockResponse(data: unknown, ok = true, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        statusText: ok ? 'OK' : 'Error',
        headers: { 'Content-Type': 'application/json' },
    })
}

describe('keyFetch.create', () => {
    const TestSchema = z.object({
        success: z.boolean(),
        result: z.object({ value: z.string() }).nullable(),
    })

    test('should fetch and parse data', async () => {
        const mockData = { success: true, result: { value: 'hello' } }
        mockFetch.mockResolvedValueOnce(createMockResponse(mockData))

        const instance = keyFetch.create({
            name: 'test.basic',
            outputSchema: TestSchema,
            use: [useHttp('https://api.test.com/data')],
        })

        const result = await instance.fetch({})
        expect(result).toEqual(mockData)
    })

    test('should handle null result', async () => {
        const mockData = { success: true, result: null }
        mockFetch.mockResolvedValueOnce(createMockResponse(mockData))

        const instance = keyFetch.create({
            name: 'test.null',
            outputSchema: TestSchema,
            use: [useHttp('https://api.test.com/data')],
        })

        const result = await instance.fetch({})
        expect((result as { result: null }).result).toBeNull()
    })

    test('should subscribe and receive updates', async () => {
        const mockData = { success: true, result: { value: 'test' } }
        mockFetch.mockResolvedValue(createMockResponse(mockData))

        const instance = keyFetch.create({
            name: 'test.subscribe',
            outputSchema: TestSchema,
            use: [useHttp('https://api.test.com/data')],
        })

        const callback = vi.fn()
        const unsubscribe = instance.subscribe({}, callback)

        await new Promise(resolve => setTimeout(resolve, 100))

        expect(callback).toHaveBeenCalled()
        unsubscribe()
    })
})

describe('combine with useHttp + transform', () => {
    const BalanceSchema = z.object({
        symbol: z.string(),
        amount: z.string(),
    })

    const RawBalanceSchema = z.object({
        chain_stats: z.object({
            funded_txo_sum: z.number(),
            spent_txo_sum: z.number(),
        }),
    })

    test('should fetch with useHttp and apply transform', async () => {
        const rawData = { chain_stats: { funded_txo_sum: 1000, spent_txo_sum: 300 } }
        mockFetch.mockResolvedValueOnce(createMockResponse(rawData))

        const balance = combine({
            name: 'test.balance',
            outputSchema: BalanceSchema,
            use: [useHttp('https://api.test.com/balance')],
            transform: (data) => {
                const raw = RawBalanceSchema.parse(data)
                const amount = raw.chain_stats.funded_txo_sum - raw.chain_stats.spent_txo_sum
                return { symbol: 'BTC', amount: amount.toString() }
            },
        })

        const result = await balance.fetch({})
        expect(result).toEqual({ symbol: 'BTC', amount: '700' })
    })

    test('should subscribe and receive transformed data', async () => {
        const rawData = { chain_stats: { funded_txo_sum: 500, spent_txo_sum: 100 } }
        mockFetch.mockResolvedValue(createMockResponse(rawData))

        const balance = combine({
            name: 'test.balance.sub',
            outputSchema: BalanceSchema,
            use: [useHttp('https://api.test.com/balance')],
            transform: (data) => {
                const raw = RawBalanceSchema.parse(data)
                const amount = raw.chain_stats.funded_txo_sum - raw.chain_stats.spent_txo_sum
                return { symbol: 'BTC', amount: amount.toString() }
            },
        })

        const callback = vi.fn()
        const unsubscribe = balance.subscribe({}, callback)

        await new Promise(resolve => setTimeout(resolve, 100))

        expect(callback).toHaveBeenCalled()
        expect(callback.mock.calls[0][0]).toEqual({ symbol: 'BTC', amount: '400' })

        unsubscribe()
    })
})

describe('combine with sources as trigger', () => {
    const BlockSchema = z.number()
    const BalanceSchema = z.object({ symbol: z.string(), amount: z.string() })

    test('should refetch when source updates', async () => {
        // 第一次调用返回区块高度
        mockFetch.mockResolvedValueOnce(createMockResponse(100))
        // 第二次调用返回余额
        mockFetch.mockResolvedValueOnce(createMockResponse({ funded: 1000, spent: 200 }))

        const blockHeight = keyFetch.create({
            name: 'block',
            outputSchema: BlockSchema,
            use: [useHttp('https://api.test.com/block')],
        })

        const balance = combine({
            name: 'balance',
            outputSchema: BalanceSchema,
            sources: [{ source: blockHeight, params: () => ({}) }],
            use: [useHttp('https://api.test.com/balance/:address')],
            transform: (data) => {
                const raw = data as { funded: number; spent: number }
                return { symbol: 'BTC', amount: (raw.funded - raw.spent).toString() }
            },
        })

        const result = await balance.fetch({ address: 'abc123' })
        expect(result).toEqual({ symbol: 'BTC', amount: '800' })
        expect(mockFetch).toHaveBeenCalledTimes(2)
    })
})
