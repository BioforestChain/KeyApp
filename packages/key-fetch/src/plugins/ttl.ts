/**
 * TTL Plugin
 * 
 * 缓存生存时间插件（中间件模式）
 */

import type { FetchPlugin } from '../types'

// 简单内存缓存
const cache = new Map<string, { data: Response; timestamp: number }>()

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
export function ttl(ms: number): FetchPlugin {
  return {
    name: 'ttl',

    async onFetch(request, next, context) {
      // 如果跳过缓存，直接请求
      if (context.skipCache) {
        return next(request)
      }

      // 生成缓存 key
      const cacheKey = `${context.name}:${JSON.stringify(context.params)}`
      const cached = cache.get(cacheKey)

      // 检查缓存是否有效
      if (cached && Date.now() - cached.timestamp < ms) {
        // 返回缓存的响应副本
        return cached.data.clone()
      }

      // 发起请求
      const response = await next(request)

      // 缓存成功的响应
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
