import { test, expect } from '@playwright/test'
import { UI_TEXT } from './helpers/i18n'

// Mock API responses using fetch interception
const mockApiResponses = `
  const originalFetch = window.fetch
  window.fetch = async (url, options) => {
    const urlStr = typeof url === 'string' ? url : url.toString()
    
    // Mock asset type list
    if (urlStr.includes('/transmit/assetTypeList')) {
      return {
        ok: true,
        json: () => Promise.resolve({
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
        }),
      }
    }
    
    // Mock records list
    if (urlStr.includes('/transmit/records')) {
      return {
        ok: true,
        json: () => Promise.resolve({ page: 1, pageSize: 10, dataList: [] }),
      }
    }
    
    // Mock transmit POST
    if (urlStr.includes('/transmit') && options?.method === 'POST') {
      return {
        ok: true,
        json: () => Promise.resolve({ orderId: 'mock-order-123' }),
      }
    }
    
    // Mock record detail
    if (urlStr.includes('/transmit/recordDetail')) {
      return {
        ok: true,
        json: () => Promise.resolve({
          state: 3,
          orderState: 4, // SUCCESS
          swapRatio: 1,
          updatedTime: new Date().toISOString(),
        }),
      }
    }
    
    return originalFetch(url, options)
  }
`

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
    // Mock API calls via fetch interception
    await page.addInitScript(mockApiResponses)
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

    // Wait for asset selection page
    await expect(page.getByText(UI_TEXT.asset.select)).toBeVisible({ timeout: 10000 })
    
    // Wait for assets to load, then click ETH card
    const ethCard = page.getByText('ETH → BFMCHAIN').first()
    await expect(ethCard).toBeVisible({ timeout: 5000 })
    await ethCard.click()
    
    // Verify amount input is visible (wait for step transition)
    await expect(page.locator('input[type="number"]')).toBeVisible({ timeout: 10000 })

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

    // Wait for asset selection page and click ETH
    await expect(page.getByText(UI_TEXT.asset.select)).toBeVisible({ timeout: 10000 })
    const ethCard = page.getByText('ETH → BFMCHAIN').first()
    await ethCard.click()

    // Fill amount
    await expect(page.locator('input[type="number"]')).toBeVisible({ timeout: 10000 })
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

    // Wait for asset selection page and select ETH
    await expect(page.getByText(UI_TEXT.asset.select)).toBeVisible({ timeout: 10000 })
    const ethCard = page.getByText('ETH → BFMCHAIN').first()
    await ethCard.click()

    // Fill amount and click next
    await expect(page.locator('input[type="number"]')).toBeVisible({ timeout: 10000 })
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

    // Wait for asset selection page and select ETH
    await expect(page.getByText(UI_TEXT.asset.select)).toBeVisible({ timeout: 10000 })
    const ethCard = page.getByText('ETH → BFMCHAIN').first()
    await ethCard.click()

    // Fill amount and proceed
    await expect(page.locator('input[type="number"]')).toBeVisible({ timeout: 10000 })
    await page.fill('input[type="number"]', '500')
    await page.getByRole('button', { name: UI_TEXT.amount.next }).click()

    // Select target wallet
    await expect(page.getByRole('button', { name: UI_TEXT.target.button })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: UI_TEXT.target.button }).click()
    
    // Verify confirm page (use exact: true to avoid matching multiple elements)
    await expect(page.getByText('发送', { exact: true })).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('接收', { exact: true })).toBeVisible()
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

    // Wait for asset selection page and select ETH
    await expect(page.getByText(UI_TEXT.asset.select)).toBeVisible({ timeout: 10000 })
    const ethCard = page.getByText('ETH → BFMCHAIN').first()
    await ethCard.click()

    // Fill amount and proceed
    await expect(page.locator('input[type="number"]')).toBeVisible({ timeout: 10000 })
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
    // Mock bio SDK that throws connection error
    await page.addInitScript(`
      window.bio = {
        request: async ({ method }) => {
          if (method === 'bio_closeSplashScreen') return
          throw new Error('连接失败')
        },
        on: () => {},
        off: () => {},
        isConnected: () => false,
      }
    `)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for connect button
    const connectBtn = page.getByRole('button', { name: UI_TEXT.connect.button })
    await expect(connectBtn).toBeVisible({ timeout: 10000 })
    await connectBtn.click()
    
    // Verify error message (bio SDK throws error)
    await expect(page.getByText('连接失败')).toBeVisible({ timeout: 5000 })

    await expect(page).toHaveScreenshot('08-error-no-sdk.png')
  })

  // ============ 边界场景测试 ============

  test('09 - API failure - asset list unavailable', async ({ page }) => {
    // Override API mock to return error for asset list
    await page.addInitScript(`
      const originalFetch = window.fetch
      window.fetch = async (url, options) => {
        const urlStr = typeof url === 'string' ? url : url.toString()
        if (urlStr.includes('/transmit/assetTypeList')) {
          throw new Error('Network Error')
        }
        return originalFetch(url, options)
      }
    `)
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Connect button should be visible
    const connectBtn = page.getByRole('button', { name: UI_TEXT.connect.button })
    await expect(connectBtn).toBeVisible({ timeout: 10000 })
    
    // Config error message should be visible (API failed to load)
    await expect(page.getByText(UI_TEXT.connect.configError)).toBeVisible({ timeout: 5000 })
  })

  test('10 - user rejects wallet selection', async ({ page }) => {
    // Mock bio SDK that rejects wallet selection
    await page.addInitScript(`
      window.bio = {
        request: async ({ method }) => {
          if (method === 'bio_closeSplashScreen') return
          if (method === 'bio_selectAccount') {
            throw new Error('用户取消')
          }
          return {}
        },
        on: () => {},
        off: () => {},
        isConnected: () => true,
      }
    `)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const connectBtn = page.getByRole('button', { name: UI_TEXT.connect.button })
    await expect(connectBtn).toBeVisible({ timeout: 10000 })
    await connectBtn.click()

    // Should show user cancelled error
    await expect(page.getByText('用户取消')).toBeVisible({ timeout: 5000 })
  })

  test('11 - transmit API failure', async ({ page }) => {
    // Mock API that fails on transmit
    await page.addInitScript(`
      const originalFetch = window.fetch
      window.fetch = async (url, options) => {
        const urlStr = typeof url === 'string' ? url : url.toString()
        
        if (urlStr.includes('/transmit/assetTypeList')) {
          return {
            ok: true,
            json: () => Promise.resolve({
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
                },
              },
            }),
          }
        }
        
        // Fail on transmit POST
        if (urlStr.includes('/transmit') && options?.method === 'POST') {
          throw new Error('服务器错误')
        }
        
        return originalFetch(url, options)
      }
    `)
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate through flow
    const connectBtn = page.getByRole('button', { name: UI_TEXT.connect.button })
    await expect(connectBtn).toBeVisible({ timeout: 10000 })
    await connectBtn.click()

    // Select asset
    await expect(page.getByText(UI_TEXT.asset.select)).toBeVisible({ timeout: 10000 })
    await page.getByText('ETH → BFMCHAIN').first().click()

    // Fill amount
    await expect(page.locator('input[type="number"]')).toBeVisible({ timeout: 10000 })
    await page.fill('input[type="number"]', '100')
    await page.getByRole('button', { name: UI_TEXT.amount.next }).click()

    // Select target
    await expect(page.getByRole('button', { name: UI_TEXT.target.button })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: UI_TEXT.target.button }).click()

    // Confirm - this should fail
    await expect(page.getByRole('button', { name: UI_TEXT.confirm.button })).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: UI_TEXT.confirm.button }).click()

    // Should show error (use first() to handle multiple matching elements)
    await expect(page.getByText(/传送失败|服务器错误/).first()).toBeVisible({ timeout: 10000 })
  })
})
