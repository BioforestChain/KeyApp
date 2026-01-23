/**
 * Params Plugin
 * 
 * 将请求参数组装到不同位置（兼容旧版）
 */

import type { Plugin } from '../types'

/**
 * SearchParams 插件 - 将 params 添加到 URL query string
 */
export function searchParams<P extends Record<string, unknown> = Record<string, unknown>>(options?: {
    defaults?: P
    transform?: (params: P) => Record<string, unknown>
}): Plugin<P, unknown> {
    return {
        name: 'params:searchParams',
        async onFetch(ctx, next) {
            const url = new URL(ctx.req.url)

            const mergedParams = {
                ...options?.defaults,
                ...(ctx.input as P),
            }

            const finalParams = options?.transform
                ? options.transform(mergedParams)
                : mergedParams

            for (const [key, value] of Object.entries(finalParams)) {
                if (value !== undefined) {
                    url.searchParams.set(key, String(value))
                }
            }

            ctx.req = new Request(url.toString(), {
                method: ctx.req.method,
                headers: ctx.req.headers,
                body: ctx.req.body,
            })

            return next()
        },
    }
}

/**
 * PostBody 插件 - 将 params 设置为 POST body
 */
export function postBody<TIN extends Record<string, unknown>>(options?: {
    defaults?: Partial<TIN>
    transform?: (params: TIN) => unknown
}): Plugin<TIN, unknown> {
    return {
        name: 'params:postBody',
        async onFetch(ctx, next) {
            const mergedParams = {
                ...options?.defaults,
                ...(ctx.input as TIN),
            }

            const body = options?.transform
                ? options.transform(mergedParams)
                : mergedParams

            ctx.req = new Request(ctx.req.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            return next()
        },
    }
}

/**
 * PathParams 插件 - 替换 URL 中的 :param 占位符
 */
export function pathParams(): Plugin {
    return {
        name: 'params:pathParams',
        async onFetch(ctx, next) {
            let url = ctx.req.url

            if (typeof ctx.input === 'object' && ctx.input !== null) {
                for (const [key, value] of Object.entries(ctx.input)) {
                    if (value !== undefined) {
                        url = url.replace(`:${key}`, encodeURIComponent(String(value)))
                    }
                }
            }

            ctx.req = new Request(url, {
                method: ctx.req.method,
                headers: ctx.req.headers,
                body: ctx.req.body,
            })

            return next()
        },
    }
}
