/**
 * useInterval Plugin
 * 
 * 定时轮询插件 - 在 onSubscribe 阶段启动定时器
 */

import type { Context, Plugin } from '../types'

/**
 * useInterval - 定时轮询插件
 * 
 * @param ms 轮询间隔（毫秒）或动态获取函数
 * 
 * @example
 * ```ts
 * // 固定间隔
 * keyFetch.create({
 *   name: 'blockHeight',
 *   outputSchema: BlockSchema,
 *   use: [useHttp(url), useInterval(30_000)],
 * })
 * 
 * // 动态间隔
 * keyFetch.create({
 *   name: 'blockHeight',
 *   outputSchema: BlockSchema,
 *   use: [useHttp(url), useInterval(() => getPollingInterval())],
 * })
 * ```
 */
export function useInterval(ms: number | (() => number)): Plugin {
  // 每个 input 独立的轮询状态
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  const active = new Map<string, boolean>()
  const subscriberCounts = new Map<string, number>()

  const getKey = (ctx: Context<unknown, unknown>): string => {
    return `${ctx.name}::${JSON.stringify(ctx.input)}`
  }

  return {
    name: 'interval',

    onSubscribe(ctx, emit) {
      const key = getKey(ctx)
      const count = (subscriberCounts.get(key) ?? 0) + 1
      subscriberCounts.set(key, count)

      // 首个订阅者，启动轮询
      if (count === 1) {
        active.set(key, true)

        const poll = async () => {
          if (!active.get(key)) return

          try {
            const data = await ctx.self.fetch(ctx.input)
            emit(data)
          } catch {
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
