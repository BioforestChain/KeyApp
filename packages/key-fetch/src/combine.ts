/**
 * Combine - 合并多个 KeyFetchInstance 的结果为一个 object
 * 
 * 与 merge 不同，combine 会并行调用所有 sources 并将结果组合
 * 
 * @example
 * ```ts
 * import { combine } from '@biochain/key-fetch'
 * 
 * const transaction = combine({
 *   name: 'chain.transaction',
 *   schema: TransactionSchema,
 *   sources: {
 *     pending: pendingTxFetcher,
 *     confirmed: confirmedTxFetcher,
 *   },
 *   use: [
 *     transform({
 *       transform: (results) => {
 *         // results = { pending: ..., confirmed: ... }
 *         return results.pending ?? results.confirmed
 *       },
 *     }),
 *   ],
 * })
 * ```
 */

import type {
    KeyFetchInstance,
    AnyZodSchema,
    FetchPlugin,
    InferOutput,
} from './types'
import { keyFetch } from './index'

/** Combine 选项 */
export interface CombineOptions<
    S extends AnyZodSchema,
    Sources extends Record<string, KeyFetchInstance<any, any>>
> {
    /** 合并后的名称 */
    name: string
    /** 输出 Schema */
    schema: S
    /** 源 fetcher 对象 */
    sources: Sources
    /** 插件列表 */
    use?: FetchPlugin[]
}

/** 从 sources 推导出统一的 params 类型 */
type InferCombinedParams<Sources extends Record<string, KeyFetchInstance<any, any>>> =
    Sources[keyof Sources] extends KeyFetchInstance<any, infer P> ? InferOutput<P> : never

/**
 * 合并多个 KeyFetchInstance 的结果
 * 
 * - 并行调用所有 sources
 * - 将结果组合为 { [key]: result } 的 object
 * - 支持 use 插件系统进行后续处理
 * - 自动订阅所有 sources
 */
export function combine<
    S extends AnyZodSchema,
    Sources extends Record<string, KeyFetchInstance<any, any>>
>(
    options: CombineOptions<S, Sources>
): KeyFetchInstance<S, any> {
    const { name, schema, sources, use = [] } = options

    const sourceKeys = Object.keys(sources)

    // 创建一个虚拟的 URL（combine 不需要真实的 HTTP 请求）
    const url = `combine://${name}`

    // 创建一个插件来拦截请求并调用所有 sources
    const combinePlugin: FetchPlugin = {
        name: 'combine',
        onFetch: async (_request, _next, context) => {
            // 并行调用所有 sources
            const results = await Promise.all(
                sourceKeys.map(async (key) => {
                    try {
                        // context.params 是一个 object，每个 key 对应一个 source 的 params
                        const sourceParams = (context.params as any)[key]
                        const result = await sources[key].fetch(sourceParams)
                        return [key, result] as const
                    } catch (error) {
                        // 某个 source 失败时返回 undefined
                        return [key, undefined] as const
                    }
                })
            )

            // 组合为 object
            const combined = Object.fromEntries(results)

            // 返回 Response（使用 context.createResponse）
            return context.createResponse(combined)
        },
        onSubscribe: (context) => {
            // 订阅所有 sources，任何一个更新都触发 refetch
            const unsubscribes = sourceKeys.map((key) => {
                const sourceParams = (context.params as any)[key]
                return sources[key].subscribe(sourceParams, () => {
                    // 任何 source 更新时，触发 combine 的 refetch
                    context.refetch()
                })
            })

            // 返回清理函数
            return () => {
                unsubscribes.forEach(unsub => unsub())
            }
        },
    }

    // 使用 keyFetch.create 创建实例，插件顺序：combinePlugin -> 用户插件
    return keyFetch.create({
        name,
        schema,
        // paramsSchema 从 sources 推导，这里不传
        url,
        method: 'GET',
        use: [combinePlugin, ...use],
    })
}
