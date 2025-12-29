import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BioProviderImpl } from './provider'
import { BioErrorCodes } from './types'

describe('BioProviderImpl', () => {
  let mockParent: { postMessage: ReturnType<typeof vi.fn> }
  let originalParent: Window

  beforeEach(() => {
    mockParent = { postMessage: vi.fn() }
    originalParent = window.parent
    Object.defineProperty(window, 'parent', {
      value: mockParent,
      writable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'parent', {
      value: originalParent,
      writable: true,
    })
    vi.clearAllMocks()
  })

  it('should send connect message on initialization', () => {
    new BioProviderImpl()

    expect(mockParent.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'bio_request',
        method: 'bio_connect',
      }),
      '*'
    )
  })

  it('should use custom target origin', () => {
    new BioProviderImpl('https://example.com')

    expect(mockParent.postMessage).toHaveBeenCalledWith(
      expect.anything(),
      'https://example.com'
    )
  })

  it('should send request and receive response', async () => {
    const provider = new BioProviderImpl()
    mockParent.postMessage.mockClear()

    const requestPromise = provider.request({
      method: 'bio_accounts',
      params: [],
    })

    // Get the request ID from the posted message
    const postedMessage = mockParent.postMessage.mock.calls[0][0]
    const requestId = postedMessage.id

    // Simulate response from host
    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'bio_response',
          id: requestId,
          success: true,
          result: [{ address: '0x123', chain: 'eth' }],
        },
      })
    )

    const result = await requestPromise
    expect(result).toEqual([{ address: '0x123', chain: 'eth' }])
  })

  it('should reject on error response', async () => {
    const provider = new BioProviderImpl()
    mockParent.postMessage.mockClear()

    const requestPromise = provider.request({
      method: 'bio_signMessage',
      params: [{ message: 'test', address: '0x123' }],
    })

    const postedMessage = mockParent.postMessage.mock.calls[0][0]
    const requestId = postedMessage.id

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'bio_response',
          id: requestId,
          success: false,
          error: {
            code: BioErrorCodes.USER_REJECTED,
            message: 'User rejected the request',
          },
        },
      })
    )

    await expect(requestPromise).rejects.toMatchObject({
      code: BioErrorCodes.USER_REJECTED,
      message: 'User rejected the request',
    })
  })

  it('should emit events from host', () => {
    const provider = new BioProviderImpl()
    const handler = vi.fn()

    provider.on('accountsChanged', handler)

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'bio_event',
          event: 'accountsChanged',
          args: [[{ address: '0x456', chain: 'eth' }]],
        },
      })
    )

    // args are spread, so the handler receives the array
    expect(handler).toHaveBeenCalledWith([{ address: '0x456', chain: 'eth' }])
  })

  it('should track connection state', () => {
    const provider = new BioProviderImpl()

    expect(provider.isConnected()).toBe(false)

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'bio_event',
          event: 'connect',
          args: [{ chainId: 'eth' }],
        },
      })
    )

    expect(provider.isConnected()).toBe(true)

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'bio_event',
          event: 'disconnect',
          args: [{ code: 4900, message: 'Disconnected' }],
        },
      })
    )

    expect(provider.isConnected()).toBe(false)
  })

  it('should remove event listeners with off()', () => {
    const provider = new BioProviderImpl()
    const handler = vi.fn()

    provider.on('chainChanged', handler)
    provider.off('chainChanged', handler)

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'bio_event',
          event: 'chainChanged',
          args: ['btc'],
        },
      })
    )

    expect(handler).not.toHaveBeenCalled()
  })

  it('should warn when not in iframe', () => {
    Object.defineProperty(window, 'parent', {
      value: window,
      writable: true,
    })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    new BioProviderImpl()

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Not running in iframe')
    )

    warnSpy.mockRestore()
  })
})
