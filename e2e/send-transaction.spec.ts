import { test, expect, type Page } from '@playwright/test'

/**
 * 发送交易 E2E 测试
 *
 * 测试发送交易流程，特别是 Amount 类型相关的功能：
 * - 金额输入和格式化
 * - 余额验证
 * - 手续费显示
 * - 确认流程
 */

// 测试钱包数据（带余额）
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
            { symbol: 'USDT', balance: '1000', decimals: 6, contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
          ],
        },
        {
          chain: 'bfmeta',
          address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
          tokens: [
            { symbol: 'BFM', balance: '10000', decimals: 8 },
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

// 获取发送页面的输入元素
async function getSendPageInputs(page: Page) {
  // 等待页面加载
  await page.waitForSelector('h1', { timeout: 10000 })
  
  // 地址输入框通常是第一个文本输入框
  const addressInput = page.locator('input').first()
  // 金额输入框通常是第二个或有 placeholder="0" 的
  const amountInput = page.locator('input[placeholder="0"], input').nth(1)
  
  return { addressInput, amountInput }
}

test.describe('发送交易 - 金额输入测试', () => {
  test('输入有效金额', async ({ page }) => {
    await setupTestWallet(page, '/send')
    await waitForAppReady(page)

    const { amountInput } = await getSendPageInputs(page)
    
    // 输入有效金额
    await amountInput.fill('0.5')
    
    // 验证输入值
    const value = await amountInput.inputValue()
    expect(value).toBe('0.5')
  })

  test('输入超过余额的金额触发错误', async ({ page }) => {
    await setupTestWallet(page, '/send')
    await waitForAppReady(page)

    const { addressInput, amountInput } = await getSendPageInputs(page)

    // 填写有效地址
    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')

    // 输入超过余额的金额（余额是 1.5 ETH）
    await amountInput.fill('100')

    // 等待验证
    await page.waitForTimeout(300)

    // 验证继续按钮被禁用
    const continueBtn = page.locator('button:has-text("Continue"), button:has-text("继续"), [data-testid="send-continue-button"]')
    await expect(continueBtn.first()).toBeDisabled()
  })

  test('清空金额后继续按钮禁用', async ({ page }) => {
    await setupTestWallet(page, '/send')
    await waitForAppReady(page)

    const { addressInput, amountInput } = await getSendPageInputs(page)

    // 填写有效数据
    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')
    await amountInput.fill('0.1')

    // 等待
    await page.waitForTimeout(300)

    // 清空金额
    await amountInput.clear()

    // 继续按钮应该禁用
    const continueBtn = page.locator('button:has-text("Continue"), button:has-text("继续"), [data-testid="send-continue-button"]')
    await expect(continueBtn.first()).toBeDisabled()
  })

  test('处理零金额', async ({ page }) => {
    await setupTestWallet(page, '/send')
    await waitForAppReady(page)

    const { addressInput, amountInput } = await getSendPageInputs(page)

    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')
    await amountInput.fill('0')

    await page.waitForTimeout(300)

    // 零金额应该禁用继续按钮
    const continueBtn = page.locator('button:has-text("Continue"), button:has-text("继续"), [data-testid="send-continue-button"]')
    await expect(continueBtn.first()).toBeDisabled()
  })
})

test.describe('发送交易 - 确认流程测试', () => {
  test('填写完整表单后可以继续', async ({ page }) => {
    await setupTestWallet(page, '/send')
    await waitForAppReady(page)

    const { addressInput, amountInput } = await getSendPageInputs(page)

    // 填写表单
    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')
    await amountInput.fill('0.1')

    // 等待费用估算
    await page.waitForTimeout(500)

    // 验证继续按钮启用
    const continueBtn = page.locator('button:has-text("Continue"), button:has-text("继续"), [data-testid="send-continue-button"]')
    await expect(continueBtn.first()).toBeEnabled()
  })

  test('点击继续打开确认弹窗', async ({ page }) => {
    await setupTestWallet(page, '/send')
    await waitForAppReady(page)

    const { addressInput, amountInput } = await getSendPageInputs(page)

    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')
    await amountInput.fill('0.1')

    await page.waitForTimeout(500)

    // 点击继续
    const continueBtn = page.locator('button:has-text("Continue"), button:has-text("继续"), [data-testid="send-continue-button"]')
    await continueBtn.first().click()

    // 验证弹窗出现（等待任何 dialog 或 sheet 元素）
    await page.waitForTimeout(500)
    
    // 检查是否有确认相关的内容出现
    const hasConfirmContent = await page.locator('text=/confirm|确认|0\\.1/i').first().isVisible().catch(() => false)
    expect(hasConfirmContent).toBe(true)
  })
})

test.describe('发送交易 - 截图测试', () => {
  test('发送页面初始状态', async ({ page }) => {
    await setupTestWallet(page, '/send')
    await waitForAppReady(page)
    
    await page.waitForSelector('h1', { timeout: 10000 })

    await expect(page).toHaveScreenshot('send-page-initial.png')
  })

  test('发送页面填写表单后', async ({ page }) => {
    await setupTestWallet(page, '/send')
    await waitForAppReady(page)

    const { addressInput, amountInput } = await getSendPageInputs(page)

    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')
    await amountInput.fill('0.5')

    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('send-page-filled.png')
  })

  test('发送页面余额不足', async ({ page }) => {
    await setupTestWallet(page, '/send')
    await waitForAppReady(page)

    const { addressInput, amountInput } = await getSendPageInputs(page)

    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')
    await amountInput.fill('999999')

    await page.waitForTimeout(300)

    await expect(page).toHaveScreenshot('send-page-insufficient.png')
  })
})

test.describe('发送交易 - 金额格式化显示', () => {
  test('页面显示格式化余额', async ({ page }) => {
    await setupTestWallet(page, '/send')
    await waitForAppReady(page)

    await page.waitForSelector('h1', { timeout: 10000 })

    // 验证页面上显示了格式化的余额（如 "1.5" 而不是 "1500000000000000000"）
    // 余额应该小于 100（原始 wei 值会非常大）
    const balanceText = await page.locator('text=/\\d+\\.?\\d*\\s*(ETH|Available|余额)/').first().textContent()
    
    if (balanceText) {
      // 提取数字
      const match = balanceText.match(/(\d+\.?\d*)/)
      if (match) {
        const balanceValue = parseFloat(match[1])
        // 格式化后的余额应该是合理的数值（不是 wei）
        expect(balanceValue).toBeLessThan(1000000)
      }
    }
  })
})
