/**
 * Deps Plugin
 * 
 * 依赖插件 - 当依赖的 KeyFetch 实例数据变化时自动刷新
 * 
 * 中间件模式：使用 registry 监听依赖更新
 */

import type { FetchPlugin, KeyFetchInstance, AnyZodSchema } from '../types'
import { globalRegistry } from '../registry'

// 存储依赖关系和清理函数
const dependencyCleanups = new Map<string, (() => void)[]>()

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
export function deps(...dependencies: KeyFetchInstance<AnyZodSchema>[]): FetchPlugin {
  let initialized = false
  let instanceName = ''

  return {
    name: 'deps',

    async onFetch(request, next, context) {
      // 首次请求时初始化依赖监听
      if (!initialized) {
        initialized = true
        instanceName = context.name

        // 注册依赖关系
        for (const dep of dependencies) {
          globalRegistry.addDependency(context.name, dep.name)
        }

        // 监听依赖更新
        const unsubscribes = dependencies.map(dep =>
          globalRegistry.onUpdate(dep.name, () => {
            // 依赖更新时，通过 registry 通知
            globalRegistry.emitUpdate(context.name)
          })
        )

        dependencyCleanups.set(context.name, unsubscribes)
      }

      return next(request)
    },
  }
}
