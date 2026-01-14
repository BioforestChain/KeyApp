/**
 * TronWallet Provider 测试
 * 
 * 使用 KeyFetch 架构
 * Mock 格式匹配真实服务器响应
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { TronWalletProvider, createTronwalletProvider } from '../tronwallet-provider'
import type { ParsedApiEntry } from '@/services/chain-config'
import { keyFetch } from '@biochain/key-fetch'

// Mock chainConfigService
vi.mock('@/services/chain-config', () => ({
    chainConfigService: {
        getSymbol: (chainId: string) => chainId === 'tron' ? 'TRX' : 'UNKNOWN',
        getDecimals: (chainId: string) => chainId === 'tron' ? 6 : 6,
    },
}))

// Mock fetch
const mockFetch = vi.fn()
const originalFetch = global.fetch
Object.assign(global, { fetch: mockFetch })

afterAll(() => {
    Object.assign(global, { fetch: originalFetch })
})

// 创建 mock Response 辅助函数
function createMockResponse<T>(data: T, ok = true, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        statusText: ok ? 'OK' : 'Error',
        headers: { 'Content-Type': 'application/json' },
    })
}

describe('TronWalletProvider', () => {
    const entry: ParsedApiEntry = {
        type: 'tronwallet-v1',
        endpoint: 'https://walletapi.example.com/wallet/tron',
    }

    beforeEach(() => {
        vi.clearAllMocks()
        keyFetch.clear()
    })

    describe('createTronwalletProvider', () => {
        it('creates provider for tronwallet-v1 type', () => {
            const provider = createTronwalletProvider(entry, 'tron')
            expect(provider).toBeInstanceOf(TronWalletProvider)
        })

        it('returns null for non-tronwallet type', () => {
            const rpcEntry: ParsedApiEntry = {
                type: 'tron-rpc',
                endpoint: 'https://rpc.example.com',
            }
            const provider = createTronwalletProvider(rpcEntry, 'tron')
            expect(provider).toBeNull()
        })
    })

    describe('nativeBalance', () => {
        it('fetches balance with walletApi wrapper format', async () => {
            // 真实服务器响应: { success: true, result: "balance" }
            mockFetch.mockImplementation(async (input: Request | string) => {
                const url = typeof input === 'string' ? input : input.url
                expect(url).toContain('/balance')
                return createMockResponse({
                    success: true,
                    result: '1000000', // 1 TRX (6 decimals)
                })
            })

            const provider = new TronWalletProvider(entry, 'tron')
            const balance = await provider.nativeBalance.fetch({ address: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9' })

            expect(mockFetch).toHaveBeenCalled()
            expect(balance.symbol).toBe('TRX')
            expect(balance.amount.toRawString()).toBe('1000000')
        })

        it('handles numeric balance result', async () => {
            mockFetch.mockResolvedValue(createMockResponse({
                success: true,
                result: 2000000, // 数字格式
            }))

            const provider = new TronWalletProvider(entry, 'tron')
            const balance = await provider.nativeBalance.fetch(
                { address: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9' },
                { skipCache: true }
            )

            expect(balance.amount.toRawString()).toBe('2000000')
        })
    })

    describe('transactionHistory', () => {
        it('converts TRON native transactions to standard format', async () => {
            const sender = 'TSenderAddress'

            // 真实服务器响应: { success: true, data: [...] }
            mockFetch.mockImplementation(async () => {
                return createMockResponse({
                    success: true,
                    data: [{
                        txID: '17deac747345af0729f4f1ee3cab56fe0d68bd427fac4b755d6b20833a18cce5',
                        from: sender,
                        to: 'TReceiverAddress',
                        amount: 1000000,
                        timestamp: 1767607884000,
                        contractRet: 'SUCCESS',
                    }],
                })
            })

            const provider = new TronWalletProvider(entry, 'tron')
            const txs = await provider.transactionHistory.fetch({ address: sender })

            expect(txs).toHaveLength(1)
            expect(txs[0].hash).toBe('17deac747345af0729f4f1ee3cab56fe0d68bd427fac4b755d6b20833a18cce5')
            expect(txs[0].status).toBe('confirmed')
            expect(txs[0].action).toBe('transfer')
            expect(txs[0].direction).toBe('out')
            expect(txs[0].assets[0]).toMatchObject({
                assetType: 'native',
                value: '1000000',
                symbol: 'TRX',
                decimals: 6,
            })
        })

        it('correctly determines direction for incoming transaction', async () => {
            const receiver = 'TMyAddress'

            mockFetch.mockResolvedValue(createMockResponse({
                success: true,
                data: [{
                    txID: '0xin',
                    from: 'TOtherAddress',
                    to: receiver,
                    amount: 5000000,
                    timestamp: 1700000000,
                    contractRet: 'SUCCESS',
                }],
            }))

            const provider = new TronWalletProvider(entry, 'tron')
            const txs = await provider.transactionHistory.fetch(
                { address: receiver },
                { skipCache: true }
            )

            expect(txs[0].direction).toBe('in')
        })

        it('handles failed transaction', async () => {
            const address = 'TFailedTxAddress'

            mockFetch.mockResolvedValue(createMockResponse({
                success: true,
                data: [{
                    txID: '0xfailed',
                    from: address,
                    to: 'TContract',
                    amount: 0,
                    timestamp: 1700000000,
                    contractRet: 'FAILED',
                }],
            }))

            const provider = new TronWalletProvider(entry, 'tron')
            const txs = await provider.transactionHistory.fetch(
                { address },
                { skipCache: true }
            )

            expect(txs[0].status).toBe('failed')
        })

        it('handles empty transaction list', async () => {
            mockFetch.mockResolvedValue(createMockResponse({
                success: true,
                data: [],
            }))

            const provider = new TronWalletProvider(entry, 'tron')
            const txs = await provider.transactionHistory.fetch(
                { address: 'TEmptyAddress' },
                { skipCache: true }
            )

            expect(txs).toHaveLength(0)
        })

        it('returns empty when success is false', async () => {
            mockFetch.mockResolvedValue(createMockResponse({
                success: false,
                data: [],
            }))

            const provider = new TronWalletProvider(entry, 'tron')
            const txs = await provider.transactionHistory.fetch(
                { address: 'TErrorAddress' },
                { skipCache: true }
            )

            expect(txs).toHaveLength(0)
        })
    })
})
