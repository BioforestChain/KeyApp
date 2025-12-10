/**
 * Web 平台安全存储服务实现
 * 使用 localStorage（实际使用时应配合加密）
 */

import type { ISecureStorageService } from './types'

export class SecureStorageService implements ISecureStorageService {
  private prefix = 'bfm_secure_'

  async set(key: string, value: string): Promise<void> {
    localStorage.setItem(this.prefix + key, value)
  }

  async get(key: string): Promise<string | null> {
    return localStorage.getItem(this.prefix + key)
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key)
  }

  async has(key: string): Promise<boolean> {
    return localStorage.getItem(this.prefix + key) !== null
  }

  async clear(): Promise<void> {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }
}
