/**
 * Chain Effect Schema Definitions
 * 
 * 使用 Effect Schema 替代 Zod，与 Effect 生态深度集成
 */

import { Schema } from "effect"

// ==================== 基础类型 ====================

/** 金额 Schema（字符串形式，避免精度丢失）*/
export class AmountValue extends Schema.Class<AmountValue>("AmountValue")({
  raw: Schema.String,
  decimals: Schema.Number,
  symbol: Schema.String,
  formatted: Schema.optional(Schema.String),
}) {}

// ==================== 参数 Schema ====================

/** 地址查询参数 */
export class AddressParams extends Schema.Class<AddressParams>("AddressParams")({
  address: Schema.String,
}) {}

/** 交易历史查询参数 */
export class TxHistoryParams extends Schema.Class<TxHistoryParams>("TxHistoryParams")({
  address: Schema.String,
  limit: Schema.optionalWith(Schema.Number, { default: () => 20 }),
  page: Schema.optional(Schema.Number),
}) {}

/** 单笔交易查询参数 */
export class TransactionParams extends Schema.Class<TransactionParams>("TransactionParams")({
  txHash: Schema.String,
}) {}

// ==================== 输出 Schema ====================

/** 余额输出 */
export class BalanceOutput extends Schema.Class<BalanceOutput>("BalanceOutput")({
  amount: AmountValue,
  symbol: Schema.String,
}) {}

/** 代币元数据 */
export class TokenMetadata extends Schema.Class<TokenMetadata>("TokenMetadata")({
  possibleSpam: Schema.optional(Schema.Boolean),
  securityScore: Schema.optional(Schema.NullOr(Schema.Number)),
  verified: Schema.optional(Schema.Boolean),
  totalSupply: Schema.optional(Schema.String),
}) {}

/** 代币余额 */
export class TokenBalance extends Schema.Class<TokenBalance>("TokenBalance")({
  symbol: Schema.String,
  name: Schema.String,
  amount: AmountValue,
  isNative: Schema.Boolean,
  decimals: Schema.Number,
  icon: Schema.optional(Schema.String),
  contractAddress: Schema.optional(Schema.String),
  metadata: Schema.optional(TokenMetadata),
}) {}

/** 代币余额列表 */
export const TokenBalancesOutput = Schema.Array(TokenBalance)
export type TokenBalancesOutput = Schema.Schema.Type<typeof TokenBalancesOutput>

/** 资产类型 */
export const AssetType = Schema.Literal("native", "token", "nft")
export type AssetType = Schema.Schema.Type<typeof AssetType>

/** 交易方向 */
export const Direction = Schema.Literal("in", "out", "self")
export type Direction = Schema.Schema.Type<typeof Direction>

/** 交易动作 */
export const Action = Schema.Literal(
  "transfer",
  "approve",
  "swap",
  "stake",
  "unstake",
  "claim",
  "bridge",
  "contract",
  "mint",
  "burn",
  "gift",
  "grab",
  "trust",
  "signFor",
  "emigrate",
  "immigrate",
  "issueAsset",
  "increaseAsset",
  "destroyAsset",
  "issueEntity",
  "destroyEntity",
  "locationName",
  "dapp",
  "certificate",
  "mark",
  "signature",
  "unknown"
)
export type Action = Schema.Schema.Type<typeof Action>

/** 交易状态 */
export const TxStatus = Schema.Literal("pending", "confirming", "confirmed", "failed")
export type TxStatus = Schema.Schema.Type<typeof TxStatus>

/** 资产信息 */
export class Asset extends Schema.Class<Asset>("Asset")({
  assetType: AssetType,
  value: Schema.String,
  symbol: Schema.String,
  decimals: Schema.Number,
  contractAddress: Schema.optional(Schema.String),
  name: Schema.optional(Schema.String),
  logoUrl: Schema.optional(Schema.String),
  tokenId: Schema.optional(Schema.String),
}) {}

/** 手续费信息 */
export class FeeInfo extends Schema.Class<FeeInfo>("FeeInfo")({
  value: Schema.String,
  symbol: Schema.String,
  decimals: Schema.Number,
}) {}

/** 交易记录 */
export class Transaction extends Schema.Class<Transaction>("Transaction")({
  hash: Schema.String,
  from: Schema.String,
  to: Schema.String,
  timestamp: Schema.Number,
  status: TxStatus,
  blockNumber: Schema.optional(Schema.BigIntFromSelf),
  action: Action,
  direction: Direction,
  assets: Schema.Array(Asset),
  fee: Schema.optional(FeeInfo),
  nonce: Schema.optional(Schema.Number),
  fromEntity: Schema.optional(Schema.String),
  toEntity: Schema.optional(Schema.String),
  summary: Schema.optional(Schema.String),
}) {}

/** 交易列表 */
export const TransactionsOutput = Schema.Array(Transaction)
export type TransactionsOutput = Schema.Schema.Type<typeof TransactionsOutput>

/** 交易详情（可为 null）*/
export const TransactionOutput = Schema.NullOr(Transaction)
export type TransactionOutput = Schema.Schema.Type<typeof TransactionOutput>

/** 交易状态输出 */
export class TransactionStatusOutput extends Schema.Class<TransactionStatusOutput>("TransactionStatusOutput")({
  status: TxStatus,
  confirmations: Schema.Number,
  requiredConfirmations: Schema.Number,
}) {}

/** 区块高度 */
export const BlockHeightOutput = Schema.BigIntFromSelf
export type BlockHeightOutput = Schema.Schema.Type<typeof BlockHeightOutput>
