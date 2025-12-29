import { test, expect } from '@playwright/test'
import { UI_TEXT, TEST_IDS, byTestId } from './helpers/i18n'

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

test.describe('Forge UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('01 - connect page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first()).toBeVisible()
    await expect(page).toHaveScreenshot('01-connect.png')
  })

  test('02 - swap page after connect', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await expect(page.locator(`button:has-text("${UI_TEXT.swap.button.source}")`).first()).toBeVisible()

    await expect(page).toHaveScreenshot('02-swap.png')
  })

  test('03 - swap page with amount', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('input[type="number"]')

    await page.fill('input[type="number"]', '1.5')
    await expect(page.locator('input[type="number"]')).toHaveValue('1.5')

    await expect(page).toHaveScreenshot('03-swap-amount.png')
  })

  test('04 - token picker', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('button:has-text("ETH")')

    await page.click('button:has-text("ETH")')
    await expect(page.locator(`text=${UI_TEXT.token.select.source}`).first()).toBeVisible()

    await expect(page).toHaveScreenshot('04-token-picker.png')
  })

  test('05 - confirm page', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('input[type="number"]')

    await page.fill('input[type="number"]', '1.5')

    const previewButton = page.locator(`button:has-text("${UI_TEXT.swap.preview.source}")`).first()
    if (await previewButton.isVisible()) {
      await previewButton.click()
      await expect(page.locator(`text=${UI_TEXT.confirm.title.source}`).first()).toBeVisible()
    }

    await expect(page).toHaveScreenshot('05-confirm.png')
  })
})
