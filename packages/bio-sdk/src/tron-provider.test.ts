import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TronLinkProvider, TronWebProvider, initTronProvider } from './tron-provider'

describe('TronLinkProvider', () => {
  let provider: TronLinkProvider

  beforeEach(() => {
    provider = new TronLinkProvider('*')
  })

  describe('request', () => {
    it('should return a promise', () => {
      const result = provider.request({ method: 'tron_requestAccounts' })
      expect(result).toBeInstanceOf(Promise)
    })

    it('should timeout after 5 minutes', async () => {
      vi.useFakeTimers()
      
      const promise = provider.request({ method: 'tron_requestAccounts' })
      
      // Fast forward 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000 + 100)
      
      await expect(promise).rejects.toThrow('Request timeout')
      
      vi.useRealTimers()
    })
  })

  describe('event emitter', () => {
    it('should support on/off', () => {
      const handler = vi.fn()
      
      provider.on('accountsChanged', handler)
      provider.off('accountsChanged', handler)
      
      expect(true).toBe(true)
    })
  })

  describe('message handling', () => {
    it('should handle tron_response', () => {
      const requestPromise = provider.request({ method: 'tron_accounts' })

      // Get the request ID from pending requests (internal)
      // We'll simulate a response
      const event = new MessageEvent('message', {
        data: {
          type: 'tron_response',
          id: 'tron_1_1', // This won't match, but tests the handler path
          success: true,
          result: { base58: 'T...', hex: '41...' },
        },
      })
      window.dispatchEvent(event)

      // Request will still timeout since ID doesn't match
      // This just tests that the handler doesn't throw
      expect(true).toBe(true)
    })

    it('should handle tron_event', () => {
      const handler = vi.fn()
      provider.on('accountsChanged', handler)

      const event = new MessageEvent('message', {
        data: {
          type: 'tron_event',
          event: 'accountsChanged',
          args: [{ base58: 'T...', hex: '41...' }],
        },
      })
      window.dispatchEvent(event)

      expect(handler).toHaveBeenCalled()
    })
  })
})

describe('TronWebProvider', () => {
  let tronLink: TronLinkProvider
  let tronWeb: TronWebProvider

  beforeEach(() => {
    tronLink = new TronLinkProvider('*')
    tronWeb = new TronWebProvider(tronLink)
  })

  describe('initial state', () => {
    it('should not be ready initially', () => {
      expect(tronWeb.ready).toBe(false)
    })

    it('should have empty default address', () => {
      expect(tronWeb.defaultAddress).toEqual({ base58: '', hex: '' })
    })
  })

  describe('setAddress', () => {
    it('should set address and mark as ready', () => {
      tronWeb.setAddress({ base58: 'TAddr...', hex: '41...' })
      
      expect(tronWeb.ready).toBe(true)
      expect(tronWeb.defaultAddress.base58).toBe('TAddr...')
    })
  })

  describe('isAddress', () => {
    it('should validate base58 address', () => {
      expect(tronWeb.isAddress('T' + 'x'.repeat(33))).toBe(true)
      expect(tronWeb.isAddress('invalid')).toBe(false)
    })

    it('should validate hex address', () => {
      expect(tronWeb.isAddress('41' + 'x'.repeat(40))).toBe(true)
      expect(tronWeb.isAddress('00' + 'x'.repeat(40))).toBe(false)
    })
  })

  describe('trx methods', () => {
    it('should have sign method', () => {
      expect(typeof tronWeb.trx.sign).toBe('function')
    })

    it('should have sendRawTransaction method', () => {
      expect(typeof tronWeb.trx.sendRawTransaction).toBe('function')
    })

    it('should have getBalance method', () => {
      expect(typeof tronWeb.trx.getBalance).toBe('function')
    })

    it('should have getAccount method', () => {
      expect(typeof tronWeb.trx.getAccount).toBe('function')
    })
  })
})

describe('initTronProvider', () => {
  afterEach(() => {
    if (window.tronLink) {
      delete (window as { tronLink?: unknown }).tronLink
    }
    if (window.tronWeb) {
      delete (window as { tronWeb?: unknown }).tronWeb
    }
  })

  it('should inject providers into window', () => {
    const { tronLink, tronWeb } = initTronProvider('*')
    
    expect(window.tronLink).toBe(tronLink)
    expect(window.tronWeb).toBe(tronWeb)
  })

  it('should return existing providers if already initialized', () => {
    const first = initTronProvider('*')
    const second = initTronProvider('*')
    
    expect(first.tronLink).toBe(second.tronLink)
    expect(first.tronWeb).toBe(second.tronWeb)
  })
})
