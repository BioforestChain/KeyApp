/**
 * useHttp Plugin
 * 
 * HTTP 请求插件 - 统一处理 URL、method、headers、body
 * 替代旧版的 pathParams() + searchParams() + postBody()
 */

import type { Context, Plugin } from '../types'

type ContextAny = Context<unknown, unknown>

export interface UseHttpOptions<TInput> {
  /** HTTP 方法 */
  method?: 'GET' | 'POST' | ((ctx: Context<TInput, unknown>) => 'GET' | 'POST')
  /** 请求头 */
  headers?: HeadersInit | ((ctx: Context<TInput, unknown>) => HeadersInit)
  /** 请求体（POST 时使用） */
  body?: unknown | ((ctx: Context<TInput, unknown>) => unknown)
}

/**
 * 替换 URL 中的 :param 占位符
 */
function replacePathParams(url: string, input: unknown): string {
  if (typeof input !== 'object' || input === null) {
    return url
  }
  
  let result = url
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      result = result.replace(`:${key}`, encodeURIComponent(String(value)))
    }
  }
  return result
}

/**
 * 将 input 添加为 query params（GET 请求）
 */
function appendSearchParams(url: string, input: unknown): string {
  if (typeof input !== 'object' || input === null) {
    return url
  }

  const urlObj = new URL(url)
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined && !url.includes(`:${key}`)) {
      urlObj.searchParams.set(key, String(value))
    }
  }
  return urlObj.toString()
}

/**
 * useHttp - HTTP 请求插件
 * 
 * @example
 * ```ts
 * // 简单 GET 请求
 * keyFetch.create({
 *   name: 'user',
 *   outputSchema: UserSchema,
 *   use: [useHttp('https://api.example.com/users/:id')],
 * })
 * 
 * // POST 请求带自定义 body
 * keyFetch.create({
 *   name: 'createUser',
 *   outputSchema: UserSchema,
 *   use: [useHttp('https://api.example.com/users', {
 *     method: 'POST',
 *     body: (ctx) => ({ name: ctx.input.name, email: ctx.input.email }),
 *   })],
 * })
 * 
 * // 动态 URL
 * keyFetch.create({
 *   name: 'chainData',
 *   outputSchema: DataSchema,
 *   use: [useHttp((ctx) => `https://${ctx.input.chain}.api.com/data`)],
 * })
 * ```
 */
export function useHttp<TInput = unknown>(
  url: string | ((ctx: Context<TInput, unknown>) => string),
  options?: UseHttpOptions<TInput>
): Plugin<TInput, unknown> {
  return {
    name: 'http',

    async onFetch(ctx: ContextAny, next) {
      const typedCtx = ctx as Context<TInput, unknown>

      // 解析 URL
      let finalUrl = typeof url === 'function' ? url(typedCtx) : url
      
      // 替换 :param 占位符
      finalUrl = replacePathParams(finalUrl, ctx.input)

      // 解析 method
      const method = options?.method
        ? (typeof options.method === 'function' ? options.method(typedCtx) : options.method)
        : 'GET'

      // 解析 headers
      const headers = options?.headers
        ? (typeof options.headers === 'function' ? options.headers(typedCtx) : options.headers)
        : {}

      // 构建请求配置
      const requestInit: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      }

      // 处理 body
      if (method === 'POST') {
        if (options?.body !== undefined) {
          const bodyData = typeof options.body === 'function' 
            ? (options.body as (ctx: Context<TInput, unknown>) => unknown)(typedCtx)
            : options.body
          requestInit.body = JSON.stringify(bodyData)
        } else if (ctx.input !== undefined) {
          // 默认使用 input 作为 body
          requestInit.body = JSON.stringify(ctx.input)
        }
      } else {
        // GET 请求：将未使用的 input 字段添加为 query params
        finalUrl = appendSearchParams(finalUrl, ctx.input)
      }

      // 更新 ctx.req
      ctx.req = new Request(finalUrl, requestInit)

      // 执行请求
      return fetch(ctx.req)
    },
  }
}
