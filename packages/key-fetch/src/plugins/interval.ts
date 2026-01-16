/**
 * Interval Plugin
 * 
 * 定时轮询插件 - 中间件模式
 */

import type { FetchPlugin, SubscribeContext } from '../types'

export interface IntervalOptions {
  /** 轮询间隔（毫秒）或动态获取函数 */
  ms: number | (() => number)
}

/**
 * 定时轮询插件
 * 
 * @example
 * ```ts
 * const lastBlockFetch = keyFetch.create({
 *   name: 'bfmeta.lastblock',
 *   schema: LastBlockSchema,
 *   url: 'https://api.bfmeta.info/wallet/:chainId/lastblock',
 *   use: [interval(15_000)],
 * })
 * 
 * // 或动态间隔
 * use: [interval(() => getForgeInterval())]
 * ```
 */
export function interval(ms: number | (() => number)): FetchPlugin {
  // 每个参数组合独立的轮询状态
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  const active = new Map<string, boolean>()
  const subscriberCounts = new Map<string, number>()

  const getKey = (ctx: SubscribeContext): string => {
    return JSON.stringify(ctx.params)
  }

  return {
    name: 'interval',

    // 透传请求（不修改）
    async onFetch(request, next) {
      return next(request)
    },

    onSubscribe(ctx) {
      const key = getKey(ctx)
      const count = (subscriberCounts.get(key) ?? 0) + 1
      subscriberCounts.set(key, count)

      // 首个订阅者，启动轮询
      if (count === 1) {
        active.set(key, true)

        const poll = async () => {
          if (!active.get(key)) return

          try {
            await ctx.refetch()
          } catch (error) {
            // 静默处理轮询错误
          } finally {
            if (active.get(key)) {
              const nextMs = typeof ms === 'function' ? ms() : ms
              const timer = setTimeout(poll, nextMs)
              timers.set(key, timer)
            }
          }
        }

        const initialMs = typeof ms === 'function' ? ms() : ms
        const timer = setTimeout(poll, initialMs)
        timers.set(key, timer)
      }

      // 返回清理函数
      return () => {
        const newCount = (subscriberCounts.get(key) ?? 1) - 1
        subscriberCounts.set(key, newCount)

        // 最后一个订阅者，停止轮询
        if (newCount === 0) {
          active.set(key, false)
          const timer = timers.get(key)
          if (timer) {
            clearTimeout(timer)
            timers.delete(key)
          }
          subscriberCounts.delete(key)
        }
      }
    },
  }
}
