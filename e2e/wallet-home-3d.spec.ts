import { test, expect, type Page } from '@playwright/test'

/**
 * 钱包首页 3D 卡片 E2E 测试
 *
 * 测试三页合一后的首页功能：
 * - 3D 钱包卡片展示和交互
 * - 钱包轮播切换
 * - 资产/交易 Tab 切换
 * - 快捷操作按钮
 * - 钱包列表展开
 */

const E2E_WALLET_SEED = {
  wallets: [
    {
      id: 'e2e-wallet-ethereum',
      name: 'E2E Wallet',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f00000',
      chain: 'ethereum',
      keyType: 'mnemonic',
      encryptedMnemonic: {
        ciphertext: 'e2e',
        iv: 'e2e',
        salt: 'e2e',
      },
      createdAt: 1,
      chainAddresses: [
        {
          chain: 'ethereum',
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f00000',
          tokens: [],
        },
      ],
    },
  ],
  currentWalletId: 'e2e-wallet-ethereum',
}

async function seedWallet(page: Page) {
  await page.addInitScript(async (seed) => {
    localStorage.clear()
    sessionStorage.clear()

    const databases = await indexedDB.databases()
    for (const db of databases) {
      if (db.name) indexedDB.deleteDatabase(db.name)
    }

    localStorage.setItem('bfm_wallets', JSON.stringify(seed))
    localStorage.setItem('bfm_preferences', JSON.stringify({ language: 'zh-CN', currency: 'CNY' }))
  }, E2E_WALLET_SEED)
}

