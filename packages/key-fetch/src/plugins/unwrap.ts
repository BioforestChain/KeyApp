/**
 * Unwrap Plugin - 响应解包插件
 * 
 * 用于处理服务器返回的包装格式
 */

import type { Context, Plugin } from '../types'
import { superjson } from '../core'

export interface UnwrapOptions<TWrapper, TInner> {
    /**
     * 解包函数
     * @param wrapped 包装的响应数据
     * @param ctx 上下文
     * @returns 解包后的内部数据
     */
    unwrap: (wrapped: TWrapper, ctx: Context<unknown, unknown>) => TInner | Promise<TInner>
}

/**
 * 创建解包插件
 */
export function unwrap<TWrapper, TInner>(
    options: UnwrapOptions<TWrapper, TInner>
): Plugin {
    return {
        name: 'unwrap',

        async onFetch(ctx, next) {
            const response = await next()

            if (!response.ok) {
                return response
            }

            // 解析包装响应
            const text = await response.text()
            const isSuperjson = response.headers.get('X-Superjson') === 'true'
            const wrapped = isSuperjson ? superjson.parse(text) as TWrapper : JSON.parse(text) as TWrapper

            // 解包
            const inner = await options.unwrap(wrapped, ctx)

            // 重新构建响应
            return new Response(JSON.stringify(inner), {
                status: response.status,
                statusText: response.statusText,
                headers: { 'Content-Type': 'application/json' },
            })
        },
    }
}

/**
 * Wallet API 包装格式解包器
 */
export function walletApiUnwrap<T>(): Plugin {
    return unwrap<{ success: boolean; result: T }, T>({
        unwrap: (wrapped, ctx) => {
            if (wrapped.success === false) {
                throw new Error(`[${ctx.name}]: Wallet API returned success: false`)
            } else if (wrapped.success === true) {
                return wrapped.result
            }
            return wrapped as unknown as T
        },
    })
}

/**
 * Etherscan API 包装格式解包器
 */
export function etherscanApiUnwrap<T>(): Plugin {
    return unwrap<{ status: string; message: string; result: T }, T>({
        unwrap: (wrapped) => {
            if (wrapped.status !== '1') {
                throw new Error(`Etherscan API error: ${wrapped.message}`)
            }
            return wrapped.result
        },
    })
}
