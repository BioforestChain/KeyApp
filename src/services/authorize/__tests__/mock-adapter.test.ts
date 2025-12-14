import { describe, expect, it, vi } from 'vitest'
import { PlaocAdapter } from '../mock'
import { WALLET_PLAOC_PATH } from '../paths'

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

    const payload = [{ name: 'Wallet 1', address: '0x1' }]
    await adapter.respondWith('event-1', WALLET_PLAOC_PATH.authorizeAddress, payload)

    expect(consoleSpy).toHaveBeenCalledWith('[MockPlaocAdapter] respondWith:', {
      eventId: 'event-1',
      path: WALLET_PLAOC_PATH.authorizeAddress,
      data: payload,
    })

    expect(adapter._getLastWireResponse()).toEqual({
      eventId: 'event-1',
      path: WALLET_PLAOC_PATH.authorizeAddress,
      body: { data: payload },
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

  it('removeEventId should record wire envelope {data:null}', async () => {
    const adapter = new PlaocAdapter()
    adapter._registerMockEvent('evt-removed', {
      appId: 'temp.app',
      appName: 'Temp App',
      appIcon: '/temp.png',
      origin: 'https://temp.app',
    })
    await adapter.removeEventId('evt-removed')

    expect(adapter._getLastWireRemoval()).toEqual({
      eventId: 'evt-removed',
      body: { data: null },
    })
  })

  it('respondWith should consume event to avoid double respond', async () => {
    const adapter = new PlaocAdapter()
    adapter._registerMockEvent('evt-consume', {
      appId: 'temp.app',
      appName: 'Temp App',
      appIcon: '/temp.png',
      origin: 'https://temp.app',
    })

    await adapter.respondWith('evt-consume', WALLET_PLAOC_PATH.authorizeAddress, [])
    await adapter.removeEventId('evt-consume')

    expect(adapter._getLastWireRemoval()).toBe(null)
  })

  it('should always report available in mock mode', () => {
    const adapter = new PlaocAdapter()
    expect(adapter.isAvailable()).toBe(true)
  })
})
