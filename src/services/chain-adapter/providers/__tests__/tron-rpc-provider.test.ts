import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { TronRpcProvider, createTronRpcProvider } from '../tron-rpc-provider'
import { resetFetchJsonForTests } from '../fetch-json'
import type { ParsedApiEntry } from '@/services/chain-config'

vi.mock('@/services/chain-config', () => ({
  chainConfigService: {
    getSymbol: (chainId: string) => chainId === 'tron' ? 'TRX' : 'UNKNOWN',
    getDecimals: (chainId: string) => chainId === 'tron' ? 6 : 8,
  },
}))

const mockFetch = vi.fn()
const originalFetch = global.fetch
global.fetch = mockFetch

afterAll(() => {
  global.fetch = originalFetch
})

describe('TronRpcProvider', () => {
  const mockEntry: ParsedApiEntry = {
    type: 'tron-rpc',
    endpoint: 'https://api.trongrid.io',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    resetFetchJsonForTests()
  })

  describe('createTronRpcProvider', () => {
    it('creates provider for tron-rpc type', () => {
      const provider = createTronRpcProvider(mockEntry, 'tron')
      expect(provider).toBeInstanceOf(TronRpcProvider)
    })

    it('creates provider for tron-rpc-pro type', () => {
      const entry: ParsedApiEntry = {
        type: 'tron-rpc-pro',
        endpoint: 'https://api.trongrid.io',
      }
      const provider = createTronRpcProvider(entry, 'tron')
      expect(provider).toBeInstanceOf(TronRpcProvider)
    })

    it('returns null for tronwallet-v1', () => {
      const entry: ParsedApiEntry = {
        type: 'tronwallet-v1',
        endpoint: 'https://walletapi.example.com/wallet/tron',
      }
      const provider = createTronRpcProvider(entry, 'tron')
      expect(provider).toBeNull()
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

  describe('apiKeyEnv', () => {
    it('adds TRON-PRO-API-KEY header when apiKeyEnv is set', async () => {
      const previous = process.env.VITE_TRONGRID_API_KEY
      process.env.VITE_TRONGRID_API_KEY = 'test-trongrid-key'

      try {
        const entry: ParsedApiEntry = {
          type: 'tron-rpc-pro',
          endpoint: 'https://api.trongrid.io',
          config: { apiKeyEnv: 'VITE_TRONGRID_API_KEY' },
        }

        mockFetch.mockImplementationOnce(async (_url: string, init?: RequestInit) => {
          const headers = (init?.headers ?? {}) as Record<string, string>
          expect(headers['TRON-PRO-API-KEY']).toBe('test-trongrid-key')
          return {
            ok: true,
            json: async () => ({ block_header: { raw_data: { number: 1 } } }),
          } as any
        })

        const provider = new TronRpcProvider(entry, 'tron')
        const height = await provider.getBlockHeight()
        expect(height).toBe(1n)
      } finally {
        if (previous === undefined) {
          delete process.env.VITE_TRONGRID_API_KEY
        } else {
          process.env.VITE_TRONGRID_API_KEY = previous
        }
      }
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

    it('filters TriggerSmartContract with 0 TRX and no TRC-20 events (Option A smart filter)', async () => {
      const userAddress = 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'

      // 无意义的合约调用：0 TRX，无 TRC-20 事件
      const spamTx = {
        txID: 'spam123',
        raw_data: {
          contract: [{
            type: 'TriggerSmartContract',
            parameter: {
              value: {
                owner_address: userAddress,
                contract_address: 'TSpamContract',
                amount: 0,
              },
            },
          }],
          timestamp: 1766822586000,
        },
        ret: [{ contractRet: 'SUCCESS' }],
      }

      // 有价值的转账
      const transferTx = {
        txID: 'transfer456',
        raw_data: {
          contract: [{
            type: 'TransferContract',
            parameter: {
              value: {
                owner_address: userAddress,
                to_address: 'TRecipient',
                amount: 1000000,
              },
            },
          }],
          timestamp: 1766822580000,
        },
        ret: [{ contractRet: 'SUCCESS' }],
      }

      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/transactions/trc20')) {
          return { ok: true, json: async () => ({ success: true, data: [] }) }
        }
        if (url.includes('/transactions?')) {
          return { ok: true, json: async () => ({ success: true, data: [spamTx, transferTx] }) }
        }
        return { ok: true, json: async () => ({ success: true, data: [] }) }
      })

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const txs = await provider.getTransactionHistory(userAddress, 10)

      // spam 交易应该被过滤，只剩下 transfer
      expect(txs).toHaveLength(1)
      expect(txs[0].hash).toBe('transfer456')
      expect(txs[0].action).toBe('transfer')
    })

    it('keeps TriggerSmartContract with TRC-20 events (token transfer)', async () => {
      const userAddress = 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'
      const txId = 'usdt-transfer-123'

      const nativeTx = {
        txID: txId,
        raw_data: {
          contract: [{
            type: 'TriggerSmartContract',
            parameter: {
              value: {
                owner_address: userAddress,
                contract_address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
                amount: 0,
              },
            },
          }],
          timestamp: 1766822586000,
        },
        ret: [{ contractRet: 'SUCCESS' }],
      }

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
        to: 'TRecipient123',
        type: 'Transfer',
        value: '5000000',
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

      // 有 TRC-20 事件的 TriggerSmartContract 不应被过滤
      expect(txs).toHaveLength(1)
      expect(txs[0].hash).toBe(txId)
      expect(txs[0].action).toBe('transfer')
      expect(txs[0].assets[0].symbol).toBe('USDT')
    })

    it('keeps TriggerSmartContract with non-zero TRX amount', async () => {
      const userAddress = 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'

      const nativeTx = {
        txID: 'contract-with-trx',
        raw_data: {
          contract: [{
            type: 'TriggerSmartContract',
            parameter: {
              value: {
                owner_address: userAddress,
                contract_address: 'TDeFiContract',
                amount: 10000000, // 10 TRX
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

      // 有 TRX 转移的合约调用不应被过滤
      expect(txs).toHaveLength(1)
      expect(txs[0].hash).toBe('contract-with-trx')
      expect(txs[0].assets[0].value).toBe('10000000')
    })

    it('keeps FAILED transactions (Rule 3: Critical Feedback)', async () => {
      const userAddress = 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'

      // 失败的合约调用：即使 0 TRX 也必须保留
      const failedTx = {
        txID: 'failed-tx-123',
        raw_data: {
          contract: [{
            type: 'TriggerSmartContract',
            parameter: {
              value: {
                owner_address: userAddress,
                contract_address: 'TContractAddress',
                amount: 0,
              },
            },
          }],
          timestamp: 1766822586000,
        },
        ret: [{ contractRet: 'REVERT' }], // 失败状态
      }

      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/transactions/trc20')) {
          return { ok: true, json: async () => ({ success: true, data: [] }) }
        }
        if (url.includes('/transactions?')) {
          return { ok: true, json: async () => ({ success: true, data: [failedTx] }) }
        }
        return { ok: true, json: async () => ({ success: true, data: [] }) }
      })

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const txs = await provider.getTransactionHistory(userAddress, 10)

      // 失败交易必须保留，用户需要看到失败记录
      expect(txs).toHaveLength(1)
      expect(txs[0].hash).toBe('failed-tx-123')
      expect(txs[0].status).toBe('failed')
    })

    it('keeps approve transactions (Rule 4: Key Actions)', async () => {
      const userAddress = 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'

      // approve 授权交易：0 TRX 但是必须保留
      const approveTx = {
        txID: 'approve-tx-456',
        raw_data: {
          contract: [{
            type: 'TriggerSmartContract',
            parameter: {
              value: {
                owner_address: userAddress,
                contract_address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // USDT contract
                amount: 0,
                // approve(address,uint256) MethodID: 0x095ea7b3
                data: '095ea7b3000000000000000000000000spender0000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
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
          return { ok: true, json: async () => ({ success: true, data: [approveTx] }) }
        }
        return { ok: true, json: async () => ({ success: true, data: [] }) }
      })

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const txs = await provider.getTransactionHistory(userAddress, 10)

      // approve 交易必须保留，且 action 应该是 approve
      expect(txs).toHaveLength(1)
      expect(txs[0].hash).toBe('approve-tx-456')
      expect(txs[0].action).toBe('approve')
    })

    it('filters successful 0-TRX TriggerSmartContract without TRC-20 and not approve', async () => {
      const userAddress = 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'

      // 纯噪音：成功 + 0 TRX + 无 TRC-20 + 非 approve
      const spamTx = {
        txID: 'spam-noise-789',
        raw_data: {
          contract: [{
            type: 'TriggerSmartContract',
            parameter: {
              value: {
                owner_address: userAddress,
                contract_address: 'TSpamContract',
                amount: 0,
                data: 'deadbeef12345678', // 未知方法
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
          return { ok: true, json: async () => ({ success: true, data: [spamTx] }) }
        }
        return { ok: true, json: async () => ({ success: true, data: [] }) }
      })

      const provider = new TronRpcProvider(mockEntry, 'tron')
      const txs = await provider.getTransactionHistory(userAddress, 10)

      // 噪音交易应该被过滤
      expect(txs).toHaveLength(0)
    })
  })
})
