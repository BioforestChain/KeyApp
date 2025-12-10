/**
 * DWEB 平台安全存储服务实现
 */

import { keyValuePlugin } from '@plaoc/plugins'
import type { ISecureStorageService } from './types'

export class SecureStorageService implements ISecureStorageService {
  async set(key: string, value: string): Promise<void> {
    await keyValuePlugin.set(key, value)
  }

  async get(key: string): Promise<string | null> {
    const result = await keyValuePlugin.get(key)
    return result ?? null
  }

  async remove(key: string): Promise<void> {
    await keyValuePlugin.delete(key)
  }

  async has(key: string): Promise<boolean> {
    const result = await keyValuePlugin.get(key)
    return result !== null && result !== undefined
  }

  async clear(): Promise<void> {
    await keyValuePlugin.clear()
  }
}
