import { test, expect, type Page } from '@playwright/test'
import { UI_TEXT } from './helpers/i18n'

/**
 * 服务集成 E2E 测试 - Dev 环境
 * 
 * 测试剪贴板、Toast、触觉反馈等服务在真实环境下的行为
 * 
 * 注意：使用 data-testid 和多语言正则，避免硬编码文本
 */

const DEFAULT_PATTERN = [0, 1, 2, 5]
const TEST_MNEMONIC = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

async function drawPattern(page: Page, gridTestId: string, nodes: number[]): Promise<void> {
  const grid = page.locator(`[data-testid="${gridTestId}"]`)
  await grid.scrollIntoViewIfNeeded()
  const box = await grid.boundingBox()
  if (!box) throw new Error(`Pattern grid ${gridTestId} not visible`)

  const size = 3
  const toPoint = (index: number) => {
    const row = Math.floor(index / size)
    const col = index % size
    return {
      x: box.x + box.width * ((col + 0.5) / size),
      y: box.y + box.height * ((row + 0.5) / size),
    }
  }

  const points = nodes.map((node) => toPoint(node))
  const first = points[0]!
  await page.mouse.move(first.x, first.y)
  await page.mouse.down()
  for (const point of points.slice(1)) {
    await page.mouse.move(point.x, point.y, { steps: 8 })
  }
  await page.mouse.up()
}

async function importWallet(page: Page): Promise<void> {
  await page.goto('/#/wallet/import')
  await page.waitForSelector('[data-testid="mnemonic-step"]')

  const words = TEST_MNEMONIC.split(' ')
  for (let i = 0; i < words.length; i++) {
    await page.locator(`[data-word-index="${i}"]`).fill(words[i]!)
  }

  await page.click('[data-testid="continue-button"]')
  await page.waitForSelector('[data-testid="pattern-step"]')

  await drawPattern(page, 'pattern-lock-set-grid', DEFAULT_PATTERN)
  await page.waitForSelector('[data-testid="pattern-lock-confirm-grid"]')
  await drawPattern(page, 'pattern-lock-confirm-grid', DEFAULT_PATTERN)

  await page.waitForSelector('[data-testid="chain-selector-step"]')
  await page.click('[data-testid="chain-selector-complete-button"]')

  await page.waitForURL(/.*#\/$/)
  await expect(page.locator('[data-testid="wallet-name"]:visible').first()).toBeVisible({ timeout: 10000 })
}

test.describe('ClipboardService - Dev 环境', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
  })

  test('收款页面复制地址', async ({ page }) => {
    await importWallet(page)

    // 导航到收款页面（使用多语言正则）
    await page.locator(`button:has-text("${UI_TEXT.receive.source}")`).first().click()
    await page.waitForURL(/.*#\/receive/)

    // 点击复制按钮（使用 data-testid 或 aria-label）
    const copyButton = page.locator('[data-testid="copy-button"], button[aria-label*="copy" i]').first()
    if (await copyButton.isVisible()) {
      await copyButton.click()
      
      // 验证复制成功提示（使用多语言正则）
      await expect(page.locator(`text=${UI_TEXT.copy.source}`).first()).toBeVisible({ timeout: 3000 })
    }
  })
})

test.describe('ToastService - Dev 环境', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
  })

  test('复制后显示 Toast 提示', async ({ page }) => {
    await importWallet(page)

    // 点击复制地址按钮（在首页）
    const copyButton = page.locator('button[aria-label*="复制"], button[aria-label*="copy"]').first()
    if (await copyButton.isVisible()) {
      await copyButton.click()
      
      // Toast 应该显示
      const toast = page.locator('[role="alert"], [data-testid="toast"]').first()
      await expect(toast).toBeVisible({ timeout: 3000 })
    }
  })
})

test.describe('Navigation - Dev 环境', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
  })

  test('底部导航切换', async ({ page }) => {
    await importWallet(page)

    // 验证底部导航存在
    const nav = page.locator('nav, [role="navigation"]').first()
    await expect(nav).toBeVisible()

    // 切换到设置
    await page.goto('/#/settings')
    await expect(page.locator(`h1:has-text("${UI_TEXT.settings.source}")`).first()).toBeVisible()

    // 切换到历史
    await page.goto('/#/history')
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('返回按钮功能', async ({ page }) => {
    await importWallet(page)

    // 进入发送页面（使用多语言正则）
    await page.locator(`button:has-text("${UI_TEXT.send.source}")`).first().click()
    await page.waitForURL(/.*#\/send/)

    // 点击返回（使用 data-testid 或 aria-label）
    await page.locator('[data-testid="back-button"], button[aria-label*="back" i]').first().click()

    // 应该返回首页
    await page.waitForURL(/.*#\/$/)
  })
})
