/**
 * Dedupe Plugin
 * 
 * 请求去重 - 合并并发的相同请求
 */

import type { CachePlugin, RequestContext, ResponseContext } from '../types'

/**
 * 请求去重插件
 * 
 * @example
 * ```ts
 * keyFetch.define({
 *   name: 'api.data',
 *   pattern: /\/api\/data/,
 *   use: [dedupe(), ttl(60_000)],
 * })
 * ```
 */
export function dedupe(): CachePlugin {
  const inFlight = new Map<string, Promise<unknown>>()
  const waiters = new Map<string, ((data: unknown) => void)[]>()

  return {
    name: 'dedupe',

    async onRequest(ctx: RequestContext) {
      const pending = inFlight.get(ctx.url)
      if (pending) {
        // 等待进行中的请求完成
        return new Promise((resolve) => {
          const callbacks = waiters.get(ctx.url) ?? []
          callbacks.push(resolve)
          waiters.set(ctx.url, callbacks)
        })
      }
      return undefined
    },

    async onResponse(ctx: ResponseContext) {
      // 通知所有等待者
      const callbacks = waiters.get(ctx.url)
      if (callbacks) {
        callbacks.forEach(cb => cb(ctx.data))
        waiters.delete(ctx.url)
      }
      inFlight.delete(ctx.url)
    },
  }
}
