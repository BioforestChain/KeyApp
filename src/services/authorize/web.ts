import type { CallerAppInfo, IPlaocAdapter } from './types'

export class PlaocAdapter implements IPlaocAdapter {
  async getCallerAppInfo(eventId: string): Promise<CallerAppInfo> {
    void eventId
    throw new Error('DWEB runtime not available in web environment')
  }

  async respondWith(eventId: string, path: string, data: unknown): Promise<void> {
    void eventId
    void path
    void data
    throw new Error('DWEB runtime not available in web environment')
  }

  async removeEventId(eventId: string): Promise<void> {
    void eventId
  }

  isAvailable(): boolean {
    return false
  }
}

export const plaocAdapter = new PlaocAdapter()
