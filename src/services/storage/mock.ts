/**
 * 安全存储服务 - Mock 实现
 */

import { secureStorageServiceMeta } from './types'

const storage = new Map<string, string>()

export const secureStorageService = secureStorageServiceMeta.impl({
  async set({ key, value }) {
    storage.set(key, value)
  },

  async get({ key }) {
    return storage.get(key) ?? null
  },

  async remove({ key }) {
    storage.delete(key)
  },

  async has({ key }) {
    return storage.has(key)
  },

  async clear() {
    storage.clear()
  },
})

/** Mock 控制器 */
export const storageMockController = {
  getAll: () => Object.fromEntries(storage),
  clear: () => storage.clear(),
}
