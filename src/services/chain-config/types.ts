/**
 * 链配置服务类型定义
 *
 * 以 Zod Schema 为单一事实来源（DRY），从 Schema 推导 TS 类型。
 */

import type { z } from 'zod'

import {
  ApiConfigSchema,
  ApiEntrySchema,
  ChainConfigListSchema,
  ChainConfigSchema,
  ChainConfigSourceSchema,
  ChainConfigSubscriptionSchema,
  ChainConfigTypeSchema,
  ChainConfigVersionSchema,
} from './schema'

export type ChainConfigVersion = z.infer<typeof ChainConfigVersionSchema>
export type ChainConfigType = z.infer<typeof ChainConfigTypeSchema>
export type ChainConfigSource = z.infer<typeof ChainConfigSourceSchema>

export type ChainConfig = z.infer<typeof ChainConfigSchema>
export type ChainConfigList = z.infer<typeof ChainConfigListSchema>
export type ChainConfigSubscription = z.infer<typeof ChainConfigSubscriptionSchema>

/** API 配置项 (url | [url, config]) */
export type ApiEntry = z.infer<typeof ApiEntrySchema>
/** API 配置对象 Record<providerType, ApiEntry> */
export type ApiConfig = z.infer<typeof ApiConfigSchema>

/** 解析后的 API 条目，用于 Provider 初始化 */
export interface ParsedApiEntry {
  type: string
  endpoint: string
  config?: Record<string, unknown>
}
