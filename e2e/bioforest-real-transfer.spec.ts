/**
 * BioForest Chain 真实转账 E2E 测试
 * 
 * 使用真实助记词和密码，验证完整转账流程。
 * 
 * 环境变量:
 * - E2E_TEST_MNEMONIC: 测试助记词
 * - E2E_TEST_PASSWORD: 钱包密码
 * - E2E_TARGET_ADDRESS: 目标地址
 * 
 * 本地运行: 创建 .env.local 文件
 * CI 运行: 通过 GitHub Secrets 注入
 */

import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

// 加载 .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const TEST_MNEMONIC = process.env.E2E_TEST_MNEMONIC
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'test-password-123'
const TARGET_ADDRESS = process.env.E2E_TARGET_ADDRESS || 'bCfAynSAKhzgKLi3BXyuh5k22GctLR72j'

// 跳过测试如果没有配置助记词
const describeOrSkip = TEST_MNEMONIC ? test.describe : test.describe.skip

describeOrSkip('BioForest 真实转账流程', () => {
  test.setTimeout(120000) // 2 分钟超时

  test('完整转账流程 - 从导入钱包到转账成功', async ({ page }) => {
    // ========== 1. 导入钱包 ==========
    await test.step('导入钱包', async () => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // 等待引导页面或首页
      await page.waitForTimeout(1000)

      // 检查是否需要导入钱包
      const importButton = page.locator('text=导入钱包').or(page.locator('text=恢复钱包')).first()
      if (await importButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await importButton.click()
        await page.waitForTimeout(500)

        // 输入助记词
        const mnemonicInput = page.locator('textarea').or(page.locator('input[placeholder*="助记词"]')).first()
        await mnemonicInput.waitFor({ timeout: 5000 })
        await mnemonicInput.fill(TEST_MNEMONIC!)
        await page.waitForTimeout(300)

        // 点击继续/下一步
        const continueBtn = page.locator('button:has-text("继续")').or(page.locator('button:has-text("下一步")')).first()
        await continueBtn.click()
        await page.waitForTimeout(500)

        // 设置密码
        const passwordInput = page.locator('input[type="password"]').first()
        await passwordInput.waitFor({ timeout: 5000 })
        await passwordInput.fill(TEST_PASSWORD)

        // 确认密码（如果有）
        const confirmPasswordInput = page.locator('input[type="password"]').nth(1)
        if (await confirmPasswordInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await confirmPasswordInput.fill(TEST_PASSWORD)
        }

        // 完成导入
        const finishBtn = page.locator('button:has-text("完成")').or(page.locator('button:has-text("创建")')).first()
        await finishBtn.click()
        await page.waitForTimeout(2000)
      }

      // 验证进入首页
      await expect(page.locator('text=BFM').or(page.locator('text=BFMeta'))).toBeVisible({ timeout: 10000 })
      console.log('✅ 钱包导入/加载成功')
    })

    // ========== 2. 检查余额 ==========
    let balance = '0'
    await test.step('检查余额', async () => {
      // 等待余额加载
      await page.waitForTimeout(2000)

      // 获取余额显示
      const balanceText = await page.locator('text=/\\d+\\.\\d+ BFM/').textContent({ timeout: 5000 }).catch(() => null)
      if (balanceText) {
        balance = balanceText.replace(' BFM', '')
        console.log(`✅ 当前余额: ${balance} BFM`)
      }

      // 截图记录
      await expect(page).toHaveScreenshot('real-transfer-01-home.png')
    })

    // ========== 3. 进入发送页面 ==========
    await test.step('进入发送页面', async () => {
      const sendButton = page.locator('[data-testid="send-button"]').or(page.locator('button:has-text("发送")')).first()
      await sendButton.click()
      await page.waitForTimeout(500)

      // 验证进入发送页面
      await expect(page.locator('input[placeholder*="地址"]').or(page.locator('text=收款地址'))).toBeVisible({ timeout: 5000 })
      console.log('✅ 进入发送页面')
      await expect(page).toHaveScreenshot('real-transfer-02-send-page.png')
    })

    // ========== 4. 填写转账信息 ==========
    await test.step('填写转账信息', async () => {
      // 输入收款地址
      const addressInput = page.locator('input[placeholder*="地址"]').first()
      await addressInput.fill(TARGET_ADDRESS)
      await page.waitForTimeout(300)

      // 输入金额 - 转一个很小的金额
      const amountInput = page.locator('input[inputmode="decimal"]').first()
      await amountInput.fill('0.00001')
      await page.waitForTimeout(500)

      console.log(`✅ 填写完成: ${TARGET_ADDRESS}, 0.00001 BFM`)
      await expect(page).toHaveScreenshot('real-transfer-03-filled.png')
    })

    // ========== 5. 点击继续 ==========
    await test.step('点击继续', async () => {
      const continueBtn = page.locator('[data-testid="send-continue-button"]').or(page.locator('button:has-text("继续")')).first()
      await expect(continueBtn).toBeEnabled({ timeout: 5000 })
      await continueBtn.click()
      await page.waitForTimeout(500)
      console.log('✅ 点击继续')
    })

    // ========== 6. 确认转账弹窗 ==========
    await test.step('确认转账', async () => {
      // 等待确认弹窗出现
      const confirmBtn = page.locator('[data-testid="confirm-transfer-button"]').or(page.locator('button:has-text("确认")').first())
      await expect(confirmBtn).toBeVisible({ timeout: 5000 })
      
      await expect(page).toHaveScreenshot('real-transfer-04-confirm-sheet.png')
      
      await confirmBtn.click()
      await page.waitForTimeout(500)
      console.log('✅ 点击确认转账')
    })

    // ========== 7. 输入密码 ==========
    await test.step('输入钱包密码', async () => {
      // 等待密码输入框出现
      const passwordInput = page.locator('input[type="password"]').first()
      await expect(passwordInput).toBeVisible({ timeout: 5000 })
      
      await expect(page).toHaveScreenshot('real-transfer-05-password-dialog.png')
      
      await passwordInput.fill(TEST_PASSWORD)
      console.log('✅ 输入密码')

      // 点击确认密码
      const confirmPasswordBtn = page.locator('button[type="submit"]').filter({ hasText: /确认|Confirm/ })
      await confirmPasswordBtn.click()
      await page.waitForTimeout(3000)
      console.log('✅ 提交密码')
    })

    // ========== 8. 验证结果 ==========
    await test.step('验证转账结果', async () => {
      await expect(page).toHaveScreenshot('real-transfer-06-result.png')

      // 检查是否显示成功或返回首页
      const pageContent = await page.content()
      
      const isSuccess = 
        pageContent.includes('成功') ||
        pageContent.includes('已发送') ||
        pageContent.includes('交易已提交') ||
        // 或者密码弹窗消失了（说明验证成功）
        !(await page.locator('text=验证密码').isVisible().catch(() => false))

      if (isSuccess) {
        console.log('✅ 转账流程完成')
      } else {
        // 检查是否有错误信息
        const errorText = await page.locator('text=/错误|失败|Error|Failed/i').textContent().catch(() => null)
        if (errorText) {
          console.log(`❌ 转账失败: ${errorText}`)
        }
      }

      expect(isSuccess).toBe(true)
    })
  })

  test('交易历史显示', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 进入转账历史
    const transferTab = page.locator('a[href*="transfer"]').or(page.locator('button:has-text("转账")')).first()
    if (await transferTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await transferTab.click()
      await page.waitForTimeout(1000)
    }

    // 验证交易历史加载
    const content = await page.content()
    const hasHistory = content.includes('BFM') || content.includes('转账')
    
    await expect(page).toHaveScreenshot('real-transfer-history.png')
    
    console.log(`✅ 交易历史页面加载: ${hasHistory ? '有记录' : '空'}`)
  })
})
