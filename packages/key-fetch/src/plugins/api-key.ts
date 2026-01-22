/**
 * API Key Plugin
 * 
 * 通用 API Key 插件，支持自定义请求头和前缀
 */

import type { FetchPlugin } from '../types'

export interface ApiKeyOptions {
  /** 请求头名称，如 'TRON-PRO-API-KEY', 'Authorization', 'X-API-Key' */
  header: string
  /** API Key 值，如果为空则不添加头 */
  key: string | undefined
  /** 可选前缀，如 'Bearer ' */
  prefix?: string
}

/**
 * API Key 插件
 * 
 * @example
 * ```ts
 * import { apiKey } from '@biochain/key-fetch'
 * 
 * // TronGrid
 * keyFetch.create({
 *   use: [apiKey({ header: 'TRON-PRO-API-KEY', key: 'xxx' })],
 * })
 * 
 * // Bearer Token
 * keyFetch.create({
 *   use: [apiKey({ header: 'Authorization', key: 'token', prefix: 'Bearer ' })],
 * })
 * ```
 */
export function apiKey(options: ApiKeyOptions): FetchPlugin {
  const { header, key, prefix = '' } = options

  return {
    name: 'api-key',

    onFetch: async (request, next) => {
      if (key) {
        const headers = new Headers(request.headers)
        headers.set(header, `${prefix}${key}`)
        return next(new Request(request, { headers }))
      }
      return next(request)
    },
  }
}
