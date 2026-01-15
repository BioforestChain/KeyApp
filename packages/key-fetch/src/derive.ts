/**
 * Derive - 从基础 KeyFetchInstance 派生新实例
 * 
 * 设计模式：类似 KeyFetchDefineOptions，统一使用 `use` 插件系统
 * 共享同一个数据源，通过插件应用转换逻辑
 * 
 * @example
 * ```ts
 * // 基础 fetcher（获取原始数据）
 * const #assetFetcher = keyFetch.create({
 *   name: 'biowallet.asset',
 *   schema: AssetResponseSchema,
 *   url: '/address/asset',
 * })
 * 
 * // 派生：Balance 视图（使用 transform 插件）
 * const nativeBalance = keyFetch.derive({
 *   name: 'biowallet.balance',
 *   source: #assetFetcher,
 *   schema: BalanceOutputSchema,
 *   use: [
 *     transform((raw) => ({
 *       amount: Amount.fromRaw(raw.result.assets[0].balance, 8, 'BFM'),
 *       symbol: 'BFM'
 *     })),
 *   ],
 * })
 * ```
 */

import type {
    KeyFetchInstance,
    AnyZodSchema,
    InferOutput,
    SubscribeCallback,
    FetchPlugin,
} from './types'
import { getUseStateImpl } from './core'
import superjson from 'superjson'

/** 派生选项 - 类似 KeyFetchDefineOptions */
export interface KeyFetchDeriveOptions<
    TSourceSchema extends AnyZodSchema,
    TOutputSchema extends AnyZodSchema,
    P extends AnyZodSchema = AnyZodSchema,
> {
    /** 唯一名称 */
    name: string
    /** 源 KeyFetchInstance */
    source: KeyFetchInstance<TSourceSchema, P>
    /** 输出 Schema */
    schema: TOutputSchema
    /** 插件列表（使用 transform 插件进行转换） */
    use?: FetchPlugin[]
}

/**
 * 从基础 KeyFetchInstance 派生新实例
 * 
 * 派生实例：
 * - 共享同一个网络请求（通过 source.fetch）
 * - 通过 use 插件链应用转换
 * - 自动继承订阅能力
 */
export function derive<
    TSourceSchema extends AnyZodSchema,
    TOutputSchema extends AnyZodSchema,
    P extends AnyZodSchema = AnyZodSchema,
>(
    options: KeyFetchDeriveOptions<TSourceSchema, TOutputSchema, P>
): KeyFetchInstance<TOutputSchema, P> {
    const { name, source, schema, use: plugins = [] } = options

    // 创建派生实例
    const derived: KeyFetchInstance<TOutputSchema, P> = {
        name,
        schema,
        paramsSchema: undefined,
        _output: undefined as InferOutput<TOutputSchema>,
        _params: undefined as unknown as InferOutput<P>,

        async fetch(params: InferOutput<P>, fetchOptions?: { skipCache?: boolean }) {
            // 从 source 获取数据
            const sourceData = await source.fetch(params, fetchOptions)

            // 构建完整的 middlewareContext（包含 superjson 工具）
            const middlewareContext: import('./types').MiddlewareContext = {
                name,
                params: (params ?? {}) as import('./types').FetchParams,
                skipCache: false,
                // 直接暴露 superjson 库
                superjson,
                // 创建带 X-Superjson 头的 Response
                createResponse: <T>(data: T, init?: ResponseInit) => {
                    return new Response(superjson.stringify(data), {
                        ...init,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Superjson': 'true',
                            ...init?.headers,
                        },
                    })
                },
                // 根据 X-Superjson 头自动选择解析方式
                body: async <T>(input: Request | Response): Promise<T> => {
                    const text = await input.text()
                    const isSuperjson = input.headers.get('X-Superjson') === 'true'
                    if (isSuperjson) {
                        return superjson.parse(text) as T
                    }
                    return JSON.parse(text) as T
                },
            }

            // 构造 Response 对象供插件链处理 (使用 ctx.createResponse)
            let response = middlewareContext.createResponse(sourceData, { status: 200 })

            for (const plugin of plugins) {
                if (plugin.onFetch) {
                    response = await plugin.onFetch(
                        new Request('derive://source'),
                        async () => response,
                        middlewareContext
                    )
                }
            }

            // 解析最终结果 (使用 ctx.body 根据 X-Superjson 头自动选择)
            return middlewareContext.body<InferOutput<TOutputSchema>>(response)
        },

        subscribe(
            params: InferOutput<P>,
            callback: SubscribeCallback<InferOutput<TOutputSchema>>
        ) {
            // 订阅 source，通过插件链转换后通知
            return source.subscribe(params, async (sourceData, event) => {
                try {
                    // 构建完整的 middlewareContext（包含 superjson 工具）
                    const middlewareContext: import('./types').MiddlewareContext = {
                        name,
                        params: (params ?? {}) as import('./types').FetchParams,
                        skipCache: false,
                        // 直接暴露 superjson 库
                        superjson,
                        // 创建带 X-Superjson 头的 Response
                        createResponse: <T>(data: T, init?: ResponseInit) => {
                            return new Response(superjson.stringify(data), {
                                ...init,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-Superjson': 'true',
                                    ...init?.headers,
                                },
                            })
                        },
                        // 根据 X-Superjson 头自动选择解析方式
                        body: async <T>(input: Request | Response): Promise<T> => {
                            const isSuperjson = input.headers.get('X-Superjson') === 'true'
                            if (isSuperjson) {
                                return superjson.parse(await input.text()) as T
                            }
                            return await input.json() as T
                        },
                    }

                    // 构造 Response 对象 (使用 ctx.createResponse)
                    let response = middlewareContext.createResponse(sourceData, { status: 200 })

                    for (const plugin of plugins) {
                        if (plugin.onFetch) {
                            response = await plugin.onFetch(
                                new Request('derive://source'),
                                async () => response,
                                middlewareContext
                            )
                        }
                    }

                    // 解析最终结果 (使用 ctx.body)
                    const transformed = await middlewareContext.body<InferOutput<TOutputSchema>>(response)
                    callback(transformed, event)
                } catch (err) {
                    console.error(`[key-fetch] Error in derive subscribe for ${name}:`, err)
                }
            })
        },

        invalidate() {
            source.invalidate()
        },

        getCached(_params?: InferOutput<P>) {
            // 对于派生实例，getCached 需要同步执行插件链
            // 这比较复杂，暂时返回 undefined
            return undefined
        },

        useState(params?: InferOutput<P>, options?: { enabled?: boolean }) {
            // 使用 core.ts 中注入的 useState 实现
            const impl = getUseStateImpl()
            if (!impl) {
                throw new Error(
                    `[key-fetch] useState() requires React. Import from '@biochain/key-fetch' to enable React support.`
                )
            }
            return impl(derived as any, params as any, options)
        },
    }

    return derived
}
