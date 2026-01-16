/**
 * Unwrap Plugin - 响应解包插件
 * 
 * 用于处理服务器返回的包装格式，如：
 * - { success: true, result: {...} }
 * - { status: '1', message: 'OK', result: [...] }
 */

import type { FetchPlugin, MiddlewareContext } from '../types'

export interface UnwrapOptions<TWrapper, TInner> {
    /**
     * 解包函数
     * @param wrapped 包装的响应数据
     * @param context 中间件上下文
     * @returns 解包后的内部数据
     */
    unwrap: (wrapped: TWrapper, context: MiddlewareContext) => TInner | Promise<TInner>
}

/**
 * 创建解包插件
 * 
 * 服务器可能返回包装格式，使用此插件解包后再进行 schema 验证
 * 
 * @example
 * ```ts
 * // 处理 { success: true, result: {...} } 格式
 * const fetcher = keyFetch.create({
 *   name: 'btcwallet.balance',
 *   schema: AddressInfoSchema,
 *   url: '/address/:address',
 *   use: [walletApiUnwrap(), ttl(60_000)],
 * })
 * ```
 */
export function unwrap<TWrapper, TInner>(
    options: UnwrapOptions<TWrapper, TInner>
): FetchPlugin {
    return {
        name: 'unwrap',

        async onFetch(request, next, context) {
            const response = await next(request)

            if (!response.ok) {
                return response
            }

            // 解析包装响应
            const wrapped = await context.body<TWrapper>(response)

            // 解包
            const inner = await options.unwrap(wrapped, context)

            // 重新构建响应（带 X-Superjson 头以便 core.ts 正确解析）
            return context.createResponse(inner, {
                status: response.status,
                statusText: response.statusText,
            })
        },
    }
}

/**
 * Wallet API 包装格式解包器
 * { success: boolean, result: T } -> T
 */
export function walletApiUnwrap<T>(): FetchPlugin {
    return unwrap<{ success: boolean; result: T }, T>({
        unwrap: (wrapped, ctx) => {
            if (wrapped.success === false) {
                throw new Error(`[${ctx.name}]: Wallet API returned success: false`)
            } else if (wrapped.success === true) {
                return wrapped.result
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- legacy support
            return wrapped as any as T
        },
    })
}

/**
 * Etherscan API 包装格式解包器
 * { status: '1', message: 'OK', result: T } -> T
 */
export function etherscanApiUnwrap<T>(): FetchPlugin {
    return unwrap<{ status: string; message: string; result: T }, T>({
        unwrap: (wrapped) => {
            if (wrapped.status !== '1') {
                throw new Error(`Etherscan API error: ${wrapped.message}`)
            }
            return wrapped.result
        },
    })
}
