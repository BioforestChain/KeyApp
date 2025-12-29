import { test, expect } from '@playwright/test'
import { UI_TEXT, TEST_IDS, byTestId } from './helpers/i18n'

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

test.describe('Teleport UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('01 - connect page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first()).toBeVisible()
    await expect(page).toHaveScreenshot('01-connect.png')
  })

  test('02 - asset selection page', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await expect(page.locator('[data-slot="card"]').first()).toBeVisible()

    await expect(page).toHaveScreenshot('02-select-asset.png')
  })

  test('03 - amount input page', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('[data-slot="card"]')

    await page.click('[data-slot="card"]:has-text("BFM")')
    await expect(page.locator('input[type="number"]')).toBeVisible()

    await expect(page).toHaveScreenshot('03-input-amount.png')
  })

  test('04 - amount filled', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('[data-slot="card"]')

    await page.click('[data-slot="card"]:has-text("BFM")')
    await page.waitForSelector('input[type="number"]')

    await page.fill('input[type="number"]', '500')
    await expect(page.locator('input[type="number"]')).toHaveValue('500')

    await expect(page).toHaveScreenshot('04-amount-filled.png')
  })

  test('05 - target wallet selection', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('[data-slot="card"]')

    await page.click('[data-slot="card"]:has-text("BFM")')
    await page.waitForSelector('input[type="number"]')

    await page.fill('input[type="number"]', '500')
    await page.locator(`button:has-text("${UI_TEXT.amount.next.source}")`).first().click()
    await expect(page.locator(`text=${UI_TEXT.target.title.source}`).first()).toBeVisible()

    await expect(page).toHaveScreenshot('05-select-target.png')
  })

  test('06 - confirm page', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('[data-slot="card"]')

    await page.click('[data-slot="card"]:has-text("BFM")')
    await page.waitForSelector('input[type="number"]')

    await page.fill('input[type="number"]', '500')
    await page.locator(`button:has-text("${UI_TEXT.amount.next.source}")`).first().click()
    await page.waitForSelector(`text=${UI_TEXT.target.title.source}`)

    await page.locator(`button:has-text("${UI_TEXT.target.button.source}")`).first().click()
    await expect(page.locator(`text=${UI_TEXT.confirm.title.source}`).first()).toBeVisible()

    await expect(page).toHaveScreenshot('06-confirm.png')
  })
})
