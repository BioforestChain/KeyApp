/**
 * BioForest 链特有类型
 */

export interface BioforestAddressInfo {
  address: string
  publicKey: string
  secondPublicKey?: string // 交易密码公钥
  isFreezed: boolean
}

export interface BioforestTransactionOptions {
  mainSecret: string
  paySecret?: string
  sendAddress: string
  receiveAddress: string
  assetType: string
  amount: string
  fee?: string
  remark?: Record<string, string>
}

export interface BioforestTransactionResult {
  transaction: BioforestTransactionJSON
  fee: string
  amount: string
  txId: string
}

export interface BioforestTransactionJSON {
  signature: string
  signSignature?: string
  senderId: string
  recipientId: string
  amount: string
  fee: string
  timestamp: number
  applyBlockHeight: number
  remark?: Record<string, string>
}

export interface BioforestBalanceResponse {
  address: string
  assets: BioforestAssetBalance[]
}

export interface BioforestAssetBalance {
  assetType: string
  amount: string
  decimals: number
}

export interface BioforestBlockInfo {
  height: number
  timestamp: number
  previousBlockId: string
}

export interface BioforestFeeInfo {
  minFee: string
  avgFee: string
}
