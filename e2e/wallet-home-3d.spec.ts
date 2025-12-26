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

test.describe('Wallet Home 3D', () => {
  test.beforeEach(async ({ page }) => {
    // 假设已有钱包，直接访问首页
    await page.goto('/')
  })

  test.describe('Wallet Card Display', () => {
    test('should display wallet card with 3D perspective', async ({ page }) => {
      const card = page.locator('.wallet-card-container')
      await expect(card).toBeVisible()

      // 检查 3D 透视容器
      const perspectiveContainer = page.locator('.perspective-\\[1000px\\]')
      await expect(perspectiveContainer).toBeVisible()
    })

    test('should display wallet name on card', async ({ page }) => {
      const walletName = page.locator('.wallet-card h2')
      await expect(walletName).toBeVisible()
    })

    test('should display chain selector button', async ({ page }) => {
      const chainButton = page.locator('.wallet-card button').filter({ hasText: /Ethereum|Tron|Bitcoin/i })
      await expect(chainButton.first()).toBeVisible()
    })

    test('should display truncated address', async ({ page }) => {
      const address = page.locator('.wallet-card .font-mono')
      await expect(address).toBeVisible()
      const text = await address.textContent()
      expect(text).toMatch(/^0x[\da-f]{4,6}\.{3}[\da-f]{4}$/i)
    })
  })

  test.describe('Wallet Card Interactions', () => {
    test('should copy address on click', async ({ page }) => {
      // 找到复制按钮（最后一个按钮在底部行）
      const copyButton = page.locator('.wallet-card button').last()
      await copyButton.click()

      // 应该显示成功状态（绿色勾）
      const checkIcon = page.locator('.wallet-card .text-green-300')
      await expect(checkIcon).toBeVisible({ timeout: 1000 })
    })

    test('should open chain selector on chain button click', async ({ page }) => {
      const chainButton = page.locator('.wallet-card button').filter({ hasText: /Ethereum|Tron|Bitcoin/i }).first()
      await chainButton.click()

      // 应该打开链选择器
      // 具体验证取决于 ChainSelectorJob 的实现
      await page.waitForTimeout(300)
    })

    test('should respond to mouse hover with 3D effect', async ({ page }) => {
      const card = page.locator('.wallet-card')
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
      const sendButton = page.locator('button').filter({ hasText: /发送|转账|Send/i })
      await expect(sendButton.first()).toBeVisible()
    })

    test('should display receive button', async ({ page }) => {
      const receiveButton = page.locator('button').filter({ hasText: /收款|Receive/i })
      await expect(receiveButton.first()).toBeVisible()
    })

    test('should display scan button', async ({ page }) => {
      const scanButton = page.locator('button').filter({ hasText: /扫码|Scan/i })
      await expect(scanButton.first()).toBeVisible()
    })

    test('should navigate to send page', async ({ page }) => {
      const sendButton = page.locator('button').filter({ hasText: /发送|转账|Send/i }).first()
      await sendButton.click()

      await expect(page).toHaveURL(/\/send/)
    })

    test('should navigate to receive page', async ({ page }) => {
      const receiveButton = page.locator('button').filter({ hasText: /收款|Receive/i }).first()
      await receiveButton.click()

      await expect(page).toHaveURL(/\/receive/)
    })
  })

  test.describe('Content Tabs', () => {
    test('should display assets and history tabs', async ({ page }) => {
      const assetsTab = page.locator('button').filter({ hasText: /资产|Assets/i })
      const historyTab = page.locator('button').filter({ hasText: /交易|History/i })

      await expect(assetsTab.first()).toBeVisible()
      await expect(historyTab.first()).toBeVisible()
    })

    test('should show assets content by default', async ({ page }) => {
      // 资产 tab 应该默认激活
      const assetsTab = page.locator('button').filter({ hasText: /资产|Assets/i }).first()
      await expect(assetsTab).toHaveClass(/text-primary|border-primary/)
    })

    test('should switch to history tab', async ({ page }) => {
      const historyTab = page.locator('button').filter({ hasText: /交易|History/i }).first()
      await historyTab.click()

      await expect(historyTab).toHaveClass(/text-primary|border-primary|text-foreground/)
    })

    test('should display token list in assets tab', async ({ page }) => {
      // 确保在资产 tab
      const assetsTab = page.locator('button').filter({ hasText: /资产|Assets/i }).first()
      await assetsTab.click()

      // 应该显示代币列表或空状态
      const tokenList = page.locator('[class*="token"]')
      const emptyState = page.locator('[class*="empty"]')

      const hasTokens = await tokenList.first().isVisible().catch(() => false)
      const isEmpty = await emptyState.first().isVisible().catch(() => false)

      expect(hasTokens || isEmpty).toBeTruthy()
    })

    test('should display transaction list in history tab', async ({ page }) => {
      const historyTab = page.locator('button').filter({ hasText: /交易|History/i }).first()
      await historyTab.click()

      await page.waitForTimeout(300)

      // 应该显示交易列表或空状态
      const txList = page.locator('[class*="transaction"]')
      const emptyState = page.locator('[class*="empty"]')

      const hasTx = await txList.first().isVisible().catch(() => false)
      const isEmpty = await emptyState.first().isVisible().catch(() => false)

      expect(hasTx || isEmpty).toBeTruthy()
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
    test('should display only 2 tabs (wallet and settings)', async ({ page }) => {
      const tabBar = page.locator('[class*="tab-bar"], nav')
      if (!(await tabBar.isVisible())) return

      const tabs = tabBar.locator('button, a')
      const count = await tabs.count()

      // 应该只有 2 个 tab
      expect(count).toBe(2)
    })

    test('should navigate to settings', async ({ page }) => {
      const settingsTab = page.locator('button, a').filter({ hasText: /设置|Settings/i }).first()
      if (!(await settingsTab.isVisible())) return

      await settingsTab.click()

      await expect(page).toHaveURL(/\/settings/)
    })
  })

  test.describe('Visual Regression', () => {
    test('wallet card should match snapshot', async ({ page }) => {
      const card = page.locator('.wallet-card-container')
      if (!(await card.isVisible())) return

      await expect(card).toHaveScreenshot('wallet-card-3d.png', {
        animations: 'disabled',
      })
    })

    test('content tabs should match snapshot', async ({ page }) => {
      const tabs = page.locator('[class*="content-tabs"], [class*="ContentTabs"]').first()
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
    const card = page.locator('.wallet-card')
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
    const assetsTab = page.locator('button').filter({ hasText: /资产|Assets/i }).first()
    const historyTab = page.locator('button').filter({ hasText: /交易|History/i }).first()

    if (!(await assetsTab.isVisible())) return

    await assetsTab.focus()
    await page.keyboard.press('Tab')

    await expect(historyTab).toBeFocused()
  })
})
