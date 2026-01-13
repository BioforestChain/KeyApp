/**
 * TTL Plugin
 * 
 * 基于时间的缓存过期
 */

import type { CachePlugin, RequestContext, ResponseContext } from '../types'

/**
 * TTL 缓存插件
 * 
 * @example
 * ```ts
 * keyFetch.define({
 *   name: 'api.data',
 *   pattern: /\/api\/data/,
 *   use: [ttl(60_000)], // 60秒缓存
 * })
 * ```
 */
export function ttl(ms: number): CachePlugin {
  return {
    name: 'ttl',

    onRequest(ctx: RequestContext) {
      const cached = ctx.cache.get(ctx.url)
      if (cached && Date.now() - cached.timestamp < ms) {
        return cached.data
      }
      return undefined
    },

    onResponse(ctx: ResponseContext) {
      ctx.cache.set(ctx.url, { 
        data: ctx.data, 
        timestamp: Date.now() 
      })
    },
  }
}
