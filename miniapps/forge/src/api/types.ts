/**
 * COT Recharge API Types
 * Based on @bnqkl/cotcore@0.7.4 type definitions
 */

/** 外链名称 */
export type ExternalChainName = 'ETH' | 'BSC' | 'TRON'

/** 内链名称 */
export type InternalChainName = 'bfmeta' | 'bfchain' | 'ccchain' | 'pmchain'

/** 外链资产信息 */
export interface ExternalAssetInfoItem {
  /** 是否启用 */
  enable: boolean
  /** 合约地址（ERC20/BEP20/TRC20） */
  contract?: string
  /** 充值地址 */
  depositAddress: string
  /** 资产类型名称 */
  assetType: string
  /** Logo URL */
  logo?: string
  /** 精度 */
  decimals?: number
}

/** 赎回参数 */
export interface RedemptionConfig {
  enable: boolean
  /** 单笔赎回下限（内链最小单位） */
  min: string
  /** 单笔赎回上限（内链最小单位） */
  max: string
  /** 不同链的手续费 */
  fee: Record<string, string>
  /** 手续费比例 */
  radioFee: string
}

/** 充值配置项 */
export interface RechargeItem {
  /** 是否启用 */
  enable: boolean
  /** 内链名 */
  chainName: InternalChainName
  /** 内链代币名（锻造产物） */
  assetType: string
  /** 内链币发行地址 */
  applyAddress: string
  /** 支持的外链 */
  supportChain: {
    ETH?: ExternalAssetInfoItem
    BSC?: ExternalAssetInfoItem
    TRON?: ExternalAssetInfoItem
  }
  /** 赎回参数 */
  redemption?: RedemptionConfig
  /** Logo */
  logo?: string
}

/** 充值配置（按内链 -> 资产类型） */
export type RechargeConfig = Record<string, Record<string, RechargeItem>>

/** 充值支持配置响应 */
export interface RechargeSupportResDto {
  recharge: RechargeConfig
}

/** 外链交易体 */
export interface FromTrJson {
  eth?: { signTransData: string }
  bsc?: { signTransData: string }
  tron?: unknown
  trc20?: unknown
}

/** 内链接收方信息 */
export interface RechargeV2ToTrInfoData {
  chainName: InternalChainName
  address: string
  assetType: string
  timestamp: number
}

/** 签名信息 */
export interface SignatureInfo {
  timestamp: number
  signature: string
  publicKey: string
}

/** 充值请求 */
export interface RechargeV2ReqDto {
  /** 外链已签名交易体 */
  fromTrJson: FromTrJson
  /** 内链接收信息 */
  message: RechargeV2ToTrInfoData
  /** 验签信息 */
  signatureInfo: SignatureInfo
}

/** 充值响应 */
export interface RechargeResDto {
  orderId: string
}

/** 合约池信息请求 */
export interface RechargeContractPoolReqDto {
  internalChainName: InternalChainName
}

/** 合约池信息项 */
export interface RechargeContractPoolItem {
  chainName: InternalChainName
  assetType: string
  externalChainInfo: Array<{
    chainName: ExternalChainName
    assetType: string
  }>
  /** 总铸造量 */
  totalMinted: string
  /** 当前流通总量 */
  totalCirculation: string
  /** 总销毁量 */
  totalBurned: string
  /** 总质押量 */
  totalStaked: string
}

/** 合约池信息响应 */
export interface RechargeContractPoolResDto {
  poolInfo: RechargeContractPoolItem[]
}

/** 充值订单状态 */
export enum RECHARGE_ORDER_STATE_ID {
  INIT = 1,
  EXTERNAL_WAIT_ON_CHAIN = 2,
  EXTERNAL_ON_CHAIN_FAIL = 201,
  INTERNAL_WAIT_ON_CHAIN = 3,
  INTERNAL_ON_CHAIN_FAIL = 301,
  SUCCESS = 4,
}

/** 充值记录状态 */
export enum RECHARGE_RECORD_STATE {
  PENDING = 1,
  TO_BE_POSTED = 2,
  POSTED = 3,
  FAIL = 4,
}

/** 交易信息 */
export interface RecordTxInfo {
  chainName: string
  assetType: string
  address: string
  amount: string
  txHash?: string
}

/** 充值记录 */
export interface RechargeRecord {
  orderId: string
  state: RECHARGE_RECORD_STATE
  orderState: RECHARGE_ORDER_STATE_ID
  createdTime: string
  fromTxInfo: RecordTxInfo
  toTxInfoArray: RecordTxInfo[]
}

