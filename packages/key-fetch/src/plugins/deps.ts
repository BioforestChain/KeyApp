/**
 * Deps Plugin
 * 
 * 依赖插件 - 当依赖的 KeyFetch 实例数据变化时自动刷新
 * 
 * 核心逻辑：
 * 1. 当订阅当前 fetcher 时，自动订阅所有依赖的 fetcher
 * 2. 当依赖的 fetcher 数据更新时，触发当前 fetcher 的重新获取
 * 3. 取消订阅时，自动取消对依赖的订阅（如果没有其他订阅者）
 */

import type { FetchPlugin, KeyFetchInstance, SubscribeContext, FetchParams } from '../types'
import { globalRegistry } from '../registry'

// 存储依赖订阅的清理函数
const dependencyCleanups = new Map<string, (() => void)[]>()
// 跟踪每个 fetcher 的订阅者数量
const subscriberCounts = new Map<string, number>()

/**
 * 依赖插件
 * 
 * 当订阅使用此插件的 fetcher 时，会自动订阅所有依赖的 fetcher，
 * 确保依赖的 interval 轮询等功能正常工作。
 * 
 * @example
 * ```ts
 * const blockApi = keyFetch.create({
 *   name: 'biowallet.blockApi',
 *   schema: BlockSchema,
 *   use: [interval(15_000)],
 * })
 * 
 * const balanceFetch = keyFetch.create({
 *   name: 'biowallet.balance',
 *   schema: BalanceSchema,
 *   // 订阅 balance 时会自动订阅 blockApi
 *   // blockApi 更新时 balance 会自动刷新
 *   use: [deps(blockApi)], 
 * })
 * ```
 */
export function deps<TParams extends FetchParams = FetchParams>(...dependencies: KeyFetchInstance[]): FetchPlugin<TParams> {
  // 用于生成唯一 key
  const getSubscriptionKey = (ctx: SubscribeContext): string => {
    return `${ctx.name}::${JSON.stringify(ctx.params)}`
  }

  return {
    name: 'deps',

    // onFetch: 注册依赖关系（用于 registry 追踪）
    async onFetch(request, next, context) {
      // 注册依赖关系到 registry
      for (const dep of dependencies) {
        globalRegistry.addDependency(context.name, dep.name)
      }
      return next(request)
    },

    // onSubscribe: 自动订阅依赖并监听更新
    onSubscribe(ctx: SubscribeContext) {
      const key = getSubscriptionKey(ctx)
      const count = (subscriberCounts.get(key) ?? 0) + 1
      subscriberCounts.set(key, count)

      // 只有第一个订阅者时才初始化依赖订阅
      if (count === 1) {
        const cleanups: (() => void)[] = []

        for (const dep of dependencies) {
          // 订阅依赖的 fetcher（使用空 params，因为依赖通常是全局的如 blockApi）
          // 当依赖数据更新时，触发当前 fetcher 的 refetch
          const unsubDep = dep.subscribe({}, (_data, event) => {
            // 依赖数据更新时，触发当前 fetcher 重新获取
            if (event === 'update') {
              ctx.refetch()
            }
          })
          cleanups.push(unsubDep)

          // 同时监听 registry 的更新事件（确保广播机制正常）
          const unsubRegistry = globalRegistry.onUpdate(dep.name, () => {
            globalRegistry.emitUpdate(ctx.name)
          })
          cleanups.push(unsubRegistry)
        }

        dependencyCleanups.set(key, cleanups)
      }

      // 返回清理函数
      return () => {
        const newCount = (subscriberCounts.get(key) ?? 1) - 1
        subscriberCounts.set(key, newCount)

        // 最后一个订阅者取消时，清理依赖订阅
        if (newCount === 0) {
          const cleanups = dependencyCleanups.get(key)
          if (cleanups) {
            cleanups.forEach(fn => fn())
            dependencyCleanups.delete(key)
          }
          subscriberCounts.delete(key)
        }
      }
    },
  }
}
