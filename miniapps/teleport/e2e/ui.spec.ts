import { test, expect } from '@playwright/test'

// Mock bio SDK
const mockBioSDK = `
  window.bio = {
    request: async ({ method }) => {
      if (method === 'bio_selectAccount') {
        return { address: '0x1234567890abcdef1234567890abcdef12345678', name: 'Test Wallet' }
      }
      if (method === 'bio_pickWallet') {
        return { address: '0xabcdef1234567890abcdef1234567890abcdef12', name: 'Target Wallet' }
      }
      return {}
    }
  }
`

test.describe('Teleport 小程序 UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('01 - 连接页面', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    await expect(page).toHaveScreenshot('01-connect.png')
  })

  test('02 - 选择资产页面', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.click('button:has-text("启动传送门")')
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot('02-select-asset.png')
  })

  test('03 - 输入金额页面', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.click('button:has-text("启动传送门")')
    await page.waitForTimeout(300)
    
    // 选择 BFM 资产
    await page.click('[data-slot="card"]:has-text("BFM")')
    await page.waitForTimeout(300)
    
    await expect(page).toHaveScreenshot('03-input-amount.png')
  })

  test('04 - 输入金额后', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.click('button:has-text("启动传送门")')
    await page.waitForTimeout(300)
    
    await page.click('[data-slot="card"]:has-text("BFM")')
    await page.waitForTimeout(300)
    
    await page.fill('input[type="number"]', '500')
    await page.waitForTimeout(300)
    
    await expect(page).toHaveScreenshot('04-amount-filled.png')
  })

  test('05 - 选择目标钱包页面', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.click('button:has-text("启动传送门")')
    await page.waitForTimeout(300)
    
    await page.click('[data-slot="card"]:has-text("BFM")')
    await page.waitForTimeout(300)
    
    await page.fill('input[type="number"]', '500')
    await page.click('button:has-text("下一步")')
    await page.waitForTimeout(300)
    
    await expect(page).toHaveScreenshot('05-select-target.png')
  })

  test('06 - 确认页面', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await page.click('button:has-text("启动传送门")')
    await page.waitForTimeout(300)
    
    await page.click('[data-slot="card"]:has-text("BFM")')
    await page.waitForTimeout(300)
    
    await page.fill('input[type="number"]', '500')
    await page.click('button:has-text("下一步")')
    await page.waitForTimeout(300)
    
    await page.click('button:has-text("选择目标钱包")')
    await page.waitForTimeout(300)
    
    await expect(page).toHaveScreenshot('06-confirm.png')
  })
})
