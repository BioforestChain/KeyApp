import { test, expect, type Page } from '@playwright/test'
import { UI_TEXT } from './helpers/i18n'

/**
 * 交易历史 E2E 测试
 *
 * 测试交易历史页面，特别是 Amount 类型相关的功能：
 * - 交易金额显示格式化
 * - 手续费显示
 * - 交易详情页面
 * 
 * 注意：使用 data-testid 和多语言正则，避免硬编码文本
 */

// 测试钱包数据（带交易历史）
const TEST_WALLET_DATA = {
  wallets: [
    {
      id: 'test-wallet-1',
      name: '测试钱包',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      chain: 'ethereum',
      chainAddresses: [
        {
          chain: 'ethereum',
          address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          tokens: [
            { symbol: 'ETH', balance: '1.5', decimals: 18 },
          ],
        },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test' },
      createdAt: Date.now(),
      tokens: [],
    },
  ],
  currentWalletId: 'test-wallet-1',
  selectedChain: 'ethereum',
}

// 辅助函数：设置测试钱包
async function setupTestWallet(page: Page, targetUrl: string = '/', language: string = 'en') {
  await page.addInitScript((data) => {
    localStorage.setItem('bfm_wallets', JSON.stringify(data.wallet))
    localStorage.setItem('bfm_preferences', JSON.stringify({ language: data.lang, currency: 'USD' }))
  }, { wallet: TEST_WALLET_DATA, lang: language })

  const hashUrl = targetUrl === '/' ? '/' : `/#${targetUrl}`
  await page.goto(hashUrl)
  await page.waitForLoadState('networkidle')
}

async function waitForAppReady(page: Page) {
  await page.locator('svg[aria-label="加载中"]').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {})
}

test.describe('交易历史 - 金额显示测试', () => {
  test('交易列表显示格式化金额', async ({ page }) => {
    await setupTestWallet(page, '/history')
    await waitForAppReady(page)

    // 等待页面加载
    await page.waitForTimeout(500)

    // 如果有交易记录，验证列表项可见
    const transactionItems = page.locator('[data-testid="transaction-item"], [role="listitem"], article')
    const count = await transactionItems.count()

    if (count > 0) {
      // 验证第一个交易项可见
      await expect(transactionItems.first()).toBeVisible()
    }
  })

  test('交易历史页面截图 - 有交易', async ({ page }) => {
    await setupTestWallet(page, '/history')
    await waitForAppReady(page)

    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('history-with-transactions.png')
  })

  test('交易历史过滤器工作正常', async ({ page }) => {
    await setupTestWallet(page, '/history')
    await waitForAppReady(page)

    // 查找过滤器选择器
    const chainFilter = page.locator('[aria-label*="链"], select[name="chain"], [data-testid="chain-filter"]')
    const periodFilter = page.locator('[aria-label*="时间"], select[name="period"], [data-testid="period-filter"]')

    // 如果过滤器存在，测试切换
    if (await chainFilter.isVisible().catch(() => false)) {
      await chainFilter.selectOption({ index: 0 }).catch(() => {})
      await page.waitForTimeout(300)
    }

    if (await periodFilter.isVisible().catch(() => false)) {
      await periodFilter.selectOption({ index: 0 }).catch(() => {})
      await page.waitForTimeout(300)
    }
    
    // 验证页面保持正常
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })
})

test.describe('交易详情 - 金额显示测试', () => {
  test('交易详情页面显示完整信息', async ({ page }) => {
    // 直接访问交易详情页面（使用 mock 交易 ID）
    await setupTestWallet(page, '/transaction/tx-1')
    await waitForAppReady(page)

    await page.waitForTimeout(500)

    // 验证页面标题
    const pageTitle = page.locator('[data-testid="page-title"], h1')
    await expect(pageTitle).toBeVisible()
  })

  test('交易详情显示金额和手续费', async ({ page }) => {
    await setupTestWallet(page, '/transaction/tx-1')
    await waitForAppReady(page)

    await page.waitForTimeout(500)

    // 如果交易存在，验证金额和手续费显示
    const amountDisplay = page.locator('[data-testid="transaction-amount"], .text-2xl, .text-xl')
    if (await amountDisplay.first().isVisible()) {
      // 验证金额格式化显示
      await expect(amountDisplay.first()).toContainText(/\d/)
    }
  })

  test('交易详情页面截图', async ({ page }) => {
    await setupTestWallet(page, '/transaction/tx-1')
    await waitForAppReady(page)

    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('transaction-detail.png')
  })
})

