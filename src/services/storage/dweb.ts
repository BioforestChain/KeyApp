/**
 * 安全存储服务 - DWEB 平台实现
 */

import { keychainPlugin } from '@plaoc/plugins'
import { secureStorageServiceMeta } from './types'

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

export const secureStorageService = secureStorageServiceMeta.impl({
  async set({ key, value }) {
    await keychainPlugin.set(key, textEncoder.encode(value))
  },

  async get({ key }) {
    const result = await keychainPlugin.get(key)
    if (!result) return null
    return textDecoder.decode(result)
  },

  async remove({ key }) {
    await keychainPlugin.delete(key)
  },

  async has({ key }) {
    return await keychainPlugin.has(key)
  },

  async clear() {
    const keys = await keychainPlugin.keys()
    for (const k of keys) {
      await keychainPlugin.delete(k)
    }
  },
})
