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
 */

import type {
    KeyFetchInstance,
    SubscribeCallback,
    UseKeyFetchResult,
    UseKeyFetchOptions,
} from './types'
import { getUseStateImpl } from './core'
import z from 'zod'

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
export interface FallbackOptions<TOUT extends unknown, TPIN extends unknown = unknown> {
    /** 合并后的名称 */
    name: string
    /** 源 fetcher 数组（可以是空数组） */
    sources: KeyFetchInstance<TOUT, TPIN>[]
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
export function fallback<TOUT extends unknown, TPIN extends unknown = unknown>(
    options: FallbackOptions<TOUT, TPIN>
): KeyFetchInstance<TOUT, TPIN> {
    const { name, sources, onEmpty, onAllFailed } = options

    // 空数组错误处理
    const handleEmpty = onEmpty ?? (() => {
        throw new NoSupportError(name)
    })

    // 全部失败错误处理
    const handleAllFailed = onAllFailed ?? ((errors: Error[]) => {
        const aggError = new AggregateError(errors, `All ${errors.length} provider(s) failed for: ${name}`)
        // 如果任一子错误已被处理（如 throttleError），传递标记
        if (errors.some(e => (e as Error & { __errorHandled?: boolean }).__errorHandled)) {
            ;(aggError as Error & { __errorHandled?: boolean }).__errorHandled = true
        }
        throw aggError
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
    return createFallbackFetcher<TOUT, TPIN>(name, sources, handleAllFailed)
}

/** 创建一个总是抛出 NoSupportError 的 fetcher */
function createEmptyFetcher<TOUT extends unknown, TPIN extends unknown = unknown>(
    name: string,
    handleEmpty: () => never
): KeyFetchInstance<TOUT, TPIN> {
    return {
        name,
        outputSchema: z.any(),
        inputSchema: undefined,
        _output: undefined as TOUT,
        _params: undefined as unknown as TPIN,

        async fetch(): Promise<TOUT> {
            handleEmpty()
        },

        subscribe(
            _params: TPIN,
            _callback: SubscribeCallback<TOUT>
        ): () => void {
            // 不支持，直接返回空 unsubscribe
            return () => { }
        },

        invalidate(): void {
            // no-op
        },

        getCached(): TOUT | undefined {
            return undefined
        },

        useState(
            _params?: TPIN,
            _options?: UseKeyFetchOptions
        ): UseKeyFetchResult<TOUT> {
            // 返回带 NoSupportError 的结果
            return {
                data: undefined,
                isLoading: false,
                isFetching: false,
                error: new NoSupportError(name),
                refetch: async () => { },
            }
        },
        use() { return this }
    }
}

/** 创建带 fallback 逻辑的 fetcher */
function createFallbackFetcher<TOUT extends unknown, TPIN extends unknown = unknown>(
    name: string,
    sources: KeyFetchInstance<TOUT, TPIN>[],
    handleAllFailed: (errors: Error[]) => never
): KeyFetchInstance<TOUT, TPIN> {
    const first = sources[0]

    const merged: KeyFetchInstance<TOUT, TPIN> = {
        name,
        outputSchema: first.outputSchema,
        inputSchema: first.inputSchema,
        _output: first._output,
        _params: first._params,

        async fetch(params: TPIN, options?: { skipCache?: boolean }): Promise<TOUT> {
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
            params: TPIN,
            callback: SubscribeCallback<TOUT>
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

        getCached(params?: TPIN): TOUT | undefined {
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
            params: TPIN,
            options?: UseKeyFetchOptions
        ): UseKeyFetchResult<TOUT> {
            // 使用注入的 useState 实现（与 derive 一致）
            const impl = getUseStateImpl()
            if (!impl) {
                throw new Error(
                    `[key-fetch] useState() requires React. Import from '@biochain/key-fetch' to enable React support.`
                )
            }
            // 对于 merge 实例，直接调用注入的实现
            // 传入 merged 实例本身，这样 useKeyFetch 会正确使用 merged 的 subscribe
            return impl(merged, params, options)
        },
        use() { return this }
    }

    return merged
}
