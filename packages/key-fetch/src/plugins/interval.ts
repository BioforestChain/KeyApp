/**
 * Interval Plugin
 * 
 * 定时轮询插件 - 作为响应式数据源头
 */

import type { CachePlugin, PluginContext, SubscribeContext } from '../types'

export interface IntervalOptions {
  /** 轮询间隔（毫秒）或动态获取函数 */
  ms: number | ((ctx: PluginContext) => number)
  /** 是否在无订阅者时停止轮询 */
  pauseWhenIdle?: boolean
}

/**
 * 定时轮询插件
 * 
 * @example
 * ```ts
 * keyFetch.define({
 *   name: 'bfmetav2.lastblock',
 *   pattern: /\/wallet\/bfmetav2\/lastblock/,
 *   use: [interval(15_000)],
 * })
 * ```
 */
export function interval(ms: number | ((ctx: PluginContext) => number)): CachePlugin {
  const options: IntervalOptions = typeof ms === 'number' || typeof ms === 'function'
    ? { ms }
    : ms

  let timer: ReturnType<typeof setInterval> | null = null
  let subscriberCount = 0
  let pluginCtx: PluginContext | null = null

  const startPolling = (ctx: SubscribeContext) => {
    if (timer) return

    const intervalMs = typeof options.ms === 'function' 
      ? options.ms(pluginCtx!) 
      : options.ms

    const poll = async () => {
      try {
        const response = await fetch(ctx.url)
        if (!response.ok) {
          console.error(`[key-fetch:interval] HTTP ${response.status} for ${ctx.url}`)
          return
        }

        const data = await response.json()
        const cached = ctx.cache.get(ctx.url)

        // 只有数据变化时才通知
        if (!cached || !shallowEqual(cached.data, data)) {
          ctx.cache.set(ctx.url, { data, timestamp: Date.now() })
          ctx.notify(data)
        }
      } catch (error) {
        console.error(`[key-fetch:interval] Error polling ${ctx.url}:`, error)
      }
    }

    // 立即执行一次
    poll()
    timer = setInterval(poll, intervalMs)
  }

  const stopPolling = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  return {
    name: 'interval',

    setup(ctx) {
      pluginCtx = ctx
      return () => {
        stopPolling()
        pluginCtx = null
      }
    },

    onSubscribe(ctx) {
      subscriberCount++
      
      if (subscriberCount === 1) {
        startPolling(ctx)
      }

      return () => {
        subscriberCount--
        if (subscriberCount === 0 && options.pauseWhenIdle !== false) {
          stopPolling()
        }
      }
    },
  }
}

/** 浅比较两个对象 */
function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object') return false
  if (a === null || b === null) return false

  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if ((a as Record<string, unknown>)[key] !== (b as Record<string, unknown>)[key]) {
      return false
    }
  }

  return true
}
