/**
 * Etherscan Provider 测试
 * 
 * 使用 KeyFetch 架构与真实 fixture 数据
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EtherscanProvider, createEtherscanProvider } from '../etherscan-provider'
import type { ParsedApiEntry } from '@/services/chain-config'
import { keyFetch } from '@biochain/key-fetch'

// Mock chainConfigService
vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: (chainId: string) => chainId === 'ethereum' ? 'ETH' : 'UNKNOWN',
    getDecimals: (chainId: string) => chainId === 'ethereum' ? 18 : 8,
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

describe('EtherscanProvider', () => {
  const mockEntry: ParsedApiEntry = {
    type: 'blockscout-eth',
    endpoint: 'https://eth.blockscout.com/api',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    keyFetch.clear()
  })

  describe('createEtherscanProvider', () => {
    it('creates provider for etherscan-* type', () => {
      const provider = createEtherscanProvider(mockEntry, 'ethereum')
      expect(provider).toBeInstanceOf(EtherscanProvider)
    })

    it('creates provider for *scan-* type', () => {
      const bscEntry: ParsedApiEntry = {
        type: 'bscscan-v1',
        endpoint: 'https://api.bscscan.com/api',
      }
      const provider = createEtherscanProvider(bscEntry, 'binance')
      expect(provider).toBeInstanceOf(EtherscanProvider)
    })

    it('returns null for non-scan type', () => {
      const rpcEntry: ParsedApiEntry = {
        type: 'ethereum-rpc',
        endpoint: 'https://rpc.example.com',
      }
      const provider = createEtherscanProvider(rpcEntry, 'ethereum')
      expect(provider).toBeNull()
    })
  })

  describe('nativeBalance', () => {
    it('fetches balance with correct API parameters', async () => {
      const balanceResponse = {
        status: '1',
        message: 'OK',
        result: '1000000000000000000', // 1 ETH
      }

      mockFetch.mockImplementation(async (input: Request | string) => {
        const url = typeof input === 'string' ? input : input.url
        const parsed = new URL(url)

        expect(parsed.searchParams.get('module')).toBe('account')
        expect(parsed.searchParams.get('action')).toBe('balance')
        expect(parsed.searchParams.get('address')).toBe('0x1234')
        expect(parsed.searchParams.get('tag')).toBe('latest')

        return createMockResponse(balanceResponse)
      })

      const provider = new EtherscanProvider(mockEntry, 'ethereum')
      const balance = await provider.nativeBalance.fetch({ address: '0x1234' })

      expect(mockFetch).toHaveBeenCalled()
      expect(balance.symbol).toBe('ETH')
      expect(balance.amount.toRawString()).toBe('1000000000000000000')
    })
  })

  describe('transactionHistory', () => {
    it('converts real Blockscout native transfer sample to native asset', async () => {
      const receiver = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      const nativeTx = readFixture<{ tx: any }>('eth-blockscout-native-transfer-tx.json').tx

      mockFetch.mockImplementation(async (input: Request | string) => {
        const url = typeof input === 'string' ? input : input.url
        const parsed = new URL(url)
        const action = parsed.searchParams.get('action')

        if (action === 'txlist') {
          return createMockResponse({ status: '1', message: 'OK', result: [nativeTx] })
        }
        return createMockResponse({ status: '1', message: 'OK', result: [] })
      })

      const provider = new EtherscanProvider(mockEntry, 'ethereum')
      const txs = await provider.transactionHistory.fetch({ address: receiver })

      expect(txs).toHaveLength(1)
      expect(txs[0].hash).toBe(nativeTx.hash)
      expect(txs[0].action).toBe('transfer')
      expect(txs[0].direction).toBe('in')
      expect(txs[0].assets[0]).toMatchObject({
        assetType: 'native',
        value: nativeTx.value,
        symbol: 'ETH',
        decimals: 18,
      })
    })

    it('fetches transactions with limit parameter', async () => {
      const txListResponse = {
        status: '1',
        message: 'OK',
        result: [],
      }

      mockFetch.mockImplementation(async (input: Request | string) => {
        const url = typeof input === 'string' ? input : input.url
        const parsed = new URL(url)

        expect(parsed.searchParams.get('module')).toBe('account')
        expect(parsed.searchParams.get('action')).toBe('txlist')
        expect(parsed.searchParams.get('address')).toBe('0xTestLimit')
        expect(parsed.searchParams.get('offset')).toBe('10')
        expect(parsed.searchParams.get('sort')).toBe('desc')

        return createMockResponse(txListResponse)
      })

      const provider = new EtherscanProvider(mockEntry, 'ethereum')
      await provider.transactionHistory.fetch({ address: '0xTestLimit', limit: 10 })

      expect(mockFetch).toHaveBeenCalled()
    })

    it('uses default limit of 20 when not specified', async () => {
      const txListResponse = {
        status: '1',
        message: 'OK',
        result: [],
      }

      mockFetch.mockImplementation(async (input: Request | string) => {
        const url = typeof input === 'string' ? input : input.url
        const parsed = new URL(url)

        expect(parsed.searchParams.get('offset')).toBe('20')

        return createMockResponse(txListResponse)
      })

      const provider = new EtherscanProvider(mockEntry, 'ethereum')
      await provider.transactionHistory.fetch({ address: '0xDefaultLimit' })

      expect(mockFetch).toHaveBeenCalled()
    })

    it('correctly determines direction based on from/to addresses', async () => {
      const testAddress = '0xDirectionTest'
      const txListResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            hash: '0xin',
            from: '0xother',
            to: testAddress,
            value: '100',
            timeStamp: '1700000000',
            isError: '0',
            blockNumber: '1',
          },
          {
            hash: '0xout',
            from: testAddress,
            to: '0xother',
            value: '100',
            timeStamp: '1700000001',
            isError: '0',
            blockNumber: '2',
          },
          {
            hash: '0xself',
            from: testAddress,
            to: testAddress,
            value: '100',
            timeStamp: '1700000002',
            isError: '0',
            blockNumber: '3',
          },
        ],
      }

      mockFetch.mockResolvedValue(createMockResponse(txListResponse))

      const provider = new EtherscanProvider(mockEntry, 'ethereum')
      const txs = await provider.transactionHistory.fetch(
        { address: testAddress },
        { skipCache: true }
      )

      expect(txs[0].direction).toBe('in')
      expect(txs[1].direction).toBe('out')
      expect(txs[2].direction).toBe('self')
    })
  })
})
