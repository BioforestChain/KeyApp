/**
 * API Key Plugin
 * 
 * 通用 API Key 插件
 */

import type { Plugin } from '../types'

export interface ApiKeyOptions {
  /** 请求头名称 */
  header: string
  /** API Key 值 */
  key: string | undefined
  /** 可选前缀 */
  prefix?: string
}

/**
 * API Key 插件
 */
export function apiKey(options: ApiKeyOptions): Plugin {
  const { header, key, prefix = '' } = options

  return {
    name: 'api-key',

    async onFetch(ctx, next) {
      if (key) {
        const headers = new Headers(ctx.req.headers)
        headers.set(header, `${prefix}${key}`)
        ctx.req = new Request(ctx.req, { headers })
      }
      return next()
    },
  }
}
