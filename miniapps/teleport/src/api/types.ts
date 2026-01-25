/**
 * Teleport API Types
 *
 * 类型以 @bnqkl/metabox-core 与 @bnqkl/wallet-typings 为唯一可信来源，
 * 并对 JSON 序列化后的字段做必要的结构适配。
 */

import type {} from '@bnqkl/metabox-core'
import type {
  ExternalAssetType as WalletExternalAssetType,
  ExternalChainName as WalletExternalChainName,
  InternalAssetType as WalletInternalAssetType,
  InternalChainName as WalletInternalChainName,
} from '@bnqkl/wallet-typings'

// 链名类型
export type ExternalChainName = WalletExternalChainName | `${WalletExternalChainName}`
export type InternalChainName = WalletInternalChainName | `${WalletInternalChainName}`
export type ChainName = ExternalChainName | InternalChainName

// 资产类型
export type InternalAssetType = WalletInternalAssetType | `${WalletInternalAssetType}`
export type ExternalAssetType = WalletExternalAssetType | `${WalletExternalAssetType}`

// 分数类型
export type Fraction = MetaBoxCore.Fraction

// 传送支持配置（API 序列化后 transmitDate 为字符串）
export type TransmitSupport = Omit<
  MetaBoxCore.Config.TransmitSupport,
  'transmitDate' | 'targetChain' | 'targetAsset'
> & {
  targetChain: InternalChainName
  targetAsset: InternalAssetType
  transmitDate: {
    startDate: string
    endDate: string
  }
}

export type TransmitSupportItem = Record<string, TransmitSupport>

// 传送配置响应
export type TransmitAssetTypeListResponse = Omit<
  MetaBoxCore.Api.TransmitAssetTypeListResDto,
  'transmitSupport'
> & {
  transmitSupport: Record<string, TransmitSupportItem | undefined>
}

// TRON 交易体
export interface TronTransaction {
  txID: string
  raw_data: unknown
  raw_data_hex: string
  signature?: string[]
}

// 外链发起方交易体
export interface ExternalFromTrJson {
  eth?: { signTransData: string }
  bsc?: { signTransData: string }
  tron?: TronTransaction
  trc20?: TronTransaction
}

// 内链发起方交易体
export type InternalFromTrJson = Omit<WalletTypings.InternalChain.FromTrJson, 'bcf'> & {
  bcf?: {
    chainName: InternalChainName
    trJson: TransferAssetTransaction
  }
}

// 转账交易体
export type TransferAssetTransaction = WalletTypings.InternalChain.TransferAssetTransaction

// 发起方交易体（合并外链和内链）
export type FromTrJson = Omit<MetaBoxCore.Transmit.FromTrJson, 'bcf'> & InternalFromTrJson

// 接收方交易信息
export type ToTrInfo = Omit<MetaBoxCore.Transmit.ToTrInfo, 'chainName' | 'assetType'> & {
  chainName: InternalChainName
  assetType: InternalAssetType
}

// 传送请求
export type TransmitRequest = Omit<MetaBoxCore.Api.TransmitReqDto, 'fromTrJson' | 'toTrInfo'> & {
  fromTrJson: FromTrJson
  toTrInfo?: ToTrInfo
}

// 传送响应
export type TransmitResponse = MetaBoxCore.Api.TransmitResDto

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
export type RecordTxInfo = Omit<WalletTypings.Order.RecordTxInfo, 'chainName'> & {
  chainName: ChainName
}

// 交易详情信息
export type RecordDetailTxInfo = Omit<WalletTypings.Order.RecordDetailTxInfo, 'chainName'> & {
  chainName: ChainName
}

// 传送记录
export type TransmitRecord = Omit<
  MetaBoxCore.Swap.SwapRecord,
  'createdTime' | 'fromTxInfo' | 'toTxInfo' | 'orderState' | 'state'
> & {
  createdTime: string | number
  state: SWAP_RECORD_STATE
  orderState: SWAP_ORDER_STATE_ID
  fromTxInfo?: RecordTxInfo
  toTxInfo?: RecordTxInfo
}

// 传送记录详情
export type TransmitRecordDetail = Omit<
  MetaBoxCore.Api.TransmitRecordDetailResDto,
  'updatedTime' | 'fromTxInfo' | 'toTxInfo' | 'orderState' | 'state'
> & {
  updatedTime: string | number
  state: SWAP_RECORD_STATE
  orderState: SWAP_ORDER_STATE_ID
  fromTxInfo?: RecordDetailTxInfo
  toTxInfo?: RecordDetailTxInfo
  orderFailReason?: string
  swapRatio: number
}

// 分页请求
export type PageRequest = MetaBoxCore.PageRequest

// 记录列表请求
export type TransmitRecordsRequest = Omit<MetaBoxCore.Api.TransmitRecordsReqDto, 'fromChain'> & {
  fromChain?: ChainName
}

// 记录列表响应
export type TransmitRecordsResponse = Omit<MetaBoxCore.Api.TransmitRecordsResDto, 'dataList'> & {
  dataList: TransmitRecord[]
}

// 重试响应
export type RetryResponse = MetaBoxCore.Api.TransmitRetryFromTxOnChainResDto

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
