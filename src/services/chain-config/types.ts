/**
 * 链配置服务类型定义
 *
 * 以 Zod Schema 为单一事实来源（DRY），从 Schema 推导 TS 类型。
 */

import type { z } from 'zod'

import {
  ApiProviderEntrySchema,
  ApiProvidersSchema,
  ChainConfigListSchema,
  ChainConfigSchema,
  ChainConfigSourceSchema,
  ChainConfigSubscriptionSchema,
  ChainKindSchema,
  ChainConfigVersionSchema,
} from './schema'

export type ChainConfigVersion = z.infer<typeof ChainConfigVersionSchema>
export type ChainKind = z.infer<typeof ChainKindSchema>
export type ChainConfigSource = z.infer<typeof ChainConfigSourceSchema>

export type ChainConfig = z.infer<typeof ChainConfigSchema>
export type ChainConfigList = z.infer<typeof ChainConfigListSchema>
export type ChainConfigSubscription = z.infer<typeof ChainConfigSubscriptionSchema>

/** API provider entry (ordered) */
export type ApiProviderEntry = z.infer<typeof ApiProviderEntrySchema>
export type ApiProviders = z.infer<typeof ApiProvidersSchema>

/** provider 初始化需要的条目（当前与 ApiProviderEntry 结构一致） */
export type ParsedApiEntry = ApiProviderEntry
