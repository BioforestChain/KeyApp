import { test, expect, type Page } from '@playwright/test'

/**
 * 页面截图 E2E 测试
 *
 * 用于视觉回归测试，确保 UI 变更不会破坏设计
 */

// 测试钱包数据（包含 BioForest 链）
const TEST_WALLET_DATA = {
  wallets: [
    {
      id: 'test-wallet-1',
      name: '测试钱包',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      chain: 'ethereum',
      chainAddresses: [
        { chain: 'ethereum', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', tokens: [] },
        { chain: 'bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', tokens: [] },
        { chain: 'tron', address: 'TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW', tokens: [] },
        { chain: 'bfmeta', address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3', tokens: [] },
        { chain: 'pmchain', address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3', tokens: [] },
        { chain: 'ccchain', address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3', tokens: [] },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test' },
      createdAt: Date.now(),
      tokens: [],
    },
  ],
  currentWalletId: 'test-wallet-1',
  selectedChain: 'ethereum',
}

async function waitForAppReady(page: Page) {
  // Some routes are lazy-loaded; when the bundle is cached, `networkidle` can fire before
  // Suspense resolves. Waiting for the global loading spinner to disappear makes screenshots stable.
  await page.locator('svg[aria-label="加载中"]').waitFor({ state: 'hidden', timeout: 10_000 })
}

// 辅助函数：在页面加载前注入钱包数据
async function setupTestWallet(page: Page, targetUrl: string = '/') {
  // Use addInitScript to inject localStorage BEFORE the page loads.
  // This ensures Stackflow reads wallet data on initial activity construction.
  await page.addInitScript((data) => {
    localStorage.setItem('bfm_wallets', JSON.stringify(data))
  }, TEST_WALLET_DATA)
  
  // Navigate directly to target URL with hash routing
  const hashUrl = targetUrl === '/' ? '/' : `/#${targetUrl}`
  await page.goto(hashUrl)
  await page.waitForLoadState('networkidle')
}

test.describe('首页', () => {
  test('有钱包状态 - 截图', async ({ page }) => {
    await setupTestWallet(page)
    await waitForAppReady(page)

    await expect(page).toHaveScreenshot('home-with-wallet.png', {
      mask: [page.locator('[data-testid="address-display"]')],
    })
  })

  test('链切换底部弹窗', async ({ page }) => {
    await setupTestWallet(page)

    // 打开链切换弹窗
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')

    await expect(page).toHaveScreenshot('home-chain-selector.png', {
      mask: [page.locator('[data-testid="address-display"]')],
    })
  })

  test('链切换功能验证', async ({ page }) => {
    await setupTestWallet(page)

    // 记录初始地址
    const initialAddress = await page.locator('.font-mono').first().textContent()

    // 打开链切换弹窗
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')

    // 选择 BFMeta 链
    await page.click('text=BFMeta')

    // 等待弹窗关闭
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })

    // 验证链选择器显示 BFMeta
    await expect(page.locator('[data-testid="chain-selector"]')).toContainText('BFMeta')

    // 地址应该改变（BioForest 地址以 'c' 开头）
    const newAddress = await page.locator('.font-mono').first().textContent()
    expect(newAddress).not.toBe(initialAddress)
  })
})

test.describe('收款页面', () => {
  test('收款页面截图', async ({ page }) => {
    await setupTestWallet(page, '/receive')
    await waitForAppReady(page)
    
    await expect(page).toHaveScreenshot('receive-page.png', {
      // QR 码内容会变化，使用 mask
      mask: [page.locator('svg[role="img"]')],
    })
  })
})

test.describe('发送页面', () => {
  test('发送页面 - 空状态', async ({ page }) => {
    await setupTestWallet(page, '/send')
    await waitForAppReady(page)
    // Verify we are on the Send page (PageHeader title)
    await expect(page.locator('h1:has-text("发送")')).toBeVisible({ timeout: 10000 })

    await expect(page).toHaveScreenshot('send-empty.png')
  })

  test('发送页面 - 填写表单', async ({ page }) => {
    await setupTestWallet(page, '/send')
    await waitForAppReady(page)
    // Verify we are on the Send page (PageHeader title)
    await expect(page.locator('h1:has-text("发送")')).toBeVisible({ timeout: 10000 })

    // 使用 placeholder 属性选择器（SendPage 使用动态 placeholder）
    const addressInput = page.locator('input[placeholder*="地址"]')
    const amountInput = page.locator('input[placeholder="0"]')

    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')
    await amountInput.fill('100')

    await expect(page).toHaveScreenshot('send-filled.png')
  })

  test.skip('发送页面 - 余额不足警告', async ({ page }) => {
    // TODO: Fix button locator - "确认发送" button text may have changed
    await setupTestWallet(page)
    await page.goto('/#/send')
    await page.waitForSelector('text=发送')

    const addressInput = page.locator('input[placeholder*="地址"]')
    const amountInput = page.locator('input[placeholder="0"]')

    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')
    await amountInput.fill('999999')

    // 验证余额不足警告显示
    await expect(page.locator('text=余额不足')).toBeVisible()
    await expect(page).toHaveScreenshot('send-insufficient-balance.png')
  })

  test.skip('发送页面 - 功能验证', async ({ page }) => {
    // TODO: Fix button locator - "确认发送" button text may have changed
    await setupTestWallet(page)
    await page.goto('/#/send')
    await page.waitForSelector('text=发送')

    const addressInput = page.locator('input[placeholder*="地址"]')
    const amountInput = page.locator('input[placeholder="0"]')

    // 验证确认按钮初始禁用
    const sendBtn = page.locator('button:has-text("确认发送")')
    await expect(sendBtn).toBeDisabled()

    // 填写地址
    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')
    await expect(sendBtn).toBeDisabled() // 还没填金额

    // 填写金额
    await amountInput.fill('10')
    await expect(sendBtn).toBeEnabled() // 现在应该启用

    // 验证当前链信息显示（使用精确选择器避免匹配提示文本）
    await expect(page.locator('.text-sm.font-medium:has-text("Ethereum")')).toBeVisible()
  })
})

test.describe('代币详情页面', () => {
  test('代币详情截图', async ({ page }) => {
    await setupTestWallet(page, '/token/usdt')
    await waitForAppReady(page)
    
    await expect(page).toHaveScreenshot('token-detail.png')
  })
})

test.describe('钱包详情页面', () => {
  test('钱包详情截图', async ({ page }) => {
    await setupTestWallet(page, '/wallet/test-wallet-1')
    await waitForAppReady(page)

    await expect(page).toHaveScreenshot('wallet-detail.png', {
      mask: [page.locator('[data-testid="address-display"]')],
    })
  })
})

test.describe('设置页面', () => {
  test('设置主页截图', async ({ page }) => {
    await setupTestWallet(page, '/settings')
    await waitForAppReady(page)

    await expect(page).toHaveScreenshot('settings-main.png')
  })

  test('链配置截图', async ({ page }) => {
    await setupTestWallet(page, '/settings/chains')
    await waitForAppReady(page)

    await expect(page).toHaveScreenshot('settings-chains.png')
  })

  test('语言设置截图', async ({ page }) => {
    await setupTestWallet(page, '/settings/language')
    await waitForAppReady(page)

    await expect(page).toHaveScreenshot('settings-language.png')
  })

  test('货币设置截图', async ({ page }) => {
    await setupTestWallet(page, '/settings/currency')
    await waitForAppReady(page)

    await expect(page).toHaveScreenshot('settings-currency.png')
  })
})

test.describe('交易历史页面', () => {
  test('历史页面截图 - 空状态', async ({ page }) => {
    await setupTestWallet(page, '/history')
    await waitForAppReady(page)

    await expect(page).toHaveScreenshot('history-empty.png')
  })
})

test.describe('通知页面', () => {
  test('通知中心截图 - 空状态', async ({ page }) => {
    await setupTestWallet(page, '/notifications')
    await waitForAppReady(page)

    await expect(page).toHaveScreenshot('notifications-empty.png')
  })
})

test.describe('地址簿页面', () => {
  test('地址簿截图 - 空状态', async ({ page }) => {
    await setupTestWallet(page, '/address-book')
    await waitForAppReady(page)

    await expect(page).toHaveScreenshot('address-book-empty.png')
  })
})

test.describe('钱包列表页面', () => {
  test('钱包列表截图', async ({ page }) => {
    await setupTestWallet(page, '/wallet/list')
    await waitForAppReady(page)

    await expect(page).toHaveScreenshot('wallet-list.png', {
      mask: [page.locator('[data-testid="address-display"]')],
    })
  })
})
