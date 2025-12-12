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
} from './types'

const MPAY_IDB_NAME = 'walletv2-idb'
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
async function getAllFromStore<T>(storeName: string): Promise<T[]> {
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
 * 获取 mpay localStorage 设置
 */
function getMpaySettings(): MpayWalletAppSettings | null {
  try {
    const json = localStorage.getItem(MPAY_SETTINGS_KEY)
    if (!json) return null
    return JSON.parse(json) as MpayWalletAppSettings
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
    }
  }

  const [wallets, addresses] = await Promise.all([
    getAllFromStore<MpayMainWallet>('mainWallet'),
    getAllFromStore<MpayChainAddressInfo>('chainAddress'),
  ])

  const settings = getMpaySettings()

  return {
    hasData: wallets.length > 0,
    walletCount: wallets.length,
    addressCount: addresses.length,
    hasSettings: settings !== null && !!settings.password,
  }
}

/**
 * 读取所有 mpay 钱包数据
 */
export async function readMpayWallets(): Promise<MpayMainWallet[]> {
  return getAllFromStore<MpayMainWallet>('mainWallet')
}

/**
 * 读取所有 mpay 链地址数据
 */
export async function readMpayAddresses(): Promise<MpayChainAddressInfo[]> {
  return getAllFromStore<MpayChainAddressInfo>('chainAddress')
}

/**
 * 读取 mpay 设置
 */
export function readMpaySettings(): MpayWalletAppSettings | null {
  return getMpaySettings()
}

export { MPAY_IDB_NAME, MPAY_SETTINGS_KEY }
