import { test, expect } from '@playwright/test'
import { getWalletDataFromIndexedDB } from './utils/indexeddb-helper'

/**
 * mpay 迁移流程 E2E 测试
 *
 * 测试从 mpay 迁移钱包数据到 KeyApp 的完整流程
 * 
 * TODO: 这些测试需要 crypto.subtle API，在非 HTTPS 环境下不可用
 * 需要配置 Playwright 使用 HTTPS 或修改测试方法
 */

const TEST_PASSWORD = 'test-password'
const TEST_MNEMONIC =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

// Test address book entries for migration
const TEST_ADDRESS_BOOK_ENTRIES = [
  {
    addressBookId: 'contact-1',
    name: 'Alice',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    chainList: ['Ethereum'],
    remarks: 'My friend Alice',
  },
  {
    addressBookId: 'contact-2',
    name: 'Bob',
    address: 'bfm9876543210fedcba9876543210fedcba987654',
    chainList: ['BFMeta'],
    remarks: 'Business partner',
  },
  {
    addressBookId: 'contact-3',
    name: 'Charlie',
    address: 'TRX12345678901234567890123456789012',
    chainList: ['Tron'],
  },
]

/**
 * 种子 mpay 数据到 IndexedDB
 * 使用 WebCrypto 加密助记词，模拟真实的 mpay 数据格式
 */
async function seedMpayData(page: import('@playwright/test').Page, password: string) {
  await page.evaluate(async (pwd) => {
    const encoder = new TextEncoder()
    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

    // Generate AES-CTR encrypted mnemonic (matches mpay format)
    const keyMaterial = await crypto.subtle.digest('SHA-256', encoder.encode(pwd))
    const key = await crypto.subtle.importKey('raw', keyMaterial, 'AES-CTR', false, ['encrypt'])

    const counter = new Uint8Array(16) // zeros
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CTR', counter, length: 64 },
      key,
      encoder.encode(mnemonic)
    )
    const importPhrase = btoa(String.fromCharCode(...new Uint8Array(encrypted)))

    // Delete existing database first to ensure clean state
    await new Promise<void>((resolve) => {
      const deleteReq = indexedDB.deleteDatabase('walletv2-idb')
      deleteReq.onsuccess = () => resolve()
      deleteReq.onerror = () => resolve() // Ignore errors, proceed anyway
      deleteReq.onblocked = () => resolve()
    })

    // Open IndexedDB and seed mpay data (version 1 to trigger onupgradeneeded)
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('walletv2-idb', 1)
      req.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result
        if (!database.objectStoreNames.contains('mainWallet')) {
          database.createObjectStore('mainWallet', { keyPath: 'walletKey' })
        }
        if (!database.objectStoreNames.contains('chainAddress')) {
          database.createObjectStore('chainAddress', { keyPath: 'addressKey' })
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })

    const tx = db.transaction(['mainWallet', 'chainAddress'], 'readwrite')
    tx.objectStore('mainWallet').put({
      walletKey: 'wallet-1',
      name: 'Test Wallet',
      importPhrase,
      createTime: Date.now(),
    })
    tx.objectStore('chainAddress').put({
      addressKey: 'addr-1',
      walletKey: 'wallet-1',
      chainId: 'ethereum',
      address: '0x9858effd232b4033e47d90003d41ec34ecaeda94',
    })
    await new Promise((r) => {
      tx.oncomplete = r
    })
    db.close()

    // Also seed localStorage settings that mpay uses
    localStorage.setItem(
      '👨‍👩‍👧‍👦walletAppSetting',
      JSON.stringify({
        language: 'zh-CN',
        currency: 'CNY',
      })
    )

    // Clear KeyApp migration status to trigger detection
    localStorage.removeItem('keyapp_migration_status')
  }, password)
}

/**
 * 种子 mpay 地址簿数据到 IndexedDB (chainAddressBook-idb)
 */
async function seedMpayAddressBook(
  page: import('@playwright/test').Page,
  entries: typeof TEST_ADDRESS_BOOK_ENTRIES
) {
  await page.evaluate(async (addressBookEntries) => {
    // Delete existing address book database first
    await new Promise<void>((resolve) => {
      const deleteReq = indexedDB.deleteDatabase('chainAddressBook-idb')
      deleteReq.onsuccess = () => resolve()
      deleteReq.onerror = () => resolve()
      deleteReq.onblocked = () => resolve()
    })

    // Open IndexedDB and seed address book data
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('chainAddressBook-idb', 1)
      req.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result
        if (!database.objectStoreNames.contains('addressBook')) {
          database.createObjectStore('addressBook', { keyPath: 'addressBookId' })
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })

    const tx = db.transaction(['addressBook'], 'readwrite')
    const store = tx.objectStore('addressBook')
    for (const entry of addressBookEntries) {
      store.put(entry)
    }
    await new Promise((r) => {
      tx.oncomplete = r
    })
    db.close()
  }, entries)
}

