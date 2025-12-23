import { Page } from '@playwright/test'

/**
 * 等待应用加载完成
 */
export async function waitForAppReady(page: Page) {
  await page.locator('svg[aria-label="加载中"]').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {})
  await page.waitForLoadState('networkidle')
}

/**
 * 设置测试钱包（使用助记词）
 * 这会在测试开始前通过 localStorage 预设钱包数据
 */
export async function setupWalletWithMnemonic(page: Page, mnemonic: string, password: string = 'test-password') {
  // 创建基础测试钱包数据（使用 migrateFromLocalStorage 期望的格式）
  const testWalletData = {
    wallets: [
      {
        id: 'test-wallet-bioforest',
        name: 'BioForest 测试钱包',
        address: 'b9gB9NzHKWsDKGYFCaNva6xRnxPwFfGcfx', // migrateFromLocalStorage 期望 address 字段
        chain: 'bfmeta', // migrateFromLocalStorage 期望 chain 字段
        keyType: 'mnemonic',
        encryptedMnemonic: {
          ciphertext: 'encrypted-' + mnemonic.replace(/\s/g, '-'),
          iv: 'test-iv',
          salt: 'test-salt',
        },
        createdAt: Date.now(),
        // chainAddresses 是必需的，用于创建链地址记录
        chainAddresses: [
          {
            chain: 'bfmeta',
            address: 'b9gB9NzHKWsDKGYFCaNva6xRnxPwFfGcfx',
            tokens: [],
          },
        ],
      },
    ],
    currentWalletId: 'test-wallet-bioforest',
    selectedChain: 'bfmeta',
  }

  await page.addInitScript((data) => {
    localStorage.setItem('bfm_wallets', JSON.stringify(data.wallet))
    localStorage.setItem('bfm_preferences', JSON.stringify({ language: 'zh-CN', currency: 'CNY' }))
    // 存储测试密码（仅用于测试）
    localStorage.setItem('__test_password', data.password)
  }, { wallet: testWalletData, password })

  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

/**
 * E2E 测试辅助函数：从 IndexedDB 读取钱包数据
 */
export async function getWalletsFromIndexedDB(page: Page) {
  return await page.evaluate(async () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('bfm-wallet-db', 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction('wallets', 'readonly')
        const store = tx.objectStore('wallets')
        const getAllRequest = store.getAll()
        getAllRequest.onsuccess = () => resolve(getAllRequest.result)
        getAllRequest.onerror = () => reject(getAllRequest.error)
      }
      // 如果数据库不存在，返回空数组
      request.onupgradeneeded = () => {
        resolve([])
      }
    })
  })
}

/**
 * E2E 测试辅助函数：从 IndexedDB 读取链地址数据
 */
export async function getChainAddressesFromIndexedDB(page: Page, walletId?: string) {
  return await page.evaluate(async (wId) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('bfm-wallet-db', 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction('chainAddresses', 'readonly')
        const store = tx.objectStore('chainAddresses')
        
        if (wId) {
          const index = store.index('by-wallet')
          const getRequest = index.getAll(wId)
          getRequest.onsuccess = () => resolve(getRequest.result)
          getRequest.onerror = () => reject(getRequest.error)
        } else {
          const getAllRequest = store.getAll()
          getAllRequest.onsuccess = () => resolve(getAllRequest.result)
          getAllRequest.onerror = () => reject(getAllRequest.error)
        }
      }
      request.onupgradeneeded = () => {
        resolve([])
      }
    })
  }, walletId)
}

/**
 * E2E 测试辅助函数：组合钱包和链地址数据（兼容旧格式）
 */
export async function getWalletDataFromIndexedDB(page: Page) {
  const wallets = await getWalletsFromIndexedDB(page) as Array<{
    id: string
    name: string
    primaryAddress: string
    primaryChain: string
    [key: string]: unknown
  }>
  
  const chainAddresses = await getChainAddressesFromIndexedDB(page) as Array<{
    walletId: string
    chain: string
    address: string
    [key: string]: unknown
  }>

  // 转换为旧格式以兼容现有测试
  return wallets.map(wallet => ({
    ...wallet,
    address: wallet.primaryAddress,
    chain: wallet.primaryChain,
    chainAddresses: chainAddresses
      .filter(ca => ca.walletId === wallet.id)
      .map(ca => ({
        chain: ca.chain,
        address: ca.address,
        tokens: [],
      })),
  }))
}
