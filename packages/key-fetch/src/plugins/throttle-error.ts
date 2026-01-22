/**
 * Throttle Error Plugin
 * 
 * 对匹配的错误进行日志节流，避免终端刷屏
 */

import type { FetchPlugin } from '../types'

export interface ThrottleErrorOptions {
  /** 错误匹配器 - 返回 true 表示需要节流 */
  match: (error: Error) => boolean
  /** 时间窗口（毫秒），默认 10000ms */
  windowMs?: number
  /** 窗口内首次匹配时的处理，默认 console.warn */
  onFirstMatch?: (error: Error, name: string) => void
  /** 窗口结束时汇总回调 */
  onSummary?: (count: number, name: string) => void
}

/** 预置错误匹配器 */

/** 高阶函数：为匹配器添加 AggregateError 支持 */
const withAggregateError = (matcher: (msg: string) => boolean) => (e: Error): boolean => {
  if (matcher(e.message)) return true
  if (e instanceof AggregateError) {
    return e.errors.some(inner => inner instanceof Error && matcher(inner.message))
  }
  return false
}

export const errorMatchers = {
  /** 匹配 HTTP 状态码（支持 AggregateError） */
  httpStatus: (...codes: number[]) =>
    withAggregateError(msg => codes.some(code => msg.includes(`HTTP ${code}`))),

  /** 匹配关键词（支持 AggregateError） */
  contains: (...keywords: string[]) =>
    withAggregateError(msg => keywords.some(kw => msg.toLowerCase().includes(kw.toLowerCase()))),

  /** 组合多个匹配器 (OR) */
  any: (...matchers: Array<(e: Error) => boolean>) => (e: Error) =>
    matchers.some(m => m(e)),
}

/**
 * 错误日志节流插件
 * 
 * @example
 * ```ts
 * import { throttleError, errorMatchers } from '@biochain/key-fetch'
 * 
 * keyFetch.create({
 *   name: 'api.example',
 *   use: [
 *     throttleError({
 *       match: errorMatchers.httpStatus(429),
 *       windowMs: 10_000,
 *     }),
 *   ],
 * })
 * ```
 */
export function throttleError(options: ThrottleErrorOptions): FetchPlugin {
  const {
    match,
    windowMs = 10_000,
    onFirstMatch = (err, name) => {
      console.warn(`[${name}] ${err.message.split('\n')[0]} (suppressing for ${windowMs / 1000}s)`)
    },
    onSummary = (count, name) => {
      if (count > 0) {
        console.warn(`[${name}] Suppressed ${count} similar errors in last ${windowMs / 1000}s`)
      }
    },
  } = options

  // 每个 name 独立的节流状态
  const throttleState = new Map<string, {
    inWindow: boolean
    suppressedCount: number
    timer: ReturnType<typeof setTimeout> | null
  }>()

  const getState = (name: string) => {
    let state = throttleState.get(name)
    if (!state) {
      state = { inWindow: false, suppressedCount: 0, timer: null }
      throttleState.set(name, state)
    }
    return state
  }

  return {
    name: 'throttle-error',

    onError: (error, _response, context) => {
      if (!match(error)) {
        return false // 不匹配，交给默认处理
      }

      const state = getState(context.name)

      if (!state.inWindow) {
        // 首次匹配，打印警告并启动窗口
        state.inWindow = true
        state.suppressedCount = 0
        onFirstMatch(error, context.name)

        state.timer = setTimeout(() => {
          onSummary(state.suppressedCount, context.name)
          state.inWindow = false
          state.suppressedCount = 0
          state.timer = null
        }, windowMs)
      } else {
        // 窗口内，静默计数
        state.suppressedCount++
      }

      return true // 已处理，跳过默认日志
    },
  }
}
