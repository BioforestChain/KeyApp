import { test, expect, type Page } from '@playwright/test'

const DEFAULT_PATTERN = [0, 1, 2, 5]

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

async function fillVerifyInputs(page: Page, words: string[]): Promise<void> {
  const inputs = page.locator('[data-verify-index]')
  const count = await inputs.count()
  for (let i = 0; i < count; i++) {
    const input = inputs.nth(i)
    const indexAttr = await input.getAttribute('data-verify-index')
    const index = indexAttr ? Number(indexAttr) : NaN
    if (Number.isFinite(index)) {
      await input.fill(words[index] ?? '')
    }
  }
}

// Helper to create wallet for tests that require it
async function createTestWallet(page: Page) {
  await page.goto('/#/wallet/create')
  await page.waitForSelector('[data-testid="pattern-step"]')

  await drawPattern(page, 'pattern-lock-set-grid', DEFAULT_PATTERN)
  await page.waitForSelector('[data-testid="pattern-lock-confirm-grid"]')
  await drawPattern(page, 'pattern-lock-confirm-grid', DEFAULT_PATTERN)

  await page.waitForSelector('[data-testid="mnemonic-step"]')
  await page.click('[data-testid="toggle-mnemonic-button"]')

  const mnemonicDisplay = page.locator('[data-testid="mnemonic-display"]')
  const wordElements = mnemonicDisplay.locator('span.font-medium:not(.blur-sm)')
  const wordCount = await wordElements.count()
  const words: string[] = []
  for (let i = 0; i < wordCount; i++) {
    const word = await wordElements.nth(i).textContent()
    if (word) words.push(word.trim())
  }

  await page.click('[data-testid="mnemonic-backed-up-button"]')

  await page.waitForSelector('[data-testid="verify-step"]')
  await fillVerifyInputs(page, words)

  await page.click('[data-testid="verify-next-button"]')
  await page.waitForSelector('[data-testid="chain-selector-step"]')
  await page.click('[data-testid="chain-selector-complete-button"]')

  await page.waitForURL('/#/')
  await page.waitForSelector('[data-testid="chain-selector"]', { timeout: 10000 })
}

test.describe('Scanner 页面', () => {
  test('显示扫描界面', async ({ page }) => {
    await page.goto('/#/scanner')

    await expect(page.locator('[data-testid="page-title"]')).toBeVisible()
    await expect(page.locator('[data-testid="gallery-button"]')).toBeVisible()
    await expect(page.locator('[data-testid="back-button"]')).toBeVisible()
  })

  test('权限拒绝或不支持时显示重试按钮', async ({ page }) => {
    await page.goto('/#/scanner')

    await page.waitForTimeout(1000)

    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  test.skip('返回按钮导航回首页', async ({ page }) => {
    await createTestWallet(page)
    await page.click('[data-testid="scan-fab"]')
    await page.waitForSelector('[data-testid="page-title"]')
    await page.click('[data-testid="back-button"]')
    await expect(page).toHaveURL(/.*#\/$/)
  })
})

test.describe('Scanner 集成', () => {
  test('发送页面有扫描图标', async ({ page }) => {
    await page.goto('/#/send')

    await expect(page.locator('[data-testid="scan-address-button"]')).toBeVisible()
  })

  test('首页 FAB 导航到扫描页', async ({ page }) => {
    await createTestWallet(page)

    await expect(page.locator('[data-testid="scan-fab"]')).toBeVisible()

    await page.click('[data-testid="scan-fab"]')

    await expect(page).toHaveURL(/.*#\/scanner\/?$/)
  })
})
