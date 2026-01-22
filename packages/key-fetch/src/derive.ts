/**
 * Derive - 从现有 KeyFetchInstance 派生新实例
 * 
 * 派生实例共享同一个数据源，但可以应用不同的转换和验证
 * 
 * @example
 * ```ts
 * import { keyFetch, derive, transform } from '@biochain/key-fetch'
 * 
 * // 原始 API fetcher
 * const rawApi = keyFetch.create({
 *   name: 'api.raw',
 *   schema: RawSchema,
 *   url: '/api/data',
 * })
 * 
 * // 派生：应用转换
 * const processed = derive({
 *   name: 'api.processed',
 *   source: rawApi,
 *   schema: ProcessedSchema,
 *   use: [
 *     transform({
 *       transform: (raw) => processData(raw),
 *     }),
 *   ],
 * })
 * ```
 */

import type {
    KeyFetchInstance,
    FetchPlugin,
} from './types'
import { keyFetch } from './index'
import type { z } from 'zod'

/** Derive 选项 */
export interface KeyFetchDeriveOptions<
    TSourceOut,
    TOUT,
    TIN = unknown
> {
    /** 派生实例名称 */
    name: string
    /** 源 KeyFetchInstance */
    source: KeyFetchInstance<TSourceOut, TIN>
    /** 输出 Schema */
    outputSchema: z.ZodType<TOUT>
    /** 插件列表（通常包含 transform） */
    use?: FetchPlugin<TIN>[]
}

/**
 * 从现有 KeyFetchInstance 派生新实例
 * 
 * - 共享同一个数据源（source.fetch）
 * - 通过插件链应用转换
 * - 自动继承订阅能力
 */
export function derive<
    TSourceOut,
    TOUT,
    TIN = unknown
>(
    options: KeyFetchDeriveOptions<TSourceOut, TOUT, TIN>
): KeyFetchInstance<TOUT, TIN> {
    const { name, source, outputSchema: schema, use = [] } = options

    // 创建一个虚拟的 URL（derive 不需要真实的 HTTP 请求）
    const url = `derive://${name}`

    // 创建一个插件来拦截请求并调用 source
    const derivePlugin: FetchPlugin<TIN> = {
        name: 'derive',
        onFetch: async (_request, _next, context) => {
            // 调用 source 获取数据
            const sourceData = await source.fetch(context.params)

            // 返回 Response，让后续插件（如 transform）处理
            return context.createResponse(sourceData)
        },
        onSubscribe: (context) => {
            // 订阅 source，source 更新时触发 refetch
            return source.subscribe(context.params, () => {
                context.refetch().catch((error) => {
                    // 如果插件已处理错误（如 throttleError），跳过日志
                    if (!(error as Error & { __errorHandled?: boolean }).__errorHandled) {
                        console.error(`[key-fetch] Error in derive refetch for ${name}:`, error)
                    }
                })
            })
        },
    }

    // 使用 keyFetch.create 创建实例
    // 插件顺序：用户插件在前，derivePlugin 在后
    return Object.assign(keyFetch.create({
        name,
        outputSchema: schema,
        inputSchema: source.inputSchema,
        url,
        method: 'GET',
        use: [...use, derivePlugin],
    }), {
        use(...plugins: FetchPlugin<TIN>[]) {
            return derive({
                ...options,
                use: [...use, ...plugins],
            })
        }
    })
}
