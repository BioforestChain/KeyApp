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

/** 单个依赖配置 */
export interface DepConfig<TParams extends FetchParams = FetchParams> {
  /** 依赖的 KeyFetch 实例 */
  source: KeyFetchInstance
  /** 从当前 context 生成依赖的 params，默认返回空对象 {} */
  params?: (ctx: SubscribeContext<TParams>) => FetchParams
}

/** 依赖输入：可以是 KeyFetchInstance 或 DepConfig */
export type DepInput<TParams extends FetchParams = FetchParams> = KeyFetchInstance | DepConfig<TParams>

/** 规范化依赖输入为 DepConfig */
function normalizeDepInput<TParams extends FetchParams>(input: DepInput<TParams>): DepConfig<TParams> {
  if ('source' in input && typeof input.source === 'object') {
    return input as DepConfig<TParams>
  }
  return { source: input as KeyFetchInstance }
}

/**
 * 依赖插件
 * 
 * 当订阅使用此插件的 fetcher 时，会自动订阅所有依赖的 fetcher，
 * 确保依赖的 interval 轮询等功能正常工作。
 * 
 * @example
 * ```ts
 * // 简单用法：依赖使用空 params
 * const balanceFetch = keyFetch.create({
 *   name: 'biowallet.balance',
 *   use: [deps(blockApi)], 
 * })
 * 
 * // 高级用法：每个依赖独立配置 params
 * const tokenBalances = keyFetch.create({
 *   name: 'tokenBalances',
 *   use: [
 *     deps([
 *       { source: nativeBalanceApi, params: ctx => ctx.params },
 *       { source: priceApi, params: ctx => ({ symbol: ctx.params.symbol }) },
 *       blockApi,  // 混合使用，等价于 { source: blockApi }
 *     ])
 *   ],
 * })
 * ```
 */
export function deps<TParams extends FetchParams = FetchParams>(
  ...args: DepInput<TParams>[] | [DepInput<TParams>[]]
): FetchPlugin<TParams> {
  // 支持 deps(a, b, c) 和 deps([a, b, c]) 两种调用方式
  const inputs: DepInput<TParams>[] = args.length === 1 && Array.isArray(args[0])
    ? args[0]
    : args as DepInput<TParams>[]
  
  // 规范化为 DepConfig[]
  const depConfigs = inputs.map(normalizeDepInput)

  // 用于生成唯一 key
  const getSubscriptionKey = (ctx: SubscribeContext): string => {
    return `${ctx.name}::${JSON.stringify(ctx.params)}`
  }

  return {
    name: 'deps',

    // onFetch: 注册依赖关系（用于 registry 追踪）
    async onFetch(request, next, context) {
      // 注册依赖关系到 registry
      for (const dep of depConfigs) {
        globalRegistry.addDependency(context.name, dep.source.name)
      }
      return next(request)
    },

    // onSubscribe: 自动订阅依赖并监听更新
    onSubscribe(ctx: SubscribeContext<TParams>) {
      const key = getSubscriptionKey(ctx)
      const count = (subscriberCounts.get(key) ?? 0) + 1
      subscriberCounts.set(key, count)

      // 只有第一个订阅者时才初始化依赖订阅
      if (count === 1) {
        const cleanups: (() => void)[] = []

        for (const dep of depConfigs) {
          // 使用配置的 params 函数生成依赖参数，默认空对象
          const depParams = dep.params ? dep.params(ctx) : {}
          const unsubDep = dep.source.subscribe(depParams, (_data, event) => {
            // 依赖数据更新时，触发当前 fetcher 重新获取
            if (event === 'update') {
              ctx.refetch()
            }
          })
          cleanups.push(unsubDep)

          // 同时监听 registry 的更新事件（确保广播机制正常）
          const unsubRegistry = globalRegistry.onUpdate(dep.source.name, () => {
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
