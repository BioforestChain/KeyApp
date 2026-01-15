/**
 * mpay 数据检测服务
 *
 * 检测 IndexedDB walletv2-idb 是否存在钱包数据
 */

import type {
  MpayDetectionResult,
  MpayMainWallet,
  MpayChainAddressInfo,
  MpayWalletAppSettings,
  MpayAddressBookEntry,
} from './types'

import { z } from 'zod'

const MpayAddressAssetSchema = z.looseObject({
  assetType: z.string(),
  decimals: z.number(),
  amount: z.string().optional(),
  useDefaultDecimals: z.boolean().optional(),
  logoUrl: z.string().optional(),
  contractAddress: z.string().optional(),
})

const MpayChainAddressInfoSchema: z.ZodType<MpayChainAddressInfo> = z.looseObject({
  address: z.string(),
  symbol: z.string(),
  addressKey: z.string(),
  mainWalletId: z.string(),
  chain: z.string(),
  mnemonic: z.string().optional(),
  privateKey: z.string(),
  publicKey: z.string().optional(),
  isCustomAssets: z.boolean().optional(),
  isFreezed: z.boolean().optional(),
  assets: z.array(MpayAddressAssetSchema),
  name: z.string(),
  prohibitChangeName: z.boolean().optional(),
  index: z.number().optional(),
  purpose: z.union([z.literal(44), z.literal(49), z.literal(84), z.literal(86)]).optional(),
})

const MpayMainWalletAddressInfoSchema = z.looseObject({
  chainName: z.string(),
  addressKey: z.string(),
  address: z.string(),
  symbol: z.string(),
  mainWalletId: z.string(),
  index: z.number().optional(),
  purpose: z.union([z.literal(44), z.literal(49), z.literal(84), z.literal(86)]).optional(),
})

const MpayMainWalletSchema: z.ZodType<MpayMainWallet> = z.looseObject({
  name: z.string(),
  skipBackup: z.boolean().optional(),
  importPhrase: z.string(),
  importType: z.string(),
  addressKeyList: z.array(MpayMainWalletAddressInfoSchema),
  mainWalletId: z.string(),
  headSculpture: z.string(),
  createTimestamp: z.number(),
  lastBitcoinAddressKey: z.string().optional(),
})

const MpayAddressBookEntrySchema: z.ZodType<MpayAddressBookEntry> = z.looseObject({
  addressBookId: z.string(),
  name: z.string(),
  address: z.string(),
  chainList: z.array(z.string()).optional(),
  remarks: z.string().optional(),
  iconName: z.string().optional(),
  symbol: z.string().optional(),
})

const MpayWalletAppSettingsSchema: z.ZodType<MpayWalletAppSettings> = z.looseObject({
  password: z.string(),
  passwordTips: z.string().optional(),
  lastWalletActivate: MpayChainAddressInfoSchema.optional(),
  walletLock: z.boolean().optional(),
  fingerprintLock: z.boolean().optional(),
  fingerprintPay: z.boolean().optional(),
})

const MPAY_IDB_NAME = 'walletv2-idb'
const MPAY_ADDRESS_BOOK_IDB = 'chainAddressBook-idb'
const MPAY_SETTINGS_KEY = '👨‍👩‍👧‍👦walletAppSetting'

/**
 * 检测 mpay IndexedDB 是否存在
 */
async function checkIndexedDBExists(): Promise<boolean> {
  return new Promise((resolve) => {
    const request = indexedDB.open(MPAY_IDB_NAME)
    request.onsuccess = () => {
      const db = request.result
      const hasStores =
        db.objectStoreNames.contains('mainWallet') &&
        db.objectStoreNames.contains('chainAddress')
      db.close()
      resolve(hasStores)
    }
    request.onerror = () => resolve(false)
  })
}

/**
 * 获取 IndexedDB store 中的所有数据
 */
