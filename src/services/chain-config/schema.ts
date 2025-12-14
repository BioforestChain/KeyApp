/**
 * 链配置 Zod Schema
 *
 * 说明：
 * - `version` 使用 `major.minor`（例如 "1.0"）
 * - `type` 用于选择对应的链服务实现（bioforest/evm/bip39/custom）
 * - `source/enabled` 为运行时字段：用于 UI 展示与用户启用状态
 */

import { z } from 'zod'

export const ChainConfigVersionSchema = z
  .string()
  .regex(/^\d+\.\d+$/, 'version must be "major.minor" (e.g. "1.0")')

export const ChainConfigTypeSchema = z.enum(['bioforest', 'evm', 'bip39', 'custom'])

export const ChainConfigSourceSchema = z.enum(['default', 'subscription', 'manual'])

export const ChainConfigSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'id must match /^[a-z0-9-]+$/'),
    version: ChainConfigVersionSchema,
    type: ChainConfigTypeSchema,

    name: z.string().min(1).max(50),
    symbol: z.string().min(1).max(10),
    icon: z.string().min(1).optional(),

    prefix: z.string().min(1).max(10).optional(),
    decimals: z.number().int().min(0).max(18),
    rpcUrl: z.string().url().optional(),
    explorerUrl: z.string().url().optional(),

    enabled: z.boolean().default(true),
    source: ChainConfigSourceSchema.default('default'),
  })
  .strict()

export const ChainConfigListSchema = z.array(ChainConfigSchema).min(1)

export const ChainConfigSubscriptionSchema = z
  .object({
    url: z.string().min(1),
    refreshIntervalMinutes: z.number().int().min(1).default(1440),
    lastUpdated: z.string().optional(),
    etag: z.string().optional(),
  })
  .strict()

