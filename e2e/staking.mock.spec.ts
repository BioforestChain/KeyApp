import { test, expect } from './fixtures'

/**
 * Staking 页面 E2E 测试
 *
 * 测试质押功能的 UI 和交互流程
 */

// 测试钱包数据
const TEST_WALLET_DATA = {
  wallets: [
    {
      id: 'test-wallet-1',
      name: '测试钱包',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      chain: 'ethereum',
      chainAddresses: [
        { chain: 'ethereum', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', tokens: [] },
        { chain: 'bfmeta', address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3', tokens: [] },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test' },
      createdAt: Date.now(),
      tokens: [],
    },
  ],
  currentWalletId: 'test-wallet-1',
  selectedChain: 'ethereum',
}

// 辅助函数：设置测试钱包并设置英文语言
async function setupTestWallet(page: import('@playwright/test').Page, targetUrl: string = '/') {
  await page.addInitScript((data) => {
    localStorage.setItem('bfm_wallets', JSON.stringify(data))
    // 设置英文语言以确保测试一致性
    localStorage.setItem('bfm_preferences', JSON.stringify({ language: 'en', currency: 'USD' }))
  }, TEST_WALLET_DATA)
  
  const hashUrl = targetUrl === '/' ? '/' : `/#${targetUrl}`
  await page.goto(hashUrl)
  await page.waitForLoadState('networkidle')
}

test.describe('质押页面 - 截图测试', () => {
  test('质押概览页面截图', async ({ page }) => {
    await setupTestWallet(page, '/staking')

    // 等待页面标题加载
    await page.waitForSelector('h1', { timeout: 10000 })

    await expect(page).toHaveScreenshot('staking-overview.png')
  })

  test('质押 Mint 页面截图', async ({ page }) => {
    await setupTestWallet(page, '/staking')

    // 点击第二个标签（Mint）
    const tabs = page.locator('.border-b button')
    await tabs.nth(1).click()

    // 等待 Mint 表单加载
    await page.waitForSelector('input[placeholder="0.00"]', { timeout: 10000 })

    await expect(page).toHaveScreenshot('staking-mint.png')
  })

  test('质押 Burn 页面截图', async ({ page }) => {
    await setupTestWallet(page, '/staking')

    // 点击第三个标签（Burn）
    const tabs = page.locator('.border-b button')
    await tabs.nth(2).click()

    // 等待 Burn 表单加载
    await page.waitForSelector('input[placeholder="0.00"]', { timeout: 10000 })

    await expect(page).toHaveScreenshot('staking-burn.png')
  })

  test('质押历史页面截图', async ({ page }) => {
    await setupTestWallet(page, '/staking')

    // 点击第四个标签（History）
    const tabs = page.locator('.border-b button')
    await tabs.nth(3).click()

    // 等待历史列表加载
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('staking-history.png')
  })
})

test.describe('质押页面 - 功能测试', () => {
  test('标签切换功能', async ({ page }) => {
    await setupTestWallet(page, '/staking')

    const tabs = page.locator('.border-b button')

    // 验证有 4 个标签
    await expect(tabs).toHaveCount(4)

    // 切换到 Mint（第2个标签）
    await tabs.nth(1).click()
    await expect(page.locator('input[placeholder="0.00"]')).toBeVisible()

    // 切换到 Burn（第3个标签）
    await tabs.nth(2).click()
    await expect(page.locator('input[placeholder="0.00"]')).toBeVisible()

    // 切换到 History（第4个标签）
    await tabs.nth(3).click()
    await page.waitForTimeout(300)

    // 切换回 Overview（第1个标签）
    await tabs.nth(0).click()
    await page.waitForTimeout(300)
  })

  test('Mint 表单 - 金额输入', async ({ page }) => {
    await setupTestWallet(page, '/staking')

    // 切换到 Mint 标签
    const tabs = page.locator('.border-b button')
    await tabs.nth(1).click()

    // 等待表单加载
    await page.waitForSelector('input[placeholder="0.00"]', { timeout: 10000 })

    // 找到确认按钮（最后一个主要按钮）
    const confirmBtn = page.locator('button.w-full').last()
    await expect(confirmBtn).toBeDisabled()

    // 输入金额
    const amountInput = page.locator('input[placeholder="0.00"]')
    await amountInput.fill('100')

    // 确认按钮应该启用
    await expect(confirmBtn).toBeEnabled()
  })

  test('Mint 表单 - 余额不足验证', async ({ page }) => {
    await setupTestWallet(page, '/staking')

    // 切换到 Mint 标签
    const tabs = page.locator('.border-b button')
    await tabs.nth(1).click()

    await page.waitForSelector('input[placeholder="0.00"]', { timeout: 10000 })

    // 输入超大金额
    const amountInput = page.locator('input[placeholder="0.00"]')
    await amountInput.fill('999999999')

    // 应该显示余额不足提示
    await expect(page.locator('.text-destructive')).toBeVisible()

    // 确认按钮应该禁用
    const confirmBtn = page.locator('button.w-full').last()
    await expect(confirmBtn).toBeDisabled()
  })
})
