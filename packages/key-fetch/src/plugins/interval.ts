/**
 * Interval Plugin
 * 
 * 定时轮询插件 - 适配新的工厂模式架构
 */

import type { CachePlugin, AnyZodSchema, SubscribeContext } from '../types'

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
export function interval(ms: number | (() => number)): CachePlugin<AnyZodSchema> {
  // 每个参数组合独立的轮询状态
  const timers = new Map<string, ReturnType<typeof setInterval>>()
  const subscriberCounts = new Map<string, number>()

  const getKey = (ctx: SubscribeContext): string => {
    return JSON.stringify(ctx.params)
  }

  return {
    name: 'interval',

    onSubscribe(ctx) {
      const key = getKey(ctx)
      const count = (subscriberCounts.get(key) ?? 0) + 1
      subscriberCounts.set(key, count)

      // 首个订阅者，启动轮询
      if (count === 1) {
        const intervalMs = typeof ms === 'function' ? ms() : ms
        

        const poll = async () => {
          try {
            const data = await ctx.kf.fetch(ctx.params as Record<string, string>, { skipCache: true })
            ctx.notify(data)
          } catch (error) {
            
          }
        }

        const timer = setInterval(poll, intervalMs)
        timers.set(key, timer)
      }

      // 返回清理函数
      return () => {
        const newCount = (subscriberCounts.get(key) ?? 1) - 1
        subscriberCounts.set(key, newCount)

        // 最后一个订阅者，停止轮询
        if (newCount === 0) {
          const timer = timers.get(key)
          if (timer) {
            
            clearInterval(timer)
            timers.delete(key)
          }
          subscriberCounts.delete(key)
        }
      }
    },
  }
}
