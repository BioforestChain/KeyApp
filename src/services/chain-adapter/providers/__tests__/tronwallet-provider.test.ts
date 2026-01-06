import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { TronWalletProvider, createTronwalletProvider } from '../tronwallet-provider'
import type { ParsedApiEntry } from '@/services/chain-config'

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: () => 'TRX',
    getDecimals: () => 6,
  },
}))

const mockFetch = vi.fn()
const originalFetch = global.fetch
global.fetch = mockFetch

afterAll(() => {
  global.fetch = originalFetch
})

/** Base58 alphabet used by Tron */
const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function decodeBase58(str: string): Uint8Array {
  let num = BigInt(0)
  for (const char of str) {
    const index = ALPHABET.indexOf(char)
    if (index === -1) throw new Error('Invalid base58')
    num = num * 58n + BigInt(index)
  }

  const hex = num.toString(16).padStart(50, '0')
  const bytes = new Uint8Array(25)
  for (let i = 0; i < 25; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

function tronBase58ToHex(address: string): string {
  const payload = decodeBase58(address).slice(0, 21)
  return Array.from(payload).map((b) => b.toString(16).padStart(2, '0')).join('')
}

describe('TronWalletProvider', () => {
  const entry: ParsedApiEntry = {
    type: 'tronwallet-v1',
    endpoint: 'https://walletapi.example.com/wallet/tron',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createTronwalletProvider creates provider for tronwallet-v1', () => {
    const provider = createTronwalletProvider(entry, 'tron')
    expect(provider).toBeInstanceOf(TronWalletProvider)
  })

  it('converts base58 address to hex for balance query', async () => {
    const address = 'TZ4UXDV5ZhNW7fb2AMSbgfAEZ7hWsnYS2g'
    const expectedHex = tronBase58ToHex(address)

    mockFetch.mockImplementation(async (url: string) => {
      expect(url).toContain(`/balance?address=${expectedHex}`)
      return { ok: true, json: async () => ({ success: true, result: '1000000' }) }
    })

    const provider = new TronWalletProvider(entry, 'tron')
    const balance = await provider.getNativeBalance(address)
    expect(balance.amount.raw).toBe(1000000n)
  })

  it('maps tx history and converts hex addresses to base58', async () => {
    const address = 'TZ4UXDV5ZhNW7fb2AMSbgfAEZ7hWsnYS2g'
    const hexAddress = tronBase58ToHex(address)

    const nativeTx = {
      contractRet: 'SUCCESS',
      txID: 'tx1',
      blockNumber: 10,
      from: hexAddress,
      to: hexAddress,
      amount: 123,
      timestamp: 1700000000000,
    }

    mockFetch.mockImplementation(async (url: string) => {
      if (url.endsWith('/trans/common/history')) {
        return { ok: true, json: async () => ({ success: true, data: [nativeTx] }) }
      }
      if (url.endsWith('/trans/trc20/history')) {
        return { ok: true, json: async () => ({ success: true, data: [] }) }
      }
      return { ok: true, json: async () => ({ success: true, data: [] }) }
    })

    const provider = new TronWalletProvider(entry, 'tron')
    const txs = await provider.getTransactionHistory(address, 10)
    expect(txs).toHaveLength(1)
    expect(txs[0].from).toBe(address)
    expect(txs[0].to).toBe(address)
    expect(txs[0].assets[0]).toMatchObject({
      assetType: 'native',
      symbol: 'TRX',
      decimals: 6,
      value: '123',
    })
  })
})
