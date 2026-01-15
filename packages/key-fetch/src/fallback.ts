/**
 * Merge - 合并多个 KeyFetchInstance 实现 auto-fallback
 * 
 * @example
 * ```ts
 * import { keyFetch, NoSupportError } from '@biochain/key-fetch'
 * 
 * // 合并多个 fetcher，失败时自动 fallback
 * const balanceFetcher = keyFetch.merge({
 *   name: 'chain.balance',
 *   sources: [provider1.balance, provider2.balance].filter(Boolean),
 *   // 空数组时
 *   onEmpty: () => { throw new NoSupportError('nativeBalance') },
 *   // 全部失败时
 *   onAllFailed: (errors) => { throw new AggregateError(errors, 'All providers failed') },
 * })
 * 
 * // 使用
 * const { data, error } = balanceFetcher.useState({ address })
 * if (error instanceof NoSupportError) {
 *   // 不支持
 * }
 * ```
 */

import type {
    KeyFetchInstance,
    AnyZodSchema,
    InferOutput,
    FetchParams,
    SubscribeCallback,
    UseKeyFetchResult,
    UseKeyFetchOptions,
} from './types'
import { getUseStateImpl } from './core'

/** 自定义错误：不支持的能力 */
export class NoSupportError extends Error {
    readonly capability: string

    constructor(capability: string) {
        super(`No provider supports: ${capability}`)
        this.name = 'NoSupportError'
        this.capability = capability
    }
}

/** Fallback 选项 */
export interface FallbackOptions<S extends AnyZodSchema, P extends AnyZodSchema> {
    /** 合并后的名称 */
    name: string
    /** 源 fetcher 数组（可以是空数组） */
    sources: KeyFetchInstance<S, P>[]
    /** 当 sources 为空时调用，默认抛出 NoSupportError */
    onEmpty?: () => never
    /** 当所有 sources 都失败时调用，默认抛出 AggregateError */
    onAllFailed?: (errors: Error[]) => never
}

/**
 *  提供 KeyFetchInstance，一个出错自动使用下一个来回退
 * 
 * - 如果 sources 为空，调用 onEmpty（默认抛出 NoSupportError）
 * - 如果某个 source 失败，自动尝试下一个
 * - 如果全部失败，调用 onAllFailed（默认抛出 AggregateError）
 */
export function fallback<S extends AnyZodSchema, P extends AnyZodSchema>(
    options: FallbackOptions<S, P>
): KeyFetchInstance<S, P> {
    const { name, sources, onEmpty, onAllFailed } = options

    // 空数组错误处理
    const handleEmpty = onEmpty ?? (() => {
        throw new NoSupportError(name)
    })

    // 全部失败错误处理
    const handleAllFailed = onAllFailed ?? ((errors: Error[]) => {
        throw new AggregateError(errors, `All ${errors.length} provider(s) failed for: ${name}`)
    })

    // 如果没有 source，创建一个总是失败的实例
    if (sources.length === 0) {
        return createEmptyFetcher(name, handleEmpty)
    }

    // 只有一个 source，直接返回
    if (sources.length === 1) {
        return sources[0]
    }

    // 多个 sources，创建 fallback 实例
    return createFallbackFetcher(name, sources, handleAllFailed)
}

/** 创建一个总是抛出 NoSupportError 的 fetcher */
function createEmptyFetcher<S extends AnyZodSchema, P extends AnyZodSchema>(
    name: string,
    handleEmpty: () => never
): KeyFetchInstance<S, P> {
    return {
        name,
        schema: undefined as unknown as S,
        paramsSchema: undefined,
        _output: undefined as InferOutput<S>,
        _params: undefined as unknown as InferOutput<P>,

        async fetch(): Promise<InferOutput<S>> {
            handleEmpty()
        },

        subscribe(
            _params: InferOutput<P>,
            _callback: SubscribeCallback<InferOutput<S>>
        ): () => void {
            // 不支持，直接返回空 unsubscribe
            return () => { }
        },

        invalidate(): void {
            // no-op
        },

        getCached(): InferOutput<S> | undefined {
            return undefined
        },

        useState(
            _params?: InferOutput<P>,
            _options?: UseKeyFetchOptions
        ): UseKeyFetchResult<InferOutput<S>> {
            // 返回带 NoSupportError 的结果
            return {
                data: undefined,
                isLoading: false,
                isFetching: false,
                error: new NoSupportError(name),
                refetch: async () => { },
            }
        },
    }
}

/** 创建带 fallback 逻辑的 fetcher */
function createFallbackFetcher<S extends AnyZodSchema, P extends AnyZodSchema>(
    name: string,
    sources: KeyFetchInstance<S, P>[],
    handleAllFailed: (errors: Error[]) => never
): KeyFetchInstance<S, P> {
    const first = sources[0]

    const merged: KeyFetchInstance<S, P> = {
        name,
        schema: first.schema,
        paramsSchema: first.paramsSchema,
        _output: first._output,
        _params: first._params,

        async fetch(params: InferOutput<P>, options?: { skipCache?: boolean }): Promise<InferOutput<S>> {
            const errors: Error[] = []

            for (const source of sources) {
                try {
                    return await source.fetch(params, options)
                } catch (error) {
                    errors.push(error instanceof Error ? error : new Error(String(error)))
                }
            }

            handleAllFailed(errors)
        },

        subscribe(
            params: InferOutput<P>,
            callback: SubscribeCallback<InferOutput<S>>
        ): () => void {
            // 对于 subscribe，使用第一个可用的 source
            // 如果第一个失败，不自动切换（订阅比较复杂）
            return first.subscribe(params, callback)
        },

        invalidate(): void {
            // 失效所有 sources
            for (const source of sources) {
                source.invalidate()
            }
        },

        getCached(params?: InferOutput<P>): InferOutput<S> | undefined {
            // 从第一个有缓存的 source 获取
            for (const source of sources) {
                const cached = source.getCached(params)
                if (cached !== undefined) {
                    return cached
                }
            }
            return undefined
        },

        useState(
            params?: InferOutput<P>,
            options?: UseKeyFetchOptions
        ): UseKeyFetchResult<InferOutput<S>> {
            // 使用注入的 useState 实现（与 derive 一致）
            const impl = getUseStateImpl()
            if (!impl) {
                throw new Error(
                    `[key-fetch] useState() requires React. Import from '@biochain/key-fetch' to enable React support.`
                )
            }
            // 对于 merge 实例，直接调用注入的实现
            // 传入 merged 实例本身，这样 useKeyFetch 会正确使用 merged 的 subscribe
            return impl(merged as unknown as KeyFetchInstance<S>, params as unknown as FetchParams | undefined, options)
        },
    }

    return merged
}
