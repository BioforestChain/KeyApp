import { test, expect } from '@playwright/test'

// Mock bio SDK
const mockBioSDK = `
  window.bio = {
    request: async ({ method }) => {
      if (method === 'bio_selectAccount') {
        return { address: '0x1234...5678', name: 'Test Wallet' }
      }
      return {}
    }
  }
`

test.describe('Forge 小程序 UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('01 - 连接页面', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    await expect(page).toHaveScreenshot('01-connect.png')
  })

  test('02 - 兑换页面', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 点击连接按钮
    await page.click('button:has-text("连接钱包")')
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot('02-swap.png')
  })

  test('03 - 兑换页面 - 输入金额', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.click('button:has-text("连接钱包")')
    await page.waitForTimeout(300)
    
    // 输入金额
    await page.fill('input[type="number"]', '1.5')
    await page.waitForTimeout(300)
    
    await expect(page).toHaveScreenshot('03-swap-amount.png')
  })

  test('04 - 代币选择器', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.click('button:has-text("连接钱包")')
    await page.waitForTimeout(500)
    
    // 点击代币选择按钮
    await page.click('button:has-text("ETH")')
    await page.waitForTimeout(800)
    
    await expect(page).toHaveScreenshot('04-token-picker.png')
  })

  test('05 - 确认页面', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.click('button:has-text("连接钱包")')
    await page.waitForTimeout(300)
    
    await page.fill('input[type="number"]', '1.5')
    await page.waitForTimeout(200)
    
    // 点击预览
    await page.click('button:has-text("预览交易")')
    await page.waitForTimeout(300)
    
    await expect(page).toHaveScreenshot('05-confirm.png')
  })
})
