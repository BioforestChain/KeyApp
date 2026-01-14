/**
 * TronRPC Provider 测试
 * 
 * 使用 KeyFetch 架构
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { TronRpcProvider, createTronRpcProvider } from '../tron-rpc-provider'
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

describe('TronRpcProvider', () => {
  const mockEntry: ParsedApiEntry = {
    type: 'tron-rpc',
    endpoint: 'https://api.trongrid.io',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    keyFetch.clear()
  })

  describe('createTronRpcProvider', () => {
    it('creates provider for tron-rpc type', () => {
      const provider = createTronRpcProvider(mockEntry, 'tron')
      expect(provider).toBeInstanceOf(TronRpcProvider)
    })

    it('creates provider for tron-rpc-pro type', () => {
      const proEntry: ParsedApiEntry = {
        type: 'tron-rpc-pro',
        endpoint: 'https://api.trongrid.io',
      }
      const provider = createTronRpcProvider(proEntry, 'tron')
      expect(provider).toBeInstanceOf(TronRpcProvider)
    })

    it('returns null for non-tron type', () => {
      const rpcEntry: ParsedApiEntry = {
        type: 'ethereum-rpc',
        endpoint: 'https://rpc.example.com',
      }
      const provider = createTronRpcProvider(rpcEntry, 'tron')
      expect(provider).toBeNull()
    })
  })

  describe('nativeBalance', () => {
    it('fetches TRX balance correctly', async () => {
      const accountResponse = {
        balance: 1000000, // 1 TRX (6 decimals)
        address: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
      }

      mockFetch.mockImplementation(async (input: Request | string) => {
        const url = typeof input === 'string' ? input : input.url
        if (url.includes('/wallet/getaccount')) {
          return createMockResponse(accountResponse)
        }
        return createMockResponse({})
      })

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const balance = await provider.nativeBalance.fetch({ address: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9' })

      expect(mockFetch).toHaveBeenCalled()
      expect(balance.symbol).toBe('TRX')
      expect(balance.amount.toRawString()).toBe('1000000')
    })

    it('returns zero balance when balance is undefined', async () => {
      const accountResponse = {
        address: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
      }

      mockFetch.mockResolvedValue(createMockResponse(accountResponse))

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const balance = await provider.nativeBalance.fetch(
        { address: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9' },
        { skipCache: true }
      )

      expect(balance.amount.toRawString()).toBe('0')
    })
  })

  describe('blockHeight', () => {
    it('fetches block height correctly', async () => {
      const blockResponse = {
        block_header: {
          raw_data: {
            number: 78981623,
          },
        },
      }

      mockFetch.mockImplementation(async (input: Request | string) => {
        const url = typeof input === 'string' ? input : input.url
        if (url.includes('/wallet/getnowblock')) {
          return createMockResponse(blockResponse)
        }
        return createMockResponse({})
      })

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const height = await provider.blockHeight.fetch({})

      expect(height).toBe(78981623n)
    })
  })

  describe('transactionHistory', () => {
    it('converts TRON transactions to standard format', async () => {
      const txListResponse = {
        success: true,
        data: [
          {
            txID: '17deac747345af0729f4f1ee3cab56fe0d68bd427fac4b755d6b20833a18cce5',
            raw_data: {
              contract: [{
                parameter: {
                  value: {
                    amount: 1000000,
                    owner_address: 'TSenderAddress',
                    to_address: 'TReceiverAddress',
                  },
                },
                type: 'TransferContract',
              }],
              timestamp: 1767607884000,
            },
            ret: [{ contractRet: 'SUCCESS' }],
          },
        ],
      }

      mockFetch.mockResolvedValue(createMockResponse(txListResponse))

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const txs = await provider.transactionHistory.fetch({ address: 'TSenderAddress' })

      expect(txs).toHaveLength(1)
      expect(txs[0].hash).toBe('17deac747345af0729f4f1ee3cab56fe0d68bd427fac4b755d6b20833a18cce5')
      expect(txs[0].status).toBe('confirmed')
      expect(txs[0].action).toBe('transfer')
      expect(txs[0].direction).toBe('out')
      expect(txs[0].assets[0].assetType).toBe('native')
      const nativeAsset = txs[0].assets[0]
      if (nativeAsset.assetType === 'native') {
        expect(nativeAsset.symbol).toBe('TRX')
      }
    })

    it('correctly determines direction for incoming transaction', async () => {
      const txListResponse = {
        success: true,
        data: [
          {
            txID: '0xin',
            raw_data: {
              contract: [{
                parameter: {
                  value: {
                    amount: 1000000,
                    owner_address: 'TSenderOther',
                    to_address: 'TMyAddress',
                  },
                },
                type: 'TransferContract',
              }],
              timestamp: 1700000000,
            },
            ret: [{ contractRet: 'SUCCESS' }],
          },
        ],
      }

      mockFetch.mockResolvedValue(createMockResponse(txListResponse))

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const txs = await provider.transactionHistory.fetch(
        { address: 'tmyaddress' }, // lowercase
        { skipCache: true }
      )

      expect(txs[0].direction).toBe('in')
    })

    it('handles empty transaction list', async () => {
      const txListResponse = {
        success: true,
        data: [],
      }

      mockFetch.mockResolvedValue(createMockResponse(txListResponse))

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const txs = await provider.transactionHistory.fetch(
        { address: 'TEmptyAddress' },
        { skipCache: true }
      )

      expect(txs).toHaveLength(0)
    })

    it('handles failed transaction', async () => {
      const txListResponse = {
        success: true,
        data: [
          {
            txID: '0xfailed',
            raw_data: {
              contract: [{
                parameter: {
                  value: {
                    amount: 1000000,
                    owner_address: 'TSender',
                    to_address: 'TReceiver',
                  },
                },
              }],
              timestamp: 1700000000,
            },
            ret: [{ contractRet: 'FAILED' }],
          },
        ],
      }

      mockFetch.mockResolvedValue(createMockResponse(txListResponse))

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const txs = await provider.transactionHistory.fetch(
        { address: 'TSender' },
        { skipCache: true }
      )

      expect(txs[0].status).toBe('failed')
    })
  })
})
