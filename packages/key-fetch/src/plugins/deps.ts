/**
 * Deps Plugin
 * 
 * 依赖插件 - 当依赖的规则数据变化时自动失效
 */

import type { CachePlugin, PluginContext } from '../types'

/**
 * 依赖插件
 * 
 * @example
 * ```ts
 * keyFetch.define({
 *   name: 'bfmetav2.txHistory',
 *   pattern: /\/wallet\/bfmetav2\/transactions/,
 *   use: [deps('bfmetav2.lastblock')],
 * })
 * ```
 */
export function deps(...ruleNames: string[]): CachePlugin {
  return {
    name: 'deps',

    setup(ctx: PluginContext) {
      // 订阅依赖规则的变化
      const unsubscribes = ruleNames.map(ruleName =>
        ctx.registry.onRuleUpdate(ruleName, () => {
          // 依赖更新时，失效当前规则的所有缓存
          for (const key of ctx.cache.keys()) {
            if (ctx.pattern.test(key)) {
              ctx.cache.delete(key)
            }
          }
          // 通知订阅者刷新
          ctx.notifySubscribers()
        })
      )

      return () => {
        unsubscribes.forEach(fn => fn())
      }
    },
  }
}
