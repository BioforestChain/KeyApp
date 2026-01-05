import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EthereumProvider, initEthereumProvider } from './ethereum-provider'

describe('EthereumProvider', () => {
  let provider: EthereumProvider
  let originalWindow: typeof window

  beforeEach(() => {
    provider = new EthereumProvider('*')
    // Save original window.ethereum
    originalWindow = { ...window }
  })

  afterEach(() => {
    // Restore window
    if (window.ethereum) {
      delete (window as { ethereum?: unknown }).ethereum
    }
  })

  describe('constructor', () => {
    it('should have isKeyApp property', () => {
      expect(provider.isKeyApp).toBe(true)
    })

    it('should have isMetaMask as false', () => {
      expect(provider.isMetaMask).toBe(false)
    })

    it('should start disconnected', () => {
      expect(provider.isConnected()).toBe(false)
    })

    it('should have null chainId initially', () => {
      expect(provider.chainId).toBeNull()
    })

    it('should have null selectedAddress initially', () => {
      expect(provider.selectedAddress).toBeNull()
    })
  })

  describe('request', () => {
    it('should return a promise', () => {
      const result = provider.request({ method: 'eth_chainId' })
      expect(result).toBeInstanceOf(Promise)
    })

    it('should timeout after 5 minutes', async () => {
      vi.useFakeTimers()
      
      const promise = provider.request({ method: 'eth_chainId' })
      
      // Fast forward 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000 + 100)
      
      await expect(promise).rejects.toThrow('Request timeout')
      
      vi.useRealTimers()
    })
  })

  describe('event emitter', () => {
    it('should support on/off', () => {
      const handler = vi.fn()
      
      provider.on('connect', handler)
      provider.off('connect', handler)
      
      // Should not throw
      expect(true).toBe(true)
    })

    it('should support once', () => {
      const handler = vi.fn()
      provider.once('connect', handler)
      
      // Should not throw
      expect(true).toBe(true)
    })

    it('should support removeListener alias', () => {
      const handler = vi.fn()
      provider.on('connect', handler)
      provider.removeListener('connect', handler)
      
      // Should not throw
      expect(true).toBe(true)
    })
  })

  describe('legacy methods', () => {
    it('should have enable method', () => {
      expect(typeof provider.enable).toBe('function')
    })

    it('should have send method', () => {
      expect(typeof provider.send).toBe('function')
    })

    it('should have sendAsync method', () => {
      expect(typeof provider.sendAsync).toBe('function')
    })
  })

  describe('initEthereumProvider', () => {
    it('should inject provider into window.ethereum', () => {
      const injected = initEthereumProvider('*')
      expect(window.ethereum).toBe(injected)
    })

    it('should return existing provider if already initialized', () => {
      const first = initEthereumProvider('*')
      const second = initEthereumProvider('*')
      expect(first).toBe(second)
    })
  })

  describe('message handling', () => {
    it('should handle connect event', () => {
      const handler = vi.fn()
      provider.on('connect', handler)

      // Simulate message from host
      const event = new MessageEvent('message', {
        data: {
          type: 'eth_event',
          event: 'connect',
          args: [{ chainId: '0x38' }],
        },
      })
      window.dispatchEvent(event)

      expect(handler).toHaveBeenCalledWith({ chainId: '0x38' })
    })

    it('should handle chainChanged event', () => {
      const handler = vi.fn()
      provider.on('chainChanged', handler)

      const event = new MessageEvent('message', {
        data: {
          type: 'eth_event',
          event: 'chainChanged',
          args: ['0x1'],
        },
      })
      window.dispatchEvent(event)

      expect(handler).toHaveBeenCalledWith('0x1')
    })

    it('should handle accountsChanged event', () => {
      const handler = vi.fn()
      provider.on('accountsChanged', handler)

      const event = new MessageEvent('message', {
        data: {
          type: 'eth_event',
          event: 'accountsChanged',
          args: [['0x1234...']],
        },
      })
      window.dispatchEvent(event)

      expect(handler).toHaveBeenCalledWith(['0x1234...'])
    })
  })
})
