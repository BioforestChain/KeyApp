/**
 * ETag Plugin
 * 
 * HTTP ETag 缓存验证插件
 */

import type { CachePlugin, AnyZodSchema, RequestContext, ResponseContext } from '../types'

/**
 * ETag 缓存验证插件
 * 
 * @example
 * ```ts
 * const configFetch = keyFetch.create({
 *   name: 'chain.config',
 *   schema: ConfigSchema,
 *   use: [etag()],
 * })
 * ```
 */
export function etag(): CachePlugin<AnyZodSchema> {
  const etagStore = new Map<string, string>()

  return {
    name: 'etag',

    onResponse(ctx: ResponseContext) {
      const etagValue = ctx.response.headers.get('etag')
      if (etagValue) {
        const cacheKey = `${ctx.kf.name}:${ctx.url}`
        etagStore.set(cacheKey, etagValue)
      }
    },
  }
}
