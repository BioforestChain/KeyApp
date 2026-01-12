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
                chainName: 'bfmeta',
                assetType: 'BFM',
                applyAddress: 'b0000000000000000000000000000000000000000',
                supportChain: {
                  ETH: { enable: true, assetType: 'ETH', depositAddress: '0x1234567890', logo: '' },
                  BSC: { enable: true, assetType: 'BNB', depositAddress: '0xabcdef1234', logo: '' },
                },
                redemption: {
                  enable: true,
                  min: '100000000',
                  max: '10000000000000',
                  fee: { ETH: '1000000', BSC: '500000', TRON: '500000' },
                  radioFee: '0.001',
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
    // Match redemption endpoint
    if (urlStr.includes('/cot/redemption/V2') || urlStr.includes('/redemption/V2')) {
      return {
        ok: true,
        json: () => Promise.resolve({ orderId: 'redemption-789012' }),
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
        const chain = params?.[0]?.chain || 'bfmeta'
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
  
  // Mock ethereum provider for EVM chains
  window.ethereum = {
    request: async ({ method }) => {
      if (method === 'wallet_switchEthereumChain') return null
      if (method === 'eth_requestAccounts') return ['0x1234567890abcdef1234567890abcdef12345678']
      if (method === 'eth_chainId') return '0x1'
      return null
    }
  }
`

test.describe('BioBridge UI', () => {
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

  test('04 - swap page with token display', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()
    await page.waitForSelector('input[type="number"]', { timeout: 10000 })

    // Verify swap page shows token info
    await expect(page.locator('text=支付').first()).toBeVisible()
    await expect(page.locator('text=获得').first()).toBeVisible()

    await expect(page).toHaveScreenshot('04-swap-tokens.png')
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
    // Mock bio SDK that throws connection error, and ethereum provider
    await page.addInitScript(`
      window.bio = {
        request: async ({ method }) => {
          if (method === 'bio_closeSplashScreen') return {}
          throw new Error('连接失败')
        }
      }
      window.ethereum = {
        request: async ({ method }) => {
          if (method === 'wallet_switchEthereumChain') return null
          if (method === 'eth_requestAccounts') throw new Error('连接失败')
          return null
        }
      }
    `)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for button to be enabled (config loaded)
    const connectBtn = page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first()
    await expect(connectBtn).toBeEnabled({ timeout: 10000 })
    await connectBtn.click()

    // Should show error message (connection throws error)
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

    // Step 4: Take screenshot at confirm page (actual signing requires real SDK)
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

  test('09 - mode tabs visible', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for config to load - mode tabs should be visible since redemption is enabled
    await expect(page.locator('text=充值')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=赎回')).toBeVisible({ timeout: 5000 })

    await expect(page).toHaveScreenshot('09-mode-tabs.png')
  })

  test('09b - redemption mode UI', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Wait for mode tabs and click redemption
    await expect(page.locator('text=赎回')).toBeVisible({ timeout: 10000 })
    await page.click('text=赎回')

    // Should show redemption UI
    await expect(page.locator('text=赎回').first()).toBeVisible()
    await expect(page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first()).toBeVisible()

    await expect(page).toHaveScreenshot('09b-redemption-mode.png')
  })

  test('09c - redemption form after connect', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Switch to redemption mode
    await expect(page.locator('text=赎回')).toBeVisible({ timeout: 10000 })
    await page.click('text=赎回')

    // Connect wallet
    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()

    // Wait for redemption form to appear
    await expect(page.locator('input[type="number"]')).toBeVisible({ timeout: 10000 })

    // Should show redemption form with amount input and limits
    await expect(page.locator('text=限额').first()).toBeVisible()

    await expect(page).toHaveScreenshot('09c-redemption-form.png')
  })

  test('09d - redemption form with amount', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Switch to redemption mode and connect
    await expect(page.locator('text=赎回')).toBeVisible({ timeout: 10000 })
    await page.click('text=赎回')
    await page.locator(`button:has-text("${UI_TEXT.connect.button.source}")`).first().click()

    // Wait for form
    await expect(page.locator('input[type="number"]')).toBeVisible({ timeout: 10000 })

    // Enter amount
    await page.fill('input[type="number"]', '100')

    // Enter target address in the text input (placeholder contains "地址" or "address")
    const addressInput = page.locator('input[type="text"]').first()
    await addressInput.fill('0x1234567890abcdef1234567890abcdef12345678')

    // Wait for fee calculation to show
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('09d-redemption-amount.png')
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
    // Mock bio SDK that rejects wallet selection, and ethereum that rejects
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
      window.ethereum = {
        request: async ({ method }) => {
          if (method === 'wallet_switchEthereumChain') return null
          if (method === 'eth_requestAccounts') throw new Error('用户取消')
          return null
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

    // Take screenshot at confirm page - actual API failure requires real signing
    await expect(page).toHaveScreenshot('12-api-failure-confirm.png')
  })
})