async function getAllFromStore(storeName: string): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MPAY_IDB_NAME)
    request.onsuccess = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(storeName)) {
        db.close()
        resolve([])
        return
      }
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const getAllRequest = store.getAll()
      getAllRequest.onsuccess = () => {
        db.close()
        resolve(getAllRequest.result || [])
      }
      getAllRequest.onerror = () => {
        db.close()
        reject(getAllRequest.error)
      }
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * 获取指定 IndexedDB 数据库中的所有数据
 */
async function getAllFromDatabase(dbName: string): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName)
    request.onsuccess = () => {
      const db = request.result
      const storeNames = db.objectStoreNames
      if (storeNames.length === 0) {
        db.close()
        resolve([])
        return
      }
      // 使用第一个 store（地址簿 IDB 通常只有一个 store）
      const storeName = storeNames.item(0)
      if (!storeName) {
        db.close()
        resolve([])
        return
      }
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const getAllRequest = store.getAll()
      getAllRequest.onsuccess = () => {
        db.close()
        resolve(getAllRequest.result || [])
      }
      getAllRequest.onerror = () => {
        db.close()
        reject(getAllRequest.error)
      }
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * 获取 mpay localStorage 设置
 */
function getMpaySettings(): MpayWalletAppSettings | null {
  try {
    const json = localStorage.getItem(MPAY_SETTINGS_KEY)
    if (!json) return null
    const raw: unknown = JSON.parse(json)
    const parsed = MpayWalletAppSettingsSchema.safeParse(raw)
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

/**
 * 检测 mpay 数据
 */
export async function detectMpayData(): Promise<MpayDetectionResult> {
  const exists = await checkIndexedDBExists()
  if (!exists) {
    return {
      hasData: false,
      walletCount: 0,
      addressCount: 0,
      hasSettings: false,
      addressBookCount: 0,
    }
  }

  const [wallets, addresses, addressBook] = await Promise.all([
    readMpayWallets(),
    readMpayAddresses(),
    readMpayAddressBook(),
  ])

  const settings = getMpaySettings()

  return {
    hasData: wallets.length > 0,
    walletCount: wallets.length,
    addressCount: addresses.length,
    hasSettings: settings !== null && !!settings.password,
    addressBookCount: addressBook.length,
  }
}

/**
 * 读取所有 mpay 钱包数据
 */
export async function readMpayWallets(): Promise<MpayMainWallet[]> {
  const raw = await getAllFromStore('mainWallet')
  const wallets: MpayMainWallet[] = []
  for (const item of raw) {
    const parsed = MpayMainWalletSchema.safeParse(item)
    if (!parsed.success) {
      
      continue
    }
    wallets.push(parsed.data)
  }
  return wallets
}

/**
 * 读取所有 mpay 链地址数据
 */
export async function readMpayAddresses(): Promise<MpayChainAddressInfo[]> {
  const raw = await getAllFromStore('chainAddress')
  const addresses: MpayChainAddressInfo[] = []
  for (const item of raw) {
    const parsed = MpayChainAddressInfoSchema.safeParse(item)
    if (!parsed.success) {
      
      continue
    }
    addresses.push(parsed.data)
  }
  return addresses
}

/**
 * 读取 mpay 设置
 */
export function readMpaySettings(): MpayWalletAppSettings | null {
  return getMpaySettings()
}

/**
 * 读取 mpay 地址簿数据
 */
export async function readMpayAddressBook(): Promise<MpayAddressBookEntry[]> {
  try {
    const raw = await getAllFromDatabase(MPAY_ADDRESS_BOOK_IDB)
    const entries: MpayAddressBookEntry[] = []
    for (const item of raw) {
      const parsed = MpayAddressBookEntrySchema.safeParse(item)
      if (!parsed.success) {
        
        continue
      }
      entries.push(parsed.data)
    }
    return entries
  } catch {
    // 地址簿数据库可能不存在
    return []
  }
}

export { MPAY_IDB_NAME, MPAY_ADDRESS_BOOK_IDB, MPAY_SETTINGS_KEY }
