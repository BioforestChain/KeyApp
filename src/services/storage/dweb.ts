/**
 * DWEB 平台安全存储服务实现
 * 使用 keychainPlugin 进行安全存储
 */

import { keychainPlugin } from '@plaoc/plugins'
import type { ISecureStorageService } from './types'

// 文本编解码器
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

export class SecureStorageService implements ISecureStorageService {
  async set(key: string, value: string): Promise<void> {
    await keychainPlugin.set(key, textEncoder.encode(value))
  }

  async get(key: string): Promise<string | null> {
    const result = await keychainPlugin.get(key)
    if (!result) return null
    return textDecoder.decode(result)
  }

  async remove(key: string): Promise<void> {
    await keychainPlugin.delete(key)
  }

  async has(key: string): Promise<boolean> {
    return await keychainPlugin.has(key)
  }

  async clear(): Promise<void> {
    // keychainPlugin 没有 clear 方法，需要逐个删除
    const keys = await keychainPlugin.keys()
    for (const key of keys) {
      await keychainPlugin.delete(key)
    }
  }
}
