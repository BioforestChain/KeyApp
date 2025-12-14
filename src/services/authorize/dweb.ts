import type { CallerAppInfo, IPlaocAdapter } from './types'

// TODO: 当 DWEB runtime 可用时实现
export class PlaocAdapter implements IPlaocAdapter {
  async getCallerAppInfo(eventId: string): Promise<CallerAppInfo> {
    void eventId
    throw new Error('DWEB Plaoc IPC not implemented yet')
  }

  async respondWith(eventId: string, path: string, data: unknown): Promise<void> {
    void eventId
    void path
    void data
    throw new Error('DWEB Plaoc IPC not implemented yet')
  }

  async removeEventId(eventId: string): Promise<void> {
    void eventId
    throw new Error('DWEB Plaoc IPC not implemented yet')
  }

  isAvailable(): boolean {
    return typeof globalThis === 'object' && globalThis !== null && 'plaoc' in globalThis
  }
}