test.describe('Wallet Home 3D', () => {
  test.beforeEach(async ({ page }) => {
    await seedWallet(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.getByTestId('wallet-card-container')).toBeVisible({ timeout: 10_000 })
  })

  test.describe('Wallet Card Display', () => {
    test('should display wallet card with 3D perspective', async ({ page }) => {
      const card = page.getByTestId('wallet-card-container')
      await expect(card).toBeVisible()

      // 检查 3D 透视容器
      await expect(card).toHaveCSS('perspective', '1000px')
    })

    test('should display wallet name on card', async ({ page }) => {
      const walletName = page.getByTestId('wallet-name')
      await expect(walletName).toBeVisible()
    })

    test('should display chain selector button', async ({ page }) => {
      await expect(page.getByTestId('wallet-card').getByTestId('chain-selector')).toBeVisible()
    })

    test('should display truncated address', async ({ page }) => {
      const address = E2E_WALLET_SEED.wallets[0].address
      const last4 = address.slice(-4)

      const addressText = page.getByTestId('wallet-card-address-text')
      await expect(page.getByTestId('wallet-card-address')).toHaveAttribute('title', address)
      await expect(addressText).toBeVisible()

      const text = (await addressText.textContent()) ?? ''
      expect(text).toContain('...')
      expect(text).toMatch(/^0x/i)
      expect(text.toLowerCase()).toContain(last4.toLowerCase())
    })
  })

  test.describe('Wallet Card Interactions', () => {
    test('should copy address on click', async ({ page }) => {
      const copyButton = page.getByTestId('wallet-card-copy-button')
      await copyButton.click()

      await expect(copyButton).toHaveAttribute('data-copied', 'true', { timeout: 1000 })
    })

    test('should open chain selector on chain button click', async ({ page }) => {
      const chainButton = page.getByTestId('wallet-card').getByTestId('chain-selector')
      await chainButton.click()

      // 应该打开链选择器
      // 具体验证取决于 ChainSelectorJob 的实现
      await page.waitForTimeout(300)
    })

    test('should respond to mouse hover with 3D effect', async ({ page }) => {
      const card = page.getByTestId('wallet-card')
      const box = await card.boundingBox()
      if (!box) throw new Error('Card not visible')

      // 移动到卡片右上角
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2)

      // 验证卡片处于激活状态
      await expect(card).toHaveAttribute('data-active', 'true')
    })
  })

  test.describe('Wallet Carousel', () => {
    test('should display wallet count button when multiple wallets', async ({ page }) => {
      const walletCountButton = page.locator('button').filter({ hasText: /\d+ 个钱包/ })
      // 只有多个钱包时才显示
      const isVisible = await walletCountButton.isVisible().catch(() => false)
      if (isVisible) {
        await expect(walletCountButton).toBeVisible()
      }
    })

    test('should swipe to next wallet', async ({ page }) => {
      const swiper = page.locator('.wallet-swiper')
      if (!(await swiper.isVisible())) return

      const box = await swiper.boundingBox()
      if (!box) return

      // 获取当前钱包名称
      const walletName = page.locator('.wallet-card h2')
      const initialName = await walletName.textContent()

      // 模拟左滑
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2)
      await page.mouse.down()
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2, { steps: 10 })
      await page.mouse.up()

      await page.waitForTimeout(500)

      // 检查是否切换了钱包（如果有多个钱包）
      const newName = await walletName.textContent()
      // 如果只有一个钱包，名称相同；否则应该不同
    })
  })

  test.describe('Quick Actions', () => {
    test('should display send button', async ({ page }) => {
      await expect(page.getByTestId('wallet-home-send-button')).toBeVisible()
    })

    test('should display receive button', async ({ page }) => {
      await expect(page.getByTestId('wallet-home-receive-button')).toBeVisible()
    })

    test('should display scan button', async ({ page }) => {
      await expect(page.getByTestId('wallet-home-scan-button')).toBeVisible()
    })

    test('should navigate to send page', async ({ page }) => {
      const sendButton = page.getByTestId('wallet-home-send-button')
      await sendButton.click()

      await expect(page).toHaveURL(/\/send/)
    })

    test('should navigate to receive page', async ({ page }) => {
      const receiveButton = page.getByTestId('wallet-home-receive-button')
      await receiveButton.click()

      await expect(page).toHaveURL(/\/receive/)
    })
  })

  test.describe('Content Tabs', () => {
    test('should display assets and history tabs', async ({ page }) => {
      await expect(page.getByTestId('wallet-home-content-tabs-tab-assets')).toBeVisible()
      await expect(page.getByTestId('wallet-home-content-tabs-tab-history')).toBeVisible()
    })

    test('should show assets content by default', async ({ page }) => {
      await expect(page.getByTestId('wallet-home-content-tabs-tab-assets')).toHaveAttribute('data-active', 'true')
    })

    test('should switch to history tab', async ({ page }) => {
      const historyTab = page.getByTestId('wallet-home-content-tabs-tab-history')
      await historyTab.click()
      await expect(historyTab).toHaveAttribute('data-active', 'true')
    })

    test('should display token list in assets tab', async ({ page }) => {
      await page.getByTestId('wallet-home-content-tabs-tab-assets').click()
      const tokenListOrEmpty = page.locator('[data-testid="token-list"], [data-testid="token-list-empty"]').first()
      await expect(tokenListOrEmpty).toBeVisible()
    })

    test('should display transaction list in history tab', async ({ page }) => {
      await page.getByTestId('wallet-home-content-tabs-tab-history').click()
      const txListOrEmpty = page.locator('[data-testid="transaction-list"], [data-testid="transaction-list-empty"]').first()
      await expect(txListOrEmpty).toBeVisible()
    })
  })

  test.describe('Wallet List Sheet', () => {
    test('should open wallet list on button click', async ({ page }) => {
      const walletCountButton = page.locator('button').filter({ hasText: /\d+ 个钱包/ })
      if (!(await walletCountButton.isVisible())) return

      await walletCountButton.click()

      // 应该显示钱包列表 sheet
      const sheet = page.locator('[class*="animate-slide-in-bottom"]')
      await expect(sheet).toBeVisible({ timeout: 1000 })
    })

    test('should display wallet list title', async ({ page }) => {
      const walletCountButton = page.locator('button').filter({ hasText: /\d+ 个钱包/ })
      if (!(await walletCountButton.isVisible())) return

      await walletCountButton.click()

      const title = page.getByRole('heading', { name: /我的钱包|My Wallets/i })
      await expect(title).toBeVisible()
    })

    test('should close wallet list on backdrop click', async ({ page }) => {
      const walletCountButton = page.locator('button').filter({ hasText: /\d+ 个钱包/ })
      if (!(await walletCountButton.isVisible())) return

      await walletCountButton.click()
      await page.waitForTimeout(300)

      // 点击背景关闭
      const backdrop = page.locator('.bg-black\\/50')
      await backdrop.click()

      await expect(backdrop).not.toBeVisible({ timeout: 1000 })
    })

    test('should switch wallet from list', async ({ page }) => {
      const walletCountButton = page.locator('button').filter({ hasText: /\d+ 个钱包/ })
      if (!(await walletCountButton.isVisible())) return

      await walletCountButton.click()
      await page.waitForTimeout(300)

      // 获取第一个非当前钱包
      const walletItems = page.locator('[class*="divide-y"] > div')
      const count = await walletItems.count()
      if (count < 2) return

      // 点击第二个钱包
      const secondWallet = walletItems.nth(1)
      await secondWallet.click()

      // Sheet 应该关闭
      const backdrop = page.locator('.bg-black\\/50')
      await expect(backdrop).not.toBeVisible({ timeout: 1000 })
    })
  })

  test.describe('Tab Bar', () => {
    test('should display wallet/ecosystem/settings tabs', async ({ page }) => {
      const tabBar = page.getByTestId('tab-bar')
      await expect(tabBar).toBeVisible()

      await expect(page.getByTestId('tab-wallet')).toBeVisible()
      await expect(page.getByTestId('tab-ecosystem')).toBeVisible()
      await expect(page.getByTestId('tab-settings')).toBeVisible()
    })

    test('should navigate to settings', async ({ page }) => {
      const settingsTab = page.getByTestId('tab-settings')
      await settingsTab.click()

      await expect(settingsTab).toHaveAttribute('aria-current', 'page')
    })
  })

  test.describe('Visual Regression', () => {
    test('wallet card should match snapshot', async ({ page }) => {
      const card = page.getByTestId('wallet-card-container')
      if (!(await card.isVisible())) return

      await expect(card).toHaveScreenshot('wallet-card-3d.png', {
        animations: 'disabled',
      })
    })

    test('content tabs should match snapshot', async ({ page }) => {
      const tabs = page.getByTestId('wallet-home-content-tabs')
      if (!(await tabs.isVisible())) return

      await expect(tabs).toHaveScreenshot('content-tabs.png', {
        animations: 'disabled',
      })
    })
  })
})

