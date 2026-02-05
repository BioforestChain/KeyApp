import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  applyMiniappSafeAreaCssVars,
  getMiniappContext,
  onMiniappContextUpdate,
  type MiniappContext,
} from './miniapp-context'

const sampleContext: MiniappContext = {
  version: 1,
  env: {
    safeAreaInsets: { top: 12, right: 0, bottom: 8, left: 0 },
    platform: 'web',
    locale: 'en-US',
  },
  host: {
    name: 'KeyApp',
    version: '0.1.0',
  },
  updatedAt: new Date().toISOString(),
}

describe('miniapp context sdk', () => {
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
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('requests context and resolves on update', async () => {
    const promise = getMiniappContext({
      timeoutMs: 100,
      retries: 0,
      forceRefresh: true,
      appId: 'miniapp-test',
    })

    const posted = mockParent.postMessage.mock.calls[0][0]
    expect(posted.type).toBe('miniapp:context-request')
    expect(typeof posted.requestId).toBe('string')
    expect(posted.payload).toEqual({ appId: 'miniapp-test' })

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'keyapp:context-update',
          requestId: posted.requestId,
          payload: sampleContext,
        },
      })
    )

    await expect(promise).resolves.toMatchObject({
      env: {
        safeAreaInsets: { top: 12, right: 0, bottom: 8, left: 0 },
      },
    })
  })

  it('falls back with warning on timeout', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.useFakeTimers()

    const promise = getMiniappContext({ timeoutMs: 10, retries: 0, forceRefresh: true })
    await vi.advanceTimersByTimeAsync(20)

    const context = await promise
    expect(context.env.safeAreaInsets).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
    expect(warnSpy).toHaveBeenCalled()
  })

  it('replays cached context to subscribers', async () => {
    const handler = vi.fn()

    window.dispatchEvent(
      new MessageEvent('message', {
        data: {
          type: 'keyapp:context-update',
          payload: sampleContext,
        },
      })
    )

    const unsubscribe = onMiniappContextUpdate(handler)
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        host: expect.objectContaining({ name: 'KeyApp' }),
      })
    )

    unsubscribe()
  })

  it('applies safe area css vars', () => {
    applyMiniappSafeAreaCssVars(sampleContext)
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--keyapp-safe-area-top').trim()).toBe('12px')
    expect(styles.getPropertyValue('--keyapp-safe-area-bottom').trim()).toBe('8px')
  })
})
