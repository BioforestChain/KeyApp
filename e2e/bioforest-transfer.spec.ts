import { test, expect } from '@playwright/test'
import { setupWalletWithMnemonic, waitForAppReady } from './utils/indexeddb-helper'
import { setupBioforestMock } from './utils/bioforest-mock'

/**
 * BioForest Chain 转账完整测试
 *
 * 测试内容：
 * - 交易历史查询
 * - 手续费计算
 * - 支付密码（二次签名）设置
 * - 转账功能
 */

// 测试账号助记词
const TEST_MNEMONIC = '董 夜 孟 和 罚 箱 房 五 汁 搬 渗 县 督 细 速 连 岭 爸 养 谱 握 杭 刀 拆'
const TEST_ADDRESS = 'b9gB9NzHKWsDKGYFCaNva6xRnxPwFfGcfx'
const TARGET_ADDRESS = 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j'

// 测试 API 配置
const RPC_URL = 'https://walletapi.bfmeta.info'
const CHAIN_ID = 'bfm'

// API 返回格式: { success: boolean, result: T }
interface ApiResponse<T> {
  success: boolean
  result: T
}

test.describe('BioForest Chain API 功能测试', () => {
  test('获取最新区块高度', async ({ request }) => {
    const response = await request.get(`${RPC_URL}/wallet/${CHAIN_ID}/lastblock`)
    expect(response.ok()).toBe(true)
    
    const json = await response.json() as ApiResponse<{ height: number; timestamp: number }>
    expect(json.success).toBe(true)
    const data = json.result
    expect(data).toHaveProperty('height')
    expect(data).toHaveProperty('timestamp')
    expect(typeof data.height).toBe('number')
    expect(data.height).toBeGreaterThan(0)
    
    console.log(`Latest block: height=${data.height}, timestamp=${data.timestamp}`)
  })

  test('查询账户余额', async ({ request }) => {
    const response = await request.post(`${RPC_URL}/wallet/${CHAIN_ID}/address/balance`, {
      data: {
        address: TEST_ADDRESS,
        magic: 'nxOGQ',
        assetType: 'BFM',
      },
    })
    expect(response.ok()).toBe(true)
    
    const json = await response.json() as ApiResponse<{ amount: string }>
    expect(json.success).toBe(true)
    const data = json.result
    expect(data).toHaveProperty('amount')
    
    console.log(`Balance for ${TEST_ADDRESS}: ${data.amount}`)
  })

  test('查询账户信息（包含二次签名公钥）', async ({ request }) => {
    const response = await request.post(`${RPC_URL}/wallet/${CHAIN_ID}/address/info`, {
      data: {
        address: TEST_ADDRESS,
      },
    })
    expect(response.ok()).toBe(true)
    
    const json = await response.json() as ApiResponse<{ address: string; secondPublicKey?: string }>
    expect(json.success).toBe(true)
    const data = json.result
    console.log(`Address info for ${TEST_ADDRESS}:`, JSON.stringify(data, null, 2))
    
    if (data?.secondPublicKey) {
      console.log('Account has pay password set')
    } else {
      console.log('Account does NOT have pay password set')
    }
  })

  test('查询交易历史', async ({ request }) => {
    const blockResponse = await request.get(`${RPC_URL}/wallet/${CHAIN_ID}/lastblock`)
    const blockJson = await blockResponse.json() as ApiResponse<{ height: number }>
    const maxHeight = blockJson.result.height

    const response = await request.post(`${RPC_URL}/wallet/${CHAIN_ID}/transactions/query`, {
      data: {
        maxHeight,
        address: TEST_ADDRESS,
        page: 1,
        pageSize: 10,
        sort: -1,
      },
    })
    expect(response.ok()).toBe(true)
    
    const json = await response.json() as ApiResponse<{ trs?: Array<{ transaction: { signature: string; type: string; senderId: string; recipientId: string; fee: string; timestamp: number } }> }>
    expect(json.success).toBe(true)
    const data = json.result
    console.log(`Transaction history for ${TEST_ADDRESS}: ${data.trs?.length ?? 0} transactions`)
  })

  test('查询 Pending 交易', async ({ request }) => {
    const response = await request.post(`${RPC_URL}/wallet/${CHAIN_ID}/pendingTr`, {
      data: {
        senderId: TEST_ADDRESS,
        sort: -1,
      },
    })
    expect(response.ok()).toBe(true)
    
    const json = await response.json() as ApiResponse<unknown[]>
    expect(json.success).toBe(true)
    const data = json.result
    console.log(`Pending transactions: ${Array.isArray(data) ? data.length : 0}`)
  })
})

