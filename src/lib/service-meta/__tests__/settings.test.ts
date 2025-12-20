/**
 * 全局设置系统测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { z } from 'zod'
import {
  defineServiceMeta,
  ServiceMeta,
  settingsMiddleware,
  getGlobalDelay,
  setGlobalDelay,
  getGlobalError,
  setGlobalError,
  resetSettings,
  subscribeSettings,
  getSettings,
} from '../index'

describe('Settings API', () => {
  beforeEach(() => {
    resetSettings()
  })

  it('getSettings returns current settings', () => {
    const settings = getSettings()
    expect(settings).toEqual({
      globalDelay: 0,
      globalError: null,
      enabled: true,
    })
  })

  it('setGlobalDelay updates delay', () => {
    setGlobalDelay(500)
    expect(getGlobalDelay()).toBe(500)
    expect(getSettings().globalDelay).toBe(500)
  })

  it('setGlobalDelay clamps negative values to 0', () => {
    setGlobalDelay(-100)
    expect(getGlobalDelay()).toBe(0)
  })

  it('setGlobalError sets and clears error', () => {
    const error = new Error('Test error')
    setGlobalError(error)
    expect(getGlobalError()).toBe(error)
    expect(getSettings().globalError).toBe(error)

    setGlobalError(null)
    expect(getGlobalError()).toBeNull()
  })

  it('resetSettings resets all settings', () => {
    setGlobalDelay(1000)
    setGlobalError(new Error('Test'))

    resetSettings()

    expect(getGlobalDelay()).toBe(0)
    expect(getGlobalError()).toBeNull()
  })

  it('subscribeSettings notifies on changes', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeSettings(listener)

    setGlobalDelay(500)
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ globalDelay: 500 })
    )

    setGlobalError(new Error('Test'))
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    setGlobalDelay(1000)
    expect(listener).toHaveBeenCalledTimes(2) // No more calls after unsubscribe
  })
})

describe('settingsMiddleware', () => {
  beforeEach(() => {
    resetSettings()
    ServiceMeta.clearGlobal()
  })

  it('applies global delay', async () => {
    const meta = defineServiceMeta('test', (s) =>
      s.api('fast', {
        input: z.void(),
        output: z.string(),
      })
    )

    ServiceMeta.useGlobal(settingsMiddleware)

    const service = meta.impl({
      async fast() {
        return 'done'
      },
    })

    setGlobalDelay(100)

    const start = Date.now()
    await service.fast()
    const elapsed = Date.now() - start

    expect(elapsed).toBeGreaterThanOrEqual(90) // Allow some tolerance
  })

  it('throws global error when set', async () => {
    const meta = defineServiceMeta('test', (s) =>
      s.api('willFail', {
        input: z.void(),
        output: z.void(),
      })
    )

    ServiceMeta.useGlobal(settingsMiddleware)

    const service = meta.impl({
      async willFail() {},
    })

    setGlobalError(new Error('Global failure'))

    await expect(service.willFail()).rejects.toThrow('Global failure')
  })

  it('works normally when no settings configured', async () => {
    const meta = defineServiceMeta('test', (s) =>
      s.api('normal', {
        input: z.void(),
        output: z.number(),
      })
    )

    ServiceMeta.useGlobal(settingsMiddleware)

    const service = meta.impl({
      async normal() {
        return 42
      },
    })

    const result = await service.normal()
    expect(result).toBe(42)
  })

  it('global error takes precedence over delay', async () => {
    const meta = defineServiceMeta('test', (s) =>
      s.api('test', {
        input: z.void(),
        output: z.void(),
      })
    )

    ServiceMeta.useGlobal(settingsMiddleware)

    const service = meta.impl({
      async test() {},
    })

    setGlobalDelay(1000)
    setGlobalError(new Error('Error first'))

    const start = Date.now()
    await expect(service.test()).rejects.toThrow('Error first')
    const elapsed = Date.now() - start

    // Should fail immediately without waiting for delay
    expect(elapsed).toBeLessThan(100)
  })
})
