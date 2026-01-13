/**
 * @biochain/key-fetch
 * 
 * Schema-first 插件化响应式 Fetch
 * 
 * @example
 * ```ts
 * import { z } from 'zod'
 * import { keyFetch, interval, deps } from '@biochain/key-fetch'
 * 
 * // 定义 Schema
 * const LastBlockSchema = z.object({
 *   success: z.boolean(),
 *   result: z.object({
 *     height: z.number(),
 *     timestamp: z.number(),
 *   }),
 * })
 * 
 * // 创建 KeyFetch 实例（工厂模式）
 * const lastBlockFetch = keyFetch.create({
 *   name: 'bfmeta.lastblock',
 *   schema: LastBlockSchema,
 *   url: 'https://api.bfmeta.info/wallet/:chainId/lastblock',
 *   use: [interval(15_000)],
 * })
 * 
 * // 请求（类型安全，已验证）
 * const data = await lastBlockFetch.fetch({ chainId: 'bfmeta' })
 * 
 * // 订阅
 * const unsubscribe = lastBlockFetch.subscribe({ chainId: 'bfmeta' }, (data, event) => {
 *   console.log('区块更新:', data.result.height)
 * })
 * 
 * // React 中使用
 * function BlockHeight() {
 *   const { data, isLoading } = useKeyFetch(lastBlockFetch, { chainId: 'bfmeta' })
 *   if (isLoading) return <div>Loading...</div>
 *   return <div>Height: {data?.result.height}</div>
 * }
 * ```
 */

import { create, get, invalidate, clear } from './core'
import { getInstancesByTag } from './plugins/tag'

// ==================== 导出类型 ====================

export type {
  // Schema types
  AnyZodSchema,
  InferOutput,
  // Cache types
  CacheEntry,
  CacheStore,
  // Plugin types
  CachePlugin,
  PluginContext,
  RequestContext,
  ResponseContext,
  SubscribeContext,
  // Instance types
  KeyFetchDefineOptions,
  KeyFetchInstance,
  FetchParams,
  SubscribeCallback,
  // Registry types
  KeyFetchRegistry,
  // React types
  UseKeyFetchResult,
  UseKeyFetchOptions,
} from './types'

// ==================== 导出插件 ====================

export { interval } from './plugins/interval'
export { deps } from './plugins/deps'
export { ttl } from './plugins/ttl'
export { dedupe } from './plugins/dedupe'
export { tag } from './plugins/tag'
export { etag } from './plugins/etag'

// ==================== 导出 React Hooks ====================

export { useKeyFetch, useKeyFetchSubscribe } from './react'

// ==================== 主 API ====================

/**
 * KeyFetch 命名空间
 */
export const keyFetch = {
  /**
   * 创建 KeyFetch 实例
   */
  create,

  /**
   * 获取已注册的实例
   */
  get,

  /**
   * 按名称失效
   */
  invalidate,

  /**
   * 按标签失效
   */
  invalidateByTag(tagName: string): void {
    const names = getInstancesByTag(tagName)
    for (const name of names) {
      invalidate(name)
    }
  },

  /**
   * 清理所有（用于测试）
   */
  clear,
}

// 默认导出
export default keyFetch
