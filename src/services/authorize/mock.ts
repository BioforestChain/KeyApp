/**
 * Authorize 服务 - Mock 实现
 */

import type { CallerAppInfo, IPlaocAdapter } from './types'

type WireEnvelope<T> = Readonly<{ data: T }>

export type MockPlaocWireResponse = Readonly<{
  eventId: string
  path: string
  body: WireEnvelope<unknown>
}>

export type MockPlaocWireRemoval = Readonly<{
  eventId: string
  body: WireEnvelope<null>
}>

// ==================== PlaocAdapter 类实现 ====================

export class PlaocAdapter implements IPlaocAdapter {
  private mockEvents = new Map<string, CallerAppInfo>()
  private lastWireResponse: MockPlaocWireResponse | null = null
  private lastWireRemoval: MockPlaocWireRemoval | null = null

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
    this.lastWireResponse = {
      eventId,
      path,
      body: { data },
    }
    
    this.mockEvents.delete(eventId)
  }

  async removeEventId(eventId: string): Promise<void> {
    if (!this.mockEvents.has(eventId)) return
    
    this.lastWireRemoval = { eventId, body: { data: null } }
    this.mockEvents.delete(eventId)
  }

  isAvailable(): boolean {
    return true
  }

  // Mock 控制方法
  _registerMockEvent(eventId: string, info: CallerAppInfo): void {
    this.mockEvents.set(eventId, info)
  }

  _getLastWireResponse(): MockPlaocWireResponse | null {
    return this.lastWireResponse
  }

  _getLastWireRemoval(): MockPlaocWireRemoval | null {
    return this.lastWireRemoval
  }
}

export const plaocAdapter = new PlaocAdapter()
