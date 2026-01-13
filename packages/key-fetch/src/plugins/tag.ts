/**
 * Tag Plugin
 * 
 * 标签插件 - 用于批量失效
 */

import type { CachePlugin, AnyZodSchema } from '../types'

// 全局标签映射
const tagToInstances = new Map<string, Set<string>>()

/**
 * 标签插件
 * 
 * @example
 * ```ts
 * const balanceFetch = keyFetch.create({
 *   name: 'bfmeta.balance',
 *   schema: BalanceSchema,
 *   use: [tag('wallet-data')],
 * })
 * 
 * // 批量失效
 * keyFetch.invalidateByTag('wallet-data')
 * ```
 */
export function tag(...tags: string[]): CachePlugin<AnyZodSchema> {
  return {
    name: 'tag',

    setup(ctx) {
      for (const t of tags) {
        let instances = tagToInstances.get(t)
        if (!instances) {
          instances = new Set()
          tagToInstances.set(t, instances)
        }
        instances.add(ctx.kf.name)
      }

      return () => {
        for (const t of tags) {
          const instances = tagToInstances.get(t)
          instances?.delete(ctx.kf.name)
        }
      }
    },
  }
}

/**
 * 按标签失效所有相关实例
 */
export function invalidateByTag(tagName: string): void {
  const instances = tagToInstances.get(tagName)
  if (instances) {
    // 需要通过 registry 失效
    // 这里仅提供辅助函数，实际失效需要在外部调用
    console.log(`[key-fetch:tag] Invalidating tag "${tagName}":`, [...instances])
  }
}

/** 获取标签下的实例名称 */
export function getInstancesByTag(tagName: string): string[] {
  const instances = tagToInstances.get(tagName)
  return instances ? [...instances] : []
}
