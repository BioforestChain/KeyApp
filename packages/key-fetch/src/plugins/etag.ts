/**
 * ETag Plugin
 * 
 * HTTP ETag 缓存验证插件
 */

import type { Plugin } from '../types'

const etagStore = new Map<string, string>()

/**
 * ETag 缓存验证插件
 */
export function etag(): Plugin {
  return {
    name: 'etag',

    async onFetch(ctx, next) {
      const cacheKey = `${ctx.name}:${ctx.req.url}`
      const cachedEtag = etagStore.get(cacheKey)

      if (cachedEtag) {
        const headers = new Headers(ctx.req.headers)
        headers.set('If-None-Match', cachedEtag)
        ctx.req = new Request(ctx.req.url, {
          method: ctx.req.method,
          headers,
          body: ctx.req.body,
        })
      }

      const response = await next()

      const newEtag = response.headers.get('etag')
      if (newEtag) {
        etagStore.set(cacheKey, newEtag)
      }

      return response
    },
  }
}
