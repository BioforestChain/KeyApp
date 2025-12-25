/**
 * BioForest UI 流程测试 - 分步骤调试
 */

import { test, expect } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const FUND_MNEMONIC = process.env.E2E_TEST_MNEMONIC ?? ''
const WALLET_PATTERN = '0,1,2,5,8' // 钱包锁图案：L形

const describeOrSkip = FUND_MNEMONIC ? test.describe : test.describe.skip

describeOrSkip('BioForest UI 流程', () => {
  test.setTimeout(60000)

  test('导入钱包并切换链', async ({ page }) => {
    page.on('console', msg => {
      if (msg.type() === 'error') console.log('[Browser Error]', msg.text())
    })

    // 1. 打开页面
    console.log('1. 打开页面...')
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    console.log('✅ 页面加载完成')

    // 2. 清除存储并重新加载
    console.log('2. 清除存储...')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForLoadState('networkidle')
    console.log('✅ 存储已清除')

    // 3. 导入钱包
    console.log('3. 导入钱包...')
    const importBtn = page.locator('[data-testid="import-wallet-button"]')
    await expect(importBtn).toBeVisible({ timeout: 5000 })
    await importBtn.click()
    console.log('  - 点击导入按钮')

    await page.locator('[data-testid="continue-button"]').click()
    console.log('  - 选择密钥类型')

    await page.locator('[data-testid="mnemonic-textarea"]').fill(FUND_MNEMONIC)
    await page.locator('[data-testid="continue-button"]').click()
    console.log('  - 输入助记词')

    await page.locator('[data-testid="pattern-lock-input"]').fill(WALLET_PATTERN)
    const confirmInput = page.locator('[data-testid="pattern-lock-confirm"]')
    if (await confirmInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmInput.fill(WALLET_PATTERN)
    }
    await page.locator('[data-testid="continue-button"]').click()
    console.log('  - 设置钱包锁')

    await page.locator('[data-testid="enter-wallet-button"]').click()
    await page.waitForLoadState('networkidle')
    console.log('✅ 钱包导入完成')

    // 4. 验证首页
    console.log('4. 验证首页...')
    await expect(page.locator('[data-testid="send-button"]:visible')).toBeVisible({ timeout: 10000 })
    console.log('✅ 首页显示正常')

    // 5. 切换到 BFMeta 链
    console.log('5. 切换到 BFMeta 链...')
    const chainSelector = page.locator('[data-testid="chain-selector"]')
    if (await chainSelector.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chainSelector.click()
      console.log('  - 打开链选择器')
      
      const bfmetaOption = page.locator('[data-testid="chain-option-bfmeta"]')
      await expect(bfmetaOption).toBeVisible({ timeout: 3000 })
      await bfmetaOption.click()
      console.log('  - 选择 BFMeta')
      
      await page.waitForTimeout(500)
    }
    console.log('✅ 链切换完成')

    // 6. 进入发送页面
    console.log('6. 进入发送页面...')
    await page.locator('[data-testid="send-button"]:visible').click()
    await expect(page.locator('[data-testid="address-input"]')).toBeVisible({ timeout: 5000 })
    console.log('✅ 发送页面加载完成')

    console.log('🎉 UI 流程测试通过!')
  })
})
