/**
 * PendingTxManager Unit Tests
 * 
 * 测试未上链交易管理器的核心逻辑
 */

import { describe, it, expect } from 'vitest'
import { BroadcastError } from '@/services/bioforest-sdk/errors'
import { 
  isPendingTxExpired, 
  bioChainExpirationChecker, 
  getExpirationChecker,
  type PendingTx,
} from '../pending-tx'

describe('BroadcastError.isRetryable', () => {
  it('should return false for permanent error codes', () => {
    const assetNotEnough = new BroadcastError('001-11028', 'Asset not enough')
    expect(assetNotEnough.isRetryable).toBe(false)
    
    const feeNotEnough = new BroadcastError('001-11029', 'Fee not enough')
    expect(feeNotEnough.isRetryable).toBe(false)
    
    const feeNotEnough2 = new BroadcastError('002-41011', 'Transaction fee is not enough')
    expect(feeNotEnough2.isRetryable).toBe(false)
  })

  it('should return true for network timeout errors', () => {
    const timeout = new BroadcastError(undefined, 'Request timeout')
    expect(timeout.isRetryable).toBe(true)
    
    const timedOut = new BroadcastError(undefined, 'Connection timed out')
    expect(timedOut.isRetryable).toBe(true)
  })

  it('should return true for connection errors', () => {
    const connRefused = new BroadcastError(undefined, 'ECONNREFUSED')
    expect(connRefused.isRetryable).toBe(true)
    
    const notFound = new BroadcastError(undefined, 'ENOTFOUND')
    expect(notFound.isRetryable).toBe(true)
    
    const fetchFailed = new BroadcastError(undefined, 'Failed to fetch')
    expect(fetchFailed.isRetryable).toBe(true)
  })

  it('should return false for insufficient balance errors', () => {
    const insufficient = new BroadcastError(undefined, 'Insufficient balance')
    expect(insufficient.isRetryable).toBe(false)
    
    const notEnough = new BroadcastError(undefined, 'Balance not enough')
    expect(notEnough.isRetryable).toBe(false)
  })

  it('should return false for rejected errors', () => {
    const rejected = new BroadcastError(undefined, 'Transaction was rejected')
    expect(rejected.isRetryable).toBe(false)
  })

  it('should return false for expired errors', () => {
    const expired = new BroadcastError(undefined, 'Transaction expired')
    expect(expired.isRetryable).toBe(false)
  })

  it('should return true for unknown errors without code', () => {
    const unknown = new BroadcastError(undefined, 'Something went wrong')
    expect(unknown.isRetryable).toBe(true)
  })

  it('should return false for unknown errors with code', () => {
    const unknownWithCode = new BroadcastError('999-99999', 'Unknown error')
    expect(unknownWithCode.isRetryable).toBe(false)
  })
})

describe('isPendingTxExpired', () => {
  const createMockTx = (overrides: Partial<PendingTx> = {}): PendingTx => ({
    id: 'test-1',
    walletId: 'wallet-1',
    chainId: 'bfmeta',
    fromAddress: 'addr1',
    status: 'broadcasted',
    retryCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    rawTx: {},
    ...overrides,
  })

  it('should return true for transactions older than maxAge', () => {
    const oldTx = createMockTx({
      createdAt: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
    })
    expect(isPendingTxExpired(oldTx)).toBe(true)
  })

  it('should return false for recent transactions', () => {
    const recentTx = createMockTx({
      createdAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
    })
    expect(isPendingTxExpired(recentTx)).toBe(false)
  })

  it('should return true for BioChain tx past effectiveBlockHeight', () => {
    const expiredByBlock = createMockTx({
      rawTx: { effectiveBlockHeight: 1000 },
    })
    // Current block height > effectiveBlockHeight
    expect(isPendingTxExpired(expiredByBlock, 1001)).toBe(true)
  })

  it('should return false for BioChain tx within effectiveBlockHeight', () => {
    const validByBlock = createMockTx({
      rawTx: { effectiveBlockHeight: 1000 },
    })
    // Current block height < effectiveBlockHeight
    expect(isPendingTxExpired(validByBlock, 999)).toBe(false)
  })

  it('should not use block height for non-BioChain transactions', () => {
    const ethTx = createMockTx({
      chainId: 'ethereum',
      rawTx: { effectiveBlockHeight: 1000 },
    })
    // Even with block height past effectiveBlockHeight, should not expire
    expect(isPendingTxExpired(ethTx, 1001)).toBe(false)
  })
})

describe('bioChainExpirationChecker', () => {
  it('should return true when currentBlockHeight > effectiveBlockHeight', () => {
    const tx = { effectiveBlockHeight: 1000 }
    expect(bioChainExpirationChecker.isExpired(tx, 1001)).toBe(true)
  })

  it('should return false when currentBlockHeight <= effectiveBlockHeight', () => {
    const tx = { effectiveBlockHeight: 1000 }
    expect(bioChainExpirationChecker.isExpired(tx, 1000)).toBe(false)
    expect(bioChainExpirationChecker.isExpired(tx, 999)).toBe(false)
  })

  it('should return false when no effectiveBlockHeight', () => {
    const tx = {}
    expect(bioChainExpirationChecker.isExpired(tx, 1001)).toBe(false)
  })
})

describe('getExpirationChecker', () => {
  it('should return bioChainExpirationChecker for bfmeta chains', () => {
    expect(getExpirationChecker('bfmeta')).toBeDefined()
    expect(getExpirationChecker('bfmeta-testnet')).toBeDefined()
  })

  it('should return bioChainExpirationChecker for bfm chains', () => {
    expect(getExpirationChecker('bfm')).toBeDefined()
    expect(getExpirationChecker('bfm-mainnet')).toBeDefined()
  })

  it('should return bioChainExpirationChecker for bioforest chain', () => {
    expect(getExpirationChecker('bioforest')).toBeDefined()
  })

  it('should return undefined for non-BioChain chains', () => {
    expect(getExpirationChecker('ethereum')).toBeUndefined()
    expect(getExpirationChecker('solana')).toBeUndefined()
    expect(getExpirationChecker('tron')).toBeUndefined()
  })
})
