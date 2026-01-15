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
    AnyZodSchema,
    FetchPlugin,
} from './types'
import { keyFetch } from './index'

/** Derive 选项 */
export interface KeyFetchDeriveOptions<
    TSourceSchema extends AnyZodSchema,
    TOutputSchema extends AnyZodSchema,
    P extends AnyZodSchema = AnyZodSchema
> {
    /** 派生实例名称 */
    name: string
    /** 源 KeyFetchInstance */
    source: KeyFetchInstance<TSourceSchema, P>
    /** 输出 Schema */
    schema: TOutputSchema
    /** 插件列表（通常包含 transform） */
    use?: FetchPlugin[]
}

/**
 * 从现有 KeyFetchInstance 派生新实例
 * 
 * - 共享同一个数据源（source.fetch）
 * - 通过插件链应用转换
 * - 自动继承订阅能力
 */
export function derive<
    TSourceSchema extends AnyZodSchema,
    TOutputSchema extends AnyZodSchema,
    P extends AnyZodSchema = AnyZodSchema
>(
    options: KeyFetchDeriveOptions<TSourceSchema, TOutputSchema, P>
): KeyFetchInstance<TOutputSchema, P> {
    const { name, source, schema, use = [] } = options

    // 创建一个虚拟的 URL（derive 不需要真实的 HTTP 请求）
    const url = `derive://${name}`

    // 创建一个插件来拦截请求并调用 source
    const derivePlugin: FetchPlugin = {
        name: 'derive',
        onFetch: async (_request, _next, context) => {
            // 调用 source 获取数据
            const sourceData = await source.fetch(context.params as any)

            // 返回 Response，让后续插件（如 transform）处理
            return context.createResponse(sourceData)
        },
        onSubscribe: (context) => {
            // 订阅 source，source 更新时触发 refetch
            return source.subscribe(context.params as any, () => {
                context.refetch().catch((error) => {
                    // Error is already logged by core.ts, just need to prevent unhandled rejection
                    console.error(`[key-fetch] Error in derive refetch for ${name}:`, error)
                })
            })
        },
    }

    // 使用 keyFetch.create 创建实例
    // 插件顺序：用户插件在前，derivePlugin 在后
    return keyFetch.create({
        name,
        schema,
        paramsSchema: source.paramsSchema,
        url,
        method: 'GET',
        use: [...use, derivePlugin],
    })
}
