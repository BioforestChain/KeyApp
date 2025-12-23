/**
 * BioForest Chain API Types
 *
 * Type-safe definitions for all BioForest Chain wallet API responses.
 * Based on the actual API format: { success: boolean, result: T }
 */

/** Base API response wrapper */
export interface ApiResponse<T> {
  success: boolean
  result: T
}

/** Error response from API */
export interface ApiError {
  success: false
  error?: string
  message?: string
  code?: number
}

/** Block information */
export interface BlockInfo {
  height: number
  timestamp: number
  blockSize: number
  signature: string
  generatorPublicKey: string
  previousBlockSignature: string
  reward: string
  magic: string
  version: number
  remark: {
    info: string
    debug: string
  }
  asset: {
    commonAsset: {
      assetChangeHash: string
    }
  }
  transactionInfo: {
    startTindex: number
    offset: number
    numberOfTransactions: number
    payloadHash: string
    payloadLength: number
    blobSize: number
    totalAmount: string
    totalFee: string
    transactionInBlocks: unknown[]
    statisticInfo: {
      totalFee: string
      totalAsset: string
      totalChainAsset: string
      totalAccount: number
      magicAssetTypeTypeStatisticHashMap: Record<string, unknown>
      numberOfTransactionsHashMap: Record<string, number>
    }
  }
}

/** Account balance */
export interface BalanceInfo {
  amount: string
}

/** Address/Account information */
export interface AddressInfo {
  address: string
  publicKey: string
  secondPublicKey: string | null
  accountStatus: number
}

/** Transaction in block */
export interface TransactionInBlock {
  transaction: Transaction
  tIndex: number
  height: number
  assetPrealnum?: {
    remainAssetPrealnum: string
    frozenMainAssetPrealnum: string
  }
}

/** Transaction details */
export interface Transaction {
  version: number
  type: string
  senderId: string
  senderPublicKey: string
  fee: string
  timestamp: number
  applyBlockHeight: number
  effectiveBlockHeight: number
  signature: string
  signSignature?: string
  remark: Record<string, string>
  message?: string
  asset?: Record<string, unknown>
  rangeType?: number
  range?: string[]
  recipientId?: string
  parentAssetType?: string
  assetPrealnum?: {
    remainAssetPrealnum: string
    frozenMainAssetPrealnum: string
  }
  fromMagic?: string
  toMagic?: string
  fromChainName?: string
  toChainName?: string
  nonce?: number
  sourceChainMagic?: string
  sourceChainName?: string
  amount?: string
  assetType?: string
}

/** Transaction query result */
export interface TransactionQueryResult {
  trs: TransactionInBlock[]
  count?: number
  cmdLimitPerQuery?: number
  maxHeight?: number
}

/** Pending transaction */
export interface PendingTransaction {
  transaction: Transaction
}

/** Account assets */
export interface AccountAsset {
  address: string
  assetType: string
  sourceChainMagic: string
  sourceChainName: string
  assetNumber: string
  frozenAssetNumber?: string
  ppiAssetNumber?: string
}

/** Account assets result */
export interface AccountAssetsResult {
  assets: AccountAsset[]
  count: number
}

/** Broadcast result */
export interface BroadcastResult {
  success: boolean
  message?: string
  minFee?: string
  penalty?: unknown
}

/** Fee calculation input */
export interface FeeInput {
  transaction: {
    type: string
    senderId: string
    fee: string
    timestamp: number
    applyBlockHeight: number
    effectiveBlockHeight: number
    remark?: Record<string, string>
    asset?: Record<string, unknown>
    recipientId?: string
    amount?: string
    assetType?: string
    sourceChainMagic?: string
    sourceChainName?: string
  }
}

/** Fee calculation result */
export interface FeeResult {
  minFee: string
}

/** Genesis block info (subset) */
export interface GenesisInfo {
  magic: string
  chainName: string
  assetType: string
  genesisAmount: string
  maxSupply: string
  beginEpochTime: number
  blockPerRound: number
  forgeInterval: number
}

/** Chain status */
export interface ChainStatus {
  status: 'running' | 'stopped' | 'syncing'
  peers: number
  height: number
  lastBlockTimestamp: number
}

/** Query parameters for transactions */
export interface TransactionQueryParams {
  maxHeight: number
  address?: string
  senderId?: string
  recipientId?: string
  type?: string | string[]
  page?: number
  pageSize?: number
  sort?: -1 | 1
}

/** Query parameters for pending transactions */
export interface PendingQueryParams {
  senderId?: string
  sort?: -1 | 1
}

/** Query parameters for account assets */
export interface AccountAssetsParams {
  address: string
  page?: number
  pageSize?: number
}
