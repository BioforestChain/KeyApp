/**
 * Deps Plugin
 * 
 * 依赖插件 - 当依赖的 KeyFetch 实例数据变化时自动刷新
 */

import type { CachePlugin, AnyZodSchema, PluginContext, KeyFetchInstance } from '../types'

/**
 * 依赖插件
 * 
 * @example
 * ```ts
 * const lastBlockFetch = keyFetch.create({
 *   name: 'bfmeta.lastblock',
 *   schema: LastBlockSchema,
 *   use: [interval(15_000)],
 * })
 * 
 * const balanceFetch = keyFetch.create({
 *   name: 'bfmeta.balance',
 *   schema: BalanceSchema,
 *   use: [deps(lastBlockFetch)], // 当 lastblock 更新时自动刷新
 * })
 * ```
 */
export function deps(...dependencies: KeyFetchInstance<AnyZodSchema>[]): CachePlugin<AnyZodSchema> {
  return {
    name: 'deps',

    setup(ctx: PluginContext<AnyZodSchema>) {
      // 注册依赖关系
      for (const dep of dependencies) {
        ctx.registry.addDependency(ctx.kf.name, dep.name)
      }

      // 监听依赖更新
      const unsubscribes = dependencies.map(dep =>
        ctx.registry.onUpdate(dep.name, () => {
          // 依赖更新时，失效当前实例的缓存
          ctx.kf.invalidate()
          // 通知所有订阅者
          ctx.notifySubscribers(undefined as never)
        })
      )

      return () => {
        unsubscribes.forEach(fn => fn())
      }
    },
  }
}
