import type { EncryptedData } from '@/lib/crypto'

export const WALLET_STORAGE_VERSION = 1

/** 钱包用户信息 */
export interface WalleterInfo {
  /** 钱包使用者名称 */
  name: string
  /** 密码提示 */
  passwordTips?: string | undefined
  /** 当前激活的钱包ID */
  activeWalletId: string | null
  /** 是否启用生物识别 */
  biometricEnabled: boolean
  /** 是否启用密码锁 */
  passwordLockEnabled: boolean
  /** 用户协议已阅读 */
  agreementAccepted: boolean
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
}

/** 密钥类型 */
export type KeyType = 'mnemonic' | 'arbitrary' | 'privateKey'

/** 钱包信息 */
export interface WalletInfo {
  /** 钱包唯一ID */
  id: string
  /** 钱包名称 */
  name: string
  /** 密钥类型 */
  keyType: KeyType
  /** 主链 */
  primaryChain: string
  /** 主地址 */
  primaryAddress: string
  /** 加密的助记词（使用钱包锁加密） */
  encryptedMnemonic?: EncryptedData | undefined
  /** 加密的钱包锁（使用助记词派生密钥加密） */
  encryptedWalletLock?: EncryptedData | undefined
  /** 是否已备份 */
  isBackedUp: boolean
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
}

/** 资产信息 */
export interface AssetInfo {
  /** 资产类型标识 */
  assetType: string
  /** 资产符号 */
  symbol: string
  /** 精度 */
  decimals: number
  /** 余额 */
  balance: string
  /** 合约地址（代币） */
  contractAddress?: string | undefined
  /** Logo URL */
  logoUrl?: string | undefined
}

/** 链地址信息 */
export interface ChainAddressInfo {
  /** 地址Key (walletId:chain) */
  addressKey: string
  /** 钱包ID */
  walletId: string
  /** 链标识 */
  chain: string
  /** 地址 */
  address: string
  /** 公钥（可选） */
  publicKey?: string | undefined
  /** 加密的私钥 */
  encryptedPrivateKey?: EncryptedData | undefined
  /** 派生路径（BIP44） */
  derivationPath?: string | undefined
  /** 资产列表 */
  assets: AssetInfo[]
  /** 是否自定义过资产 */
  isCustomAssets: boolean
  /** 是否冻结 */
  isFrozen: boolean
}

/** 地址簿条目 */
export interface AddressBookEntry {
  /** 唯一ID */
  id: string
  /** 链标识 */
  chain: string
  /** 地址 */
  address: string
  /** 名称 */
  name: string
  /** 备注 */
  note?: string | undefined
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
}

/** 存储元数据 */
export interface StorageMetadata {
  /** 版本号 */
  version: number
  /** 创建时间 */
  createdAt: number
  /** 最后迁移时间 */
  lastMigratedAt?: number | undefined
}

/** 钱包存储服务错误码 */
export enum WalletStorageErrorCode {
  NOT_INITIALIZED = 'STORAGE_NOT_INITIALIZED',
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  ADDRESS_NOT_FOUND = 'ADDRESS_NOT_FOUND',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  STORAGE_FULL = 'STORAGE_FULL',
  MIGRATION_FAILED = 'MIGRATION_FAILED',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
}

/** 钱包存储错误 */
export class WalletStorageError extends Error {
  constructor(
    public code: WalletStorageErrorCode,
    message: string,
    public override cause?: Error | undefined
  ) {
    super(message)
    this.name = 'WalletStorageError'
  }
}