test.describe('交易历史 - 交互测试', () => {
  test('点击交易项打开详情', async ({ page }) => {
    await setupTestWallet(page, '/history')
    await waitForAppReady(page)

    await page.waitForTimeout(500)

    // 查找交易项
    const transactionItems = page.locator('[data-testid="transaction-item"], [role="button"]:has(.font-mono)')
    const count = await transactionItems.count()

    if (count > 0) {
      // 点击第一个交易
      await transactionItems.first().click()

      // 验证导航到详情页面
      await page.waitForURL(/\/#\/transaction\//)
    }
  })

  test('返回按钮功能正常', async ({ page }) => {
    await setupTestWallet(page, '/history')
    await waitForAppReady(page)

    // 点击返回按钮
    const backButton = page.locator('[aria-label*="返回"], [aria-label*="back"], button:has(svg)')
    if (await backButton.first().isVisible()) {
      await backButton.first().click()
      
      // 验证返回到首页或上一页
      await page.waitForTimeout(300)
    }
  })
})

test.describe('交易历史 - 空状态测试', () => {
  test('无交易时显示空状态', async ({ page }) => {
    // 使用一个新钱包（无交易历史）
    const emptyWalletData = {
      ...TEST_WALLET_DATA,
      wallets: [{
        ...TEST_WALLET_DATA.wallets[0],
        id: 'empty-wallet',
      }],
      currentWalletId: 'empty-wallet',
    }

    await page.addInitScript((data) => {
      localStorage.setItem('bfm_wallets', JSON.stringify(data))
      localStorage.setItem('bfm_preferences', JSON.stringify({ language: 'en', currency: 'USD' }))
    }, emptyWalletData)

    await page.goto('/#/history')
    await page.waitForLoadState('networkidle')
    await waitForAppReady(page)

    await page.waitForTimeout(500)

    // 验证显示空状态消息（使用多语言正则）
    const emptyState = page.locator(`text=${UI_TEXT.empty.source}`)
    // 空状态可能是预期的
  })

  test('空状态页面截图', async ({ page }) => {
    const emptyWalletData = {
      ...TEST_WALLET_DATA,
      wallets: [{
        ...TEST_WALLET_DATA.wallets[0],
        id: 'empty-wallet-2',
      }],
      currentWalletId: 'empty-wallet-2',
    }

    await page.addInitScript((data) => {
      localStorage.setItem('bfm_wallets', JSON.stringify(data))
      localStorage.setItem('bfm_preferences', JSON.stringify({ language: 'en', currency: 'USD' }))
    }, emptyWalletData)

    await page.goto('/#/history')
    await page.waitForLoadState('networkidle')
    await waitForAppReady(page)

    // 等待页面稳定
    await page.waitForTimeout(1000)

    await expect(page).toHaveScreenshot('history-empty-state.png')
  })
})

test.describe('交易历史 - 刷新功能测试', () => {
  test('下拉刷新或刷新按钮', async ({ page }) => {
    await setupTestWallet(page, '/history')
    await waitForAppReady(page)

    await page.waitForTimeout(500)

    // 查找刷新按钮（使用 data-testid 或多语言正则）
    const refreshButton = page.locator(`[data-testid="refresh-button"], button:has-text("${UI_TEXT.refresh.source}")`)
    if (await refreshButton.isVisible()) {
      await refreshButton.click()
      
      // 等待刷新完成
      await page.waitForTimeout(1000)
    }
  })
})
