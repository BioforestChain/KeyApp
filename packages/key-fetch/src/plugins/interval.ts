/**
 * Interval Plugin
 * 
 * 定时轮询插件 - 作为响应式数据源头
 * 每个 URL 独立管理轮询 timer
 */

import type { CachePlugin, PluginContext, SubscribeContext } from '../types'

export interface IntervalOptions {
  /** 轮询间隔（毫秒）或动态获取函数，可接收 URL 参数 */
  ms: number | ((url: string) => number)
  /** 是否在无订阅者时停止轮询 */
  pauseWhenIdle?: boolean
}

/** URL 级别的轮询状态 */
interface PollingState {
  timer: ReturnType<typeof setInterval> | null
  subscriberCount: number
  lastData: unknown
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
 * 
 * // 或动态获取间隔
 * keyFetch.define({
 *   name: 'biochain.lastblock',
 *   pattern: /\/wallet\/\w+\/lastblock/,
 *   use: [interval((url) => getForgeIntervalByUrl(url))],
 * })
 * ```
 */
export function interval(ms: number | ((url: string) => number)): CachePlugin {
  const options: IntervalOptions = { ms }

  // 每个 URL 独立的轮询状态
  const pollingStates = new Map<string, PollingState>()

  const getOrCreateState = (url: string): PollingState => {
    let state = pollingStates.get(url)
    if (!state) {
      state = { timer: null, subscriberCount: 0, lastData: undefined }
      pollingStates.set(url, state)
    }
    return state
  }

  const startPolling = (url: string, ctx: SubscribeContext) => {
    const state = getOrCreateState(url)
    if (state.timer) return

    // 动态获取轮询间隔
    const intervalMs = typeof options.ms === 'function' 
      ? options.ms(url) 
      : options.ms

    console.log(`[key-fetch:interval] Starting polling for ${url} every ${intervalMs}ms`)

    const poll = async () => {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          console.error(`[key-fetch:interval] HTTP ${response.status} for ${url}`)
          return
        }

        const data = await response.json()
        const cached = ctx.cache.get(url)

        // 只有数据变化时才通知
        if (!cached || !shallowEqual(cached.data, data)) {
          console.log(`[key-fetch:interval] Data changed for ${url}`)
          ctx.cache.set(url, { data, timestamp: Date.now() })
          ctx.notify(data)
        }
      } catch (error) {
        console.error(`[key-fetch:interval] Error polling ${url}:`, error)
      }
    }

    // 立即执行一次
    poll()
    state.timer = setInterval(poll, intervalMs)
  }

  const stopPolling = (url: string) => {
    const state = pollingStates.get(url)
    if (state?.timer) {
      console.log(`[key-fetch:interval] Stopping polling for ${url}`)
      clearInterval(state.timer)
      state.timer = null
    }
  }

  return {
    name: 'interval',

    setup() {
      return () => {
        // 清理所有 timer
        for (const [url] of pollingStates) {
          stopPolling(url)
        }
        pollingStates.clear()
      }
    },

    onSubscribe(ctx) {
      const state = getOrCreateState(ctx.url)
      state.subscriberCount++
      
      if (state.subscriberCount === 1) {
        startPolling(ctx.url, ctx)
      }

      return () => {
        state.subscriberCount--
        if (state.subscriberCount === 0 && options.pauseWhenIdle !== false) {
          stopPolling(ctx.url)
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