test.describe('BioForest 钱包 UI 测试 (Mock)', () => {
  test.beforeEach(async ({ page }) => {
    await setupBioforestMock(page)
    await setupWalletWithMnemonic(page, TEST_MNEMONIC, 'test-password')
  })

  test('首页显示 BFM 余额', async ({ page }) => {
    await page.goto('/')
    await waitForAppReady(page)
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('bioforest-home.png')
    
    const content = await page.content()
    expect(content).toContain('BFM')
  })

  test('发送页面显示余额', async ({ page }) => {
    await page.goto('/')
    await waitForAppReady(page)
    await page.waitForTimeout(500)
    
    // 点击发送按钮进入发送页面
    await page.locator('[data-testid="send-button"]').click()
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot('bioforest-send-page.png')
  })

  test('交易历史页面', async ({ page }) => {
    await page.goto('/')
    await waitForAppReady(page)
    await page.waitForTimeout(500)
    
    // 点击转账 tab 进入历史页面
    await page.locator('a[href*="转账"], button:has-text("转账")').first().click().catch(() => {
      // 尝试底部导航
      page.locator('text=转账').first().click()
    })
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot('bioforest-history.png')
  })

  test('安全设置页面', async ({ page }) => {
    await page.goto('/')
    await waitForAppReady(page)
    await page.waitForTimeout(500)
    
    // 点击设置 tab
    await page.locator('text=设置').first().click()
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot('bioforest-security-settings.png')
  })
})

