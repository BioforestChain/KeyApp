/**
 * Staking Service 接口定义
 */

import { z } from 'zod'
import { defineServiceMeta } from '@/lib/service-meta'
import { Amount } from '@/types/amount'
import type {
  RechargeConfig,
  StakingTransaction,
  StakingOverviewItem,
  MintRequest,
  BurnRequest,
  LogoUrlMap,
} from '@/types/staking'

// ==================== Zod Schemas ====================

// Custom Amount schema for Zod validation
const AmountSchema = z.custom<Amount>((val) => val instanceof Amount)

const RechargeConfigSchema = z.record(z.string(), z.record(z.string(), z.object({
  assetType: z.string(),
  logo: z.string().optional(),
  supportChain: z.record(z.string(), z.object({
    assetType: z.string(),
    contract: z.string().optional(),
    decimals: z.number(),
  }).optional()),
})))

const LogoUrlMapSchema = z.record(z.string(), z.record(z.string(), z.string()))

const StakingOverviewItemSchema = z.object({
  chain: z.enum(['BFMeta', 'BFChain', 'CCChain', 'PMChain']),
  assetType: z.string(),
  stakedAmount: AmountSchema,
  stakedFiat: z.string(),
  availableChains: z.array(z.enum(['ETH', 'BSC', 'TRON'])),
  logoUrl: z.string().optional(),
  totalMinted: AmountSchema,
  totalCirculation: AmountSchema,
  totalBurned: AmountSchema,
  totalStaked: AmountSchema,
  externalChain: z.enum(['ETH', 'BSC', 'TRON']),
  externalAssetType: z.string(),
})

const StakingTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['mint', 'burn']),
  sourceChain: z.string(),
  sourceAsset: z.string(),
  sourceAmount: AmountSchema,
  targetChain: z.string(),
  targetAsset: z.string(),
  targetAmount: AmountSchema,
  status: z.enum(['pending', 'confirming', 'confirmed', 'failed']),
  txHash: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  errorMessage: z.string().optional(),
})

const MintRequestSchema = z.object({
  sourceChain: z.enum(['ETH', 'BSC', 'TRON']),
  sourceAsset: z.string(),
  amount: AmountSchema,
  targetChain: z.enum(['BFMeta', 'BFChain', 'CCChain', 'PMChain']),
  targetAsset: z.string(),
})

const BurnRequestSchema = z.object({
  sourceChain: z.enum(['BFMeta', 'BFChain', 'CCChain', 'PMChain']),
  sourceAsset: z.string(),
  amount: AmountSchema,
  targetChain: z.enum(['ETH', 'BSC', 'TRON']),
  targetAsset: z.string(),
})

// ==================== Service Meta ====================

export const stakingServiceMeta = defineServiceMeta('staking', (s) =>
  s.description('质押服务')
    .api('getRechargeConfig', z.void(), RechargeConfigSchema)
    .api('getLogoUrls', z.void(), LogoUrlMapSchema)
    .api('getOverview', z.void(), z.array(StakingOverviewItemSchema))
    .api('getTransactions', z.void(), z.array(StakingTransactionSchema))
    .api('getTransaction', z.object({ id: z.string() }), StakingTransactionSchema.nullable())
    .api('submitMint', MintRequestSchema, StakingTransactionSchema)
    .api('submitBurn', BurnRequestSchema, StakingTransactionSchema),
)

export type IStakingService = typeof stakingServiceMeta.Type

/**
 * Mock 控制接口（仅在 mock 模式下可用）
 */
export interface IStakingMockController {
  /** 重置 mock 数据 */
  _resetData(): void

  /** 设置自定义 mock 数据 */
  _setOverview(data: StakingOverviewItem[]): void

  /** 模拟网络延迟 */
  _setDelay(ms: number): void

  /** 模拟错误 */
  _simulateError(error: Error | null): void
}

// 重新导出类型
export type {
  RechargeConfig,
  StakingTransaction,
  StakingOverviewItem,
  MintRequest,
  BurnRequest,
  LogoUrlMap,
}