/** 充值记录请求 */
export interface RechargeRecordsReqDto {
  page: number
  pageSize: number
  internalChain?: InternalChainName
  internalAddress?: string
  recordState?: RECHARGE_RECORD_STATE
}

/** 分页数据 */
export interface PageData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 充值记录响应 */
export type RechargeRecordsResDto = PageData<RechargeRecord>

/** 充值记录详情请求 */
export interface RechargeRecordDetailReqDto {
  orderId: string
}

/** 详细交易信息 */
export interface RecordDetailTxInfo extends RecordTxInfo {
  fee?: string
  confirmations?: number
  blockNumber?: number
  blockTime?: string
}

/** 充值记录详情响应 */
export interface RechargeRecordDetailResDto {
  orderId: string
  state: RECHARGE_RECORD_STATE
  orderState: RECHARGE_ORDER_STATE_ID
  createdTime: string
  fromTxInfo: RecordDetailTxInfo
  toTxInfos: Record<string, RecordDetailTxInfo>
}

/** 重试请求 */
export interface RetryOnChainReqDto {
  orderId: string
}

// ============================================================================
// Redemption Types (赎回相关类型)
// ============================================================================

/** 赎回订单状态 */
export enum REDEMPTION_ORDER_STATE_ID {
  /** 初始 */
  INIT = 1,
  /** 等待内链上链 */
  INTERNAL_WAIT_ON_CHAIN = 2,
  /** 内链上链失败 */
  INTERNAL_ON_CHAIN_FAIL = 201,
  /** 等待外链上链 */
  EXTERNAL_WAIT_ON_CHAIN = 3,
  /** 外链上链失败 */
  EXTERNAL_ON_CHAIN_FAIL = 301,
  /** 成功 */
  SUCCESS = 4,
}

/** 赎回记录状态 */
export enum REDEMPTION_RECORD_STATE {
  /** 转账中 */
  PENDING = 1,
  /** 外链交易转账中 */
  TO_BE_POSTED = 2,
  /** 赎回已到账 */
  POSTED = 3,
  /** 赎回失败 */
  FAIL = 4,
}

/** 赎回交易 remark (目标外链信息) */
export interface RedemptionTransRemark {
  /** 外链名 */
  chainName: ExternalChainName
  /** 外链接收地址 */
  address: string
  /** 外链资产类型 */
  assetType: string
}

/** 赎回交易体 (内链 DestroyAsset 交易) */
export interface RedemptionV2Tr {
  bcf: {
    chainName: string
    trJson: unknown
  }
}

/** 赎回请求 */
export interface RedemptionV2ReqDto {
  /** 发起方交易体 - 内链 DestroyAsset 交易 */
  fromTrJson: RedemptionV2Tr
}

/** 赎回响应 */
export interface RedemptionV2ResDto {
  /** 赎回订单ID */
  orderId: string
}

/** 赎回记录请求 */
export interface RedemptionRecordsReqDto {
  page: number
  pageSize: number
  internalChain?: string
  internalAddress?: string
}

/** 赎回记录 */
export interface RedemptionRecord {
  orderId: string
  state: REDEMPTION_RECORD_STATE
  orderState: REDEMPTION_ORDER_STATE_ID
  fromTxInfo: RecordTxInfo
  toTxInfo: RecordTxInfo
  redemptionFee: string
  createdTime: string
}

/** 赎回记录响应 */
export type RedemptionRecordsResDto = PageData<RedemptionRecord>

/** 赎回记录详情请求 */
export interface RedemptionRecordDetailReqDto {
  orderId: string
}

/** 赎回记录详情响应 */
export interface RedemptionRecordDetailResDto {
  state: REDEMPTION_RECORD_STATE
  orderState: REDEMPTION_ORDER_STATE_ID
  redemptionRatio: number
  fromTxInfo: RecordDetailTxInfo
  toTxInfo: RecordDetailTxInfo
  orderFailReason?: string
  updatedTime: string
}

// ============================================================================
// Bridge Types (跨链通统一类型)
// ============================================================================

/** 桥接模式 */
export type BridgeMode = 'recharge' | 'redemption'

/** 桥接记录类型 (充值或赎回) */
export type BridgeRecord = 
  | { type: 'recharge'; data: RechargeRecord }
  | { type: 'redemption'; data: RedemptionRecord }
