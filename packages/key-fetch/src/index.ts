/**
 * @biochain/key-fetch
 * 
 * 插件化响应式 Fetch，支持订阅能力
 * 
 * @example
 * ```ts
 * import { keyFetch, interval, deps } from '@biochain/key-fetch'
 * 
 * // 定义缓存规则
 * keyFetch.define({
 *   name: 'bfmetav2.lastblock',
 *   pattern: /\/wallet\/bfmetav2\/lastblock/,
 *   use: [interval(15_000)],
 * })
 * 
 * keyFetch.define({
 *   name: 'bfmetav2.balance',
 *   pattern: /\/wallet\/bfmetav2\/address\/asset/,
 *   use: [deps('bfmetav2.lastblock')],
 * })
 * 
 * // 请求
 * const block = await keyFetch<BlockInfo>(url)
 * 
 * // 订阅
 * const unsubscribe = keyFetch.subscribe<BlockInfo>(url, (data, event) => {
 *   console.log('更新:', data, event)
 * })
 * ```
 */

import { keyFetchCore } from './core'
import type { CacheRule, KeyFetchOptions, SubscribeCallback } from './types'

// 导出类型
export type {
  CachePlugin,
  CacheRule,
  CacheStore,
  CacheEntry,
  KeyFetchOptions,
  SubscribeCallback,
  PluginContext,
  RequestContext,
  ResponseContext,
  SubscribeContext,
  InvalidateContext,
  RuleRegistry,
} from './types'

// 导出插件
export { interval, deps, ttl, dedupe, tag, etag } from './plugins/index'

/**
 * 响应式 Fetch 函数
 * 
 * 支持插件化缓存策略和订阅能力
 */
export async function keyFetch<T>(url: string, options?: KeyFetchOptions): Promise<T> {
  return keyFetchCore.fetch<T>(url, options)
}

/**
 * 定义缓存规则
 */
keyFetch.define = (rule: CacheRule): void => {
  keyFetchCore.define(rule)
}

/**
 * 订阅 URL 数据变化
 * 
 * @returns 取消订阅函数
 */
keyFetch.subscribe = <T>(
  url: string,
  callback: SubscribeCallback<T>,
  options?: KeyFetchOptions
): (() => void) => {
  return keyFetchCore.subscribe<T>(url, callback, options)
}

/**
 * 手动失效规则
 */
keyFetch.invalidate = (ruleName: string): void => {
  keyFetchCore.invalidate(ruleName)
}

/**
 * 按标签失效
 */
keyFetch.invalidateByTag = (tag: string): void => {
  keyFetchCore.invalidateByTag(tag)
}

/**
 * 清理所有规则和缓存（用于测试）
 */
keyFetch.clear = (): void => {
  keyFetchCore.clear()
}
