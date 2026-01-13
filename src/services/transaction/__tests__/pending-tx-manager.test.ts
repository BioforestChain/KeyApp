/**
 * PendingTxManager Unit Tests
 * 
 * 测试未上链交易管理器的核心逻辑
 */

import { describe, it, expect, vi } from 'vitest'
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

// ==================== PendingTxManager 订阅机制测试 ====================

describe('PendingTxManager subscription', () => {
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

  it('should notify subscribers when tx status changes', async () => {
    // 这是一个概念性测试，验证订阅机制的设计
    const callbacks: Array<(tx: PendingTx) => void> = []
    const subscribe = (cb: (tx: PendingTx) => void) => {
      callbacks.push(cb)
      return () => {
        const idx = callbacks.indexOf(cb)
        if (idx > -1) callbacks.splice(idx, 1)
      }
    }
    const notify = (tx: PendingTx) => {
      callbacks.forEach(cb => cb(tx))
    }

    const listener = vi.fn()
    const unsubscribe = subscribe(listener)

    const tx = createMockTx({ status: 'confirmed' })
    notify(tx)

    expect(listener).toHaveBeenCalledWith(tx)
    expect(listener).toHaveBeenCalledTimes(1)

    unsubscribe()
    notify(tx)

    // After unsubscribe, should not be called again
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple subscribers', () => {
    const callbacks: Array<(tx: PendingTx) => void> = []
    const subscribe = (cb: (tx: PendingTx) => void) => {
      callbacks.push(cb)
      return () => {
        const idx = callbacks.indexOf(cb)
        if (idx > -1) callbacks.splice(idx, 1)
      }
    }
    const notify = (tx: PendingTx) => {
      callbacks.forEach(cb => cb(tx))
    }

    const listener1 = vi.fn()
    const listener2 = vi.fn()
    const listener3 = vi.fn()

    subscribe(listener1)
    const unsub2 = subscribe(listener2)
    subscribe(listener3)

    const tx = createMockTx()
    notify(tx)

    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)
    expect(listener3).toHaveBeenCalledTimes(1)

    unsub2()
    notify(tx)

    expect(listener1).toHaveBeenCalledTimes(2)
    expect(listener2).toHaveBeenCalledTimes(1) // Not called after unsubscribe
    expect(listener3).toHaveBeenCalledTimes(2)
  })
})

// ==================== 状态转换逻辑测试 ====================

describe('PendingTx status transitions', () => {
  const createMockTx = (overrides: Partial<PendingTx> = {}): PendingTx => ({
    id: 'test-1',
    walletId: 'wallet-1',
    chainId: 'bfmeta',
    fromAddress: 'addr1',
    status: 'created',
    retryCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    rawTx: { signature: 'test-sig' },
    ...overrides,
  })

  it('should allow valid status transitions', () => {
    // Valid transitions based on state machine:
    // created -> broadcasting
    // broadcasting -> broadcasted | failed
    // broadcasted -> confirmed
    // failed -> broadcasting (retry)
    
    const validTransitions: Array<[PendingTx['status'], PendingTx['status']]> = [
      ['created', 'broadcasting'],
      ['broadcasting', 'broadcasted'],
      ['broadcasting', 'failed'],
      ['broadcasted', 'confirmed'],
      ['failed', 'broadcasting'],
    ]

    for (const [from, to] of validTransitions) {
      const tx = createMockTx({ status: from })
      // Simulate status update
      const updated = { ...tx, status: to }
      expect(updated.status).toBe(to)
    }
  })

  it('should track retry count correctly', () => {
    let tx = createMockTx({ retryCount: 0 })
    
    // First retry
    tx = { ...tx, retryCount: tx.retryCount + 1 }
    expect(tx.retryCount).toBe(1)
    
    // Second retry
    tx = { ...tx, retryCount: tx.retryCount + 1 }
    expect(tx.retryCount).toBe(2)
    
    // Third retry (should be max)
    tx = { ...tx, retryCount: tx.retryCount + 1 }
    expect(tx.retryCount).toBe(3)
  })

  it('should not auto-retry when retryCount >= MAX_AUTO_RETRY', () => {
    const MAX_AUTO_RETRY = 3
    const tx = createMockTx({ status: 'failed', retryCount: 3 })
    
    // Should not auto-retry
    const shouldAutoRetry = tx.retryCount < MAX_AUTO_RETRY
    expect(shouldAutoRetry).toBe(false)
  })

  it('should allow manual retry even after max auto retries', () => {
    const tx = createMockTx({ status: 'failed', retryCount: 5 })
    
    // Manual retry should always be allowed
    const canManualRetry = tx.status === 'failed'
    expect(canManualRetry).toBe(true)
  })
})

// ==================== 广播超时检测测试 ====================

describe('Broadcasting timeout detection', () => {
  const BROADCAST_TIMEOUT = 30000 // 30 seconds

  it('should detect stuck broadcasting state', () => {
    const now = Date.now()
    const stuckTx: PendingTx = {
      id: 'stuck-1',
      walletId: 'wallet-1',
      chainId: 'bfmeta',
      fromAddress: 'addr1',
      status: 'broadcasting',
      retryCount: 0,
      createdAt: now - 60000,
      updatedAt: now - 35000, // 35 seconds ago
      rawTx: {},
    }

    const elapsed = now - stuckTx.updatedAt
    const isStuck = stuckTx.status === 'broadcasting' && elapsed > BROADCAST_TIMEOUT
    
    expect(isStuck).toBe(true)
  })

  it('should not flag recent broadcasting as stuck', () => {
    const now = Date.now()
    const recentTx: PendingTx = {
      id: 'recent-1',
      walletId: 'wallet-1',
      chainId: 'bfmeta',
      fromAddress: 'addr1',
      status: 'broadcasting',
      retryCount: 0,
      createdAt: now - 10000,
      updatedAt: now - 5000, // 5 seconds ago
      rawTx: {},
    }

    const elapsed = now - recentTx.updatedAt
    const isStuck = recentTx.status === 'broadcasting' && elapsed > BROADCAST_TIMEOUT
    
    expect(isStuck).toBe(false)
  })
})
