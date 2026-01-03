import { test, expect } from '@playwright/test'
import { UI_TEXT } from './helpers/i18n'

const mockApiResponses = `
  // Mock fetch for API calls
  // Real endpoints: /cot/recharge/support, /cot/recharge/V2
  const originalFetch = window.fetch
  window.fetch = async (url, options) => {
    const urlStr = typeof url === 'string' ? url : url.toString()
    
    // Match real endpoint: /cot/recharge/support
    if (urlStr.includes('/cot/recharge/support') || urlStr.includes('/recharge/support')) {
      return {
        ok: true,
        json: () => Promise.resolve({
          recharge: {
            bfmeta: {
              BFM: {
                enable: true,
                logo: '',
                supportChain: {
                  ETH: { enable: true, assetType: 'ETH', depositAddress: '0x1234567890', logo: '' },
                  BSC: { enable: true, assetType: 'BNB', depositAddress: '0xabcdef1234', logo: '' },
                },
              },
            },
          },
        }),
      }
    }
    // Match real endpoint: /cot/recharge/V2
    if (urlStr.includes('/cot/recharge/V2') || urlStr.includes('/recharge/V2')) {
      return {
        ok: true,
        json: () => Promise.resolve({ orderId: 'order-123456' }),
      }
    }
    return originalFetch(url, options)
  }
`

const mockBioSDK = `
  window.bio = {
    request: async ({ method, params }) => {
      if (method === 'bio_closeSplashScreen') return {}
      if (method === 'bio_selectAccount') {
        const chain = params?.[0]?.chain || 'eth'
        return { 
          address: chain === 'bfmeta' ? 'bfmeta1234567890' : '0x1234567890abcdef1234567890abcdef12345678', 
          chain,
          name: 'Test Wallet' 
        }
      }
      if (method === 'bio_createTransaction') {
        return { txHash: 'unsigned-tx-123' }
      }
      if (method === 'bio_signTransaction') {
        return { data: '0xsigned-tx-data-456' }
      }
      if (method === 'bio_signMessage') {
        return { signature: 'signature-789', publicKey: 'pubkey-abc123' }
      }
      return {}
    }
  }
`

