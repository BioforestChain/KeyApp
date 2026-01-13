/**
 * ETag Plugin
 * 
 * 利用 HTTP ETag 减少传输
 */

import type { CachePlugin, RequestContext, ResponseContext } from '../types'

/**
 * ETag 缓存插件
 * 
 * @example
 * ```ts
 * keyFetch.define({
 *   name: 'api.data',
 *   pattern: /\/api\/data/,
 *   use: [etag()],
 * })
 * ```
 */
export function etag(): CachePlugin {
  return {
    name: 'etag',

    async onRequest(ctx: RequestContext) {
      const cached = ctx.cache.get(ctx.url)
      if (!cached?.etag) return undefined

      try {
        const response = await fetch(ctx.url, {
          ...ctx.init,
          headers: {
            ...ctx.init?.headers,
            'If-None-Match': cached.etag,
          },
        })

        if (response.status === 304) {
          // 使用缓存数据
          return cached.data
        }

        // 304 以外的响应，让后续流程处理
        return undefined
      } catch {
        // 网络错误时返回缓存
        return cached.data
      }
    },

    onResponse(ctx: ResponseContext) {
      const etagValue = ctx.response.headers.get('ETag')
      if (etagValue) {
        ctx.cache.set(ctx.url, {
          data: ctx.data,
          etag: etagValue,
          timestamp: Date.now(),
        })
      }
    },
  }
}
