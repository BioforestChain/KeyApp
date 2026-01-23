/**
 * TTL Plugin
 * 
 * 缓存生存时间插件
 */

import type { Plugin } from '../types'

const cache = new Map<string, { data: Response; timestamp: number }>()

/**
 * TTL 缓存插件
 */
export function ttl(ms: number | (() => number)): Plugin {
  return {
    name: 'ttl',

    async onFetch(ctx, next) {
      const cacheKey = `${ctx.name}:${JSON.stringify(ctx.input)}`
      const cached = cache.get(cacheKey)

      const ttlMs = typeof ms === 'function' ? ms() : ms
      if (cached && Date.now() - cached.timestamp < ttlMs) {
        return cached.data.clone()
      }

      const response = await next()

      if (response.ok) {
        cache.set(cacheKey, {
          data: response.clone(),
          timestamp: Date.now(),
        })
      }

      return response
    },
  }
}
