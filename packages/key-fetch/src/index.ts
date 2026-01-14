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
 *   const { data, isLoading } = lastBlockFetch.useState({ chainId: 'bfmeta' })
 *   if (isLoading) return <div>Loading...</div>
 *   return <div>Height: {data?.result.height}</div>
 * }
 * ```
 */

import { create, get, invalidate, clear } from './core'
import { getInstancesByTag } from './plugins/tag'
import superjson from 'superjson'

// ==================== 导出类型 ====================

export type {
    // Schema types
    AnyZodSchema,
    InferOutput,
    // Cache types
    CacheEntry,
    CacheStore,
    // Plugin types (middleware pattern)
    FetchPlugin,
    FetchMiddleware,
    MiddlewareContext,
    SubscribeContext,
    CachePlugin, // deprecated alias
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
export { transform, pipeTransform } from './plugins/transform'
export type { TransformOptions } from './plugins/transform'
export { cache, MemoryCacheStorage, IndexedDBCacheStorage } from './plugins/cache'
export type { CacheStorage, CachePluginOptions } from './plugins/cache'
export { searchParams, postBody, pathParams } from './plugins/params'
export { unwrap, walletApiUnwrap, etherscanApiUnwrap } from './plugins/unwrap'
export type { UnwrapOptions } from './plugins/unwrap'

// ==================== 导出 Derive 工具 ====================

export { derive } from './derive'
export type { KeyFetchDeriveOptions } from './derive'

// ==================== 导出 Merge 工具 ====================

export { merge, NoSupportError } from './merge'
export type { MergeOptions } from './merge'

// ==================== React Hooks（内部注入）====================
// 注意：不直接导出 useKeyFetch
// 用户应使用 fetcher.useState({ ... }) 方式调用
// React hooks 在 ./react 模块加载时自动注入到 KeyFetchInstance.prototype

import './react' // 副作用导入，注入 useState 实现

// ==================== 统一的 body 解析函数 ====================

/**
 * 统一的响应 body 解析函数
 * 根据 X-Superjson 头自动选择解析方式
 */
async function parseBody<T>(input: Request | Response): Promise<T> {
    const text = await input.text()
    const isSuperjson = input.headers.get('X-Superjson') === 'true'
    if (isSuperjson) {
        return superjson.parse(text) as T
    }
    return JSON.parse(text) as T
}

// ==================== 主 API ====================

import { merge as mergeImpl } from './merge'

/**
 * KeyFetch 命名空间
 */
export const keyFetch = {
    /**
     * 创建 KeyFetch 实例
     */
    create,

    /**
     * 合并多个 KeyFetch 实例（auto-fallback）
     */
    merge: mergeImpl,

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

    /**
     * SuperJSON 实例（用于注册自定义类型序列化）
     * 
     * @example
     * ```ts
     * import { keyFetch } from '@biochain/key-fetch'
     * import { Amount } from './amount'
     * 
     * keyFetch.superjson.registerClass(Amount, {
     *   identifier: 'Amount',
     *   ...
     * })
     * ```
     */
    superjson,

    /**
     * 统一的 body 解析函数（支持 superjson）
     * 
     * @example
     * ```ts
     * const data = await keyFetch.body<MyType>(response)
     * ```
     */
    body: parseBody,
}

// 默认导出
export default keyFetch
