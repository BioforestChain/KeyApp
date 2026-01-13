/**
 * Tag Plugin
 * 
 * 标签管理 - 支持按标签批量失效
 */

import type { CachePlugin, PluginContext, InvalidateContext } from '../types'

/**
 * 标签插件
 * 
 * @example
 * ```ts
 * keyFetch.define({
 *   name: 'bfmetav2.balance',
 *   pattern: /\/wallet\/bfmetav2\/address\/asset/,
 *   use: [tag('bfmetav2', 'balance')],
 * })
 * 
 * // 失效所有 balance 标签的缓存
 * keyFetch.invalidateByTag('balance')
 * ```
 */
export function tag(...tags: string[]): CachePlugin {
  return {
    name: 'tag',

    setup(ctx: PluginContext) {
      tags.forEach(t => ctx.registry.addTag(t, ctx.name))
    },

    shouldInvalidate(ctx: InvalidateContext) {
      return tags.some(t => ctx.invalidatedTags.has(t))
    },
  }
}
