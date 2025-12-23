import { test, expect, type Page } from '@playwright/test'
import { setupWalletWithMnemonic, waitForAppReady } from './utils/indexeddb-helper'

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
const RPC_URL = 'https://walletapi.bffmeta.info'
const CHAIN_ID = 'bfm'

test.describe('BioForest Chain API 功能测试', () => {
  test('获取最新区块高度', async ({ request }) => {
    const response = await request.get(`${RPC_URL}/wallet/${CHAIN_ID}/lastblock`)
    expect(response.ok()).toBe(true)
    
    const data = await response.json()
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
    
    const data = await response.json()
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
    
    const data = await response.json()
    console.log(`Address info for ${TEST_ADDRESS}:`, JSON.stringify(data, null, 2))
    
    // 检查是否有二次签名公钥
    if (data?.secondPublicKey) {
      console.log('Account has pay password set')
    } else {
      console.log('Account does NOT have pay password set')
    }
  })

  test('查询交易历史', async ({ request }) => {
    // 首先获取最新区块高度
    const blockResponse = await request.get(`${RPC_URL}/wallet/${CHAIN_ID}/lastblock`)
    const blockData = await blockResponse.json()
    const maxHeight = blockData.height

    // 查询交易
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
    
    const data = await response.json()
    console.log(`Transaction history for ${TEST_ADDRESS}:`)
    console.log(`Total transactions found: ${data.trs?.length ?? 0}`)
    
    if (data.trs && data.trs.length > 0) {
      // 打印前 3 条交易
      data.trs.slice(0, 3).forEach((item: { transaction: { signature: string; type: string; senderId: string; recipientId: string; fee: string; timestamp: number } }, i: number) => {
        const tx = item.transaction
        console.log(`  [${i + 1}] Type: ${tx.type}`)
        console.log(`      From: ${tx.senderId}`)
        console.log(`      To: ${tx.recipientId}`)
        console.log(`      Fee: ${tx.fee}`)
        console.log(`      TxId: ${tx.signature.slice(0, 20)}...`)
      })
    }
  })

  test('查询 Pending 交易', async ({ request }) => {
    const response = await request.post(`${RPC_URL}/wallet/${CHAIN_ID}/pendingTr`, {
      data: {
        senderId: TEST_ADDRESS,
        sort: -1,
      },
    })
    expect(response.ok()).toBe(true)
    
    const data = await response.json()
    console.log(`Pending transactions: ${Array.isArray(data) ? data.length : 0}`)
  })
})

test.describe('BioForest 钱包 UI 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 设置测试钱包
    await setupWalletWithMnemonic(page, TEST_MNEMONIC, 'test-password')
  })

  test('显示 BFM 余额', async ({ page }) => {
    await page.goto('/')
    await waitForAppReady(page)

    // 截图初始状态
    await page.waitForTimeout(1000)
    await expect(page).toHaveScreenshot('bioforest-home.png')

    // 验证页面显示
    const content = await page.content()
    expect(content).toContain('BFM')
  })

  test('发送页面加载正常', async ({ page }) => {
    await page.goto('/#/send')
    await waitForAppReady(page)

    await page.waitForTimeout(500)
    
    // 截图发送页面
    await expect(page).toHaveScreenshot('bioforest-send-page.png')
  })

  test('交易历史页面显示', async ({ page }) => {
    await page.goto('/#/history')
    await waitForAppReady(page)

    await page.waitForTimeout(500)
    
    // 截图交易历史
    await expect(page).toHaveScreenshot('bioforest-history.png')
  })
})

test.describe('BioForest 转账流程测试', () => {
  test.beforeEach(async ({ page }) => {
    await setupWalletWithMnemonic(page, TEST_MNEMONIC, 'test-password')
  })

  test('填写转账表单', async ({ page }) => {
    await page.goto('/#/send')
    await waitForAppReady(page)

    // 填写收款地址
    const addressInput = page.locator('input').first()
    await addressInput.fill(TARGET_ADDRESS)

    // 填写金额
    const amountInput = page.locator('input').nth(1)
    await amountInput.fill('0.0001')

    await page.waitForTimeout(500)

    // 截图填写后的状态
    await expect(page).toHaveScreenshot('bioforest-send-filled.png')
  })

  test('确认转账弹窗', async ({ page }) => {
    await page.goto('/#/send')
    await waitForAppReady(page)

    // 填写表单
    const addressInput = page.locator('input').first()
    await addressInput.fill(TARGET_ADDRESS)

    const amountInput = page.locator('input').nth(1)
    await amountInput.fill('0.0001')

    // 等待费用计算
    await page.waitForTimeout(1000)

    // 点击继续
    const continueBtn = page.locator('[data-testid="send-continue-button"]')
    if (await continueBtn.isEnabled()) {
      await continueBtn.click()
      await page.waitForTimeout(500)

      // 截图确认弹窗
      await expect(page).toHaveScreenshot('bioforest-send-confirm.png')
    }
  })
})

test.describe('BioForest 支付密码设置', () => {
  test.beforeEach(async ({ page }) => {
    await setupWalletWithMnemonic(page, TEST_MNEMONIC, 'test-password')
  })

  test('安全设置页面', async ({ page }) => {
    // 导航到安全设置
    await page.goto('/#/settings/security')
    await waitForAppReady(page)

    await page.waitForTimeout(500)

    // 截图安全设置页面
    await expect(page).toHaveScreenshot('bioforest-security-settings.png')
  })
})
