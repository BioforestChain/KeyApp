import { test, expect, type Page } from './fixtures'

/**
 * Token Menu Transfer Flow - Complete E2E Test with Screenshots
 * 
 * 完整的从菜单点击转账到发送页面的流程测试，每一步都截图
 */

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

async function setupTestWallet(page: Page) {
  await page.addInitScript((data) => {
    localStorage.setItem('bfm_wallets', JSON.stringify(data.wallet))
    localStorage.setItem('bfm_preferences', JSON.stringify({ language: 'zh-CN', currency: 'USD' }))
  }, { wallet: TEST_WALLET_DATA })

  await page.goto('/')
  await page.waitForLoadState('networkidle')
}

async function waitForAppReady(page: Page) {
  await page.locator('svg[aria-label="加载中"]').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {})
}

test.describe('Token Menu Transfer Flow - Step by Step', () => {
  test('complete transfer flow from menu click', async ({ page }) => {
    // Step 1: Setup and load wallet home
    await setupTestWallet(page)
    await waitForAppReady(page)
    
    console.log('Step 1: Waiting for wallet home...')
    await page.waitForSelector('[data-testid="wallet-home"]', { timeout: 10000 })
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('step-1-wallet-home.png')
    console.log('Step 1: Wallet home loaded')

    // Step 2: Find and click more button on BFM token
    console.log('Step 2: Looking for more button...')
    const moreButtons = page.locator('button[aria-label="更多操作"]')
    const moreButtonCount = await moreButtons.count()
    console.log(`Step 2: Found ${moreButtonCount} more buttons`)
    
    if (moreButtonCount === 0) {
      console.log('Step 2: No more buttons found, taking screenshot')
      await expect(page).toHaveScreenshot('step-2-no-more-buttons.png')
      throw new Error('No more buttons found on token items')
    }

    const firstMoreButton = moreButtons.first()
    await expect(page).toHaveScreenshot('step-2-before-click-more.png')
    await firstMoreButton.click()
    console.log('Step 2: Clicked more button')

    // Step 3: Wait for action sheet and screenshot
    console.log('Step 3: Waiting for action sheet...')
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('step-3-action-sheet-open.png')

    // Check what's in the dropdown menu (uses data-slot="dropdown-menu-content")
    const menuContent = await page.locator('[data-slot="dropdown-menu-content"]').textContent().catch(() => '')
    console.log(`Step 3: Menu content: ${menuContent}`)

    // Step 4: Find and click transfer option
    console.log('Step 4: Looking for transfer option...')
    // DropdownMenu uses data-slot="dropdown-menu-item" for menu items
    const transferOption = page.locator('[data-slot="dropdown-menu-item"]').filter({ hasText: '转账' })
    const transferVisible = await transferOption.isVisible().catch(() => false)
    console.log(`Step 4: Transfer option visible: ${transferVisible}`)

    if (!transferVisible) {
      // Try alternative selectors
      const allItems = page.locator('[data-slot="dropdown-menu-item"]')
      const itemCount = await allItems.count()
      console.log(`Step 4: Found ${itemCount} menu items`)
      
      for (let i = 0; i < itemCount; i++) {
        const item = allItems.nth(i)
        const text = await item.textContent().catch(() => '')
        console.log(`Step 4: Item ${i}: "${text}"`)
      }
      
      await expect(page).toHaveScreenshot('step-4-transfer-not-found.png')
      throw new Error('Transfer option not found in dropdown menu')
    }

    await transferOption.click()
    console.log('Step 4: Clicked transfer option')

    // Step 5: Wait for navigation and screenshot send page
    console.log('Step 5: Waiting for send page...')
    await page.waitForTimeout(1000)
    
    const currentUrl = page.url()
    console.log(`Step 5: Current URL: ${currentUrl}`)
    await expect(page).toHaveScreenshot('step-5-after-transfer-click.png')

    // Step 6: Check send page content
    console.log('Step 6: Checking send page content...')
    const pageContent = await page.content()
    const hasError = pageContent.includes('error') || pageContent.includes('Error') || pageContent.includes('错误')
    console.log(`Step 6: Page has error: ${hasError}`)

    // Check for specific elements
    const h1 = page.locator('h1')
    if (await h1.isVisible().catch(() => false)) {
      const title = await h1.textContent()
      console.log(`Step 6: Page title: ${title}`)
    }

    // Check for address input
    const addressInput = page.locator('[data-testid="address-input"], input[placeholder*="地址"]')
    const hasAddressInput = await addressInput.isVisible().catch(() => false)
    console.log(`Step 6: Has address input: ${hasAddressInput}`)

    // Check for amount input
    const amountInput = page.locator('[data-testid="amount-input"], input[placeholder="0"]')
    const hasAmountInput = await amountInput.isVisible().catch(() => false)
    console.log(`Step 6: Has amount input: ${hasAmountInput}`)

    await expect(page).toHaveScreenshot('step-6-send-page-content.png')

    // Step 7: Check for any error messages
    console.log('Step 7: Checking for error messages...')
    const errorElements = page.locator('.text-destructive, .text-red-500, [role="alert"]')
    const errorCount = await errorElements.count()
    console.log(`Step 7: Found ${errorCount} error elements`)

    for (let i = 0; i < errorCount; i++) {
      const errorText = await errorElements.nth(i).textContent()
      console.log(`Step 7: Error ${i}: "${errorText}"`)
    }

    if (errorCount > 0) {
      await expect(page).toHaveScreenshot('step-7-errors-found.png')
    }

    // Final assertion
    expect(currentUrl).toContain('send')
  })

  test('complete destroy flow from menu click', async ({ page }) => {
    // Step 1: Setup and load wallet home
    await setupTestWallet(page)
    await waitForAppReady(page)
    
    console.log('Step 1: Waiting for wallet home...')
    await page.waitForSelector('[data-testid="wallet-home"]', { timeout: 10000 })
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('destroy-step-1-wallet-home.png')

    // Step 2: Find USDT token (non-main asset) and click its more button
    console.log('Step 2: Looking for USDT token more button...')
    const usdtToken = page.locator('[role="button"]').filter({ hasText: 'USDT' })
    const usdtVisible = await usdtToken.isVisible().catch(() => false)
    console.log(`Step 2: USDT token visible: ${usdtVisible}`)

    if (!usdtVisible) {
      await expect(page).toHaveScreenshot('destroy-step-2-usdt-not-found.png')
      throw new Error('USDT token not found')
    }

    const moreButton = usdtToken.locator('button[aria-label="更多操作"]')
    const moreVisible = await moreButton.isVisible().catch(() => false)
    console.log(`Step 2: More button visible: ${moreVisible}`)

    if (!moreVisible) {
      await expect(page).toHaveScreenshot('destroy-step-2-more-not-found.png')
      throw new Error('More button not found on USDT token')
    }

    await moreButton.click()
    console.log('Step 2: Clicked more button')

    // Step 3: Wait for action sheet
    console.log('Step 3: Waiting for action sheet...')
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('destroy-step-3-action-sheet.png')

    // Step 4: Click destroy option
    console.log('Step 4: Looking for destroy option...')
    const destroyOption = page.locator('[role="dialog"], [data-state="open"]').getByText('销毁')
    const destroyVisible = await destroyOption.isVisible().catch(() => false)
    console.log(`Step 4: Destroy option visible: ${destroyVisible}`)

    if (!destroyVisible) {
      await expect(page).toHaveScreenshot('destroy-step-4-destroy-not-found.png')
      throw new Error('Destroy option not found')
    }

    await destroyOption.click()
    console.log('Step 4: Clicked destroy option')

    // Step 5: Wait for destroy page
    console.log('Step 5: Waiting for destroy page...')
    await page.waitForTimeout(1000)
    
    const currentUrl = page.url()
    console.log(`Step 5: Current URL: ${currentUrl}`)
    await expect(page).toHaveScreenshot('destroy-step-5-destroy-page.png')

    // Step 6: Check destroy page content
    console.log('Step 6: Checking destroy page content...')
    const h1 = page.locator('h1')
    if (await h1.isVisible().catch(() => false)) {
      const title = await h1.textContent()
      console.log(`Step 6: Page title: ${title}`)
    }

    // Check for error messages
    const errorElements = page.locator('.text-destructive, .text-red-500, [role="alert"]')
    const errorCount = await errorElements.count()
    console.log(`Step 6: Found ${errorCount} error elements`)

    for (let i = 0; i < errorCount; i++) {
      const errorText = await errorElements.nth(i).textContent()
      console.log(`Step 6: Error ${i}: "${errorText}"`)
    }

    await expect(page).toHaveScreenshot('destroy-step-6-page-content.png')

    expect(currentUrl).toContain('destroy')
  })
})
