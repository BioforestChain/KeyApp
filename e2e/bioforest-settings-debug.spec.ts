/**
 * 调试测试 - 检查设置页面
 */

import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const FUND_MNEMONIC = process.env.E2E_TEST_MNEMONIC ?? ''
const WALLET_PASSWORD = 'e2e-test-password'

const describeOrSkip = FUND_MNEMONIC ? test.describe : test.describe.skip

describeOrSkip('设置页面调试', () => {
  test.setTimeout(60000)

  test('打开设置支付密码对话框', async ({ page }) => {
    // 1. 导入钱包
    console.log('1. 导入钱包...')
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForLoadState('networkidle')

    await page.locator('[data-testid="import-wallet-button"]').click()
    await page.locator('[data-testid="continue-button"]').click()
    await page.locator('[data-testid="mnemonic-textarea"]').fill(FUND_MNEMONIC)
    await page.locator('[data-testid="continue-button"]').click()
    await page.locator('[data-testid="password-input"]').fill(WALLET_PASSWORD)
    const confirmInput = page.locator('[data-testid="confirm-password-input"]')
    if (await confirmInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmInput.fill(WALLET_PASSWORD)
    }
    await page.locator('[data-testid="continue-button"]').click()
    await page.locator('[data-testid="enter-wallet-button"]').click()
    await page.waitForLoadState('networkidle')
    console.log('   ✅ 钱包导入完成')

    // 2. 隐藏 Mock DevTools 按钮（避免遮挡）
    await page.evaluate(() => {
      const mockBtn = document.querySelector('[title*="Mock DevTools"]') as HTMLElement
      if (mockBtn) mockBtn.style.display = 'none'
    })

    // 3. 点击设置 Tab
    console.log('2. 点击设置 Tab...')
    const settingsTab = page.locator('[data-testid="tab-settings"]:visible')
    await settingsTab.click()
    await page.waitForTimeout(1000)
    console.log('   ✅ 设置 Tab 点击完成')

    // 3. 截图查看页面状态
    await page.screenshot({ path: 'e2e/test-results/debug-after-tab-click.png' })

    // 4. 查找设置支付密码按钮
    console.log('3. 查找设置支付密码按钮...')
    const setPayPwdBtn = page.locator('[data-testid="set-pay-password-button"]')
    const btnVisible = await setPayPwdBtn.isVisible({ timeout: 5000 }).catch(() => false)
    console.log(`   按钮可见: ${btnVisible}`)

    if (btnVisible) {
      await setPayPwdBtn.click()
      await page.waitForTimeout(500)
      console.log('   ✅ 设置按钮点击完成')
      
      // 截图查看对话框
      await page.screenshot({ path: 'e2e/test-results/debug-dialog-opened.png' })
      
      // 检查新密码输入框
      const newPwdInput = page.locator('[data-testid="new-pay-password-input"]')
      const inputVisible = await newPwdInput.isVisible({ timeout: 3000 }).catch(() => false)
      console.log(`   新密码输入框可见: ${inputVisible}`)
      expect(inputVisible).toBe(true)
    } else {
      // 获取页面内容调试
      const content = await page.content()
      console.log('   页面 HTML 长度:', content.length)
      expect(btnVisible).toBe(true)
    }

    console.log('🎉 调试测试完成!')
  })
})
