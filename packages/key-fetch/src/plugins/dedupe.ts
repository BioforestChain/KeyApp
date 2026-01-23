/**
 * useDedupe Plugin
 * 
 * 去重/节流插件 - 在时间窗口内返回缓存结果
 */

import type { Context, Plugin } from '../types'

/** 去重节流错误 */
export class DedupeThrottledError extends Error {
  constructor(key: string, windowMs: number) {
    super(`Request throttled: ${key} (window: ${windowMs}ms)`)
    this.name = 'DedupeThrottledError'
  }
}

interface CacheEntry {
  data: unknown
  timestamp: number
}

/**
 * useDedupe - 去重/节流插件
 * 
 * 在时间窗口内对相同 input 的请求返回缓存结果
 * 
 * @param windowMs 去重时间窗口（毫秒），默认 5000ms
 * 
 * @example
 * ```ts
 * keyFetch.create({
 *   name: 'balance',
 *   outputSchema: BalanceSchema,
 *   use: [useHttp(url), useDedupe(10_000)], // 10秒内不重复请求
 * })
 * ```
 */
export function useDedupe(windowMs: number = 5000): Plugin {
  const cache = new Map<string, CacheEntry>()

  const getKey = (ctx: Context<unknown, unknown>): string => {
    return `${ctx.name}::${JSON.stringify(ctx.input)}`
  }

  return {
    name: 'dedupe',

    async onFetch(ctx, next) {
      const key = getKey(ctx)
      const now = Date.now()

      // 检查缓存
      const cached = cache.get(key)
      if (cached && (now - cached.timestamp) < windowMs) {
        // 返回缓存的 Mock Response
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Dedupe': 'hit',
          },
        })
      }

      // 执行实际请求
      const response = await next()

      // 如果成功，缓存结果
      if (response.ok) {
        // 克隆 response 以便读取内容
        const cloned = response.clone()
        try {
          const data = await cloned.json()
          cache.set(key, { data, timestamp: now })
        } catch {
          // 解析失败，不缓存
        }
      }

      return response
    },
  }
}
