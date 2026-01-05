/**
 * 链配置 Zod Schema
 *
 * 设计原则：分离链属性与提供商配置
 * - 链属性：id, chainKind, name, symbol, prefix, decimals（链的固有属性）
 * - 提供商配置：api, explorer（外部依赖，可替换）
 *
 * 说明：
 * - `version` 使用 `major.minor`（例如 "1.0"）
 * - `chainKind` 用于选择对应的链派生策略与服务实现（bioforest/evm/bitcoin/tron/custom）
 * - `source/enabled` 为运行时字段：用于 UI 展示与用户启用状态
 */

import { z } from 'zod'

export const ChainConfigVersionSchema = z
  .string()
  .regex(/^\d+\.\d+$/, 'version must be "major.minor" (e.g. "1.0")')

export const ChainKindSchema = z.enum(['bioforest', 'evm', 'bitcoin', 'tron'])

export const ChainConfigSourceSchema = z.enum(['default', 'subscription', 'manual'])

/**
 * API 提供商配置
 *
 * 格式: Record<providerType, url | [url, config]>
 * - providerType: "{provider}-{version}" (e.g., "ethereum-rpc", "etherscan-v2", "biowallet-v1")
 * - url: 简单 URL 字符串
 * - [url, config]: URL + 额外配置对象
 *
 * 示例:
 * {
 *   "ethereum-rpc": "https://ethereum-rpc.publicnode.com",
 *   "etherscan-v2": ["https://api.etherscan.io/v2/api", { "apiKey": "xxx" }],
 *   "biowallet-v1": ["https://walletapi.bfmeta.info", { "path": "bfm" }]
 * }
 */
export const ApiEntrySchema = z.union([
  z.string().url(),
  z.tuple([z.string().url(), z.record(z.string(), z.unknown())]),
])

export const ApiConfigSchema = z.record(z.string(), ApiEntrySchema)

/** 区块浏览器配置（可替换的外部依赖） */
export const ExplorerConfigSchema = z.object({
  /** 浏览器 URL (e.g., https://explorer.bfmeta.io) */
  url: z.string().url(),
  /** 交易查询 URL 模板 (e.g., https://tracker.bfmeta.org/#/info/event-details/:signature) */
  queryTx: z.string().optional(),
  /** 地址查询 URL 模板 (e.g., https://tracker.bfmeta.org/#/info/address-details/:address) */
  queryAddress: z.string().optional(),
  /** 区块查询 URL 模板 (e.g., https://tracker.bfmeta.org/#/info/block-details/:height) */
  queryBlock: z.string().optional(),
})

export const ChainConfigSchema = z
  .object({
    // ===== 链固有属性 =====
    id: z.string().regex(/^[a-z0-9-]+$/, 'id must match /^[a-z0-9-]+$/'),
    version: ChainConfigVersionSchema,
    chainKind: ChainKindSchema,

    name: z.string().min(1).max(50),
    symbol: z.string().min(1).max(10),
    /** 链图标 URL */
    icon: z.string().min(1).optional(),
    /** Token 图标基础路径数组，支持多层 fallback [本地, CDN, GitHub] */
    tokenIconBase: z.array(z.string().min(1)).optional(),

    prefix: z.string().min(1).max(10).optional(), // BioForest 特有
    decimals: z.number().int().min(0).max(18),

    // ===== 提供商配置（外部依赖） =====
    api: ApiConfigSchema.optional(),
    explorer: ExplorerConfigSchema.optional(),

    // ===== 运行时字段 =====
    enabled: z.boolean().default(true),
    source: ChainConfigSourceSchema.default('default'),
  })
  .strict()

export const ChainConfigListSchema = z.array(ChainConfigSchema).min(1)

/** 带版本号的配置文件格式 */
export const VersionedChainConfigFileSchema = z.object({
  /** 配置文件版本号 (semver, e.g., "2.0.0") */
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'version must be semver (e.g. "2.0.0")'),
  /** 链配置列表 */
  chains: ChainConfigListSchema,
})

export const ChainConfigSubscriptionSchema = z
  .object({
    url: z.string().min(1),
    refreshIntervalMinutes: z.number().int().min(1).default(1440),
    lastUpdated: z.string().optional(),
    etag: z.string().optional(),
  })
  .strict()