/**
 * 清除所有数据
 */
async function clearAllData(page: import('@playwright/test').Page) {
  await page.evaluate(async () => {
    // Clear localStorage
    localStorage.clear()

    // Delete IndexedDB
    const databases = await indexedDB.databases()
    for (const db of databases) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name)
      }
    }
  })
}

test.describe.skip('mpay 迁移流程', () => {
  test.beforeEach(async ({ page }) => {
    // 先清除所有数据 - 使用 addInitScript 确保在页面加载前执行
    await page.addInitScript(async () => {
      localStorage.clear()
      const databases = await indexedDB.databases()
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name)
        }
      }
    })
  })

  test('完整迁移流程 - 成功', async ({ page }) => {
    // Seed mpay data
    await seedMpayData(page, TEST_PASSWORD)
    await page.reload() // Trigger MigrationContext re-detection

    // Navigate to migration page
    await page.goto('/#/onboarding/migrate')
    await page.waitForLoadState('networkidle')

    // Step 1: Detected step
    await expect(page.getByTestId('migration-detected-step')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('检测到 mpay 钱包')).toBeVisible()
    await expect(page).toHaveScreenshot('migration-detected.png')

    // Click start migration
    await page.getByTestId('migration-start-btn').click()

    // Step 2: Password step
    await expect(page.getByTestId('migration-password-input')).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveScreenshot('migration-password.png')

    // Enter correct password
    await page.getByTestId('migration-password-input').fill(TEST_PASSWORD)
    await page.getByTestId('migration-password-submit').click()

    // Step 3: Progress step (may be quick, so use shorter timeout)
    const progressStep = page.getByTestId('migration-progress-step')
    // Progress step might complete quickly, so just check it exists or complete step shows
    try {
      await expect(progressStep).toBeVisible({ timeout: 2000 })
      // If visible, take screenshot (mask progress bar for stability)
      await expect(page).toHaveScreenshot('migration-progress.png', {
        mask: [page.getByTestId('migration-progress-bar')],
      })
    } catch {
      // Progress step may have already completed
    }

    // Step 4: Complete step
    await expect(page.getByTestId('migration-complete-step')).toBeVisible({ timeout: 15000 })
    await expect(page).toHaveScreenshot('migration-complete.png')

    // Verify IndexedDB has migrated wallet
    const wallets = await getWalletDataFromIndexedDB(page)
    expect(wallets.length).toBeGreaterThan(0)

    // Verify migration status
    const migrationStatus = await page.evaluate(() =>
      localStorage.getItem('keyapp_migration_status')
    )
    expect(migrationStatus).toBe('completed')

    // Click go home
    await page.getByTestId('migration-go-home-btn').click()
    await page.waitForURL(/\/#?\/?$/)
  })

  test('跳过迁移', async ({ page }) => {
    // Seed mpay data
    await seedMpayData(page, TEST_PASSWORD)
    await page.reload()

    // Navigate to migration page
    await page.goto('/#/onboarding/migrate')
    await page.waitForLoadState('networkidle')

    // Should show detected step
    await expect(page.getByTestId('migration-detected-step')).toBeVisible({ timeout: 10000 })

    // Click skip
    await page.getByTestId('migration-skip-btn').click()

    // Should navigate to wallet create
    await expect(page).toHaveURL('/#/wallet/create')

    // Verify migration status is skipped
    const migrationStatus = await page.evaluate(() =>
      localStorage.getItem('keyapp_migration_status')
    )
    expect(migrationStatus).toBe('skipped')
  })

  // Note: Password verification test was skipped pending AES decryption validation fix - now enabled
  test('密码错误重试', async ({ page }) => {
    // Seed mpay data
    await seedMpayData(page, TEST_PASSWORD)
    await page.reload()

    // Navigate to migration page
    await page.goto('/#/onboarding/migrate')
    await page.waitForLoadState('networkidle')

    // Click start migration
    await expect(page.getByTestId('migration-detected-step')).toBeVisible({ timeout: 10000 })
    await page.getByTestId('migration-start-btn').click()

    // Enter wrong password
    await expect(page.getByTestId('migration-password-input')).toBeVisible({ timeout: 5000 })
    await page.getByTestId('migration-password-input').fill('wrong-password')
    await page.getByTestId('migration-password-submit').click()

    // Wait for error message or for the input to be cleared (which happens after wrong password)
    // The error message should contain "密码错误" and retry count info
    await page.waitForTimeout(1000) // Give time for password verification and error display

    // Check for either error message or that we're still on password step (not progressed)
    const passwordInput = page.getByTestId('migration-password-input')
    await expect(passwordInput).toBeVisible()

    // Try entering correct password now
    await passwordInput.fill(TEST_PASSWORD)
    await page.getByTestId('migration-password-submit').click()

    // Should complete successfully
    await expect(page.getByTestId('migration-complete-step')).toBeVisible({ timeout: 15000 })
  })

  test('无 mpay 数据时显示提示', async ({ page }) => {
    // Navigate to migration page without seeding data
    await page.goto('/#/onboarding/migrate')
    await page.waitForLoadState('networkidle')

    // Should show no data found message
    await expect(page.getByText('未检测到 mpay 钱包数据')).toBeVisible({ timeout: 10000 })
  })

  test('完整迁移流程 - 包含地址簿', async ({ page }) => {
    // Seed mpay wallet data
    await seedMpayData(page, TEST_PASSWORD)

    // Seed mpay address book data
    await seedMpayAddressBook(page, TEST_ADDRESS_BOOK_ENTRIES)

    await page.reload() // Trigger MigrationContext re-detection

    // Navigate to migration page
    await page.goto('/#/onboarding/migrate')
    await page.waitForLoadState('networkidle')

    // Step 1: Detected step - verify address book count is shown
    await expect(page.getByTestId('migration-detected-step')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('检测到 mpay 钱包')).toBeVisible()

    // Click start migration
    await page.getByTestId('migration-start-btn').click()

    // Step 2: Password step
    await expect(page.getByTestId('migration-password-input')).toBeVisible({ timeout: 5000 })
    await page.getByTestId('migration-password-input').fill(TEST_PASSWORD)
    await page.getByTestId('migration-password-submit').click()

    // Wait for migration to complete
    await expect(page.getByTestId('migration-complete-step')).toBeVisible({ timeout: 15000 })

    // Verify IndexedDB has migrated wallet
    const wallets = await getWalletDataFromIndexedDB(page)
    expect(wallets.length).toBeGreaterThan(0)

    // Verify address book data was migrated to localStorage
    const addressBookData = await page.evaluate(() => localStorage.getItem('bfm_address_book'))
    expect(addressBookData).not.toBeNull()

    const parsedAddressBook = JSON.parse(addressBookData!) as Array<{
      id: string
      name: string
      address: string
      chain?: string
      memo?: string
    }>

    // Should have all 3 contacts imported
    expect(parsedAddressBook.length).toBe(3)

    // Verify Alice (Ethereum contact)
    const alice = parsedAddressBook.find((c) => c.name === 'Alice')
    expect(alice).toBeDefined()
    expect(alice!.address).toBe('0x1234567890abcdef1234567890abcdef12345678')
    expect(alice!.chain).toBe('ethereum')
    expect(alice!.memo).toBe('My friend Alice')

    // Verify Bob (BFMeta contact)
    const bob = parsedAddressBook.find((c) => c.name === 'Bob')
    expect(bob).toBeDefined()
    expect(bob!.address).toBe('bfm9876543210fedcba9876543210fedcba987654')
    expect(bob!.chain).toBe('bfmeta')
    expect(bob!.memo).toBe('Business partner')

    // Verify Charlie (Tron contact - no memo)
    const charlie = parsedAddressBook.find((c) => c.name === 'Charlie')
    expect(charlie).toBeDefined()
    expect(charlie!.address).toBe('TRX12345678901234567890123456789012')
    expect(charlie!.chain).toBe('tron')
    expect(charlie!.memo).toBeUndefined()

    // Verify migration status
    const migrationStatus = await page.evaluate(() =>
      localStorage.getItem('keyapp_migration_status')
    )
    expect(migrationStatus).toBe('completed')

    // Click go home
    await page.getByTestId('migration-go-home-btn').click()
    await page.waitForURL(/\/#?\/?$/)
  })
})
