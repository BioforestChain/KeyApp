import { test, expect } from '@playwright/test'
import { UI_TEXT } from './helpers/i18n'

// Mock API response for asset type list
const mockAssetTypeListResponse = JSON.stringify({
  transmitSupport: {
    ETH: {
      ETH: {
        enable: true,
        isAirdrop: false,
        assetType: 'ETH',
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
        targetChain: 'BFMCHAIN',
        targetAsset: 'BFM',
        ratio: { numerator: 1, denominator: 1 },
        transmitDate: { startDate: '2020-01-01', endDate: '2030-12-31' },
      },
      USDT: {
        enable: true,
        isAirdrop: false,
        assetType: 'USDT',
        recipientAddress: '0x1234567890abcdef1234567890abcdef12345678',
        targetChain: 'BFMCHAIN',
        targetAsset: 'USDM',
        ratio: { numerator: 1, denominator: 1 },
        transmitDate: { startDate: '2020-01-01', endDate: '2030-12-31' },
      },
    },
  },
})

// Mock Bio SDK with chain support
const mockBioSDK = `
  window.bio = {
    request: async ({ method, params }) => {
      if (method === 'bio_closeSplashScreen') return
      if (method === 'bio_selectAccount') {
        return { address: '0x1234567890abcdef1234567890abcdef12345678', chain: 'ETH', name: 'Test Wallet' }
      }
      if (method === 'bio_pickWallet') {
        return { address: 'bfm_abcdef1234567890abcdef1234567890abcdef12', chain: 'BFMCHAIN', name: 'Target Wallet' }
      }
      if (method === 'bio_getBalance') {
        return '1000.00'
      }
      if (method === 'bio_createTransaction') {
        return { chainId: 'ETH', data: { raw: '0x...' } }
      }
      if (method === 'bio_signTransaction') {
        return { chainId: 'ETH', data: {}, signature: '0x123abc...' }
      }
      return {}
    },
    on: () => {},
    off: () => {},
    isConnected: () => true,
  }
`