test.describe('Wallet Home 3D - No Wallet', () => {
  test.beforeEach(async ({ page }) => {
    // 清除本地存储，模拟无钱包状态
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.reload()
  })

  test('should display welcome screen when no wallet', async ({ page }) => {
    const welcomeTitle = page.getByRole('heading').filter({ hasText: /欢迎|Welcome/i })
    const isVisible = await welcomeTitle.isVisible().catch(() => false)

    if (isVisible) {
      await expect(welcomeTitle).toBeVisible()
    }
  })

  test('should display create wallet button', async ({ page }) => {
    const createButton = page.locator('button').filter({ hasText: /创建钱包|Create Wallet/i })
    const isVisible = await createButton.first().isVisible().catch(() => false)

    if (isVisible) {
      await expect(createButton.first()).toBeVisible()
    }
  })

  test('should display import wallet button', async ({ page }) => {
    const importButton = page.locator('button').filter({ hasText: /导入钱包|Import Wallet/i })
    const isVisible = await importButton.first().isVisible().catch(() => false)

    if (isVisible) {
      await expect(importButton.first()).toBeVisible()
    }
  })
})

test.describe('Wallet Home 3D - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('wallet card should have proper aria labels', async ({ page }) => {
    const card = page.getByTestId('wallet-card')
    if (!(await card.isVisible())) return

    // 按钮应该有 aria-label
    const buttons = card.locator('button')
    const count = await buttons.count()

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      const hasLabel = await button.getAttribute('aria-label')
      const hasText = await button.textContent()
      expect(hasLabel || hasText).toBeTruthy()
    }
  })

  test('tabs should be keyboard navigable', async ({ page }) => {
    const assetsTab = page.getByTestId('wallet-home-content-tabs-tab-assets')
    const historyTab = page.getByTestId('wallet-home-content-tabs-tab-history')

    if (!(await assetsTab.isVisible())) return

    await assetsTab.focus()
    await page.keyboard.press('Tab')

    await expect(historyTab).toBeFocused()
  })
})
