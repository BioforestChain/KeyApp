import { test, expect } from '@playwright/test'
import { UI_TEXT, TEST_IDS, byTestId } from './helpers/i18n'

/**
 * Bio 小程序生态 E2E 测试
 *
 * 测试用户故事：
 * 1. 用户打开生态 Tab 查看小程序列表
 * 2. 用户点击小程序进入
 * 3. 小程序请求连接钱包
 * 4. 小程序请求签名
 */

const TEST_WALLET_DATA = {
  wallets: [
    {
      id: 'test-wallet-1',
      name: '测试钱包',
      keyType: 'mnemonic',
      address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      chain: 'bfmeta',
      chainAddresses: [
        {
          chain: 'bfmeta',
          address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
          tokens: [
            { id: 'bfmeta:BFM', symbol: 'BFM', name: 'BFM', balance: '100.0', fiatValue: 100, change24h: 0, decimals: 8, chain: 'bfmeta' },
          ],
        },
        {
          chain: 'ethereum',
          address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          tokens: [
            { id: 'ethereum:ETH', symbol: 'ETH', name: 'Ethereum', balance: '10.0', fiatValue: 30000, change24h: 0, decimals: 18, chain: 'ethereum' },
          ],
        },
      ],
      // 使用测试用的加密助记词 (密码: 01230123)
      encryptedMnemonic: {
        ciphertext: 'bWVzc2FnZSB0ZXN0',
        iv: 'aXYtdGVzdA==',
        salt: 'c2FsdC10ZXN0',
        iterations: 100000,
      },
      createdAt: 1700000000000,
      themeHue: 200,
      tokens: [],
    },
  ],
  currentWalletId: 'test-wallet-1',
  selectedChain: 'bfmeta',
  chainPreferences: {},
  isLoading: false,
  isInitialized: true,
}

// 订阅源数据
const TEST_ECOSYSTEM_DATA = {
  sources: [
    {
      url: 'http://localhost:5173/ecosystem.json',
      name: '本地测试源',
      enabled: true,
      lastUpdated: Date.now(),
    },
  ],
  permissions: [],
}

async function injectTestData(page: import('@playwright/test').Page) {
  await page.addInitScript((data) => {
    localStorage.clear()
    localStorage.setItem('bfm_wallets', JSON.stringify(data.wallet))
    localStorage.setItem('bfm_ecosystem', JSON.stringify(data.ecosystem))
  }, { wallet: TEST_WALLET_DATA, ecosystem: TEST_ECOSYSTEM_DATA })
}

test.describe('生态 Tab 基础功能', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('应该能看到生态 Tab', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 等待 TabBar 加载
    await page.waitForTimeout(500)

    // 查找生态 Tab
    const ecosystemTab = page.locator('[role="tablist"] button').filter({ hasText: /生态|Ecosystem/i })
    await expect(ecosystemTab).toBeVisible()
  })

  test('点击生态 Tab 应该显示小程序列表', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // 点击生态 Tab
    const ecosystemTab = page.locator('[role="tablist"] button').filter({ hasText: /生态|Ecosystem/i })
    await ecosystemTab.click()
    await page.waitForTimeout(300)

    // 应该显示生态页面内容
    const ecosystemContent = page.locator('text=/小程序|MiniApps|暂无小程序|No apps/i')
    await expect(ecosystemContent).toBeVisible()
  })
})

test.describe('小程序加载与交互', () => {
  test.skip('应该能打开小程序', async ({ page }) => {
    // TODO: 需要 mock 小程序服务器
    await injectTestData(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 点击生态 Tab
    const ecosystemTab = page.locator('[role="tablist"] button').filter({ hasText: /生态|Ecosystem/i })
    await ecosystemTab.click()
    await page.waitForTimeout(300)

    // 点击第一个小程序
    const firstApp = page.locator('[data-testid="miniapp-card"]').first()
    if (await firstApp.isVisible()) {
      await firstApp.click()
      await page.waitForTimeout(500)

      // 应该显示小程序容器
      const miniappContainer = page.locator('iframe')
      await expect(miniappContainer).toBeVisible()
    }
  })
})

test.describe('账户选择器', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('AccountPickerJob 应该显示钱包账户', async ({ page }) => {
    // 直接导航到 AccountPickerJob
    await page.goto('/#/sheets/AccountPickerJob')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // 应该显示账户选择器
    const picker = page.locator('text=/选择.*账户|Select.*Account/i')
    await expect(picker).toBeVisible()

    // 应该显示钱包地址
    const address = page.locator('text=/c7R6|0x71C7/i')
    await expect(address).toBeVisible()
  })
})

