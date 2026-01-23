/**
 * Transform Plugin - 响应转换插件
 */

import type { Context, Plugin } from '../types'
import { superjson } from '../core'

export interface TransformOptions<TInput, TOutput, TParams = unknown> {
    transform: (input: TInput, ctx: Context<TParams, unknown>) => TOutput | Promise<TOutput>
}

export function transform<TInput, TOutput, TParams = unknown>(
    options: TransformOptions<TInput, TOutput, TParams>
): Plugin<TParams, unknown> {
    return {
        name: 'transform',

        async onFetch(ctx, next) {
            const response = await next()

            if (!response.ok) {
                return response
            }

            const text = await response.text()
            const isSuperjson = response.headers.get('X-Superjson') === 'true'
            const rawData = isSuperjson ? superjson.parse(text) as TInput : JSON.parse(text) as TInput

            const transformed = await options.transform(rawData, ctx)

            return new Response(JSON.stringify(transformed), {
                status: response.status,
                statusText: response.statusText,
                headers: { 'Content-Type': 'application/json' },
            })
        },
    }
}
