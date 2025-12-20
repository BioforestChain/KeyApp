/**
 * Staking types and schemas
 * Based on mpay staking module (CotPaymentService, RechargeSupport)
 */

import { z } from 'zod'

/** Supported external chains for staking */
export const ExternalChainSchema = z.enum(['ETH', 'BSC', 'TRON'])
export type ExternalChain = z.infer<typeof ExternalChainSchema>

/** Supported internal BioForest chains */
export const InternalChainSchema = z.enum(['BFMeta', 'BFChain', 'CCChain', 'PMChain'])
export type InternalChain = z.infer<typeof InternalChainSchema>

/** External asset info (token on ETH/BSC/TRON) */
export const ExternalAssetInfoSchema = z.object({
  /** Token symbol (e.g., USDT, ETH) */
  assetType: z.string(),
  /** Smart contract address (optional for native tokens) */
  contract: z.string().optional(),
  /** Token decimals */
  decimals: z.number().int().min(0).max(18),
  /** Token logo URL */
  logo: z.string().url().optional(),
})
export type ExternalAssetInfo = z.infer<typeof ExternalAssetInfoSchema>

/** Chain support configuration */
export const ChainSupportSchema = z.object({
  /** Binance Smart Chain support */
  BSC: ExternalAssetInfoSchema.optional(),
  /** Ethereum support */
  ETH: ExternalAssetInfoSchema.optional(),
  /** Tron support */
  TRON: ExternalAssetInfoSchema.optional(),
})
export type ChainSupport = z.infer<typeof ChainSupportSchema>

/** Recharge config item (staking pair) */
export const RechargeConfigItemSchema = z.object({
  /** Internal chain asset type */
  assetType: z.string(),
  /** Internal chain logo URL */
  logo: z.string().optional(),
  /** Supported external chains */
  supportChain: ChainSupportSchema,
})
export type RechargeConfigItem = z.infer<typeof RechargeConfigItemSchema>

/** Recharge config by internal chain */
export const RechargeConfigSchema = z.record(
  z.string(), // Internal chain name (e.g., "bfmeta")
  z.record(z.string(), RechargeConfigItemSchema) // assetType -> config
)
export type RechargeConfig = z.infer<typeof RechargeConfigSchema>

/** Staking transaction type */
export const StakingTxTypeSchema = z.enum(['mint', 'burn'])
export type StakingTxType = z.infer<typeof StakingTxTypeSchema>

/** Staking transaction status */
export const StakingTxStatusSchema = z.enum(['pending', 'confirming', 'confirmed', 'failed'])
export type StakingTxStatus = z.infer<typeof StakingTxStatusSchema>

/** Staking transaction record */
export const StakingTransactionSchema = z.object({
  /** Unique transaction ID */
  id: z.string(),
  /** Transaction type (mint/burn) */
  type: StakingTxTypeSchema,
  /** Source chain */
  sourceChain: z.string(),
  /** Source asset type */
  sourceAsset: z.string(),
  /** Source amount (raw, in smallest unit) */
  sourceAmount: z.string(),
  /** Target chain */
  targetChain: z.string(),
  /** Target asset type */
  targetAsset: z.string(),
  /** Target amount (raw, in smallest unit) */
  targetAmount: z.string(),
  /** Transaction status */
  status: StakingTxStatusSchema,
  /** Transaction hash (on-chain) */
  txHash: z.string().optional(),
  /** Creation timestamp */
  createdAt: z.number(),
  /** Last update timestamp */
  updatedAt: z.number(),
  /** Error message if failed */
  errorMessage: z.string().optional(),
})
export type StakingTransaction = z.infer<typeof StakingTransactionSchema>

/** Mint (stake) request */
export const MintRequestSchema = z.object({
  /** Source external chain */
  sourceChain: ExternalChainSchema,
  /** Source asset type */
  sourceAsset: z.string(),
  /** Amount to mint (raw, in smallest unit) */
  amount: z.string(),
  /** Target internal chain */
  targetChain: InternalChainSchema,
  /** Target asset type */
  targetAsset: z.string(),
})
export type MintRequest = z.infer<typeof MintRequestSchema>

/** Burn (unstake) request */
export const BurnRequestSchema = z.object({
  /** Source internal chain */
  sourceChain: InternalChainSchema,
  /** Source asset type */
  sourceAsset: z.string(),
  /** Amount to burn (raw, in smallest unit) */
  amount: z.string(),
  /** Target external chain */
  targetChain: ExternalChainSchema,
  /** Target asset type */
  targetAsset: z.string(),
})
export type BurnRequest = z.infer<typeof BurnRequestSchema>

/** Staking overview item */
export interface StakingOverviewItem {
  /** Internal chain name */
  chain: InternalChain
  /** Asset type */
  assetType: string
  /** Staked amount (formatted) */
  stakedAmount: string
  /** Staked amount in fiat */
  stakedFiat: string
  /** Available external chains for unstaking */
  availableChains: ExternalChain[]
  /** Logo URL */
  logoUrl?: string | undefined
  /** Total amount minted (pool stat) */
  totalMinted: string
  /** Total amount in circulation (pool stat) */
  totalCirculation: string
  /** Total amount burned/redeemed (pool stat) */
  totalBurned: string
  /** Total amount staked on external chain (pool stat) */
  totalStaked: string
  /** External chain name */
  externalChain: ExternalChain
  /** External asset type */
  externalAssetType: string
}

/** Staking state */
export interface StakingState {
  /** Recharge configuration */
  config: RechargeConfig | null
  /** Overview items */
  overview: StakingOverviewItem[]
  /** Transaction history */
  transactions: StakingTransaction[]
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
}

/** Logo URLs by chain and asset type */
export type LogoUrlMap = Record<string, Record<string, string>>
