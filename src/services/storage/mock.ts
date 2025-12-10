/**
 * Mock 安全存储服务实现
 */

import type { ISecureStorageService } from './types'

declare global {
  interface Window {
    __MOCK_STORAGE__?: Map<string, string>
  }
}

function getStorage(): Map<string, string> {
  if (!window.__MOCK_STORAGE__) {
    window.__MOCK_STORAGE__ = new Map()
  }
  return window.__MOCK_STORAGE__
}

export class SecureStorageService implements ISecureStorageService {
  async set(key: string, value: string): Promise<void> {
    getStorage().set(key, value)
  }

  async get(key: string): Promise<string | null> {
    return getStorage().get(key) ?? null
  }

  async remove(key: string): Promise<void> {
    getStorage().delete(key)
  }

  async has(key: string): Promise<boolean> {
    return getStorage().has(key)
  }

  async clear(): Promise<void> {
    getStorage().clear()
  }
}
