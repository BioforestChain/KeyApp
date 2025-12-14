import { describe, expect, it, vi } from 'vitest'
import { PlaocAdapter } from '../mock'

describe('Mock PlaocAdapter', () => {
  it('should return default mock caller info', async () => {
    const adapter = new PlaocAdapter()
    const info = await adapter.getCallerAppInfo('test-event-1')

    expect(info).toEqual({
      appId: 'mock.dapp.local',
      appName: 'Mock DApp',
      appIcon: '/mock-icon.png',
      origin: 'https://mock.dapp.local',
    })
  })

  it('should return registered mock event info', async () => {
    const adapter = new PlaocAdapter()
    const customInfo = {
      appId: 'custom.app',
      appName: 'Custom App',
      appIcon: '/custom.png',
      origin: 'https://custom.app',
    }
    adapter._registerMockEvent('custom-event', customInfo)

    const info = await adapter.getCallerAppInfo('custom-event')
    expect(info).toEqual(customInfo)
  })

  it('should log respondWith calls', async () => {
    const adapter = new PlaocAdapter()
    const consoleSpy = vi.spyOn(console, 'log')

    await adapter.respondWith('event-1', '/auth/address', { success: true })

    expect(consoleSpy).toHaveBeenCalledWith('[MockPlaocAdapter] respondWith:', {
      eventId: 'event-1',
      path: '/auth/address',
      data: { success: true },
    })
  })

  it('should remove registered events', async () => {
    const adapter = new PlaocAdapter()
    const customInfo = {
      appId: 'temp.app',
      appName: 'Temp App',
      appIcon: '/temp.png',
      origin: 'https://temp.app',
    }
    adapter._registerMockEvent('temp-event', customInfo)

    let info = await adapter.getCallerAppInfo('temp-event')
    expect(info.appId).toBe('temp.app')

    await adapter.removeEventId('temp-event')

    info = await adapter.getCallerAppInfo('temp-event')
    expect(info.appId).toBe('mock.dapp.local')
  })

  it('should always report available in mock mode', () => {
    const adapter = new PlaocAdapter()
    expect(adapter.isAvailable()).toBe(true)
  })
})