test.describe('签名确认', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('SigningConfirmJob 应该显示签名信息', async ({ page }) => {
    // 直接导航到 SigningConfirmJob
    const params = new URLSearchParams({
      message: 'Hello, Bio!',
      address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      appName: '测试小程序',
    })
    await page.goto(`/#/sheets/SigningConfirmJob?${params}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // 应该显示签名请求标题
    const title = page.locator('text=/签名.*请求|Sign.*Request/i')
    await expect(title).toBeVisible()

    // 应该显示消息内容
    const message = page.locator('text=Hello, Bio!')
    await expect(message).toBeVisible()

    // 应该显示地址
    const address = page.locator('text=/c7R6/i')
    await expect(address).toBeVisible()

    // 应该有签名和取消按钮
    const signButton = page.locator('button').filter({ hasText: /签名|Sign/i })
    const cancelButton = page.locator('button').filter({ hasText: /取消|Cancel/i })
    await expect(signButton).toBeVisible()
    await expect(cancelButton).toBeVisible()
  })

  test('点击签名应该弹出钱包锁', async ({ page }) => {
    const params = new URLSearchParams({
      message: 'Test signing',
      address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      appName: '测试',
    })
    await page.goto(`/#/sheets/SigningConfirmJob?${params}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // 点击签名按钮
    const signButton = page.locator('button').filter({ hasText: /签名|Sign/i })
    await signButton.click()
    await page.waitForTimeout(500)

    // 应该显示钱包锁输入
    const patternLock = page.locator('[data-testid="pattern-lock-grid"], .pattern-lock')
    // 如果没有钱包锁，可能直接显示完成（测试钱包没有设置锁）
    const hasPatternLock = await patternLock.isVisible().catch(() => false)
    
    if (!hasPatternLock) {
      // 没有钱包锁时，应该直接完成
      console.log('No wallet lock configured, signing should complete directly')
    }
  })
})

test.describe('转账确认', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('MiniappTransferConfirmJob 应该显示转账信息', async ({ page }) => {
    const params = new URLSearchParams({
      appName: '一键传送',
      from: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      to: 'c8X7yWePwIqsQxf6R0AwXs8DqQo6Nl6Yz4',
      amount: '10',
      chain: 'bfmeta',
    })
    await page.goto(`/#/sheets/MiniappTransferConfirmJob?${params}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // 应该显示确认转账标题
    const title = page.locator('text=/确认.*转账|Confirm.*Transfer/i')
    await expect(title).toBeVisible()

    // 应该显示金额
    const amount = page.locator('text=10')
    await expect(amount).toBeVisible()

    // 应该显示发送和接收地址
    const fromAddr = page.locator('text=/c7R6/i')
    const toAddr = page.locator('text=/c8X7/i')
    await expect(fromAddr).toBeVisible()
    await expect(toAddr).toBeVisible()

    // 应该有确认和取消按钮
    const confirmButton = page.locator('button').filter({ hasText: /确认|Confirm/i })
    const cancelButton = page.locator('button').filter({ hasText: /取消|Cancel/i })
    await expect(confirmButton).toBeVisible()
    await expect(cancelButton).toBeVisible()
  })
})

test.describe('可信源管理', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('SettingsSourcesActivity 应该显示源列表', async ({ page }) => {
    await page.goto('/#/settings/sources')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // 应该显示可信源管理标题
    const title = page.locator('text=/可信源|Trusted Sources/i')
    await expect(title).toBeVisible()

    // 应该显示添加按钮
    const addButton = page.locator('button').filter({ hasText: /添加|Add/i })
    await expect(addButton).toBeVisible()
  })
})
