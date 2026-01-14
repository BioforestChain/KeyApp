/**
 * BtcWallet Provider 测试
 * 
 * 使用 KeyFetch 架构
 */

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { BtcWalletProvider, createBtcwalletProvider } from '../btcwallet-provider'
import type { ParsedApiEntry } from '@/services/chain-config'
import { keyFetch } from '@biochain/key-fetch'

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: () => 'BTC',
    getDecimals: () => 8,
  },
}))

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

describe('BtcWalletProvider', () => {
  const entry: ParsedApiEntry = {
    type: 'btcwallet-v1',
    endpoint: 'https://walletapi.example.com/wallet/btc/blockbook',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    keyFetch.clear()
  })

  it('createBtcwalletProvider creates provider for btcwallet-v1', () => {
    const provider = createBtcwalletProvider(entry, 'bitcoin')
    expect(provider).toBeInstanceOf(BtcWalletProvider)
  })

  it('maps balance (confirmed + unconfirmed) to Amount', async () => {
    const address = 'bc1qexample'

    // BtcWallet API returns {success: true, result: AddressInfo}
    mockFetch.mockImplementation(async (_input: Request | string) => {
      return createMockResponse({
        success: true,
        result: { balance: '8' }, // walletApiUnwrap 会解包为 balance: '8'
      })
    })

    const provider = new BtcWalletProvider(entry, 'bitcoin')
    const balance = await provider.nativeBalance.fetch({ address })

    expect(balance.amount.toRawString()).toBe('8')
    expect(balance.symbol).toBe('BTC')
  })

  it('computes direction and value from vin/vout', async () => {
    const address = 'bc1qme'

    mockFetch.mockImplementation(async (_input: Request | string) => {
      return createMockResponse({
        success: true,
        result: {
          balance: '0',
          transactions: [
            {
              txid: 'tx1',
              blockHeight: 100,
              confirmations: 1,
              blockTime: 1700000000,
              vin: [{ addresses: [address], value: '5000' }],
              vout: [
                { addresses: ['bc1qother'], value: '3000' },
                { addresses: ['bc1qchange'], value: '1900' },
              ],
            },
          ],
        },
      })
    })

    const provider = new BtcWalletProvider(entry, 'bitcoin')
    const txs = await provider.transactionHistory.fetch({ address })

    expect(txs).toHaveLength(1)
    expect(txs[0].direction).toBe('out')
    expect(txs[0].assets[0]).toMatchObject({
      assetType: 'native',
      symbol: 'BTC',
      decimals: 8,
    })
  })

  it('handles incoming transaction direction', async () => {
    const address = 'bc1qreceiver'

    mockFetch.mockImplementation(async () => {
      return createMockResponse({
        success: true,
        result: {
          balance: '0',
          transactions: [
            {
              txid: 'tx2',
              blockHeight: 200,
              confirmations: 6,
              blockTime: 1700001000,
              vin: [{ addresses: ['bc1qsender'], value: '10000' }],
              vout: [{ addresses: [address], value: '9000' }],
            },
          ],
        },
      })
    })

    const provider = new BtcWalletProvider(entry, 'bitcoin')
    const txs = await provider.transactionHistory.fetch(
      { address },
      { skipCache: true }
    )

    expect(txs).toHaveLength(1)
    expect(txs[0].direction).toBe('in')
  })
})
