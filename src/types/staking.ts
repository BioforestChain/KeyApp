/**
 * Staking types and schemas
 * Based on mpay staking module (CotPaymentService, RechargeSupport)
 */

import { z } from 'zod'
import { Amount } from './amount'

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
export interface StakingTransaction {
  /** Unique transaction ID */
  id: string
  /** Transaction type (mint/burn) */
  type: StakingTxType
  /** Source chain */
  sourceChain: string
  /** Source asset type */
  sourceAsset: string
  /** Source amount */
  sourceAmount: Amount
  /** Target chain */
  targetChain: string
  /** Target asset type */
  targetAsset: string
  /** Target amount */
  targetAmount: Amount
  /** Transaction status */
  status: StakingTxStatus
  /** Transaction hash (on-chain) */
  txHash?: string | undefined
  /** Creation timestamp */
  createdAt: number
  /** Last update timestamp */
  updatedAt: number
  /** Error message if failed */
  errorMessage?: string | undefined
}

/** Mint (stake) request */
export interface MintRequest {
  /** Source external chain */
  sourceChain: ExternalChain
  /** Source asset type */
  sourceAsset: string
  /** Amount to mint */
  amount: Amount
  /** Target internal chain */
  targetChain: InternalChain
  /** Target asset type */
  targetAsset: string
}

/** Burn (unstake) request */
export interface BurnRequest {
  /** Source internal chain */
  sourceChain: InternalChain
  /** Source asset type */
  sourceAsset: string
  /** Amount to burn */
  amount: Amount
  /** Target external chain */
  targetChain: ExternalChain
  /** Target asset type */
  targetAsset: string
}

/** Staking overview item */
export interface StakingOverviewItem {
  /** Internal chain name */
  chain: InternalChain
  /** Asset type */
  assetType: string
  /** Staked amount */
  stakedAmount: Amount
  /** Staked amount in fiat (formatted string for display) */
  stakedFiat: string
  /** Available external chains for unstaking */
  availableChains: ExternalChain[]
  /** Logo URL */
  logoUrl?: string | undefined
  /** Total amount minted (pool stat) */
  totalMinted: Amount
  /** Total amount in circulation (pool stat) */
  totalCirculation: Amount
  /** Total amount burned/redeemed (pool stat) */
  totalBurned: Amount
  /** Total amount staked on external chain (pool stat) */
  totalStaked: Amount
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
