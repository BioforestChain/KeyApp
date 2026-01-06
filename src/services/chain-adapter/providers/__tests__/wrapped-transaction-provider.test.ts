import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WrappedTransactionProvider } from '../wrapped-transaction-provider'
import type { ITransactionService, IAssetService, Balance, FeeEstimate, UnsignedTransaction, SignedTransaction, TransactionStatus, Transaction } from '../../types'
import { Amount } from '@/types/amount'

// Mock services
function createMockTransactionService(): ITransactionService {
  return {
    estimateFee: vi.fn(),
    buildTransaction: vi.fn(),
    signTransaction: vi.fn(),
    broadcastTransaction: vi.fn(),
    getTransactionStatus: vi.fn(),
    getTransaction: vi.fn(),
    getTransactionHistory: vi.fn(),
  }
}

function createMockAssetService(): IAssetService {
  return {
    getNativeBalance: vi.fn(),
    getTokenBalance: vi.fn(),
    getTokenBalances: vi.fn(),
    getTokenMetadata: vi.fn(),
  }
}

describe('WrappedTransactionProvider', () => {
  let transactionService: ITransactionService
  let assetService: IAssetService
  let provider: WrappedTransactionProvider

  beforeEach(() => {
    transactionService = createMockTransactionService()
    assetService = createMockAssetService()
    provider = new WrappedTransactionProvider('wrapped-test-tx', transactionService, assetService)
  })

  describe('constructor', () => {
    it('sets type and empty endpoint', () => {
      expect(provider.type).toBe('wrapped-test-tx')
      expect(provider.endpoint).toBe('')
    })
  })

  describe('getNativeBalance', () => {
    it('delegates to assetService.getNativeBalance', async () => {
      const mockBalance: Balance = {
        amount: Amount.fromRaw('1000000', 8, 'TEST'),
        symbol: 'TEST',
      }
      vi.mocked(assetService.getNativeBalance).mockResolvedValue(mockBalance)

      const result = await provider.getNativeBalance('0x123')

      expect(assetService.getNativeBalance).toHaveBeenCalledWith('0x123')
      expect(result).toEqual(mockBalance)
    })
  })

  describe('getTransactionHistory', () => {
    it('delegates to transactionService and converts transactions', async () => {
      const mockTxs: Transaction[] = [{
        hash: '0xabc',
        from: '0x1',
        to: '0x2',
        amount: Amount.fromRaw('1000', 8, 'TEST'),
        fee: Amount.fromRaw('10', 8, 'TEST'),
        timestamp: 1234567890,
        status: { status: 'confirmed', confirmations: 1, requiredConfirmations: 1 },
        blockNumber: 100n,
        type: 'transfer',
      }]
      vi.mocked(transactionService.getTransactionHistory).mockResolvedValue(mockTxs)

      const result = await provider.getTransactionHistory('0x1', 10)

      expect(transactionService.getTransactionHistory).toHaveBeenCalledWith('0x1', 10)
      expect(result).toHaveLength(1)
      expect(result[0].hash).toBe('0xabc')
      expect(result[0].action).toBe('transfer')
      expect(result[0].direction).toBe('out')
      expect(result[0].assets[0]?.value).toBe('1000')
    })
  })

  describe('getTransaction', () => {
    it('delegates to transactionService and converts transaction', async () => {
      const mockTx: Transaction = {
        hash: '0xabc',
        from: '0x1',
        to: '0x2',
        amount: Amount.fromRaw('1000', 8, 'TEST'),
        fee: Amount.fromRaw('10', 8, 'TEST'),
        timestamp: 1234567890,
        status: { status: 'confirmed', confirmations: 1, requiredConfirmations: 1 },
        type: 'transfer',
      }
      vi.mocked(transactionService.getTransaction).mockResolvedValue(mockTx)

      const result = await provider.getTransaction('0xabc')

      expect(transactionService.getTransaction).toHaveBeenCalledWith('0xabc')
      expect(result?.hash).toBe('0xabc')
      expect(result?.action).toBe('transfer')
    })

    it('returns null when transaction not found', async () => {
      vi.mocked(transactionService.getTransaction).mockResolvedValue(null)

      const result = await provider.getTransaction('0xnotfound')

      expect(result).toBeNull()
    })
  })

  describe('getTransactionStatus', () => {
    it('delegates to transactionService and converts status', async () => {
      const mockStatus: TransactionStatus = {
        status: 'confirmed',
        confirmations: 10,
        requiredConfirmations: 6,
      }
      vi.mocked(transactionService.getTransactionStatus).mockResolvedValue(mockStatus)

      const result = await provider.getTransactionStatus('0xabc')

      expect(transactionService.getTransactionStatus).toHaveBeenCalledWith('0xabc')
      expect(result.status).toBe('confirmed')
      expect(result.confirmations).toBe(10)
    })
  })

  describe('estimateFee', () => {
    it('delegates to transactionService and converts fee estimate', async () => {
      const mockFeeEstimate: FeeEstimate = {
        slow: { amount: Amount.fromRaw('1000', 8, 'TEST'), estimatedTime: 600 },
        standard: { amount: Amount.fromRaw('2000', 8, 'TEST'), estimatedTime: 180 },
        fast: { amount: Amount.fromRaw('3000', 8, 'TEST'), estimatedTime: 30 },
      }
      vi.mocked(transactionService.estimateFee).mockResolvedValue(mockFeeEstimate)

      const params = {
        from: '0x1',
        to: '0x2',
        amount: Amount.fromRaw('10000', 8, 'TEST'),
      }
      const result = await provider.estimateFee(params)

      expect(transactionService.estimateFee).toHaveBeenCalledWith(params)
      expect(result.slow.amount.toRawString()).toBe('1000')
      expect(result.standard.amount.toRawString()).toBe('2000')
      expect(result.fast.amount.toRawString()).toBe('3000')
    })
  })

  describe('buildTransaction', () => {
    it('delegates to transactionService', async () => {
      const mockUnsignedTx: UnsignedTransaction = {
        chainId: 'test',
        data: { type: 'transfer' },
      }
      vi.mocked(transactionService.buildTransaction).mockResolvedValue(mockUnsignedTx)

      const params = {
        from: '0x1',
        to: '0x2',
        amount: Amount.fromRaw('10000', 8, 'TEST'),
      }
      const result = await provider.buildTransaction(params)

      expect(transactionService.buildTransaction).toHaveBeenCalledWith(params)
      expect(result).toEqual(mockUnsignedTx)
    })
  })

  describe('signTransaction', () => {
    it('delegates to transactionService and converts signature', async () => {
      const mockSignedTx: SignedTransaction = {
        chainId: 'test',
        data: { type: 'transfer' },
        signature: '0xsig123',
      }
      vi.mocked(transactionService.signTransaction).mockResolvedValue(mockSignedTx)

      const unsignedTx: UnsignedTransaction = {
        chainId: 'test',
        data: { type: 'transfer' },
      }
      const privateKey = new Uint8Array(32)
      const result = await provider.signTransaction(unsignedTx, privateKey)

      expect(transactionService.signTransaction).toHaveBeenCalledWith(unsignedTx, privateKey)
      expect(result.signature).toBe('0xsig123')
    })
  })

  describe('broadcastTransaction', () => {
    it('delegates to transactionService', async () => {
      vi.mocked(transactionService.broadcastTransaction).mockResolvedValue('0xtxhash')

      const signedTx = {
        chainId: 'test',
        data: { type: 'transfer' },
        signature: '0xsig',
      }
      const result = await provider.broadcastTransaction(signedTx)

      expect(transactionService.broadcastTransaction).toHaveBeenCalledWith(signedTx)
      expect(result).toBe('0xtxhash')
    })
  })
})
