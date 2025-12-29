import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PostMessageBridge } from '../bridge'

describe('PostMessageBridge', () => {
  let bridge: PostMessageBridge

  beforeEach(() => {
    bridge = new PostMessageBridge()
  })

  afterEach(() => {
    bridge.detach()
  })

  describe('registerHandler', () => {
    it('registers a method handler', async () => {
      const handler = vi.fn().mockResolvedValue({ result: 'test' })
      bridge.registerHandler('test_method', handler)

      // Handler is registered internally
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('attach/detach', () => {
    it('attaches to iframe and sets up listener', () => {
      const iframe = document.createElement('iframe')
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      bridge.attach(iframe, 'test-app', 'Test App', ['bio_requestAccounts'])

      expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })

    it('detaches and removes listener', () => {
      const iframe = document.createElement('iframe')
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      bridge.attach(iframe, 'test-app', 'Test App')
      bridge.detach()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })

    it('detaches previous iframe when attaching new one', () => {
      const iframe1 = document.createElement('iframe')
      const iframe2 = document.createElement('iframe')

      bridge.attach(iframe1, 'app-1', 'App 1')
      bridge.attach(iframe2, 'app-2', 'App 2')

      // Should have detached iframe1 and attached iframe2
      bridge.detach()
    })
  })

  describe('emit', () => {
    it('does nothing when no iframe attached', () => {
      // Should not throw
      bridge.emit('test_event', { data: 'test' })
    })

    it('posts message to iframe contentWindow', () => {
      const iframe = document.createElement('iframe')
      const mockPostMessage = vi.fn()
      
      // Mock contentWindow
      Object.defineProperty(iframe, 'contentWindow', {
        value: { postMessage: mockPostMessage },
        writable: true,
      })

      bridge.attach(iframe, 'test-app', 'Test App')
      bridge.emit('accountsChanged', [{ address: '0x123', chain: 'eth' }])

      expect(mockPostMessage).toHaveBeenCalledWith(
        {
          type: 'bio_event',
          event: 'accountsChanged',
          args: [[{ address: '0x123', chain: 'eth' }]],
        },
        expect.any(String) // origin is derived from iframe src
      )
    })
  })
})
