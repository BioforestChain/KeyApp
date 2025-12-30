/**
 * Teleport API Types
 * 
 * 类型定义参考 @bnqkl/metabox-core@0.5.2 和 @bnqkl/wallet-typings@0.23.8
 * 注意：这些包在 package.json 中作为依赖存在，但当前未被直接 import 使用。
 * 如果不需要运行时依赖，可以考虑移至 devDependencies 或移除。
 */

// 链名类型
export type ExternalChainName = 'ETH' | 'BSC' | 'TRON'
export type InternalChainName = 'BFMCHAIN' | 'ETHMETA' | 'PMCHAIN' | 'CCCHAIN' | 'BTGMETA' | 'BFCHAINV2'
export type ChainName = ExternalChainName | InternalChainName

// 资产类型
export type InternalAssetType = string
export type ExternalAssetType = string

// 分数类型
export interface Fraction {
  numerator: string | number
  denominator: string | number
}

// 传送支持配置
export interface TransmitSupport {
  enable: boolean
  isAirdrop: boolean
  assetType: string
  recipientAddress: string
  targetChain: InternalChainName
  targetAsset: InternalAssetType
  ratio: Fraction
  transmitDate: {
    startDate: string
    endDate: string
  }
  snapshotHeight?: number
  contractAddress?: string
}

export type TransmitSupportItem = Record<string, TransmitSupport>

// 传送配置响应
export interface TransmitAssetTypeListResponse {
  transmitSupport: {
    BFCHAIN?: TransmitSupportItem
    CCCHAIN?: TransmitSupportItem
    BFMCHAIN?: TransmitSupportItem
    ETHMETA?: TransmitSupportItem
    BTGMETA?: TransmitSupportItem
    PMCHAIN?: TransmitSupportItem
    ETH?: TransmitSupportItem
  }
}

// 外链发起方交易体
export interface ExternalFromTrJson {
  eth?: { signTransData: string }
  bsc?: { signTransData: string }
  tron?: unknown
  trc20?: unknown
}

// 内链发起方交易体
export interface InternalFromTrJson {
  bcf?: {
    chainName: InternalChainName
    trJson: TransferAssetTransaction
  }
}

// 转账交易体
export interface TransferAssetTransaction {
  senderId: string
  recipientId: string
  amount: string
  fee: string
  timestamp: number
  signature: string
  asset: {
    transferAsset: {
      amount: string
      assetType: string
    }
  }
}

// 发起方交易体（合并外链和内链）
export type FromTrJson = ExternalFromTrJson & InternalFromTrJson

// 接收方交易信息
export interface ToTrInfo {
  chainName: InternalChainName
  address: string
  assetType: InternalAssetType
}

// 传送请求
export interface TransmitRequest {
  fromTrJson: FromTrJson
  toTrInfo?: ToTrInfo
}

// 传送响应
export interface TransmitResponse {
  orderId: string
}

// 订单状态
export enum SWAP_ORDER_STATE_ID {
  INIT = 1,
  FROM_TX_WAIT_ON_CHAIN = 2,
  FROM_TX_ON_CHAIN_FAIL = 201,
  TO_TX_WAIT_ON_CHAIN = 3,
  TO_TX_ON_CHAIN_FAIL = 301,
  SUCCESS = 4,
}

// 记录状态
export enum SWAP_RECORD_STATE {
  PENDING = 1,
  TO_BE_POSTED = 2,
  POSTED = 3,
  FAIL = 4,
}

// 交易信息
export interface RecordTxInfo {
  chainName: ChainName
  amount: string
  asset: string
  decimals: number
  assetLogoUrl?: string
}

// 交易详情信息
export interface RecordDetailTxInfo {
  chainName: ChainName
  address: string
  txId?: string
  txHash?: string
  contractAddress?: string
}

// 传送记录
export interface TransmitRecord {
  orderId: string
  state: SWAP_RECORD_STATE
  orderState: SWAP_ORDER_STATE_ID
  fromTxInfo?: RecordTxInfo
  toTxInfo?: RecordTxInfo
  createdTime: string
}

// 传送记录详情
export interface TransmitRecordDetail {
  state: SWAP_RECORD_STATE
  orderState: SWAP_ORDER_STATE_ID
  fromTxInfo?: RecordDetailTxInfo
  toTxInfo?: RecordDetailTxInfo
  orderFailReason?: string
  updatedTime: string
  swapRatio: number
}

// 分页请求
export interface PageRequest {
  page: number
  pageSize: number
}

// 记录列表请求
export interface TransmitRecordsRequest extends PageRequest {
  fromChain?: ChainName
  fromAddress?: string
  fromAsset?: string
}

// 记录列表响应
export interface TransmitRecordsResponse {
  page: number
  pageSize: number
  dataList: TransmitRecord[]
}

// 重试响应
export type RetryResponse = boolean

// UI 用的资产展示类型
export interface DisplayAsset {
  id: string
  chain: ChainName
  assetType: string
  symbol: string
  name: string
  balance: string
  decimals: number
  recipientAddress: string
  targetChain: InternalChainName
  targetAsset: InternalAssetType
  ratio: Fraction
  contractAddress?: string
  isAirdrop: boolean
}
