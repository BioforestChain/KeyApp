/**
 * EthWallet Provider 测试
 * 
 * 使用 KeyFetch 架构
 * Mock 格式匹配真实服务器响应: { success: boolean, result: ... }
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EthWalletProvider, createEthwalletProvider } from '../ethwallet-provider'
import type { ParsedApiEntry } from '@/services/chain-config'
import { keyFetch } from '@biochain/key-fetch'

// Mock chainConfigService
vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: (chainId: string) => chainId === 'ethereum' ? 'ETH' : 'UNKNOWN',
    getDecimals: (chainId: string) => chainId === 'ethereum' ? 18 : 18,
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

describe('EthWalletProvider', () => {
  const entry: ParsedApiEntry = {
    type: 'ethwallet-v1',
    endpoint: 'https://walletapi.example.com/wallet/eth',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    keyFetch.clear()
  })

  describe('createEthwalletProvider', () => {
    it('creates provider for ethwallet-v1 type', () => {
      const provider = createEthwalletProvider(entry, 'ethereum')
      expect(provider).toBeInstanceOf(EthWalletProvider)
    })

    it('returns null for non-ethwallet type', () => {
      const rpcEntry: ParsedApiEntry = {
        type: 'ethereum-rpc',
        endpoint: 'https://rpc.example.com',
      }
      const provider = createEthwalletProvider(rpcEntry, 'ethereum')
      expect(provider).toBeNull()
    })
  })

  describe('nativeBalance', () => {
    it('fetches balance with walletApi wrapper format', async () => {
      // 真实服务器响应: { success: true, result: "balance_string" }
      mockFetch.mockImplementation(async (input: Request | string) => {
        const url = typeof input === 'string' ? input : input.url
        expect(url).toContain('/balance')
        return createMockResponse({
          success: true,
          result: '1000000000000000000', // 1 ETH
        })
      })

      const provider = new EthWalletProvider(entry, 'ethereum')
      const balance = await provider.nativeBalance.fetch({ address: '0x1234' })

      expect(mockFetch).toHaveBeenCalled()
      expect(balance.symbol).toBe('ETH')
      expect(balance.amount.toRawString()).toBe('1000000000000000000')
    })
  })

  describe('transactionHistory', () => {
    it('converts real Blockscout native transfer to standard format', async () => {
      const receiver = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      const nativeTx = readFixture<{ tx: any }>('eth-blockscout-native-transfer-tx.json').tx

      // 真实服务器响应: { success: true, result: { status: "1", result: [...] } }
      mockFetch.mockImplementation(async () => {
        return createMockResponse({
          success: true,
          result: {
            status: '1',
            result: [nativeTx],
          },
        })
      })

      const provider = new EthWalletProvider(entry, 'ethereum')
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

    it('correctly determines direction for outgoing transaction', async () => {
      const sender = '0xSenderAddress'

      mockFetch.mockResolvedValue(createMockResponse({
        success: true,
        result: {
          status: '1',
          result: [{
            hash: '0xout',
            from: sender,
            to: '0xReceiverAddress',
            value: '1000000000000000000',
            timeStamp: '1700000000',
            blockNumber: '123',
            isError: '0',
          }],
        },
      }))

      const provider = new EthWalletProvider(entry, 'ethereum')
      const txs = await provider.transactionHistory.fetch(
        { address: sender },
        { skipCache: true }
      )

      expect(txs[0].direction).toBe('out')
    })

    it('handles failed transaction', async () => {
      const address = '0xFailedTxAddress'

      mockFetch.mockResolvedValue(createMockResponse({
        success: true,
        result: {
          status: '1',
          result: [{
            hash: '0xfailed',
            from: address,
            to: '0xContract',
            value: '0',
            timeStamp: '1700000000',
            blockNumber: '456',
            isError: '1', // 标记为失败
          }],
        },
      }))

      const provider = new EthWalletProvider(entry, 'ethereum')
      const txs = await provider.transactionHistory.fetch(
        { address },
        { skipCache: true }
      )

      expect(txs[0].status).toBe('failed')
    })

    it('handles empty transaction list', async () => {
      mockFetch.mockResolvedValue(createMockResponse({
        success: true,
        result: {
          status: '1',
          result: [],
        },
      }))

      const provider = new EthWalletProvider(entry, 'ethereum')
      const txs = await provider.transactionHistory.fetch(
        { address: '0xEmptyAddress' },
        { skipCache: true }
      )

      expect(txs).toHaveLength(0)
    })
  })
})
