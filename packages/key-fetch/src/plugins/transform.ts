/**
 * Transform Plugin - 响应转换插件
 * 
 * 中间件模式：将 API 原始响应转换为标准输出类型
 * 
 * 每个 Provider 使用自己的 API Schema 验证响应
 * 然后通过 transform 插件转换为 ApiProvider 标准输出类型
 */

import type { FetchPlugin, MiddlewareContext } from '../types'

export interface TransformOptions<TInput, TOutput> {
    /**
     * 转换函数
     * @param input 原始验证后的数据
     * @param context 中间件上下文（包含 params）
     * @returns 转换后的标准输出
     */
    transform: (input: TInput, context: MiddlewareContext) => TOutput | Promise<TOutput>
}

/**
 * 创建转换插件
 * 
 * @example
 * ```ts
 * // BioWallet API 响应转换为标准 Balance
 * const biowalletBalanceTransform = transform<AssetResponse, Balance>({
 *   transform: (raw, ctx) => {
 *     const { symbol, decimals } = ctx.params
 *     const nativeAsset = raw.result.assets.find(a => a.magic === symbol)
 *     return {
 *       amount: Amount.fromRaw(nativeAsset?.balance ?? '0', decimals, symbol),
 *       symbol,
 *     }
 *   },
 * })
 * 
 * // 使用
 * const balanceFetch = keyFetch.create({
 *   name: 'biowallet.balance',
 *   schema: AssetResponseSchema,  // 原始 API Schema
 *   url: '/address/asset',
 *   use: [biowalletBalanceTransform],  // 转换为 Balance
 * })
 * ```
 */
export function transform<TInput, TOutput>(
    options: TransformOptions<TInput, TOutput>
): FetchPlugin {
    return {
        name: 'transform',

        async onFetch(request, next, context) {
            // 调用下一个中间件获取响应
            const response = await next(request)

            // 如果响应不成功，直接返回
            if (!response.ok) {
                return response
            }

            // 解析原始响应 (使用 ctx.body 根据 X-Superjson 头自动选择解析方式)
            const rawData = await context.body<TInput>(response)

            // 应用转换
            const transformed = await options.transform(rawData, context)

            // 使用 ctx.createResponse 构建包含转换后数据的响应
            return context.createResponse(transformed, {
                status: response.status,
                statusText: response.statusText,
            })
        },
    }
}

/**
 * 链式转换 - 组合多个转换步骤
 */
export function pipeTransform<A, B, C>(
    first: TransformOptions<A, B>,
    second: TransformOptions<B, C>
): TransformOptions<A, C> {
    return {
        transform: async (input, context) => {
            const intermediate = await first.transform(input, context)
            return second.transform(intermediate, context)
        },
    }
}
