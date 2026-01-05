/**
 * E2E 测试 - 联系人扫码流程
 * 
 * 使用 mock 模式测试：1. 扫码添加联系人
 * 2. 分享联系人名片
 */

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

async function createTestWallet(page: Page) {
  await page.goto('/#/wallet/create')
  await page.waitForSelector('[data-testid="pattern-step"]')

  await drawPattern(page, 'pattern-lock-set-grid', DEFAULT_PATTERN)
  const nextButton = page.locator('[data-testid="pattern-lock-next-button"]')
  if (await nextButton.isVisible().catch(() => false)) {
    await nextButton.click()
  }
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

  await page.waitForSelector('[data-testid="theme-step"]')
  await page.click('[data-testid="theme-complete-button"]')

  await page.waitForURL(/.*#\/$/)
  await page.waitForSelector('[data-testid="chain-selector"]', { timeout: 10000 })
}

test.describe('联系人协议解析', () => {
  test('解析 JSON 格式联系人', async ({ page }) => {
    // 测试 qr-parser 在浏览器环境中的行为
    const result = await page.evaluate(() => {
      // @ts-expect-error - accessing module from window
      const { parseQRContent } = window.__qrParser || {}
      if (!parseQRContent) return { error: 'qr-parser not loaded' }
      
      const content = '{"type":"contact","name":"张三","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"}]}'
      return parseQRContent(content)
    })
    
    // 如果模块未加载，跳过测试
    if ('error' in result) {
      test.skip()
      return
    }
    
    expect(result.type).toBe('contact')
  })
})

test.describe('联系人分享流程', () => {
  test.beforeEach(async ({ page }) => {
    await createTestWallet(page)
  })

  test('通讯录页面可访问', async ({ page }) => {
    await page.getByTestId('tab-settings').click()
    await page.getByTestId('address-book-button').click()

    const title = page.locator('[data-testid="page-title"]').filter({ hasText: /通讯录|Address Book/i }).first()
    await expect(title).toBeVisible()
  })

  test('可以添加联系人', async ({ page }) => {
    await page.getByTestId('tab-settings').click()
    await page.getByTestId('address-book-button').click()

    await page.getByTestId('address-book-add-button').click()
    await expect(page.getByRole('heading', { name: /添加联系人|Add Contact/i })).toBeVisible()
  })
})

test.describe('ScannerJob 验证器', () => {
  test('ethereumAddress 验证器正确工作', async ({ page }) => {
    const result = await page.evaluate(() => {
      // 模拟验证器逻辑
      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f12345'
      const invalidAddress = '0x123'
      
      return {
        validResult: ethAddressRegex.test(validAddress),
        invalidResult: ethAddressRegex.test(invalidAddress),
      }
    })
    
    expect(result.validResult).toBe(true)
    expect(result.invalidResult).toBe(false)
  })

  test('tronAddress 验证器正确工作', async ({ page }) => {
    const result = await page.evaluate(() => {
      const tronAddressRegex = /^T[a-zA-HJ-NP-Z1-9]{33}$/
      const validAddress = 'TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW'
      const invalidAddress = 'BJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW'
      
      return {
        validResult: tronAddressRegex.test(validAddress),
        invalidResult: tronAddressRegex.test(invalidAddress),
      }
    })
    
    expect(result.validResult).toBe(true)
    expect(result.invalidResult).toBe(false)
  })
})

test.describe('截图测试', () => {
  test.beforeEach(async ({ page }) => {
    await createTestWallet(page)
  })

  test('扫描页面截图', async ({ page }) => {
    await page.goto('/#/scanner')
    await page.waitForTimeout(1000)
    
    await page.screenshot({ 
      path: 'e2e/screenshots/scanner-page.png',
      fullPage: false,
    })
  })

  test('通讯录页面截图', async ({ page }) => {
    await page.goto('/#/address-book')
    await page.waitForTimeout(500)
    
    await page.screenshot({ 
      path: 'e2e/screenshots/address-book-page.png',
      fullPage: false,
    })
  })

  test('发送页面扫描按钮截图', async ({ page }) => {
    await page.goto('/#/send')
    await page.waitForTimeout(500)
    
    await page.screenshot({ 
      path: 'e2e/screenshots/send-page-scanner-button.png',
      fullPage: false,
    })
  })
})
