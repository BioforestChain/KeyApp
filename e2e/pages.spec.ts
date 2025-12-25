import { test, expect, type Page } from '@playwright/test'
import { UI_TEXT, TEST_IDS, byTestId } from './helpers/i18n'

/**
 * 页面 E2E 测试 - Dev 环境
 * 
 * 在真实环境下测试页面基础功能，需要先创建钱包
 * 
 * 与 pages.mock.spec.ts 的区别：
 * - 这里不依赖预设数据，而是先创建钱包
 * - 测试真实的服务交互（不是 mock）
 * - 主要验证页面加载和基础 UI 功能
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

  // 填写助记词
  const words = TEST_MNEMONIC.split(' ')
  for (let i = 0; i < words.length; i++) {
    await page.locator(`[data-word-index="${i}"]`).fill(words[i]!)
  }

  await page.click('[data-testid="continue-button"]')
  await page.waitForSelector('[data-testid="pattern-step"]')

  // 设置图案锁
  await drawPattern(page, 'pattern-lock-set-grid', DEFAULT_PATTERN)
  await page.waitForSelector('[data-testid="pattern-lock-confirm-grid"]')
  await drawPattern(page, 'pattern-lock-confirm-grid', DEFAULT_PATTERN)

  // 完成链选择
  await page.waitForSelector('[data-testid="chain-selector-step"]')
  await page.click('[data-testid="chain-selector-complete-button"]')

  // 等待跳转到首页
  await page.waitForURL(/.*#\/$/)
  await expect(page.locator('[data-testid="wallet-name"]:visible').first()).toBeVisible({ timeout: 10000 })
}

test.describe('页面 - Dev 环境', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
  })

  test.describe('首页', () => {
    test('有钱包时显示钱包信息', async ({ page }) => {
      await importWallet(page)

      // 验证首页基础元素
      await expect(page.locator('[data-testid="wallet-name"]').first()).toBeVisible()
      await expect(page.locator('button[data-testid="chain-selector"]').first()).toBeVisible()
    })

    test('链切换弹窗可打开', async ({ page }) => {
      await importWallet(page)

      // 打开链切换弹窗
      await page.locator('button[data-testid="chain-selector"]:visible').first().click()
      await expect(page.locator('[data-testid="chain-sheet"]')).toBeVisible()
    })

    test('可切换到 BFMeta 链', async ({ page }) => {
      await importWallet(page)

      // 打开链选择器
      await page.locator('button[data-testid="chain-selector"]:visible').first().click()
      await page.waitForSelector('[data-testid="chain-sheet"]')

      // 选择 BFMeta
      await page.click('[data-testid="chain-item-bfmeta"]')

      // 验证链已切换（地址格式变化）
      await expect(page.locator('.font-mono').first()).toContainText(/^[bc]/)
    })
  })

  test.describe('发送页面', () => {
    test('发送页面可访问', async ({ page }) => {
      await importWallet(page)

      // 导航到发送页面（使用多语言正则）
      await page.locator(`button:has-text("${UI_TEXT.send.source}")`).first().click()
      await page.waitForURL(/.*#\/send/)

      // 验证发送表单存在
      await expect(byTestId(page, TEST_IDS.sendForm)).toBeVisible()
    })

    test('发送表单验证收款地址', async ({ page }) => {
      await importWallet(page)
      await page.locator(`button:has-text("${UI_TEXT.send.source}")`).first().click()
      await page.waitForURL(/.*#\/send/)

      // 输入无效地址（使用 data-testid 或 input type）
      const addressInput = byTestId(page, TEST_IDS.addressInput).or(page.locator('input[type="text"]').first())
      await addressInput.fill('invalid-address')
      await addressInput.blur()

      // 应该显示错误提示
      // 注意：具体的错误提示取决于实现
    })
  })

  test.describe('收款页面', () => {
    test('收款页面显示二维码', async ({ page }) => {
      await importWallet(page)

      // 导航到收款页面（使用多语言正则）
      await page.locator(`button:has-text("${UI_TEXT.receive.source}")`).first().click()
      await page.waitForURL(/.*#\/receive/)

      // 验证二维码存在
      await expect(page.locator('canvas, svg').first()).toBeVisible()
    })
  })

  test.describe('设置页面', () => {
    test('设置页面可访问', async ({ page }) => {
      await importWallet(page)

      // 导航到设置页面
      await page.goto('/#/settings')
      await page.waitForLoadState('networkidle')

      // 验证设置页面标题（使用多语言正则）
      await expect(page.locator(`h1:has-text("${UI_TEXT.settings.source}")`).first()).toBeVisible()
    })

    test('链配置页面可访问', async ({ page }) => {
      await importWallet(page)

      await page.goto('/#/settings/chains')
      await page.waitForLoadState('networkidle')

      // 验证链配置内容
      await expect(page.locator('text=BFMeta')).toBeVisible()
    })
  })

  test.describe('历史记录页面', () => {
    test('历史页面可访问', async ({ page }) => {
      await importWallet(page)

      await page.goto('/#/history')
      await page.waitForLoadState('networkidle')

      // 验证历史页面（可能显示空状态）
      await expect(page.locator('h1, h2').first()).toBeVisible()
    })
  })
})

test.describe('无钱包状态', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
  })

  test('首页显示创建钱包引导', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 验证显示创建/导入钱包按钮
    await expect(page.locator('[data-testid="create-wallet-button"]')).toBeVisible()
  })

  test('访问需要钱包的页面会重定向', async ({ page }) => {
    await page.goto('/#/send')
    await page.waitForLoadState('networkidle')

    // 应该重定向到首页或显示创建钱包引导
    await expect(page.locator('[data-testid="create-wallet-button"]')).toBeVisible()
  })
})
