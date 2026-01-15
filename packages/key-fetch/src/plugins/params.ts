/**
 * Params Plugin
 * 
 * 将请求参数组装到不同位置：
 * - searchParams: URL Query String (?address=xxx&limit=10)
 * - postBody: POST JSON Body ({ address: "xxx", limit: 10 })
 * - pathParams: URL Path (/users/:id -> /users/123)（默认在 core.ts 中处理）
 */

import type { FetchPlugin, FetchParams } from '../types'

/**
 * SearchParams 插件
 * 
 * 将 params 添加到 URL 的 query string 中
 * 
 * @example
 * ```ts
 * const fetcher = keyFetch.create({
 *   name: 'balance',
 *   schema: BalanceSchema,
 *   url: 'https://api.example.com/address/asset',
 *   use: [searchParams()],
 * })
 * 
 * // fetch({ address: 'xxx' }) 会请求:
 * // GET https://api.example.com/address/asset?address=xxx
 * 
 * // 带 transform 的用法（适用于需要转换参数名的 API）:
 * use: [searchParams({
 *   transform: (params) => ({
 *     module: 'account',
 *     action: 'balance',
 *     address: params.address,
 *   }),
 * })]
 * ```
 */
export function searchParams<P extends FetchParams = FetchParams>(options?: {
    /** 额外固定参数（合并到 params） */
    defaults?: P
    /** 转换函数（自定义 query params 格式） */
    transform?: (params: P) => Record<string, unknown>
}): FetchPlugin<P> {
    return {
        name: 'params:searchParams',
        onFetch: async (request, next, context) => {
            const url = new URL(request.url)

            // 合并默认参数并转换
            const mergedParams = {
                ...options?.defaults,
                ...context.params,
            }
            if (options?.defaults) {
                for (const key in mergedParams) {
                    if ((mergedParams[key] === undefined || mergedParams[key] === null) &&
                        options?.defaults?.[key] !== undefined && options?.defaults?.[key] !== null) {
                        (mergedParams as Record<string, unknown>)[key] = options?.defaults?.[key]
                    }
                }
            }
            const finalParams = options?.transform
                ? options.transform(mergedParams)
                : mergedParams

            // 添加 params 到 URL search params
            for (const [key, value] of Object.entries(finalParams)) {
                if (value !== undefined) {
                    url.searchParams.set(key, String(value))
                }
            }

            // 创建新请求（更新 URL）
            const newRequest = new Request(url.toString(), {
                method: request.method,
                headers: request.headers,
                body: request.body,
            })

            return next(newRequest)
        },
    }
}

/**
 * PostBody 插件
 * 
 * 将 params 设置为 POST 请求的 JSON body
 * 
 * @example
 * ```ts
 * const fetcher = keyFetch.create({
 *   name: 'transactions',
 *   schema: TransactionsSchema,
 *   url: 'https://api.example.com/transactions/query',
 *   method: 'POST',
 *   use: [postBody()],
 * })
 * 
 * // fetch({ address: 'xxx', page: 1 }) 会请求:
 * // POST https://api.example.com/transactions/query
 * // Body: { "address": "xxx", "page": 1 }
 * ```
 */
export function postBody(options?: {
    /** 额外固定参数（合并到 params） */
    defaults?: FetchParams
    /** 转换函数（自定义 body 格式） */
    transform?: (params: FetchParams) => unknown
}): FetchPlugin {
    return {
        name: 'params:postBody',
        onFetch: async (request, next, context) => {
            // 合并默认参数
            const mergedParams = {
                ...options?.defaults,
                ...context.params,
            }

            // 转换或直接使用
            const body = options?.transform
                ? options.transform(mergedParams)
                : mergedParams

            // 创建新请求（POST with JSON body）
            const newRequest = new Request(request.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            return next(newRequest)
        },
    }
}

/**
 * Path Params 插件
 * 
 * 将 params 替换到 URL 路径中的 :param 占位符
 * 
 * @example
 * ```ts
 * const fetcher = keyFetch.create({
 *   name: 'user',
 *   schema: UserSchema,
 *   url: 'https://api.example.com/users/:userId/profile',
 *   use: [pathParams()],
 * })
 * 
 * // fetch({ userId: '123' }) 会请求:
 * // GET https://api.example.com/users/123/profile
 * ```
 */
export function pathParams(): FetchPlugin {
    return {
        name: 'params:pathParams',
        onFetch: async (request, next, context) => {
            let url = request.url

            // 替换 :param 占位符
            for (const [key, value] of Object.entries(context.params)) {
                if (value !== undefined) {
                    url = url.replace(`:${key}`, encodeURIComponent(String(value)))
                }
            }

            // 创建新请求（更新 URL）
            const newRequest = new Request(url, {
                method: request.method,
                headers: request.headers,
                body: request.body,
            })

            return next(newRequest)
        },
    }
}
