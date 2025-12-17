import { test, expect, Page } from '@playwright/test'

// Helper to create wallet for tests that require it
async function createTestWallet(page: Page) {
  await page.goto('/#/wallet/create')
  await page.waitForSelector('text=设置密码')

  // Fill passwords
  await page.fill('input[placeholder="输入密码"]', 'Test1234!')
  await page.fill('input[placeholder="再次输入密码"]', 'Test1234!')
  await page.click('button:has-text("下一步")')

  // Backup mnemonic step
  await page.waitForSelector('text=备份助记词')
  await page.click('text=显示')

  // Get mnemonic words
  const mnemonicDisplay = page.locator('[data-testid="mnemonic-display"]')
  const wordElements = mnemonicDisplay.locator('span.font-medium:not(.blur-sm)')
  const wordCount = await wordElements.count()
  const words: string[] = []
  for (let i = 0; i < wordCount; i++) {
    const word = await wordElements.nth(i).textContent()
    if (word) words.push(word.trim())
  }

  await page.click('text=我已备份')

  // Verify mnemonic step
  await page.waitForSelector('text=验证助记词')
  const verifyLabels = page.locator('label:has-text("第")')
  const labelsCount = await verifyLabels.count()

  for (let i = 0; i < labelsCount; i++) {
    const labelText = await verifyLabels.nth(i).textContent()
    const match = labelText?.match(/第 (\d+) 个单词/)
    if (match) {
      const wordIndex = parseInt(match[1]) - 1
      const input = page.locator(`input[placeholder="输入第 ${wordIndex + 1} 个单词"]`)
      await input.fill(words[wordIndex])
    }
  }

  await page.click('button:has-text("完成创建")')
  await page.waitForURL('/#/')
  await page.waitForSelector('[data-testid="chain-selector"]', { timeout: 10000 })
}

test.describe('Scanner 页面', () => {
  test('显示扫描界面', async ({ page }) => {
    await page.goto('/#/scanner')

    // 应该显示标题
    await expect(page.getByRole('heading', { name: '扫一扫' })).toBeVisible()

    // 应该显示相册按钮
    await expect(page.getByRole('button', { name: '相册' })).toBeVisible()

    // 应该显示返回按钮
    await expect(page.getByLabel('返回')).toBeVisible()
  })

  test('权限拒绝或不支持时显示重试按钮', async ({ page }) => {
    await page.goto('/#/scanner')

    // 等待错误状态（浏览器不支持 getUserMedia）
    await page.waitForTimeout(1000)

    // 应该显示重试按钮
    await expect(page.getByRole('button', { name: '重试' })).toBeVisible()
  })

  test('返回按钮导航回首页', async ({ page }) => {
    await page.goto('/#/scanner')

    // 点击返回按钮
    await page.getByLabel('返回').click()

    // 应该回到首页
    await expect(page).toHaveURL('/#/')
  })
})

test.describe('Scanner 集成', () => {
  test('发送页面有扫描图标', async ({ page }) => {
    await page.goto('/#/send')

    // AddressInput 应该有扫描按钮
    await expect(page.getByLabel('扫描二维码')).toBeVisible()
  })

  test('首页 FAB 导航到扫描页', async ({ page }) => {
    // 需要先创建钱包才能看到 FAB
    await createTestWallet(page)

    // 现在应该在首页并能看到 FAB
    await expect(page.getByLabel('扫描二维码')).toBeVisible()

    // 点击 FAB
    await page.getByLabel('扫描二维码').click()

    // 应该导航到扫描页 (Stackflow 可能添加尾部斜杠)
    await expect(page).toHaveURL(/.*#\/scanner\/?$/)
  })
})
