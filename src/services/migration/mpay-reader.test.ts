/**
 * mpay-reader 单元测试
 *
 * 测试 mpay IndexedDB 数据读取
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import {
  detectMpayData,
  readMpayWallets,
  readMpayAddresses,
  readMpaySettings,
  MPAY_IDB_NAME,
  MPAY_SETTINGS_KEY,
} from './mpay-reader'
import type { MpayMainWallet, MpayChainAddressInfo } from './types'

// 辅助函数：创建 mpay IndexedDB
async function createMpayDatabase(
  wallets: MpayMainWallet[],
  addresses: MpayChainAddressInfo[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MPAY_IDB_NAME, 8)

    request.onupgradeneeded = () => {
      const db = request.result
      // 创建 mainWallet store
      if (!db.objectStoreNames.contains('mainWallet')) {
        db.createObjectStore('mainWallet', { keyPath: 'mainWalletId' })
      }
      // 创建 chainAddress store
      if (!db.objectStoreNames.contains('chainAddress')) {
        db.createObjectStore('chainAddress', { keyPath: 'addressKey' })
      }
    }

    request.onsuccess = () => {
      const db = request.result

      const transaction = db.transaction(['mainWallet', 'chainAddress'], 'readwrite')
      const walletStore = transaction.objectStore('mainWallet')
      const addressStore = transaction.objectStore('chainAddress')

      // 添加钱包
      for (const wallet of wallets) {
        walletStore.add(wallet)
      }

      // 添加地址
      for (const addr of addresses) {
        addressStore.add(addr)
      }

      transaction.oncomplete = () => {
        db.close()
        resolve()
      }

      transaction.onerror = () => {
        db.close()
        reject(transaction.error)
      }
    }

    request.onerror = () => reject(request.error)
  })
}

// 辅助函数：删除 mpay IndexedDB
async function deleteMpayDatabase(): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(MPAY_IDB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => resolve() // 忽略错误
    request.onblocked = () => resolve()
  })
}

describe('mpay-reader', () => {
  const mockWallet: MpayMainWallet = {
    mainWalletId: 'wallet-1',
    name: 'Test Wallet',
    importPhrase: 'encrypted-mnemonic-base64',
    importType: 'mnemonic',
    addressKeyList: [
      { chainName: 'BFMeta', addressKey: 'addr-1', address: 'bfm123', symbol: 'BFT', mainWalletId: 'wallet-1' },
      { chainName: 'Ethereum', addressKey: 'addr-2', address: '0x123', symbol: 'ETH', mainWalletId: 'wallet-1' },
    ],
    createTimestamp: 1700000000000,
    headSculpture: '',
  }

  const mockAddress: MpayChainAddressInfo = {
    addressKey: 'addr-1',
    mainWalletId: 'wallet-1',
    chain: 'BFMeta',
    address: 'bfm123456',
    privateKey: 'encrypted-private-key',
    assets: [
      { assetType: 'BFT', amount: '1000', decimals: 8 },
    ],
    symbol: 'BFT',
    name: 'BFMeta Address',
  }

  beforeEach(async () => {
    // 清理数据库和 localStorage
    await deleteMpayDatabase()
    localStorage.clear()
  })

  afterEach(async () => {
    await deleteMpayDatabase()
    localStorage.clear()
  })

  describe('detectMpayData', () => {
    it('should detect no data when database does not exist', async () => {
      const result = await detectMpayData()

      expect(result.hasData).toBe(false)
      expect(result.walletCount).toBe(0)
      expect(result.addressCount).toBe(0)
      expect(result.hasSettings).toBe(false)
    })

    it('should detect data when wallets exist', async () => {
      await createMpayDatabase([mockWallet], [mockAddress])

      const result = await detectMpayData()

      expect(result.hasData).toBe(true)
      expect(result.walletCount).toBe(1)
      expect(result.addressCount).toBe(1)
    })

    it('should detect multiple wallets and addresses', async () => {
      const wallets: MpayMainWallet[] = [
        { ...mockWallet, mainWalletId: 'w1', name: 'Wallet 1' },
        { ...mockWallet, mainWalletId: 'w2', name: 'Wallet 2' },
        { ...mockWallet, mainWalletId: 'w3', name: 'Wallet 3' },
      ]
      const addresses: MpayChainAddressInfo[] = [
        { ...mockAddress, addressKey: 'a1', mainWalletId: 'w1' },
        { ...mockAddress, addressKey: 'a2', mainWalletId: 'w1' },
        { ...mockAddress, addressKey: 'a3', mainWalletId: 'w2' },
      ]

      await createMpayDatabase(wallets, addresses)

      const result = await detectMpayData()

      expect(result.walletCount).toBe(3)
      expect(result.addressCount).toBe(3)
    })

    it('should detect settings with password', async () => {
      await createMpayDatabase([mockWallet], [])
      localStorage.setItem(
        MPAY_SETTINGS_KEY,
        JSON.stringify({ password: 'encrypted-password' })
      )

      const result = await detectMpayData()

      expect(result.hasSettings).toBe(true)
    })

    it('should not detect settings without password', async () => {
      await createMpayDatabase([mockWallet], [])
      localStorage.setItem(MPAY_SETTINGS_KEY, JSON.stringify({ theme: 'dark' }))

      const result = await detectMpayData()

      expect(result.hasSettings).toBe(false)
    })
  })

  describe('readMpayWallets', () => {
    it('should return empty array when no wallets', async () => {
      await createMpayDatabase([], [])

      const wallets = await readMpayWallets()

      expect(wallets).toEqual([])
    })

    it('should read single wallet', async () => {
      await createMpayDatabase([mockWallet], [])

      const wallets = await readMpayWallets()

      expect(wallets).toHaveLength(1)
      expect(wallets[0]?.mainWalletId).toBe('wallet-1')
      expect(wallets[0]?.name).toBe('Test Wallet')
      expect(wallets[0]?.importPhrase).toBe('encrypted-mnemonic-base64')
    })

    it('should read multiple wallets', async () => {
      const wallets: MpayMainWallet[] = [
        { ...mockWallet, mainWalletId: 'w1', name: 'Wallet 1' },
        { ...mockWallet, mainWalletId: 'w2', name: 'Wallet 2' },
      ]

      await createMpayDatabase(wallets, [])

      const result = await readMpayWallets()

      expect(result).toHaveLength(2)
    })
  })

  describe('readMpayAddresses', () => {
    it('should return empty array when no addresses', async () => {
      await createMpayDatabase([mockWallet], [])

      const addresses = await readMpayAddresses()

      expect(addresses).toEqual([])
    })

    it('should read single address', async () => {
      await createMpayDatabase([], [mockAddress])

      const addresses = await readMpayAddresses()

      expect(addresses).toHaveLength(1)
      expect(addresses[0]?.address).toBe('bfm123456')
      expect(addresses[0]?.chain).toBe('BFMeta')
    })

    it('should read address with assets', async () => {
      await createMpayDatabase([], [mockAddress])

      const addresses = await readMpayAddresses()

      expect(addresses[0]?.assets).toHaveLength(1)
      expect(addresses[0]?.assets[0]?.assetType).toBe('BFT')
      expect(addresses[0]?.assets[0]?.amount).toBe('1000')
    })

    it('should read multiple addresses', async () => {
      const addresses: MpayChainAddressInfo[] = [
        { ...mockAddress, addressKey: 'a1', chain: 'BFMeta', address: 'bfm1' },
        { ...mockAddress, addressKey: 'a2', chain: 'Ethereum', address: '0xeth' },
        { ...mockAddress, addressKey: 'a3', chain: 'Tron', address: 'tron' },
      ]

      await createMpayDatabase([], addresses)

      const result = await readMpayAddresses()

      expect(result).toHaveLength(3)
    })
  })

  describe('readMpaySettings', () => {
    it('should return null when no settings', () => {
      const settings = readMpaySettings()

      expect(settings).toBeNull()
    })

    it('should read settings', () => {
      const mockSettings = {
        password: 'encrypted-password',
        theme: 'dark',
        language: 'zh',
      }
      localStorage.setItem(MPAY_SETTINGS_KEY, JSON.stringify(mockSettings))

      const settings = readMpaySettings()

      expect(settings).toEqual(mockSettings)
    })

    it('should return null for invalid JSON', () => {
      localStorage.setItem(MPAY_SETTINGS_KEY, 'invalid-json{{{')

      const settings = readMpaySettings()

      expect(settings).toBeNull()
    })
  })
})