test.describe('Teleport UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Mock API calls
    await page.route('**/payment/transmit/assetTypeList', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: mockAssetTypeListResponse,
      })
    })
    
    await page.route('**/payment/transmit/records**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ page: 1, pageSize: 10, dataList: [] }),
      })
    })
    
    await page.route('**/payment/transmit', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ orderId: 'mock-order-123' }),
        })
      }
    })
    
    await page.route('**/payment/transmit/recordDetail**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          state: 3,
          orderState: 4, // SUCCESS
          swapRatio: 1,
          updatedTime: new Date().toISOString(),
        }),
      })
    })
  })

  test('01 - connect page', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Wait for config to load and button to show
    await expect(page.getByRole('button', { name: UI_TEXT.connect.button })).toBeVisible({ timeout: 10000 })
    await expect(page).toHaveScreenshot('01-connect.png')
  })

  test('02 - asset selection page', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for and click connect button
    const connectBtn = page.getByRole('button', { name: UI_TEXT.connect.button })
    await expect(connectBtn).toBeVisible({ timeout: 10000 })
    await connectBtn.click()
    
    // Wait for asset selection page
    await expect(page.getByText(UI_TEXT.asset.select)).toBeVisible({ timeout: 5000 })
    await expect(page.locator('[data-slot="card"]').first()).toBeVisible()

    await expect(page).toHaveScreenshot('02-select-asset.png')
  })

  test('03 - amount input page', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Connect
    const connectBtn = page.getByRole('button', { name: UI_TEXT.connect.button })
    await expect(connectBtn).toBeVisible({ timeout: 10000 })
    await connectBtn.click()

    // Select first asset (ETH)
    await expect(page.locator('[data-slot="card"]').first()).toBeVisible({ timeout: 5000 })
    await page.locator('[data-slot="card"]').first().click()
    
    // Verify amount input is visible
    await expect(page.locator('input[type="number"]')).toBeVisible()

    await expect(page).toHaveScreenshot('03-input-amount.png')
  })

  test('04 - amount filled', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Connect
    const connectBtn = page.getByRole('button', { name: UI_TEXT.connect.button })
    await expect(connectBtn).toBeVisible({ timeout: 10000 })
    await connectBtn.click()

    // Select asset
    await expect(page.locator('[data-slot="card"]').first()).toBeVisible({ timeout: 5000 })
    await page.locator('[data-slot="card"]').first().click()

    // Fill amount
    await page.waitForSelector('input[type="number"]')
    await page.fill('input[type="number"]', '500')
    await expect(page.locator('input[type="number"]')).toHaveValue('500')
    
    // Verify expected receive is shown
    await expect(page.getByText(UI_TEXT.amount.expected)).toBeVisible()

    await expect(page).toHaveScreenshot('04-amount-filled.png')
  })

  test('05 - target wallet selection', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Connect
    const connectBtn = page.getByRole('button', { name: UI_TEXT.connect.button })
    await expect(connectBtn).toBeVisible({ timeout: 10000 })
    await connectBtn.click()

    // Select asset
    await expect(page.locator('[data-slot="card"]').first()).toBeVisible({ timeout: 5000 })
    await page.locator('[data-slot="card"]').first().click()

    // Fill amount and click next
    await page.waitForSelector('input[type="number"]')
    await page.fill('input[type="number"]', '500')
    await page.getByRole('button', { name: UI_TEXT.amount.next }).click()
    
    // Verify target wallet selection page
    await expect(page.getByText(UI_TEXT.target.willTransfer)).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: UI_TEXT.target.button })).toBeVisible()

    await expect(page).toHaveScreenshot('05-select-target.png')
  })

  test('06 - confirm page', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Connect
    const connectBtn = page.getByRole('button', { name: UI_TEXT.connect.button })
    await expect(connectBtn).toBeVisible({ timeout: 10000 })
    await connectBtn.click()

    // Select asset
    await expect(page.locator('[data-slot="card"]').first()).toBeVisible({ timeout: 5000 })
    await page.locator('[data-slot="card"]').first().click()

    // Fill amount and proceed
    await page.waitForSelector('input[type="number"]')
    await page.fill('input[type="number"]', '500')
    await page.getByRole('button', { name: UI_TEXT.amount.next }).click()

    // Select target wallet
    await expect(page.getByRole('button', { name: UI_TEXT.target.button })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: UI_TEXT.target.button }).click()
    
    // Verify confirm page
    await expect(page.getByText(UI_TEXT.confirm.send)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(UI_TEXT.confirm.receive)).toBeVisible()
    await expect(page.getByRole('button', { name: UI_TEXT.confirm.button })).toBeVisible()

    await expect(page).toHaveScreenshot('06-confirm.png')
  })

  test('07 - success page', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Connect
    const connectBtn = page.getByRole('button', { name: UI_TEXT.connect.button })
    await expect(connectBtn).toBeVisible({ timeout: 10000 })
    await connectBtn.click()

    // Select asset
    await expect(page.locator('[data-slot="card"]').first()).toBeVisible({ timeout: 5000 })
    await page.locator('[data-slot="card"]').first().click()

    // Fill amount and proceed
    await page.waitForSelector('input[type="number"]')
    await page.fill('input[type="number"]', '500')
    await page.getByRole('button', { name: UI_TEXT.amount.next }).click()

    // Select target wallet
    await expect(page.getByRole('button', { name: UI_TEXT.target.button })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: UI_TEXT.target.button }).click()

    // Confirm transfer
    await expect(page.getByRole('button', { name: UI_TEXT.confirm.button })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: UI_TEXT.confirm.button }).click()
    
    // Verify success page
    await expect(page.getByText(UI_TEXT.success.title)).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: UI_TEXT.success.newTransfer })).toBeVisible()

    await expect(page).toHaveScreenshot('07-success.png')
  })

  test('08 - error when SDK not initialized', async ({ page }) => {
    // Don't add bio SDK mock
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for connect button
    const connectBtn = page.getByRole('button', { name: UI_TEXT.connect.button })
    await expect(connectBtn).toBeVisible({ timeout: 10000 })
    await connectBtn.click()
    
    // Verify error message
    await expect(page.getByText(UI_TEXT.error.sdkNotInit)).toBeVisible({ timeout: 5000 })

    await expect(page).toHaveScreenshot('08-error-no-sdk.png')
  })
})
