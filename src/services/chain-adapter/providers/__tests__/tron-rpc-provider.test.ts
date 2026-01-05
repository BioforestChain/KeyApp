import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TronRpcProvider, createTronRpcProvider } from '../tron-rpc-provider'
import type { ParsedApiEntry } from '@/services/chain-config'

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: (chainId: string) => chainId === 'tron' ? 'TRX' : 'UNKNOWN',
    getDecimals: (chainId: string) => chainId === 'tron' ? 6 : 8,
  },
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('TronRpcProvider', () => {
  const mockEntry: ParsedApiEntry = {
    type: 'tron-rpc',
    endpoint: 'https://api.trongrid.io',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createTronRpcProvider', () => {
    it('creates provider for tron-rpc type', () => {
      const provider = createTronRpcProvider(mockEntry, 'tron')
      expect(provider).toBeInstanceOf(TronRpcProvider)
    })

    it('creates provider for tron-* type', () => {
      const entry: ParsedApiEntry = {
        type: 'tron-grid',
        endpoint: 'https://api.trongrid.io',
      }
      const provider = createTronRpcProvider(entry, 'tron')
      expect(provider).toBeInstanceOf(TronRpcProvider)
    })

    it('returns null for non-tron type', () => {
      const rpcEntry: ParsedApiEntry = {
        type: 'ethereum-rpc',
        endpoint: 'https://rpc.example.com',
      }
      const provider = createTronRpcProvider(rpcEntry, 'ethereum')
      expect(provider).toBeNull()
    })
  })

  describe('getTransactionHistory', () => {
    it('aggregates native and TRC-20 transactions by txID', async () => {
      const userAddress = 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'
      const txId = 'a3163be0b1108f0f84a984f06ede8ec71ff15f036b017cda99e061641ca49a05'
      const contractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'

      // Native tx (TriggerSmartContract with 0 TRX)
      const nativeTx = {
        txID: txId,
        raw_data: {
          contract: [{
            type: 'TriggerSmartContract',
            parameter: {
              value: {
                owner_address: userAddress,
                to_address: contractAddress,
                amount: 0,
              },
            },
          }],
          timestamp: 1766822586000,
        },
        ret: [{ contractRet: 'SUCCESS' }],
      }

      // TRC-20 token transfer event
      const trc20Tx = {
        transaction_id: txId,
        token_info: {
          symbol: 'USDT',
          address: contractAddress,
          decimals: 6,
          name: 'Tether USD',
        },
        block_timestamp: 1766822586000,
        from: 'TDuyHLhS79NKsccnhjd5X3wv44Mwre8HNN',
        to: userAddress,
        type: 'Transfer',
        value: '2000000',
      }

      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/transactions/trc20')) {
          return { ok: true, json: async () => ({ success: true, data: [trc20Tx] }) }
        }
        if (url.includes('/transactions?')) {
          return { ok: true, json: async () => ({ success: true, data: [nativeTx] }) }
        }
        return { ok: true, json: async () => ({ success: true, data: [] }) }
      })

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const txs = await provider.getTransactionHistory(userAddress, 10)

      // Should produce only 1 aggregated transaction
      expect(txs).toHaveLength(1)

      const tx = txs[0]
      expect(tx.hash).toBe(txId)
      expect(tx.action).toBe('transfer')
      expect(tx.direction).toBe('in')
      expect(tx.status).toBe('confirmed')

      // Primary asset should be the token
      expect(tx.assets[0]).toMatchObject({
        assetType: 'token',
        value: '2000000',
        symbol: 'USDT',
        decimals: 6,
        contractAddress,
      })

      // from/to should reflect the token transfer participants
      expect(tx.from).toBe('TDuyHLhS79NKsccnhjd5X3wv44Mwre8HNN')
      expect(tx.to).toBe(userAddress)
    })

    it('handles orphan TRC-20 transactions (no native tx in window)', async () => {
      const userAddress = 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'
      const txId = 'orphan123456'

      const trc20Tx = {
        transaction_id: txId,
        token_info: {
          symbol: 'USDT',
          address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
          decimals: 6,
          name: 'Tether USD',
        },
        block_timestamp: 1766822586000,
        from: userAddress,
        to: 'TReceiverAddress123',
        type: 'Transfer',
        value: '5000000',
      }

      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/transactions/trc20')) {
          return { ok: true, json: async () => ({ success: true, data: [trc20Tx] }) }
        }
        if (url.includes('/transactions?')) {
          return { ok: true, json: async () => ({ success: true, data: [] }) }
        }
        return { ok: true, json: async () => ({ success: true, data: [] }) }
      })

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const txs = await provider.getTransactionHistory(userAddress, 10)

      expect(txs).toHaveLength(1)

      const tx = txs[0]
      expect(tx.hash).toBe(txId)
      expect(tx.action).toBe('transfer')
      expect(tx.direction).toBe('out')
      expect(tx.status).toBe('confirmed')
      expect(tx.assets[0].assetType).toBe('token')
      expect(tx.assets[0].symbol).toBe('USDT')
    })

    it('detects stake/unstake actions correctly', async () => {
      const userAddress = 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'

      const freezeTx = {
        txID: 'freeze123',
        raw_data: {
          contract: [{
            type: 'FreezeBalanceV2Contract',
            parameter: {
              value: {
                owner_address: userAddress,
                frozen_balance: 1000000000,
              },
            },
          }],
          timestamp: 1766822586000,
        },
        ret: [{ contractRet: 'SUCCESS' }],
      }

      const unfreezeTx = {
        txID: 'unfreeze456',
        raw_data: {
          contract: [{
            type: 'UnfreezeBalanceV2Contract',
            parameter: {
              value: {
                owner_address: userAddress,
              },
            },
          }],
          timestamp: 1766822590000,
        },
        ret: [{ contractRet: 'SUCCESS' }],
      }

      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/transactions/trc20')) {
          return { ok: true, json: async () => ({ success: true, data: [] }) }
        }
        if (url.includes('/transactions?')) {
          return { ok: true, json: async () => ({ success: true, data: [unfreezeTx, freezeTx] }) }
        }
        return { ok: true, json: async () => ({ success: true, data: [] }) }
      })

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const txs = await provider.getTransactionHistory(userAddress, 10)

      expect(txs).toHaveLength(2)
      
      const unstakeTx = txs.find(tx => tx.hash === 'unfreeze456')
      const stakeTx = txs.find(tx => tx.hash === 'freeze123')

      expect(unstakeTx?.action).toBe('unstake')
      expect(stakeTx?.action).toBe('stake')
    })

    it('marks unrecognized TriggerSmartContract without TRC-20 as contract action', async () => {
      const userAddress = 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'

      const nativeTx = {
        txID: 'contract123',
        raw_data: {
          contract: [{
            type: 'TriggerSmartContract',
            parameter: {
              value: {
                owner_address: userAddress,
                contract_address: 'TContractAddress123',
                amount: 0,
              },
            },
          }],
          timestamp: 1766822586000,
        },
        ret: [{ contractRet: 'SUCCESS' }],
      }

      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/transactions/trc20')) {
          return { ok: true, json: async () => ({ success: true, data: [] }) }
        }
        if (url.includes('/transactions?')) {
          return { ok: true, json: async () => ({ success: true, data: [nativeTx] }) }
        }
        return { ok: true, json: async () => ({ success: true, data: [] }) }
      })

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const txs = await provider.getTransactionHistory(userAddress, 10)

      expect(txs).toHaveLength(1)
      expect(txs[0].action).toBe('contract')
      expect(txs[0].assets[0].assetType).toBe('native')
      expect(txs[0].assets[0].value).toBe('0')
    })
  })
})
