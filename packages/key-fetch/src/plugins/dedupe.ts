/**
 * Dedupe Plugin
 * 
 * 请求去重插件（升级版）
 * 
 * 功能：
 * 1. 同一 key 的并发请求复用同一个 Response
 * 2. 可配置最小请求间隔，避免短时间内重复请求
 */

import type { FetchPlugin, MiddlewareContext } from '../types'

// 全局进行中请求缓存（存储的是克隆后的 Response Promise）
const globalPending = new Map<string, { promise: Promise<Response>; cloneCount: number }>()

// 最近完成时间（用于时间窗口去重）
const lastFetchTime = new Map<string, number>()

// 最近成功的 Response 缓存（用于时间窗口内返回缓存）
const lastResponseBody = new Map<string, string>()
const lastResponseStatus = new Map<string, number>()
const lastResponseHeaders = new Map<string, Headers>()

export interface DedupeOptions {
  /** 最小请求间隔（毫秒），0 表示不限制 */
  minInterval?: number
  /** 生成缓存 key 的函数，默认使用 name + params */
  getKey?: (ctx: MiddlewareContext) => string
}

/** 去重节流错误 */
export class DedupeThrottledError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DedupeThrottledError'
  }
}

/**
 * 请求去重插件（升级版）
 * 
 * 功能：
 * 1. 同一 key 的并发请求复用同一个 Response
 * 2. 可配置最小请求间隔，避免短时间内重复请求
 * 
 * @example
 * ```ts
 * // 基础用法：并发去重
 * use: [dedupe()]
 * 
 * // 高级用法：30秒内不重复请求
 * use: [dedupe({ minInterval: 30_000 })]
 * ```
 */
export function dedupe(options: DedupeOptions = {}): FetchPlugin {
  const { minInterval = 0, getKey } = options

  const buildKey = (ctx: MiddlewareContext): string => {
    if (getKey) return getKey(ctx)
    return `${ctx.name}::${JSON.stringify(ctx.params)}`
  }

  return {
    name: 'dedupe',

    async onFetch(request, next, context) {
      const key = buildKey(context)

      // 1. 检查进行中的请求
      const pending = globalPending.get(key)
      if (pending) {
        // 复用进行中的请求，等待完成后重建 Response
        const response = await pending.promise
        // 从缓存的 body 重建 Response
        const cachedBody = lastResponseBody.get(key)
        const cachedStatus = lastResponseStatus.get(key)
        const cachedHeaders = lastResponseHeaders.get(key)
        if (cachedBody !== undefined && cachedStatus !== undefined) {
          return new Response(cachedBody, {
            status: cachedStatus,
            headers: cachedHeaders,
          })
        }
        // 回退：返回原始响应（可能已被消费）
        return response
      }

      // 2. 检查时间窗口（如果设置了 minInterval）
      if (minInterval > 0 && !context.skipCache) {
        const lastTime = lastFetchTime.get(key) ?? 0
        const elapsed = Date.now() - lastTime
        if (elapsed < minInterval) {
          // 时间窗口内，返回缓存的 Response
          const cachedBody = lastResponseBody.get(key)
          const cachedStatus = lastResponseStatus.get(key)
          const cachedHeaders = lastResponseHeaders.get(key)
          if (cachedBody !== undefined && cachedStatus !== undefined) {
            return new Response(cachedBody, {
              status: cachedStatus,
              headers: cachedHeaders,
            })
          }
          // 无缓存，抛出节流错误
          throw new DedupeThrottledError(
            `Request throttled: ${minInterval - elapsed}ms remaining`
          )
        }
      }

      // 3. 创建新请求
      const task = next(request).then(async response => {
        // 缓存响应内容用于后续复用
        const body = await response.clone().text()
        lastResponseBody.set(key, body)
        lastResponseStatus.set(key, response.status)
        lastResponseHeaders.set(key, new Headers(response.headers))
        lastFetchTime.set(key, Date.now())
        
        // 清理 pending
        globalPending.delete(key)
        
        return response
      }).catch(error => {
        globalPending.delete(key)
        throw error
      })

      globalPending.set(key, { promise: task, cloneCount: 0 })
      return task
    },
  }
}
