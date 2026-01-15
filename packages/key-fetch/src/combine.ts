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

import { z } from 'zod'
import type {
    KeyFetchInstance,
    AnyZodSchema,
    FetchPlugin,
} from './types'
import { keyFetch } from './index'

/** Combine 选项 */
export interface CombineOptions<
    S extends AnyZodSchema,
    Sources extends Record<string, KeyFetchInstance<any, any>>,
    P extends AnyZodSchema = z.ZodType<InferCombinedParams<Sources>>
> {
    /** 合并后的名称 */
    name: string
    /** 输出 Schema */
    schema: S
    /** 源 fetcher 对象 */
    sources: Sources
    /** 自定义参数 Schema（可选，默认从 sources 推导） */
    paramsSchema?: P
    /** 参数转换函数：将外部 params 转换为各个 source 需要的 params */
    transformParams?: (params: z.infer<P>) => InferCombinedParams<Sources>
    /** 插件列表 */
    use?: FetchPlugin[]
}

/** 从 Sources 推导出组合的 params 类型 */
type InferCombinedParams<Sources extends Record<string, KeyFetchInstance<any, any>>> = {
    [K in keyof Sources]: Sources[K] extends KeyFetchInstance<any, infer P>
    ? (P extends AnyZodSchema ? z.infer<P> : never)
    : never
}

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
    Sources extends Record<string, KeyFetchInstance<any, any>>,
    P extends AnyZodSchema = z.ZodType<InferCombinedParams<Sources>>
>(
    options: CombineOptions<S, Sources, P>
): KeyFetchInstance<S, P> {
    const { name, schema, sources, paramsSchema: customParamsSchema, transformParams, use = [] } = options

    const sourceKeys = Object.keys(sources)

    // 创建一个虚拟的 URL（combine 不需要真实的 HTTP 请求）
    const url = `combine://${name}`

    // 创建一个插件来拦截请求并调用所有 sources
    const combinePlugin: FetchPlugin = {
        name: 'combine',
        onFetch: async (_request, _next, context) => {
            // 转换 params：如果有 transformParams，使用它；否则直接使用 context.params
            const sourceParams = transformParams
                ? transformParams(context.params as any)
                : (context.params as any)

            // 并行调用所有 sources
            const results = await Promise.all(
                sourceKeys.map(async (key) => {
                    try {
                        const result = await sources[key].fetch(sourceParams[key])
                        return [key, result] as const
                    } catch (error) {
                        // 某个 source 失败时返回 undefined
                        return [key, undefined] as const
                    }
                })
            )

            // 组合为 object
            const combined = Object.fromEntries(results)

            // 直接返回 Response，让后续插件（如 transform）处理
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

    // 确定最终的 paramsSchema
    let finalParamsSchema: AnyZodSchema | undefined
    if (customParamsSchema) {
        // 使用自定义的 paramsSchema
        finalParamsSchema = customParamsSchema
    } else {
        // 自动创建组合的 paramsSchema：{ sourceKey1: schema1, sourceKey2: schema2 }
        const combinedParamsShape: Record<string, AnyZodSchema> = {}
        for (const key of sourceKeys) {
            const sourceParamsSchema = sources[key].paramsSchema
            if (sourceParamsSchema) {
                combinedParamsShape[key] = sourceParamsSchema
            }
        }
        finalParamsSchema = Object.keys(combinedParamsShape).length > 0
            ? z.object(combinedParamsShape as any)
            : undefined
    }

    // 使用 keyFetch.create 创建实例
    return keyFetch.create({
        name,
        schema,
        paramsSchema: finalParamsSchema,
        url,
        method: 'GET',
        // 用户插件在前，combinePlugin 在后，这样 transform 可以处理 combined 结果
        use: [...use, combinePlugin],
    }) as KeyFetchInstance<S, P>
}
