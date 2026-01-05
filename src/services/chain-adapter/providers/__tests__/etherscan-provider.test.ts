import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
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

function readFixture<T>(name: string): T {
  const dir = path.dirname(fileURLToPath(import.meta.url))
  const filePath = path.join(dir, 'fixtures/real', name)
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

describe('EtherscanProvider', () => {
  const mockEntry: ParsedApiEntry = {
    type: 'blockscout-eth',
    endpoint: 'https://eth.blockscout.com/api',
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
    it('classifies swap/approve correctly from real Blockscout txlist samples', async () => {
      const evmContractCaller = '0xc00eb08fef86e5f74b692813f31bb5957eaa045c'
      const swap = readFixture<{ tx: unknown }>('eth-blockscout-native-swap-tx.json').tx
      const approve = readFixture<{ tx: unknown }>('eth-blockscout-native-approve-tx.json').tx

      mockFetch.mockImplementation(async (url: string) => {
        const u = new URL(url)
        const action = u.searchParams.get('action')
        const address = u.searchParams.get('address')

        if (action === 'txlist' && address?.toLowerCase() === evmContractCaller) {
          return { ok: true, json: async () => ({ status: '1', message: 'OK', result: [swap, approve] }) }
        }
        if (action === 'tokentx') {
          return { ok: true, json: async () => ({ status: '1', message: 'OK', result: [] }) }
        }

        return { ok: true, json: async () => ({ status: '1', message: 'OK', result: [] }) }
      })

      const provider = new EtherscanProvider(mockEntry, 'ethereum')
      const txs = await provider.getTransactionHistory(evmContractCaller, 10)

      const swapTx = txs.find(tx => tx.action === 'swap')
      const approveTx = txs.find(tx => tx.action === 'approve')

      expect(swapTx).toBeDefined()
      expect(swapTx?.direction).toBe('out')
      expect(swapTx?.contract?.address).toBe(swapTx?.to)
      expect(['0x38ed1739', '0x7ff36ab5', '0x18cbafe5']).toContain(swapTx?.contract?.methodId)

      expect(approveTx).toBeDefined()
      expect(approveTx?.direction).toBe('out')
      expect(approveTx?.contract?.address).toBe(approveTx?.to)
      expect(approveTx?.contract?.methodId).toBe('0x095ea7b3')
    })

    it('converts real Blockscout tokentx sample to token asset', async () => {
      const receiver = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      const tokenTx = readFixture<{ tx: any }>('eth-blockscout-token-transfer-tx.json').tx

      mockFetch.mockImplementation(async (url: string) => {
        const u = new URL(url)
        const action = u.searchParams.get('action')
        const address = u.searchParams.get('address')

        if (action === 'txlist' && address?.toLowerCase() === receiver.toLowerCase()) {
          return { ok: true, json: async () => ({ status: '1', message: 'OK', result: [] }) }
        }
        if (action === 'tokentx' && address?.toLowerCase() === receiver.toLowerCase()) {
          return { ok: true, json: async () => ({ status: '1', message: 'OK', result: [tokenTx] }) }
        }

        return { ok: true, json: async () => ({ status: '1', message: 'OK', result: [] }) }
      })

      const provider = new EtherscanProvider(mockEntry, 'ethereum')
      const txs = await provider.getTransactionHistory(receiver, 10)

      expect(txs.length).toBeGreaterThan(0)
      expect(txs[0].action).toBe('transfer')
      expect(txs[0].direction).toBe('in')
      expect(txs[0].assets[0].assetType).toBe('token')
      expect(txs[0].assets[0]).toMatchObject({
        symbol: tokenTx.tokenSymbol,
        contractAddress: tokenTx.contractAddress,
        decimals: parseInt(tokenTx.tokenDecimal, 10),
      })
    })

    it('converts real Blockscout native transfer sample to native asset', async () => {
      const receiver = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      const nativeTx = readFixture<{ tx: any }>('eth-blockscout-native-transfer-tx.json').tx

      mockFetch.mockImplementation(async (url: string) => {
        const u = new URL(url)
        const action = u.searchParams.get('action')
        const address = u.searchParams.get('address')

        if (action === 'txlist' && address?.toLowerCase() === receiver.toLowerCase()) {
          return { ok: true, json: async () => ({ status: '1', message: 'OK', result: [nativeTx] }) }
        }
        if (action === 'tokentx') {
          return { ok: true, json: async () => ({ status: '1', message: 'OK', result: [] }) }
        }

        return { ok: true, json: async () => ({ status: '1', message: 'OK', result: [] }) }
      })

      const provider = new EtherscanProvider(mockEntry, 'ethereum')
      const txs = await provider.getTransactionHistory(receiver, 10)

      expect(txs).toHaveLength(1)
      expect(txs[0].action).toBe('transfer')
      expect(txs[0].direction).toBe('in')
      expect(txs[0].assets[0]).toMatchObject({
        assetType: 'native',
        value: nativeTx.value,
        symbol: 'ETH',
        decimals: 18,
      })
    })
  })
})
