/**
 * Dedupe Plugin
 * 
 * 请求去重插件（已内置到 core，这里仅作为显式声明）
 */

import type { CachePlugin, AnyZodSchema } from '../types'

/**
 * 请求去重插件
 * 
 * 注意：去重已内置到 core 实现中，此插件仅作为显式声明使用
 */
export function dedupe(): CachePlugin<AnyZodSchema> {
  return {
    name: 'dedupe',
    // 去重逻辑已在 core 中实现
  }
}
