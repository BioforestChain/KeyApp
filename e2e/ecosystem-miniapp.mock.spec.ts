import { test, expect } from '@playwright/test'

/**
 * Bio 小程序生态 E2E 截图测试
 *
 * 测试用户故事并生成截图验证 UI 正确性
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

const TEST_ECOSYSTEM_DATA = {
  sources: [
    {
      url: 'https://localhost:11174/ecosystem.json',
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

test.describe('生态 Tab 截图测试', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('首页 - 生态 Tab 可见', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    
    await expect(page).toHaveScreenshot('01-home-with-ecosystem-tab.png')
  })

  test('生态页面 - 小程序列表', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // 点击生态 Tab (底部导航栏中间的按钮)
    const ecosystemTab = page.locator('text=/生态/i').first()
    await ecosystemTab.click()
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('02-ecosystem-tab-content.png')
  })
})

test.describe('账户选择器截图测试', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('账户选择器页面', async ({ page }) => {
    // 正确的路由格式
    await page.goto('/#/job/account-picker')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    await expect(page).toHaveScreenshot('03-account-picker.png')
  })
})

test.describe('签名确认截图测试', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('签名确认对话框', async ({ page }) => {
    const params = new URLSearchParams({
      message: 'Hello, Bio!',
      address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      appName: '测试小程序',
    })
    // 正确的路由格式
    await page.goto(`/#/job/signing-confirm?${params}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    await expect(page).toHaveScreenshot('04-signing-confirm.png')
  })

  test('点击签名后的钱包锁', async ({ page }) => {
    const params = new URLSearchParams({
      message: 'Test signing',
      address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      appName: '测试',
    })
    await page.goto(`/#/job/signing-confirm?${params}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const signButton = page.locator('button').filter({ hasText: /签名|Sign/i })
    await signButton.click()
    await page.waitForTimeout(800)

    await expect(page).toHaveScreenshot('05-signing-wallet-lock.png')
  })
})

test.describe('转账确认截图测试', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('转账确认对话框', async ({ page }) => {
    const params = new URLSearchParams({
      appName: '一键传送',
      from: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      to: 'c8X7yWePwIqsQxf6R0AwXs8DqQo6Nl6Yz4',
      amount: '10',
      chain: 'bfmeta',
    })
    // 正确的路由格式
    await page.goto(`/#/job/miniapp-transfer-confirm?${params}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    await expect(page).toHaveScreenshot('06-transfer-confirm.png')
  })
})

test.describe('可信源管理截图测试', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('可信源管理页面', async ({ page }) => {
    await page.goto('/#/settings/sources')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    await expect(page).toHaveScreenshot('07-trusted-sources.png')
  })
})

// 多钱包数据
const MULTI_WALLET_DATA = {
  wallets: [
    {
      id: 'wallet-1',
      name: '主钱包',
      keyType: 'mnemonic',
      address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      chain: 'bfmeta',
      chainAddresses: [
        { chain: 'bfmeta', address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3', tokens: [] },
        { chain: 'ethereum', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', tokens: [] },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test', iterations: 100000 },
      createdAt: 1700000000000,
      themeHue: 200,
      tokens: [],
    },
    {
      id: 'wallet-2',
      name: '储蓄钱包',
      keyType: 'mnemonic',
      address: 'c8X7yWePwIqsQxf6R0AwXs8DqQo6Nl6Yz4',
      chain: 'bfmeta',
      chainAddresses: [
        { chain: 'bfmeta', address: 'c8X7yWePwIqsQxf6R0AwXs8DqQo6Nl6Yz4', tokens: [] },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test', iterations: 100000 },
      createdAt: 1700000001000,
      themeHue: 120,
      tokens: [],
    },
    {
      id: 'wallet-3',
      name: 'ETH 钱包',
      keyType: 'mnemonic',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      chain: 'ethereum',
      chainAddresses: [
        { chain: 'ethereum', address: '0xabcdef1234567890abcdef1234567890abcdef12', tokens: [] },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test', iterations: 100000 },
      createdAt: 1700000002000,
      themeHue: 280,
      tokens: [],
    },
  ],
  currentWalletId: 'wallet-1',
  selectedChain: 'bfmeta',
  chainPreferences: {},
  isLoading: false,
  isInitialized: true,
}

test.describe('多钱包场景截图测试', () => {
  test('多钱包账户选择器', async ({ page }) => {
    await page.addInitScript((data) => {
      localStorage.clear()
      localStorage.setItem('bfm_wallets', JSON.stringify(data))
    }, MULTI_WALLET_DATA)

    await page.goto('/#/job/account-picker')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    await expect(page).toHaveScreenshot('08-multi-wallet-picker.png')
  })

  test('按链过滤账户选择器', async ({ page }) => {
    await page.addInitScript((data) => {
      localStorage.clear()
      localStorage.setItem('bfm_wallets', JSON.stringify(data))
    }, MULTI_WALLET_DATA)

    await page.goto('/#/job/account-picker?chain=ethereum')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    await expect(page).toHaveScreenshot('09-ethereum-only-picker.png')
  })
})

test.describe('签名消息变体截图测试', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('长消息签名', async ({ page }) => {
    const longMessage = 'This is a very long message that needs to be signed. It contains important information about the transaction.'
    const params = new URLSearchParams({
      message: longMessage,
      address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      appName: 'DeFi Protocol',
    })
    await page.goto(`/#/job/signing-confirm?${params}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    await expect(page).toHaveScreenshot('10-long-message-signing.png')
  })
})

test.describe('转账金额变体截图测试', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('大额转账', async ({ page }) => {
    const params = new URLSearchParams({
      appName: '交易所提现',
      from: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      to: 'c8X7yWePwIqsQxf6R0AwXs8DqQo6Nl6Yz4',
      amount: '999999.12345678',
      chain: 'bfmeta',
    })
    await page.goto(`/#/job/miniapp-transfer-confirm?${params}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    await expect(page).toHaveScreenshot('11-large-amount-transfer.png')
  })

  test('小数转账', async ({ page }) => {
    const params = new URLSearchParams({
      appName: 'Micropayment',
      from: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      to: 'c8X7yWePwIqsQxf6R0AwXs8DqQo6Nl6Yz4',
      amount: '0.00000001',
      chain: 'bfmeta',
    })
    await page.goto(`/#/job/miniapp-transfer-confirm?${params}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    await expect(page).toHaveScreenshot('12-small-amount-transfer.png')
  })
})

// ============================================
// 权限请求测试
// ============================================

test.describe('权限请求截图测试', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('权限请求对话框', async ({ page }) => {
    const params = new URLSearchParams({
      appName: '测试小程序',
      permissions: JSON.stringify(['bio_signMessage', 'bio_sendTransaction']),
    })
    await page.goto(`/#/job/permission-request?${params}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    await expect(page).toHaveScreenshot('13-permission-request.png')
  })
})

// ============================================
// 空状态测试
// ============================================

const EMPTY_WALLET_DATA = {
  wallets: [],
  currentWalletId: null,
  selectedChain: 'bfmeta',
  chainPreferences: {},
  isLoading: false,
  isInitialized: true,
}

test.describe('空状态截图测试', () => {
  test('无钱包时的账户选择器', async ({ page }) => {
    await page.addInitScript((data) => {
      localStorage.clear()
      localStorage.setItem('bfm_wallets', JSON.stringify(data))
    }, EMPTY_WALLET_DATA)

    await page.goto('/#/job/account-picker')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    await expect(page).toHaveScreenshot('14-empty-wallet-picker.png')
  })
})

// ============================================
// 十六进制数据签名（带警告）
// ============================================

test.describe('安全警告截图测试', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('十六进制数据签名警告', async ({ page }) => {
    // 十六进制数据会触发警告
    const hexMessage = '0x4e6f7420612076616c69642045495020373132207479706564206461746120616e64207369676e207479706564206461746120763420646f65736e277420776f726b'
    const params = new URLSearchParams({
      message: hexMessage,
      address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      appName: '未知 DApp',
    })
    await page.goto(`/#/job/signing-confirm?${params}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)

    await expect(page).toHaveScreenshot('15-hex-data-warning.png')
  })
})

// ============================================
// 交互流程测试（功能验证，不只是截图）
// ============================================

test.describe('取消操作流程测试', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('取消签名应触发事件', async ({ page }) => {
    const params = new URLSearchParams({
      message: 'Test',
      address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      appName: '测试',
    })
    await page.goto(`/#/job/signing-confirm?${params}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // 监听事件
    const eventPromise = page.evaluate(() => {
      return new Promise((resolve) => {
        window.addEventListener('signing-confirm', (e: Event) => {
          resolve((e as CustomEvent).detail)
        }, { once: true })
      })
    })

    // 点击取消
    const cancelButton = page.locator('button').filter({ hasText: /取消|Cancel/i })
    await cancelButton.click()

    // 验证事件
    const eventDetail = await eventPromise
    expect(eventDetail).toEqual({ confirmed: false })
  })

  test('取消转账应触发事件', async ({ page }) => {
    const params = new URLSearchParams({
      appName: '测试',
      from: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      to: 'c8X7yWePwIqsQxf6R0AwXs8DqQo6Nl6Yz4',
      amount: '10',
      chain: 'bfmeta',
    })
    await page.goto(`/#/job/miniapp-transfer-confirm?${params}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // 监听事件
    const eventPromise = page.evaluate(() => {
      return new Promise((resolve) => {
        window.addEventListener('miniapp-transfer-confirm', (e: Event) => {
          resolve((e as CustomEvent).detail)
        }, { once: true })
      })
    })

    // 点击取消
    const cancelButton = page.locator('button').filter({ hasText: /取消|Cancel/i })
    await cancelButton.click()

    // 验证事件
    const eventDetail = await eventPromise
    expect(eventDetail).toEqual({ confirmed: false })
  })

  test('取消账户选择应触发事件', async ({ page }) => {
    await page.goto('/#/job/account-picker')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // 监听事件
    const eventPromise = page.evaluate(() => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 3000)
        window.addEventListener('account-picker-cancel', () => {
          clearTimeout(timeout)
          resolve(true)
        }, { once: true })
      })
    })

    // 点击取消
    const cancelButton = page.locator('button').filter({ hasText: /取消|Cancel/i })
    await cancelButton.click()

    // 验证事件触发
    await expect(eventPromise).resolves.toBe(true)
  })
})

test.describe('账户选择流程测试', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('选择账户应触发事件并返回正确数据', async ({ page }) => {
    await page.goto('/#/job/account-picker')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // 监听事件
    const eventPromise = page.evaluate(() => {
      return new Promise((resolve) => {
        window.addEventListener('account-picker-select', (e: Event) => {
          resolve((e as CustomEvent).detail)
        }, { once: true })
      })
    })

    // 点击钱包
    const walletButton = page.locator('button').filter({ hasText: '测试钱包' })
    await walletButton.click()

    // 验证事件数据
    const eventDetail = await eventPromise
    expect(eventDetail).toMatchObject({
      address: expect.any(String),
      chain: expect.any(String),
      name: '测试钱包',
    })
  })
})

// ============================================
// 地址复制功能测试
// ============================================

test.describe('地址复制功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await injectTestData(page)
  })

  test('转账确认页地址可复制', async ({ page }) => {
    const params = new URLSearchParams({
      appName: '测试',
      from: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      to: 'c8X7yWePwIqsQxf6R0AwXs8DqQo6Nl6Yz4',
      amount: '10',
      chain: 'bfmeta',
    })
    await page.goto(`/#/job/miniapp-transfer-confirm?${params}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // 点击复制按钮（AddressDisplay 有复制图标）
    const copyButtons = page.locator('button[aria-label*="复制"], button[aria-label*="Copy"]')
    const count = await copyButtons.count()
    
    // 应该有两个复制按钮（from 和 to）
    expect(count).toBeGreaterThanOrEqual(2)
  })
})
