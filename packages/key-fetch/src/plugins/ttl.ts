/**
 * TTL Plugin
 * 
 * 缓存生存时间插件
 */

import type { CachePlugin, AnyZodSchema, RequestContext, ResponseContext } from '../types'

/**
 * TTL 缓存插件
 * 
 * @example
 * ```ts
 * const configFetch = keyFetch.create({
 *   name: 'chain.config',
 *   schema: ConfigSchema,
 *   use: [ttl(5 * 60 * 1000)], // 5 分钟缓存
 * })
 * ```
 */
export function ttl(ms: number): CachePlugin<AnyZodSchema> {
  return {
    name: 'ttl',

    onRequest(ctx: RequestContext) {
      const cacheKey = `${ctx.kf.name}:${JSON.stringify(ctx.params)}`
      const entry = ctx.cache.get(cacheKey)
      
      if (entry && Date.now() - entry.timestamp < ms) {
        return entry.data
      }
      
      return undefined
    },

    onResponse(ctx: ResponseContext) {
      const cacheKey = `${ctx.kf.name}:${JSON.stringify({})}`
      ctx.cache.set(cacheKey, {
        data: ctx.data,
        timestamp: Date.now(),
      })
    },
  }
}
