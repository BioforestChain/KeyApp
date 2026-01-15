/**
 * ETag Plugin
 * 
 * HTTP ETag 缓存验证插件（中间件模式）
 */

import type { FetchPlugin } from '../types'

// ETag 存储
const etagStore = new Map<string, string>()

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
export function etag(): FetchPlugin {
  return {
    name: 'etag',

    async onFetch(request, next, context) {
      const cacheKey = `${context.name}:${request.url}`
      const cachedEtag = etagStore.get(cacheKey)

      // 如果有缓存的 ETag，添加 If-None-Match 头
      let modifiedRequest = request
      if (cachedEtag) {
        const headers = new Headers(request.headers)
        headers.set('If-None-Match', cachedEtag)
        modifiedRequest = new Request(request.url, {
          method: request.method,
          headers,
          body: request.body,
        })
      }

      const response = await next(modifiedRequest)

      // 存储新的 ETag
      const newEtag = response.headers.get('etag')
      if (newEtag) {
        etagStore.set(cacheKey, newEtag)
      }

      return response
    },
  }
}
