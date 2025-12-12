/**
 * mpay 数据迁移服务类型定义
 *
 * 基于 mpay wallet-data-storage-v2.service.ts 的数据结构
 * IndexedDB: walletv2-idb (stores: mainWallet, chainAddress)
 * localStorage: 👨‍👩‍👧‍👦walletAppSetting
 */

/** 迁移状态 */
export type MigrationStatus =
  | 'idle' // 未检测
  | 'detected' // 检测到 mpay 数据
  | 'in_progress' // 迁移中
  | 'completed' // 迁移完成
  | 'skipped' // 用户跳过
  | 'error' // 迁移失败

/** 迁移检测结果 */
export interface MpayDetectionResult {
  /** 是否检测到 mpay 数据 */
  hasData: boolean
  /** 钱包数量 */
  walletCount: number
  /** 地址数量 */
  addressCount: number
  /** 是否有设置数据 */
  hasSettings: boolean
}

/** mpay 钱包应用设置 (localStorage) */
export interface MpayWalletAppSettings {
  /** 加密后的密码 */
  password: string
  /** 密码提示 */
  passwordTips?: string
  /** 最后使用的地址信息 */
  lastWalletActivate?: MpayChainAddressInfo
  /** 密码锁 */
  passwordLock?: boolean
  /** 指纹锁 */
  fingerprintLock?: boolean
  /** 指纹支付 */
  fingerprintPay?: boolean
}

/** mpay 身份钱包地址信息 */
export interface MpayMainWalletAddressInfo {
  chainName: string
  addressKey: string
  address: string
  symbol: string
  mainWalletId: string
  index?: number
  purpose?: 44 | 49 | 84 | 86
}

/** mpay 身份钱包 (IndexedDB mainWallet store) */
export interface MpayMainWallet {
  /** 钱包名称 */
  name: string
  /** 是否跳过备份 */
  skipBackup?: boolean
  /** 加密的助记词或私钥 */
  importPhrase: string
  /** 导入类型: 'mnemonic' | 'privateKey' */
  importType: string
  /** 地址列表 */
  addressKeyList: MpayMainWalletAddressInfo[]
  /** 钱包 ID */
  mainWalletId: string
  /** 头像 */
  headSculpture: string
  /** 创建时间戳 */
  createTimestamp: number
  /** 最后使用的 BTC 地址 key */
  lastBitcoinAddressKey?: string
}

/** mpay 地址资产类型 */
export interface MpayAddressAsset {
  assetType: string
  decimals: number
  amount?: string
  useDefaultDecimals?: boolean
  logoUrl?: string
  contractAddress?: string
}

/** mpay 链地址信息 (IndexedDB chainAddress store) */
export interface MpayChainAddressInfo {
  address: string
  symbol: string
  addressKey: string
  mainWalletId: string
  chain: string
  /** 加密的助记词 (可选) */
  mnemonic?: string
  /** 加密的私钥 */
  privateKey: string
  publicKey?: string
  isCustomAssets?: boolean
  isFreezed?: boolean
  assets: MpayAddressAsset[]
  name: string
  prohibitChangeName?: boolean
  index?: number
  purpose?: 44 | 49 | 84 | 86
}

/** 迁移进度回调 */
export interface MigrationProgress {
  /** 当前步骤 */
  step: 'detecting' | 'verifying' | 'reading' | 'transforming' | 'importing' | 'complete'
  /** 进度百分比 0-100 */
  percent: number
  /** 当前处理的钱包名称 */
  currentWallet?: string
  /** 总钱包数 */
  totalWallets?: number
  /** 已处理钱包数 */
  processedWallets?: number
}

/** 迁移服务接口 */
export interface IMigrationService {
  /** 检测 mpay 数据 */
  detect(): Promise<MpayDetectionResult>
  /** 验证密码 */
  verifyPassword(password: string): Promise<boolean>
  /** 执行迁移 */
  migrate(password: string, onProgress?: (progress: MigrationProgress) => void): Promise<void>
  /** 跳过迁移 */
  skip(): Promise<void>
  /** 获取迁移状态 */
  getStatus(): MigrationStatus
}
