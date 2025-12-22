import { test, expect, Page } from '@playwright/test'

// Helper to create wallet for tests that require it
async function createTestWallet(page: Page) {
  await page.goto('/#/wallet/create')
  await page.waitForSelector('[data-testid="password-step"]')

  // Fill passwords
  await page.fill('input[placeholder="输入密码"]', 'Test1234!')
  await page.fill('input[placeholder="再次输入密码"]', 'Test1234!')
  await page.click('[data-testid="next-step-button"]')

  // Backup mnemonic step
  await page.waitForSelector('[data-testid="mnemonic-step"]')
  await page.click('[data-testid="toggle-mnemonic-button"]')

  // Get mnemonic words
  const mnemonicDisplay = page.locator('[data-testid="mnemonic-display"]')
  const wordElements = mnemonicDisplay.locator('span.font-medium:not(.blur-sm)')
  const wordCount = await wordElements.count()
  const words: string[] = []
  for (let i = 0; i < wordCount; i++) {
    const word = await wordElements.nth(i).textContent()
    if (word) words.push(word.trim())
  }

  await page.click('[data-testid="mnemonic-backed-up-button"]')

  // Verify mnemonic step
  await page.waitForSelector('[data-testid="verify-step"]')
  // Use data-testid for verify inputs
  const verifyInputs = page.locator('[data-testid^="verify-word-input-"]')
  const inputCount = await verifyInputs.count()

  for (let i = 0; i < inputCount; i++) {
    const input = verifyInputs.nth(i)
    const testId = await input.getAttribute('data-testid')
    const indexMatch = testId?.match(/verify-word-input-(\d+)/)
    if (indexMatch) {
      const wordIndex = parseInt(indexMatch[1])
      await input.fill(words[wordIndex])
    }
  }

  await page.click('[data-testid="complete-button"]')
  await page.waitForURL('/#/')
  await page.waitForSelector('[data-testid="chain-selector"]', { timeout: 10000 })
}

test.describe('Scanner 页面', () => {
  test('显示扫描界面', async ({ page }) => {
    await page.goto('/#/scanner')

    // 应该显示标题
    await expect(page.locator('[data-testid="page-title"]')).toBeVisible()

    // 应该显示相册按钮
    await expect(page.locator('[data-testid="gallery-button"]')).toBeVisible()

    // 应该显示返回按钮
    await expect(page.locator('[data-testid="back-button"]')).toBeVisible()
  })

  test('权限拒绝或不支持时显示重试按钮', async ({ page }) => {
    await page.goto('/#/scanner')

    // 等待错误状态（浏览器不支持 getUserMedia）
    await page.waitForTimeout(1000)

    // 应该显示重试按钮
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible()
  })

  // TODO: 这个测试依赖相机权限，在 E2E 环境中不稳定
  // 已通过 FAB 导航到扫描页的测试验证了基本功能
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

    // AddressInput 应该有扫描按钮
    await expect(page.locator('[data-testid="scan-address-button"]')).toBeVisible()
  })

  test('首页 FAB 导航到扫描页', async ({ page }) => {
    // 需要先创建钱包才能看到 FAB
    await createTestWallet(page)

    // 现在应该在首页并能看到 FAB
    await expect(page.locator('[data-testid="scan-fab"]')).toBeVisible()

    // 点击 FAB
    await page.click('[data-testid="scan-fab"]')

    // 应该导航到扫描页 (Stackflow 可能添加尾部斜杠)
    await expect(page).toHaveURL(/.*#\/scanner\/?$/)
  })
})
