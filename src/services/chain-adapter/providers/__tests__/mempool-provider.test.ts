/**
 * Mempool Provider 测试
 * 
 * 使用 KeyFetch 架构与真实 fixture 数据
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MempoolProvider, createMempoolProvider } from '../mempool-provider'
import type { ParsedApiEntry } from '@/services/chain-config'
import { keyFetch } from '@biochain/key-fetch'

// Mock chainConfigService
vi.mock('@/services/chain-config', () => ({
    chainConfigService: {
        getSymbol: (chainId: string) => chainId === 'bitcoin' ? 'BTC' : 'UNKNOWN',
        getDecimals: (chainId: string) => chainId === 'bitcoin' ? 8 : 8,
    },
}))

// Mock fetch
const mockFetch = vi.fn()
const originalFetch = global.fetch
Object.assign(global, { fetch: mockFetch })

afterAll(() => {
    Object.assign(global, { fetch: originalFetch })
})

// 读取真实 fixture 数据
function readFixture<T>(name: string): T {
    const dir = path.dirname(fileURLToPath(import.meta.url))
    const filePath = path.join(dir, 'fixtures/real', name)
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

// 创建 mock Response 辅助函数
function createMockResponse<T>(data: T, ok = true, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        statusText: ok ? 'OK' : 'Error',
        headers: { 'Content-Type': 'application/json' },
    })
}

describe('MempoolProvider', () => {
    const mockEntry: ParsedApiEntry = {
        type: 'mempool-bitcoin',
        endpoint: 'https://mempool.space/api',
    }

    beforeEach(() => {
        vi.clearAllMocks()
        keyFetch.clear()
    })

    describe('createMempoolProvider', () => {
        it('creates provider for mempool-* type', () => {
            const provider = createMempoolProvider(mockEntry, 'bitcoin')
            expect(provider).toBeInstanceOf(MempoolProvider)
        })

        it('returns null for non-mempool type', () => {
            const rpcEntry: ParsedApiEntry = {
                type: 'bitcoin-rpc',
                endpoint: 'https://rpc.example.com',
            }
            const provider = createMempoolProvider(rpcEntry, 'bitcoin')
            expect(provider).toBeNull()
        })
    })

    describe('nativeBalance', () => {
        it('calculates balance from chain_stats', async () => {
            const addressInfo = {
                chain_stats: {
                    funded_txo_sum: 100000000, // 1 BTC received
                    spent_txo_sum: 50000000,   // 0.5 BTC spent
                },
            }

            mockFetch.mockImplementation(async (input: Request | string) => {
                const url = typeof input === 'string' ? input : input.url
                expect(url).toContain('/address/bc1qtest')
                return createMockResponse(addressInfo)
            })

            const provider = new MempoolProvider(mockEntry, 'bitcoin')
            const balance = await provider.nativeBalance.fetch({ address: 'bc1qtest' })

            expect(mockFetch).toHaveBeenCalled()
            expect(balance.symbol).toBe('BTC')
            // 100000000 - 50000000 = 50000000 (0.5 BTC)
            expect(balance.amount.toRawString()).toBe('50000000')
        })
    })

    describe('transactionHistory', () => {
        it('converts real BTC mempool transaction to standard format', async () => {
            const txList = readFixture<any[]>('btc-mempool-address-txs.json')
            const testAddress = '1MbbgkV38RxYxrTTtf7RF8i4DVgQY5CqYp'

            mockFetch.mockImplementation(async (input: Request | string) => {
                const url = typeof input === 'string' ? input : input.url
                if (url.includes('/txs')) {
                    return createMockResponse(txList)
                }
                return createMockResponse([])
            })

            const provider = new MempoolProvider(mockEntry, 'bitcoin')
            const txs = await provider.transactionHistory.fetch({ address: testAddress })

            expect(txs).toHaveLength(1)
            expect(txs[0].hash).toBe(txList[0].txid)
            expect(txs[0].status).toBe('confirmed')
            expect(txs[0].action).toBe('transfer')
            // 地址在 vin 中（发送方）
            expect(txs[0].direction).toBe('self') // 因为地址同时在 vin 和 vout 中
            expect(txs[0].assets[0].assetType).toBe('native')
            expect(txs[0].assets[0].symbol).toBe('BTC')
        })

        it('correctly determines direction for outgoing transaction', async () => {
            const outgoingTx = [{
                txid: '0xout',
                vin: [{ prevout: { scriptpubkey_address: '1MySendAddress' } }],
                vout: [{ scriptpubkey_address: '1OtherAddress', value: 1000 }],
                status: { confirmed: true, block_time: 1700000000 },
            }]

            mockFetch.mockResolvedValue(createMockResponse(outgoingTx))

            const provider = new MempoolProvider(mockEntry, 'bitcoin')
            const txs = await provider.transactionHistory.fetch(
                { address: '1MySendAddress' },
                { skipCache: true }
            )

            expect(txs[0].direction).toBe('out')
        })

        it('correctly determines direction for incoming transaction', async () => {
            const incomingTx = [{
                txid: '0xin',
                vin: [{ prevout: { scriptpubkey_address: '1OtherAddress' } }],
                vout: [{ scriptpubkey_address: '1MyReceiveAddress', value: 1000 }],
                status: { confirmed: true, block_time: 1700000000 },
            }]

            mockFetch.mockResolvedValue(createMockResponse(incomingTx))

            const provider = new MempoolProvider(mockEntry, 'bitcoin')
            const txs = await provider.transactionHistory.fetch(
                { address: '1MyReceiveAddress' },
                { skipCache: true }
            )

            expect(txs[0].direction).toBe('in')
        })
    })

    describe('blockHeight', () => {
        it('fetches block height correctly', async () => {
            mockFetch.mockImplementation(async (input: Request | string) => {
                const url = typeof input === 'string' ? input : input.url
                if (url.includes('/blocks/tip/height')) {
                    return createMockResponse(930986)
                }
                return createMockResponse({})
            })

            const provider = new MempoolProvider(mockEntry, 'bitcoin')
            const height = await provider.blockHeight.fetch({})

            expect(height).toBe(930986n)
        })
    })
})
