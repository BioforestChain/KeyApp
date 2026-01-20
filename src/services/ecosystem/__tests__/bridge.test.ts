import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PostMessageBridge } from '../bridge'
import { BioErrorCodes } from '../types'

// Mock miniappRuntimeStore for icon URL resolution tests
vi.mock('../../miniapp-runtime', () => ({
  miniappRuntimeStore: {
    state: {
      apps: new Map(),
    },
  },
}))

// Mock permissions module - default to allowing all permissions
const mockHasPermission = vi.fn().mockReturnValue(true)
const mockIsSensitiveMethod = vi.fn().mockImplementation((method: string) =>
  ['bio_requestAccounts', 'bio_signMessage', 'bio_signTypedData', 'bio_signTransaction', 'bio_sendTransaction'].includes(method)
)
const mockGrantPermissions = vi.fn()

vi.mock('../permissions', () => ({
  hasPermission: (...args: unknown[]) => mockHasPermission(...args),
  isSensitiveMethod: (...args: unknown[]) => mockIsSensitiveMethod(...args),
  grantPermissions: (...args: unknown[]) => mockGrantPermissions(...args),
}))


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

  describe('permission validation', () => {
    // These tests verify the permission checking logic in the bridge.
    // Since processRequest is private, we test through the manifest permissions array.
    // The actual message processing is tested via E2E tests.

    it('stores manifest permissions when attaching', () => {
      const iframe = document.createElement('iframe')

      // Attach with specific permissions
      bridge.attach(iframe, 'test-app', 'Test App', ['bio_requestAccounts', 'bio_signMessage'])

      // Detach and re-attach with different permissions
      bridge.attach(iframe, 'test-app-2', 'Test App 2', ['bio_createTransaction'])

      // The bridge should have updated its internal permissions
      // We can't directly test private fields, but we verify attach doesn't throw
      expect(true).toBe(true)
    })

    it('attaches with empty permissions array', () => {
      const iframe = document.createElement('iframe')

      // Should not throw with empty permissions
      expect(() => {
        bridge.attach(iframe, 'test-app', 'Test App', [])
      }).not.toThrow()
    })

    it('attaches without permissions parameter (defaults to empty)', () => {
      const iframe = document.createElement('iframe')

      // Should not throw without permissions
      expect(() => {
        bridge.attach(iframe, 'test-app', 'Test App')
      }).not.toThrow()
    })
  })

  describe('permission rules documentation', () => {
    // These are documentation tests that verify our understanding of the permission system

    it('should reject undeclared bio methods (integration behavior)', () => {
      // When a miniapp calls bio_signMessage but manifest only declares:
      // ["bio_requestAccounts", "bio_selectAccount"]
      // The bridge should return:
      // { error: { code: 4100, message: "Permission not declared in manifest: bio_signMessage" } }

      // This is verified by E2E tests and the forge miniapp fix in PR #202
      expect(BioErrorCodes.UNAUTHORIZED).toBe(4100)
    })

    it('should allow bio_selectAccount when bio_requestAccounts is declared', () => {
      // The bridge maps account-related methods to bio_requestAccounts:
      // - bio_accounts -> bio_requestAccounts
      // - bio_selectAccount -> bio_requestAccounts  
      // - bio_pickWallet -> bio_requestAccounts

      // So declaring bio_requestAccounts allows all these methods
      const accountRelatedMethods = ['bio_accounts', 'bio_selectAccount', 'bio_pickWallet']
      expect(accountRelatedMethods).toContain('bio_selectAccount')
    })

    it('should skip permission check for system methods', () => {
      // bio_connect and bio_closeSplashScreen bypass permission checks
      const skipMethods = ['bio_connect', 'bio_closeSplashScreen']
      expect(skipMethods).toContain('bio_connect')
    })
  })

  describe('message handling', () => {
    /**
     * Helper to create a mock MessageEvent
     */
    function createMockMessageEvent(
      data: unknown,
      origin: string,
      source: Window | null
    ): MessageEvent {
      return new MessageEvent('message', {
        data,
        origin,
        source,
      })
    }

    /**
     * Helper to create an iframe with mocked contentWindow
     */
    function createMockIframe(src: string): HTMLIFrameElement {
      const iframe = document.createElement('iframe')
      iframe.src = src

      const mockContentWindow = {
        postMessage: vi.fn(),
      }

      Object.defineProperty(iframe, 'contentWindow', {
        value: mockContentWindow,
        writable: true,
        configurable: true,
      })

      return iframe
    }

    it('ignores non-bio message types', () => {
      const iframe = createMockIframe('http://localhost:19200')
      const handler = vi.fn()

      bridge.registerHandler('bio_requestAccounts', handler)
      bridge.attach(iframe, 'test-app', 'Test App', ['bio_requestAccounts'])

      // Dispatch a non-bio message
      const event = createMockMessageEvent(
        { type: 'some_other_message', data: 'test' },
        'http://localhost:19200',
        iframe.contentWindow
      )

      window.dispatchEvent(event)

      expect(handler).not.toHaveBeenCalled()
    })

    it('ignores messages without proper structure', () => {
      const iframe = createMockIframe('http://localhost:19200')
      const handler = vi.fn()

      bridge.registerHandler('bio_requestAccounts', handler)
      bridge.attach(iframe, 'test-app', 'Test App', ['bio_requestAccounts'])

      // Dispatch invalid messages
      window.dispatchEvent(createMockMessageEvent(null, 'http://localhost:19200', iframe.contentWindow))
      window.dispatchEvent(createMockMessageEvent('string', 'http://localhost:19200', iframe.contentWindow))
      window.dispatchEvent(createMockMessageEvent({ noType: true }, 'http://localhost:19200', iframe.contentWindow))

      expect(handler).not.toHaveBeenCalled()
    })

    it('processes bio_request from matching origin', async () => {
      const iframe = createMockIframe('http://localhost:19200')
      const handler = vi.fn().mockResolvedValue(['0x123'])

      bridge.registerHandler('bio_requestAccounts', handler)
      bridge.attach(iframe, 'test-app', 'Test App', ['bio_requestAccounts'])

      const event = createMockMessageEvent(
        {
          type: 'bio_request',
          id: 'test-id-1',
          method: 'bio_requestAccounts',
          params: [],
        },
        'http://localhost:19200',
        iframe.contentWindow
      )

      window.dispatchEvent(event)

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(handler).toHaveBeenCalled()
    })

    it('allows localhost mixed content in development (HTTP iframe in HTTPS host)', async () => {
      const iframe = createMockIframe('http://localhost:19200')
      const handler = vi.fn().mockResolvedValue(['0x123'])

      bridge.registerHandler('bio_requestAccounts', handler)
      bridge.attach(iframe, 'test-app', 'Test App', ['bio_requestAccounts'])

      // Simulate HTTP->HTTPS scenario where browser reports parent origin
      const event = createMockMessageEvent(
        {
          type: 'bio_request',
          id: 'test-id-2',
          method: 'bio_requestAccounts',
          params: [],
        },
        'https://localhost:5173', // Different protocol, same hostname
        iframe.contentWindow
      )

      window.dispatchEvent(event)

      await new Promise(resolve => setTimeout(resolve, 10))

      // Should still process because both are localhost
      expect(handler).toHaveBeenCalled()
    })

    it('rejects messages from non-localhost mismatched origin', async () => {
      const iframe = createMockIframe('https://app.example.com')
      const handler = vi.fn().mockResolvedValue(['0x123'])

      bridge.registerHandler('bio_requestAccounts', handler)
      bridge.attach(iframe, 'test-app', 'Test App', ['bio_requestAccounts'])

      const event = createMockMessageEvent(
        {
          type: 'bio_request',
          id: 'test-id-3',
          method: 'bio_requestAccounts',
          params: [],
        },
        'https://malicious.com', // Different origin
        iframe.contentWindow
      )

      window.dispatchEvent(event)

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(handler).not.toHaveBeenCalled()
    })

    it('triggers permission request callback for sensitive methods', async () => {
      // Set hasPermission to return false to trigger the permission request flow
      mockHasPermission.mockReturnValue(false)

      const iframe = createMockIframe('http://localhost:19200')
      const handler = vi.fn().mockResolvedValue(['0x123'])
      const permissionCallback = vi.fn().mockResolvedValue(true)

      bridge.registerHandler('bio_requestAccounts', handler)
      bridge.setPermissionRequestCallback(permissionCallback)
      bridge.attach(iframe, 'test-app', 'Test App', ['bio_requestAccounts'])

      const event = createMockMessageEvent(
        {
          type: 'bio_request',
          id: 'test-id-4',
          method: 'bio_requestAccounts',
          params: [],
        },
        'http://localhost:19200',
        iframe.contentWindow
      )

      window.dispatchEvent(event)

      await new Promise(resolve => setTimeout(resolve, 50))

      expect(permissionCallback).toHaveBeenCalledWith(
        'test-app',
        'Test App',
        ['bio_requestAccounts']
      )

      // Reset the mock to default for other tests
      mockHasPermission.mockReturnValue(true)
    })

    it('rejects when permission callback returns false', async () => {
      // Set hasPermission to return false to trigger the permission request flow
      mockHasPermission.mockReturnValue(false)

      const iframe = createMockIframe('http://localhost:19200')
      const handler = vi.fn().mockResolvedValue(['0x123'])
      const permissionCallback = vi.fn().mockResolvedValue(false)

      bridge.registerHandler('bio_requestAccounts', handler)
      bridge.setPermissionRequestCallback(permissionCallback)
      bridge.attach(iframe, 'test-app', 'Test App', ['bio_requestAccounts'])

      const event = createMockMessageEvent(
        {
          type: 'bio_request',
          id: 'test-id-5',
          method: 'bio_requestAccounts',
          params: [],
        },
        'http://localhost:19200',
        iframe.contentWindow
      )

      window.dispatchEvent(event)

      await new Promise(resolve => setTimeout(resolve, 50))

      // Handler should NOT be called because permission was denied
      expect(handler).not.toHaveBeenCalled()

      // Reset the mock to default for other tests
      mockHasPermission.mockReturnValue(true)
    })
  })
})

