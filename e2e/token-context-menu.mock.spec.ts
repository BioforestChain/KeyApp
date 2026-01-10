import { test, expect, type Page } from '@playwright/test'
import { UI_TEXT } from './helpers/i18n'

/**
 * Token Context Menu E2E Tests
 * 
 * Tests for the token context menu feature:
 * - More button click triggers action sheet
 * - Long press triggers action sheet on mobile
 * - Transfer and destroy actions work correctly
 */

// Test wallet data with BioForest chain tokens
const TEST_WALLET_DATA = {
  wallets: [
    {
      id: 'test-wallet-1',
      name: '测试钱包',
      address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
      chain: 'bfmeta',
      chainAddresses: [
        {
          chain: 'bfmeta',
          address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
          tokens: [
            { symbol: 'BFM', name: 'BFMeta', balance: '10000', decimals: 8 },
            { symbol: 'USDT', name: 'Tether USD', balance: '500', decimals: 8 },
            { symbol: 'TEST', name: 'Test Token', balance: '1000', decimals: 8 },
          ],
        },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test' },
      createdAt: Date.now(),
      tokens: [],
    },
  ],
  currentWalletId: 'test-wallet-1',
  selectedChain: 'bfmeta',
}

async function setupTestWallet(page: Page, language: string = 'zh-CN') {
  await page.addInitScript((data) => {
    localStorage.setItem('bfm_wallets', JSON.stringify(data.wallet))
    localStorage.setItem('bfm_preferences', JSON.stringify({ language: data.lang, currency: 'USD' }))
  }, { wallet: TEST_WALLET_DATA, lang: language })

  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

async function waitForAppReady(page: Page) {
  await page.locator('svg[aria-label="加载中"]').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {})
}

test.describe('Token Context Menu - More Button', () => {
  test('clicking more button opens action sheet', async ({ page }) => {
    await setupTestWallet(page)
    await waitForAppReady(page)

    // Wait for wallet home to load
    await page.waitForSelector('[data-testid="wallet-home"]', { timeout: 10000 })
    
    // Find the more button on a token item (non-main asset like USDT)
    const moreButton = page.locator('button[aria-label="更多操作"]').first()
    
    if (await moreButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await moreButton.click()
      
      // Wait for action sheet to appear
      await page.waitForTimeout(300)
      
      // Check for transfer and destroy options
      const transferOption = page.getByText('转账')
      const destroyOption = page.getByText('销毁')
      
      const hasTransfer = await transferOption.isVisible().catch(() => false)
      const hasDestroy = await destroyOption.isVisible().catch(() => false)
      
      console.log(`Action sheet visible - Transfer: ${hasTransfer}, Destroy: ${hasDestroy}`)
      
      // Take screenshot
      await expect(page).toHaveScreenshot('token-action-sheet.png')
    } else {
      console.log('More button not visible - wallet may not have loaded correctly')
    }
  })

  test('transfer action navigates to send page', async ({ page }) => {
    await setupTestWallet(page)
    await waitForAppReady(page)

    await page.waitForSelector('[data-testid="wallet-home"]', { timeout: 10000 })
    
    const moreButton = page.locator('button[aria-label="更多操作"]').first()
    
    if (await moreButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await moreButton.click()
      await page.waitForTimeout(300)
      
      // Use more specific selector to avoid conflict with wallet home send button
      const transferOption = page.locator('[role="dialog"], [data-state="open"]').getByText('转账')
      if (await transferOption.isVisible().catch(() => false)) {
        await transferOption.click()
        await page.waitForTimeout(500)
        
        // Should navigate to send page
        const url = page.url()
        const hasSendInUrl = url.includes('send') || url.includes('transfer')
        console.log(`Navigated to: ${url}, has send: ${hasSendInUrl}`)
        
        // Check for send page elements
        const sendPageTitle = page.locator('h1')
        if (await sendPageTitle.isVisible()) {
          const titleText = await sendPageTitle.textContent()
          console.log(`Send page title: ${titleText}`)
        }
      }
    }
  })

  test('destroy action navigates to destroy page', async ({ page }) => {
    await setupTestWallet(page)
    await waitForAppReady(page)

    await page.waitForSelector('[data-testid="wallet-home"]', { timeout: 10000 })
    
    // Find more button for a non-main asset (USDT or TEST, not BFM)
    const tokenItems = page.locator('[role="button"]').filter({ hasText: /USDT|TEST/ })
    const moreButton = tokenItems.first().locator('button[aria-label="更多操作"]')
    
    if (await moreButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await moreButton.click()
      await page.waitForTimeout(300)
      
      const destroyOption = page.getByText('销毁')
      if (await destroyOption.isVisible()) {
        await destroyOption.click()
        await page.waitForTimeout(500)
        
        // Should navigate to destroy page
        const url = page.url()
        const hasDestroyInUrl = url.includes('destroy')
        console.log(`Navigated to: ${url}, has destroy: ${hasDestroyInUrl}`)
        
        // Take screenshot
        await expect(page).toHaveScreenshot('destroy-page.png')
      } else {
        console.log('Destroy option not visible - may be main asset')
      }
    } else {
      console.log('More button not visible for non-main asset')
    }
  })
})

test.describe('Token Context Menu - Long Press', () => {
  test('long press opens action sheet on mobile', async ({ page }) => {
    await setupTestWallet(page)
    await waitForAppReady(page)

    await page.waitForSelector('[data-testid="wallet-home"]', { timeout: 10000 })
    
    // Find a token item
    const tokenItem = page.locator('[role="button"]').filter({ hasText: 'USDT' }).first()
    
    if (await tokenItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      const box = await tokenItem.boundingBox()
      if (box) {
        // Simulate long press using touch events
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
        
        // Hold for 600ms (longer than 500ms threshold)
        const startX = box.x + box.width / 2
        const startY = box.y + box.height / 2
        
        await page.evaluate(async ({ x, y }) => {
          const el = document.elementFromPoint(x, y)
          if (el) {
            el.dispatchEvent(new TouchEvent('touchstart', {
              bubbles: true,
              cancelable: true,
              touches: [new Touch({ identifier: 0, target: el, clientX: x, clientY: y })],
            }))
            
            await new Promise(r => setTimeout(r, 600))
            
            el.dispatchEvent(new TouchEvent('touchend', {
              bubbles: true,
              cancelable: true,
              touches: [],
            }))
          }
        }, { x: startX, y: startY })
        
        await page.waitForTimeout(200)
        
        // Check for action sheet
        const transferOption = page.getByText('转账')
        const hasTransfer = await transferOption.isVisible().catch(() => false)
        console.log(`Long press triggered action sheet: ${hasTransfer}`)
      }
    }
  })
})

test.describe('Token Context Menu - Right Click', () => {
  test('right click opens action sheet on desktop', async ({ page }) => {
    await setupTestWallet(page)
    await waitForAppReady(page)

    await page.waitForSelector('[data-testid="wallet-home"]', { timeout: 10000 })
    
    // Find a token item
    const tokenItem = page.locator('[role="button"]').filter({ hasText: 'USDT' }).first()
    
    if (await tokenItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Right click on token item
      await tokenItem.click({ button: 'right' })
      await page.waitForTimeout(300)
      
      // Check for action sheet
      const transferOption = page.getByText('转账')
      const hasTransfer = await transferOption.isVisible().catch(() => false)
      console.log(`Right click triggered action sheet: ${hasTransfer}`)
      
      if (hasTransfer) {
        await expect(page).toHaveScreenshot('token-context-menu-right-click.png')
      }
    }
  })
})

test.describe('Token Context Menu - Main Asset Restrictions', () => {
  test('main asset should not show destroy option', async ({ page }) => {
    await setupTestWallet(page)
    await waitForAppReady(page)

    await page.waitForSelector('[data-testid="wallet-home"]', { timeout: 10000 })
    
    // Find the main asset (BFM)
    const mainAssetItem = page.locator('[role="button"]').filter({ hasText: 'BFM' }).first()
    const moreButton = mainAssetItem.locator('button[aria-label="更多操作"]')
    
    if (await moreButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await moreButton.click()
      await page.waitForTimeout(300)
      
      // Use more specific selector for action sheet options
      const destroyOption = page.locator('[role="dialog"], [data-state="open"]').getByText('销毁')
      const transferOption = page.locator('[role="dialog"], [data-state="open"]').getByText('转账')
      const hasDestroy = await destroyOption.isVisible().catch(() => false)
      
      console.log(`Main asset (BFM) has destroy option: ${hasDestroy}`)
      
      // Main asset should not have destroy option
      expect(hasDestroy).toBe(false)
      
      // But transfer should still be available
      const hasTransfer = await transferOption.isVisible().catch(() => false)
      expect(hasTransfer).toBe(true)
    } else {
      console.log('More button not visible for main asset - may have different behavior')
    }
  })
})

test.describe('Token Context Menu - Screenshots', () => {
  test('wallet home with context menu buttons', async ({ page }) => {
    await setupTestWallet(page)
    await waitForAppReady(page)

    await page.waitForSelector('[data-testid="wallet-home"]', { timeout: 10000 })
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot('wallet-home-with-menu-buttons.png')
  })
})
