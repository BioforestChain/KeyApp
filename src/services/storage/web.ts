/**
 * 安全存储服务 - Web 平台实现
 */

import { secureStorageServiceMeta } from './types'

const PREFIX = 'bfm_secure_'

export const secureStorageService = secureStorageServiceMeta.impl({
  async set({ key, value }) {
    localStorage.setItem(PREFIX + key, value)
  },

  async get({ key }) {
    return localStorage.getItem(PREFIX + key)
  },

  async remove({ key }) {
    localStorage.removeItem(PREFIX + key)
  },

  async has({ key }) {
    return localStorage.getItem(PREFIX + key) !== null
  },

  async clear() {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(PREFIX)) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))
  },
})