test.describe('Forge UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.addInitScript(mockApiResponses)
  })

  test('01 - connect page shows welcome screen', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Should show title and subtitle
    await expect(page.locator(`text=${UI_TEXT.app.subtitle.source}`)).toBeVisible()
    await expect(page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first()).toBeVisible()

    await expect(page).toHaveScreenshot('01-connect.png')
  })

  test('02 - swap page after wallet connect', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Click connect button
    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()

    // Should show swap UI with pay/receive
    await expect(page.locator(`text=${UI_TEXT.swap.pay.source}`).first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator(`text=${UI_TEXT.swap.receive.source}`).first()).toBeVisible()

    await expect(page).toHaveScreenshot('02-swap.png')
  })

  test('03 - swap page with amount entered', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('input[type="number"]', { timeout: 10000 })

    // Enter amount
    await page.fill('input[type="number"]', '1.5')
    await expect(page.locator('input[type="number"]')).toHaveValue('1.5')

    // Preview button should be enabled
    const previewButton = page.locator(`button:has-text("${UI_TEXT.swap.preview.source}")`)
    await expect(previewButton).toBeEnabled()

    await expect(page).toHaveScreenshot('03-swap-amount.png')
  })

  test('04 - token picker modal', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('button:has-text("ETH")', { timeout: 10000 })

    // Click token selector to open picker
    await page.click('button:has-text("ETH")')
    await expect(page.locator(`text=${UI_TEXT.token.select.source}`).first()).toBeVisible()

    // Should show available tokens (use heading to be specific)
    await expect(page.getByRole('heading', { name: 'Ethereum' })).toBeVisible()

    await expect(page).toHaveScreenshot('04-token-picker.png')
  })

  test('05 - confirm page', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('input[type="number"]', { timeout: 10000 })

    // Enter amount
    await page.fill('input[type="number"]', '1.5')

    // Click preview
    await page.locator(`button:has-text("${UI_TEXT.swap.preview.source}")`).click()

    // Should show confirm page
    await expect(page.locator(`button:has-text("${UI_TEXT.confirm.button.source}")`).first()).toBeVisible({ timeout: 5000 })

    await expect(page).toHaveScreenshot('05-confirm.png')
  })

  test('06 - error state without bio SDK', async ({ page }) => {
    // Mock bio SDK that throws connection error
    await page.addInitScript(`
      window.bio = {
        request: async ({ method }) => {
          if (method === 'bio_closeSplashScreen') return {}
          throw new Error('连接失败')
        }
      }
    `)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for button to be enabled (config loaded)
    const connectBtn = page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first()
    await expect(connectBtn).toBeEnabled({ timeout: 10000 })
    await connectBtn.click()

    // Should show error message (bio SDK throws error)
    await expect(page.locator('text=连接失败')).toBeVisible({ timeout: 5000 })

    await expect(page).toHaveScreenshot('06-error.png')
  })

  test('07 - full forge flow', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Step 1: Connect
    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('input[type="number"]', { timeout: 10000 })

    // Step 2: Enter amount
    await page.fill('input[type="number"]', '0.5')

    // Step 3: Preview
    await page.locator(`button:has-text("${UI_TEXT.swap.preview.source}")`).click()
    await expect(page.locator(`button:has-text("${UI_TEXT.confirm.button.source}")`).first()).toBeVisible({ timeout: 5000 })

    // Step 4: Confirm
    await page.locator(`button:has-text("${UI_TEXT.confirm.button.source}")`).first().click()

    // Should show success or processing
    await expect(
      page.locator(`text=${UI_TEXT.success.title.source}`).or(page.locator(`text=${UI_TEXT.processing.signingExternal.source}`))
    ).toBeVisible({ timeout: 15000 })

    await expect(page).toHaveScreenshot('07-flow-complete.png')
  })

  test('08 - back navigation from confirm', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate to confirm page
    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('input[type="number"]', { timeout: 10000 })
    await page.fill('input[type="number"]', '1.0')
    await page.locator(`button:has-text("${UI_TEXT.swap.preview.source}")`).click()
    await expect(page.locator(`button:has-text("${UI_TEXT.confirm.button.source}")`).first()).toBeVisible({ timeout: 5000 })

    // Click back button
    await page.locator('button[aria-label="back"], button:has(svg.lucide-chevron-left)').first().click()

    // Should go back to swap page
    await expect(page.locator('input[type="number"]')).toBeVisible()
  })

  test('09 - token selection change', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('button:has-text("ETH")', { timeout: 10000 })

    // Open picker
    await page.click('button:has-text("ETH")')
    await expect(page.locator(`text=${UI_TEXT.token.select.source}`)).toBeVisible()

    // Select different token (BNB → BFM option under BNB Chain)
    const bnbOption = page.locator('text=BNB → BFM').first()
    if (await bnbOption.isVisible()) {
      await bnbOption.click()
      // Picker should close, wait a moment for state update
      await page.waitForTimeout(500)
      // Token selector should now show BNB
      await expect(page.locator('button:has-text("BNB")').first()).toBeVisible({ timeout: 5000 })
    }
  })

  // ============ 边界场景测试 ============

  test('10 - API failure - config unavailable', async ({ page }) => {
    // Override API mock to throw network error
    await page.addInitScript(`
      const originalFetch = window.fetch
      window.fetch = async (url, options) => {
        const urlStr = typeof url === 'string' ? url : url.toString()
        if (urlStr.includes('/cot/recharge/support') || urlStr.includes('/recharge/support')) {
          throw new Error('Network Error')
        }
        return originalFetch(url, options)
      }
    `)
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Connect button should be visible
    const connectBtn = page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first()
    await expect(connectBtn).toBeVisible({ timeout: 10000 })
    
    // Error message should be visible (config load failed)
    await expect(page.locator(`text=${UI_TEXT.connect.configError.source}`)).toBeVisible({ timeout: 5000 })
  })

  test('11 - user rejects wallet connection', async ({ page }) => {
    // Mock bio SDK that rejects wallet selection
    await page.addInitScript(`
      window.bio = {
        request: async ({ method }) => {
          if (method === 'bio_closeSplashScreen') return {}
          if (method === 'bio_selectAccount') {
            throw new Error('用户取消')
          }
          return {}
        }
      }
    `)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const connectBtn = page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first()
    await expect(connectBtn).toBeVisible({ timeout: 10000 })
    await connectBtn.click()

    // Should show user cancelled error
    await expect(page.locator('text=用户取消')).toBeVisible({ timeout: 5000 })
  })

  test('12 - recharge API failure', async ({ page }) => {
    // Mock API that fails on recharge
    await page.addInitScript(`
      const originalFetch = window.fetch
      window.fetch = async (url, options) => {
        const urlStr = typeof url === 'string' ? url : url.toString()
        
        if (urlStr.includes('/cot/recharge/support') || urlStr.includes('/recharge/support')) {
          return {
            ok: true,
            json: () => Promise.resolve({
              recharge: {
                bfmeta: {
                  BFM: {
                    enable: true,
                    logo: '',
                    supportChain: {
                      ETH: { enable: true, assetType: 'ETH', depositAddress: '0x1234567890', logo: '' },
                    },
                  },
                },
              },
            }),
          }
        }
        
        // Fail on recharge POST
        if (urlStr.includes('/cot/recharge/V2') || urlStr.includes('/recharge/V2')) {
          throw new Error('服务器错误')
        }
        
        return originalFetch(url, options)
      }
    `)
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate through flow
    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('input[type="number"]', { timeout: 10000 })

    // Enter amount
    await page.fill('input[type="number"]', '0.5')

    // Click preview
    await page.locator(`button:has-text("${UI_TEXT.swap.preview.source}")`).click()
    await expect(page.locator(`button:has-text("${UI_TEXT.confirm.button.source}")`).first()).toBeVisible({ timeout: 5000 })

    // Confirm - this should eventually fail
    await page.locator(`button:has-text("${UI_TEXT.confirm.button.source}")`).first().click()

    // Should show error (may take time due to signing flow)
    await expect(page.getByText(/锻造失败|服务器错误/).first()).toBeVisible({ timeout: 15000 })
  })
})
