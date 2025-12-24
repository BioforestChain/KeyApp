/**
 * BioForest chain API types
 */

export interface BlockInfo {
  height: number
  timestamp: number
  magic: string
  signature: string
  generatorPublicKey: string
  numberOfTransactions: number
  totalAmount: string
  totalFee: string
  reward: string
}

export interface AddressInfo {
  address: string
  secondPublicKey?: string
  accountStatus?: number
}

export interface AssetBalance {
  assetType: string
  assetNumber: string
  sourceChainMagic: string
  sourceChainName: string
  iconUrl?: string
}

export interface AddressAssets {
  address: string
  assets: {
    [magic: string]: {
      [assetType: string]: AssetBalance
    }
  }
}

export interface TransactionDetail {
  transaction: {
    signature: string
    senderId: string
    recipientId: string
    timestamp: number
    type: string
    amount?: string
    fee: string
    storageValue?: string
  }
  height: number
  dateCreated: string
}

export interface TransactionListResult {
  trs: TransactionDetail[]
  cmdLimitPerQuery: number
  count: number
}

export interface PendingTransaction {
  state: number
  trJson: {
    signature: string
    senderId: string
    recipientId: string
    timestamp: number
    fee: string
  }
  createdTime: string
}

export interface TokenInfo {
  assetType: string
  decimals: number
  logoUrl?: string
  iconUrl?: string
}

export interface TokenListResult {
  dataList: TokenInfo[]
  hasMore: boolean
  page: number
  pageSize: number
  total: number
}

export interface TokenDetailResult {
  assetType: string
  decimals: number
  logoUrl?: string
  iconUrl?: string
}

export interface BroadcastResult {
  success: boolean
  minFee?: string
  message?: string
}

export interface GetBalanceParams {
  address: string
  magic: string
  assetType: string
}

export interface QueryTransactionsParams {
  address?: string
  senderId?: string
  recipientId?: string
  maxHeight: number
  page: number
  pageSize: number
  sort?: -1 | 1
  storageValue?: string
  signature?: string
}

export interface QueryPendingParams {
  senderId: string
  sort?: -1 | 1
}

export interface QueryTokenParams {
  page: number
  pageSize: number
  assetType?: string
}

export interface QueryTokenDetailParams {
  assetType: string
  address: string
}
