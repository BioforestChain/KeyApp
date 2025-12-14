import type { CallerAppInfo, IPlaocAdapter } from './types'

export class PlaocAdapter implements IPlaocAdapter {
  private mockEvents = new Map<string, CallerAppInfo>()

  async getCallerAppInfo(eventId: string): Promise<CallerAppInfo> {
    return (
      this.mockEvents.get(eventId) ?? {
        appId: 'mock.dapp.local',
        appName: 'Mock DApp',
        appIcon: '/mock-icon.png',
        origin: 'https://mock.dapp.local',
      }
    )
  }

  async respondWith(eventId: string, path: string, data: unknown): Promise<void> {
    console.log('[MockPlaocAdapter] respondWith:', { eventId, path, data })
  }

  async removeEventId(eventId: string): Promise<void> {
    console.log('[MockPlaocAdapter] removeEventId:', eventId)
    this.mockEvents.delete(eventId)
  }

  isAvailable(): boolean {
    return true
  }

  _registerMockEvent(eventId: string, info: CallerAppInfo): void {
    this.mockEvents.set(eventId, info)
  }
}

