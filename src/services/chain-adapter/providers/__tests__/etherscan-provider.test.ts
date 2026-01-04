import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EtherscanProvider, createEtherscanProvider } from '../etherscan-provider'
import type { ParsedApiEntry } from '@/services/chain-config'

// Mock chainConfigService
vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: (chainId: string) => chainId === 'ethereum' ? 'ETH' : 'UNKNOWN',
    getDecimals: (chainId: string) => chainId === 'ethereum' ? 18 : 8,
  },
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('EtherscanProvider', () => {
  const mockEntry: ParsedApiEntry = {
    type: 'etherscan-v2',
    endpoint: 'https://api.etherscan.io/v2/api',
    config: { apiKey: 'test-api-key' },
  }

  beforeEach(() => {
    vi.clearAllMocks()
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

  describe('getTransactionHistory', () => {
    it('fetches transactions from Etherscan API', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            hash: '0xabc123',
            from: '0x1111111111111111111111111111111111111111',
            to: '0x2222222222222222222222222222222222222222',
            value: '1000000000000000000',
            timeStamp: '1700000000',
            isError: '0',
            blockNumber: '18000000',
          },
        ],
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const provider = new EtherscanProvider(mockEntry, 'ethereum')
      const txs = await provider.getTransactionHistory('0x2222222222222222222222222222222222222222', 10)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.etherscan.io/v2/api')
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('chainid=1')
      )
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('apikey=test-api-key')
      )
      expect(txs).toHaveLength(1)
      expect(txs[0]).toMatchObject({
        hash: '0xabc123',
        from: '0x1111111111111111111111111111111111111111',
        to: '0x2222222222222222222222222222222222222222',
        value: '1000000000000000000',
        symbol: 'ETH',
        status: 'confirmed',
      })
    })

    it('returns empty array when no transactions found', async () => {
      const mockResponse = {
        status: '0',
        message: 'No transactions found',
        result: [],
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const provider = new EtherscanProvider(mockEntry, 'ethereum')
      const txs = await provider.getTransactionHistory('0x2222222222222222222222222222222222222222')

      expect(txs).toEqual([])
    })

    it('returns empty array on HTTP error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      })

      const provider = new EtherscanProvider(mockEntry, 'ethereum')
      const txs = await provider.getTransactionHistory('0x2222222222222222222222222222222222222222')

      expect(txs).toEqual([])
    })

    it('returns empty array on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const provider = new EtherscanProvider(mockEntry, 'ethereum')
      const txs = await provider.getTransactionHistory('0x2222222222222222222222222222222222222222')

      expect(txs).toEqual([])
    })

    it('marks failed transactions correctly', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            hash: '0xfailed',
            from: '0x1111111111111111111111111111111111111111',
            to: '0x2222222222222222222222222222222222222222',
            value: '0',
            timeStamp: '1700000000',
            isError: '1',
            blockNumber: '18000000',
          },
        ],
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const provider = new EtherscanProvider(mockEntry, 'ethereum')
      const txs = await provider.getTransactionHistory('0x2222222222222222222222222222222222222222')

      expect(txs[0].status).toBe('failed')
    })
  })
})
