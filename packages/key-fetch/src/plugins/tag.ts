/**
 * Tag Plugin
 * 
 * 标签插件 - 用于批量失效
 */

import type { Plugin } from '../types'

const tagToInstances = new Map<string, Set<string>>()

/**
 * 标签插件
 */
export function tag(...tags: string[]): Plugin {
  let initialized = false

  return {
    name: 'tag',

    async onFetch(ctx, next) {
      if (!initialized) {
        initialized = true
        for (const t of tags) {
          let instances = tagToInstances.get(t)
          if (!instances) {
            instances = new Set()
            tagToInstances.set(t, instances)
          }
          instances.add(ctx.name)
        }
      }

      return next()
    },
  }
}

/** 获取标签下的实例名称 */
export function getInstancesByTag(tagName: string): string[] {
  const instances = tagToInstances.get(tagName)
  return instances ? [...instances] : []
}
