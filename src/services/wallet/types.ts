/**
 * 钱包存储类型定义
 */

import type { ChainType, BitcoinPurpose } from '@/lib/crypto/derivation'

/** 钱包导入类型 */
export type WalletImportType = 'mnemonic' | 'privateKey'

/** 钱包地址信息 */
export interface WalletAddressInfo {
  /** 链类型 */
  chain: ChainType
  /** 地址 */
  address: string
  /** 钱包ID */
  walletId: string
  /** 钱包名称 */
  walletName: string
  /** Bitcoin purpose (仅 Bitcoin) */
  purpose?: BitcoinPurpose
}

/** 主钱包信息 */
export interface MainWalletInfo {
  /** 钱包 ID */
  id: string
  /** 钱包名称 */
  name: string
  /** 导入类型 */
  importType: WalletImportType
  /** 是否跳过备份 */
  skipBackup: boolean
  /** 地址列表 */
  addresses: WalletAddressInfo[]
  /** 创建时间戳 */
  createdAt: number
}

/** 重复检测结果 */
export interface DuplicateCheckResult {
  /** 是否存在重复 */
  isDuplicate: boolean
  /** 重复类型 */
  type: 'none' | 'address' | 'privateKey'
  /** 匹配的钱包信息 (如果有) */
  matchedWallet?: {
    id: string
    name: string
    importType: WalletImportType
    matchedAddress: string
  }
}

/** 钱包查询接口 */
export interface IWalletQuery {
  /** 获取所有地址 */
  getAllAddresses(): Promise<WalletAddressInfo[]>
  /** 获取所有主钱包 */
  getAllMainWallets(): Promise<MainWalletInfo[]>
  /** 根据地址查找钱包 */
  findWalletByAddress(address: string): Promise<MainWalletInfo | null>
}
