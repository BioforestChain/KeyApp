/**
 * Blockscout/Etherscan Provider Balance Support Test
 * 
 * 验证 blockscout-v1 等 scan 类 provider 是否支持余额查询
 * 使用新 KeyFetch API
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { EtherscanProvider } from '../etherscan-provider'
import { ChainProvider } from '../chain-provider'
import type { ParsedApiEntry } from '@/services/chain-config'
import { keyFetch } from '@biochain/key-fetch'

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: () => 'ETH',
    getDecimals: () => 18,
  },
}))

// Mock fetch
const mockFetch = vi.fn()
const originalFetch = global.fetch
Object.assign(global, { fetch: mockFetch })

afterAll(() => {
  Object.assign(global, { fetch: originalFetch })
})

function createMockResponse<T>(data: T, ok = true, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    statusText: ok ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('Blockscout/Etherscan Provider Balance Support', () => {
  const entry: ParsedApiEntry = {
    type: 'etherscan-v2',
    endpoint: 'https://eth.blockscout.com/api',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    keyFetch.clear()
  })

  it('etherscan-v2 should support nativeBalance', () => {
    const provider = new EtherscanProvider(entry, 'ethereum')
    const chainProvider = new ChainProvider('ethereum', [provider])

    expect(chainProvider.supportsNativeBalance).toBe(true)
  })

  it('etherscan-v2 should return balance data via nativeBalance.fetch()', async () => {
    // Mock Etherscan API response
    mockFetch.mockResolvedValue(createMockResponse({
      status: '1',
      message: 'OK',
      result: '1000000000000000000', // 1 ETH
    }))

    const provider = new EtherscanProvider(entry, 'ethereum')
    const chainProvider = new ChainProvider('ethereum', [provider])
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

    // 使用新 API: nativeBalance.fetch()
    const balance = await chainProvider.nativeBalance.fetch({ address })

    expect(balance).toBeDefined()
    expect(balance.symbol).toBe('ETH')
    expect(balance.amount).toBeDefined()
    expect(balance.amount.decimals).toBe(18)
    expect(balance.amount.toRawString()).toBe('1000000000000000000')
  })

  it('etherscan-v2 should support transactionHistory', () => {
    const provider = new EtherscanProvider(entry, 'ethereum')
    const chainProvider = new ChainProvider('ethereum', [provider])

    expect(chainProvider.supportsTransactionHistory).toBe(true)
  })
})
