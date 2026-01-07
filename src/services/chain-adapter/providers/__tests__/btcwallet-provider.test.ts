import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { BtcWalletProvider, createBtcwalletProvider } from '../btcwallet-provider'
import type { ParsedApiEntry } from '@/services/chain-config'

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: () => 'BTC',
    getDecimals: () => 8,
  },
}))

const mockFetch = vi.fn()
const originalFetch = global.fetch
global.fetch = mockFetch

afterAll(() => {
  global.fetch = originalFetch
})

describe('BtcWalletProvider', () => {
  const entry: ParsedApiEntry = {
    type: 'btcwallet-v1',
    endpoint: 'https://walletapi.example.com/wallet/btc/blockbook',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createBtcwalletProvider creates provider for btcwallet-v1', () => {
    const provider = createBtcwalletProvider(entry, 'bitcoin')
    expect(provider).toBeInstanceOf(BtcWalletProvider)
  })

  it('maps balance (confirmed + unconfirmed) to Amount', async () => {
    const address = 'bc1qexample'

    mockFetch.mockImplementation(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? '{}'))
      expect(body.method).toBe('GET')
      expect(body.url).toContain(`/api/v2/address/${address}`)
      // API returns { success, result } wrapper
      return { ok: true, json: async () => ({ success: true, result: { balance: '10', unconfirmedBalance: '-2' } }) }
    })

    const provider = new BtcWalletProvider(entry, 'bitcoin')
    const balance = await provider.getNativeBalance(address)
    expect(balance.amount.raw).toBe(8n)
  })

  it('computes direction and value from vin/vout', async () => {
    const address = 'bc1qme'

    mockFetch.mockImplementation(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? '{}'))
      if (String(body.url).includes('details=txs')) {
        return {
          ok: true,
          json: async () => ({
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
                  vout: [{ addresses: ['bc1qother'], value: '3000' }, { addresses: [address], value: '1900' }],
                },
              ],
            },
          }),
        }
      }
      return { ok: true, json: async () => ({ success: true, result: { balance: '0' } }) }
    })

    const provider = new BtcWalletProvider(entry, 'bitcoin')
    const txs = await provider.getTransactionHistory(address, 10)

    expect(txs).toHaveLength(1)
    expect(txs[0].direction).toBe('out')
    expect(txs[0].assets[0]).toMatchObject({
      assetType: 'native',
      symbol: 'BTC',
      decimals: 8,
      value: '3100',
    })
  })
})