test.describe('BioForest 转账全流程测试 (Mock)', () => {
  test.beforeEach(async ({ page }) => {
    await setupBioforestMock(page, {
      balance: '100000000000', // 1000 BFM
      hasSecondPublicKey: true,
    })
    await setupWalletWithMnemonic(page, TEST_MNEMONIC, 'test-password')
  })

  // 辅助函数：从首页进入发送页面
  async function goToSendPage(page: import('@playwright/test').Page) {
    await page.goto('/')
    await waitForAppReady(page)
    await page.waitForTimeout(500)
    await page.locator('[data-testid="send-button"]').click()
    await page.waitForTimeout(500)
    // 等待发送页面加载
    await page.locator('input[placeholder*="地址"]').first().waitFor({ timeout: 10000 })
  }

  test('步骤1: 进入发送页面', async ({ page }) => {
    await page.goto('/')
    await waitForAppReady(page)
    await page.waitForTimeout(500)
    
    // 点击发送按钮
    await page.locator('[data-testid="send-button"]').click()
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot('transfer-step1-send-page.png')
  })

  test('步骤2: 填写收款地址', async ({ page }) => {
    await goToSendPage(page)
    
    // 填写收款地址
    const addressInput = page.locator('input[placeholder*="地址"]').first()
    await addressInput.fill(TARGET_ADDRESS)
    await page.waitForTimeout(300)
    
    await expect(page).toHaveScreenshot('transfer-step2-address-filled.png')
  })

  test('步骤3: 填写转账金额', async ({ page }) => {
    await goToSendPage(page)
    
    // 填写地址
    const addressInput = page.locator('input[placeholder*="地址"]').first()
    await addressInput.fill(TARGET_ADDRESS)
    
    // 填写金额 - 找输入模式为 decimal 的输入框
    const amountInput = page.locator('input[inputmode="decimal"]').first()
    await amountInput.fill('10')
    await page.waitForTimeout(300)
    
    await expect(page).toHaveScreenshot('transfer-step3-amount-filled.png')
  })

  test('步骤4: 点击继续按钮', async ({ page }) => {
    await goToSendPage(page)
    
    // 填写表单
    const addressInput = page.locator('input[placeholder*="地址"]').first()
    await addressInput.fill(TARGET_ADDRESS)
    
    const amountInput = page.locator('input[inputmode="decimal"]').first()
    await amountInput.fill('10')
    await page.waitForTimeout(500)
    
    // 点击继续按钮
    const continueBtn = page.locator('[data-testid="send-continue-button"]')
    await expect(continueBtn).toBeEnabled({ timeout: 5000 })
    
    await expect(page).toHaveScreenshot('transfer-step4-continue-enabled.png')
  })

  test('步骤5: 确认转账弹窗', async ({ page }) => {
    await goToSendPage(page)
    
    // 填写表单
    const addressInput = page.locator('input[placeholder*="地址"]').first()
    await addressInput.fill(TARGET_ADDRESS)
    
    const amountInput = page.locator('input[inputmode="decimal"]').first()
    await amountInput.fill('10')
    await page.waitForTimeout(500)
    
    // 点击继续
    const continueBtn = page.locator('[data-testid="send-continue-button"]')
    await expect(continueBtn).toBeEnabled({ timeout: 5000 })
    await continueBtn.click()
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot('transfer-step5-confirm-dialog.png')
  })

  test('步骤6: 输入钱包密码', async ({ page }) => {
    await goToSendPage(page)
    
    // 填写表单
    const addressInput = page.locator('input[placeholder*="地址"]').first()
    await addressInput.fill(TARGET_ADDRESS)
    
    const amountInput = page.locator('input[inputmode="decimal"]').first()
    await amountInput.fill('10')
    await page.waitForTimeout(500)
    
    // 点击继续
    const continueBtn = page.locator('[data-testid="send-continue-button"]')
    await expect(continueBtn).toBeEnabled({ timeout: 5000 })
    await continueBtn.click()
    await page.waitForTimeout(500)
    
    // 点击确认按钮（在确认弹窗中）
    const confirmBtn = page.locator('button:has-text("确认")').first()
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click()
      await page.waitForTimeout(500)
    }
    
    await expect(page).toHaveScreenshot('transfer-step6-password-dialog.png')
  })
})

test.describe('BioForest 支付密码设置流程 (Mock)', () => {
  test.beforeEach(async ({ page }) => {
    await setupBioforestMock(page, {
      balance: '100000000000',
      hasSecondPublicKey: false, // 未设置支付密码
    })
    await setupWalletWithMnemonic(page, TEST_MNEMONIC, 'test-password')
  })

  // 辅助函数：从首页进入设置页面
  async function goToSettingsPage(page: import('@playwright/test').Page) {
    await page.goto('/')
    await waitForAppReady(page)
    await page.waitForTimeout(500)
    await page.locator('text=设置').first().click()
    await page.waitForTimeout(500)
  }

  test('步骤1: 进入设置页面', async ({ page }) => {
    await goToSettingsPage(page)
    
    await expect(page).toHaveScreenshot('pay-password-step1-settings.png')
  })

  test('步骤2: 点击支付密码入口', async ({ page }) => {
    await goToSettingsPage(page)
    
    // 查找支付密码相关入口
    const payPasswordEntry = page.locator('text=支付密码').first()
    if (await payPasswordEntry.isVisible()) {
      await payPasswordEntry.click()
      await page.waitForTimeout(500)
      await expect(page).toHaveScreenshot('pay-password-step2-entry.png')
    }
  })
})
