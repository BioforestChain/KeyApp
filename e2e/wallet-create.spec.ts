import { test, expect, type Page } from '@playwright/test'
import { getWalletDataFromIndexedDB } from './utils/indexeddb-helper'

/**
 * 钱包创建 E2E 测试
 *
 * 包含视觉回归测试和功能验证测试
 */

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

// ==================== 视觉回归测试 ====================

test.describe('钱包创建流程 - 截图测试', () => {
  test.beforeEach(async ({ page }) => {
    // 清除本地存储，确保干净状态
    await page.addInitScript(() => localStorage.clear())
  })

  test('完整创建流程 - 截图对比', async ({ page }) => {
    // 1. 首页 - 无钱包状态
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // 等待创建钱包按钮出现
    await page.waitForSelector('[data-testid="create-wallet-button"]')
    await expect(page).toHaveScreenshot('01-home-empty.png')

    // 2. 点击创建钱包
    await page.click('[data-testid="create-wallet-button"]')
    await page.waitForSelector('[data-testid="pattern-step"]')
    await expect(page).toHaveScreenshot('02-create-pattern-step.png')

    // 3. 绘制图案（进入确认）
    await drawPattern(page, 'pattern-lock-set-grid', DEFAULT_PATTERN)
    await page.click('[data-testid="pattern-lock-next-button"]')
    await page.waitForSelector('[data-testid="pattern-lock-confirm-grid"]')
    await expect(page).toHaveScreenshot('03-pattern-confirm-step.png')

    // 4. 确认图案进入助记词步骤
    await drawPattern(page, 'pattern-lock-confirm-grid', DEFAULT_PATTERN)
    await page.waitForSelector('[data-testid="mnemonic-step"]')
    await expect(page).toHaveScreenshot('04-mnemonic-hidden.png')

    // 5. 显示助记词
    await page.click('[data-testid="toggle-mnemonic-button"]')
    await expect(page).toHaveScreenshot('05-mnemonic-visible.png', {
      mask: [page.locator('[data-testid="mnemonic-display"]')],
    })

    const mnemonicDisplay = page.locator('[data-testid="mnemonic-display"]')
    const wordElements = mnemonicDisplay.locator('span.font-medium:not(.blur-sm)')
    const words: string[] = []
    const wordCount = await wordElements.count()
    for (let i = 0; i < wordCount; i++) {
      const word = await wordElements.nth(i).textContent()
      if (word) words.push(word.trim())
    }

    // 6. 点击"我已备份"
    await page.click('[data-testid="mnemonic-backed-up-button"]')
    await page.waitForSelector('[data-testid="verify-step"]')
    await expect(page).toHaveScreenshot('06-verify-step.png', {
      mask: [page.locator('[data-testid^="verify-word-input-"]')],
    })

    // 7. 完成验证并进入链选择
    await fillVerifyInputs(page, words)
    await page.click('[data-testid="verify-next-button"]')
    await page.waitForSelector('[data-testid="chain-selector-step"]')
    await expect(page).toHaveScreenshot('07-chain-selector-step.png')

    // 8. 进入主题设置步骤
    await page.click('[data-testid="chain-selector-complete-button"]')
    await page.waitForSelector('[data-testid="theme-step"]')
    await expect(page).toHaveScreenshot('08-theme-step.png')
  })

  test('图案确认 - 错误状态', async ({ page }) => {
    await page.goto('/#/wallet/create')
    await page.waitForSelector('[data-testid="pattern-step"]')

    await drawPattern(page, 'pattern-lock-set-grid', DEFAULT_PATTERN)
    await page.click('[data-testid="pattern-lock-next-button"]')
    await page.waitForSelector('[data-testid="pattern-lock-confirm-grid"]')

    await drawPattern(page, 'pattern-lock-confirm-grid', [0, 3, 6, 7])
    await page.waitForSelector('[data-testid="pattern-lock-mismatch"]')
    await expect(page).toHaveScreenshot('error-pattern-mismatch.png')
  })
})

// ==================== 功能验证测试 ====================

test.describe('钱包创建流程 - 功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
  })

  test('完整创建流程 - 验证钱包已创建', async ({ page }) => {
    // 1. 导航到创建页面
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.click('[data-testid="create-wallet-button"]')

    // 2. 图案锁设置
    await page.waitForSelector('[data-testid="pattern-step"]')
    await drawPattern(page, 'pattern-lock-set-grid', DEFAULT_PATTERN)
    await page.click('[data-testid="pattern-lock-next-button"]')
    await page.waitForSelector('[data-testid="pattern-lock-confirm-grid"]')
    await drawPattern(page, 'pattern-lock-confirm-grid', DEFAULT_PATTERN)

    // 3. 备份助记词步骤
    await page.waitForSelector('[data-testid="mnemonic-step"]')
    await page.click('[data-testid="toggle-mnemonic-button"]')

    const mnemonicDisplay = page.locator('[data-testid="mnemonic-display"]')
    await expect(mnemonicDisplay).toBeVisible()

    const wordElements = mnemonicDisplay.locator('span.font-medium:not(.blur-sm)')
    const wordCount = await wordElements.count()
    expect(wordCount).toBe(12)

    const words: string[] = []
    for (let i = 0; i < wordCount; i++) {
      const word = await wordElements.nth(i).textContent()
      if (word) words.push(word.trim())
    }
    expect(words.length).toBe(12)

    await page.click('[data-testid="mnemonic-backed-up-button"]')

    // 4. 验证助记词步骤
    await page.waitForSelector('[data-testid="verify-step"]')
    await fillVerifyInputs(page, words)

    const verifyNextBtn = page.locator('[data-testid="verify-next-button"]')
    await expect(verifyNextBtn).toBeEnabled()
    await verifyNextBtn.click()

    // 5. 选择链并进入主题设置
    await page.waitForSelector('[data-testid="chain-selector-step"]')
    const chainNextBtn = page.locator('[data-testid="chain-selector-complete-button"]')
    await expect(chainNextBtn).toBeEnabled()
    await chainNextBtn.click()

    // 6. 主题设置步骤 - 直接完成（使用默认主题）
    await page.waitForSelector('[data-testid="theme-step"]')
    const themeCompleteBtn = page.locator('[data-testid="theme-complete-button"]')
    await expect(themeCompleteBtn).toBeEnabled()
    await themeCompleteBtn.click()

    // 7. 验证跳转到首页且钱包已创建
    await page.waitForURL(/.*#\/$/)
    // 等待钱包名称显示，确认首页加载完成
    await expect(page.locator('[data-testid="wallet-name"]:visible').first()).toBeVisible({ timeout: 10000 })

    const wallets = await getWalletDataFromIndexedDB(page)
    expect(wallets).toHaveLength(1)
    expect(wallets[0].name).toBe('主钱包')

    const bioforestChains = ['bfmeta', 'pmchain', 'ccchain', 'bfchainv2', 'btgmeta', 'biwmeta', 'ethmeta', 'malibu']
    for (const chain of bioforestChains) {
      const chainAddr = wallets[0].chainAddresses.find((ca: { chain: string }) => ca.chain === chain)
      expect(chainAddr, `应该有 ${chain} 地址`).toBeDefined()
    }
  })

  test('创建钱包派生多链地址', async ({ page }) => {
    await page.goto('/#/settings/chains')
    await page.waitForSelector('[data-testid="manual-add-section"]')

    const manualConfig = JSON.stringify({
      id: 'bf-demo',
      version: '1.0',
      type: 'bioforest',
      name: 'BF Demo',
      symbol: 'BFD',
      decimals: 8,
      prefix: 'c',
    })

    await page.fill('[data-testid="manual-config-textarea"]', manualConfig)
    await page.click('[data-testid="add-chain-button"]')
    await expect(page.locator('[data-testid="chain-item-bf-demo"]')).toBeVisible()

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.click('[data-testid="create-wallet-button"]')
    await page.waitForSelector('[data-testid="pattern-step"]')

    await drawPattern(page, 'pattern-lock-set-grid', DEFAULT_PATTERN)
    await page.click('[data-testid="pattern-lock-next-button"]')
    await page.waitForSelector('[data-testid="pattern-lock-confirm-grid"]')
    await drawPattern(page, 'pattern-lock-confirm-grid', DEFAULT_PATTERN)

    await page.waitForSelector('[data-testid="mnemonic-step"]')
    await page.click('[data-testid="toggle-mnemonic-button"]')

    const mnemonicDisplay = page.locator('[data-testid="mnemonic-display"]')
    const wordElements = mnemonicDisplay.locator('span.font-medium:not(.blur-sm)')
    const words: string[] = []
    const wordCount = await wordElements.count()
    for (let i = 0; i < wordCount; i++) {
      const word = await wordElements.nth(i).textContent()
      if (word) words.push(word.trim())
    }

    await page.click('[data-testid="mnemonic-backed-up-button"]')

    await page.waitForSelector('[data-testid="verify-step"]')
    await fillVerifyInputs(page, words)
    await page.click('[data-testid="verify-next-button"]')

    await page.waitForSelector('[data-testid="chain-selector-step"]')
    await page.locator('[data-testid="chain-selector-group-toggle-evm"]').click()
    await page.locator('[data-testid="chain-selector-chain-ethereum"]').click()
    await page.locator('[data-testid="chain-selector-group-toggle-bip39"]').click()
    await page.locator('[data-testid="chain-selector-chain-bitcoin"]').click()
    await page.locator('[data-testid="chain-selector-chain-tron"]').click()

    await page.click('[data-testid="chain-selector-complete-button"]')

    // 主题设置步骤 - 直接完成（使用默认主题）
    await page.waitForSelector('[data-testid="theme-step"]')
    await page.click('[data-testid="theme-complete-button"]')

    await page.waitForURL(/.*#\/$/)

    const wallets = await getWalletDataFromIndexedDB(page)
    const wallet = wallets[0]

    const externalChains = ['ethereum', 'bitcoin', 'tron']
    for (const chain of externalChains) {
      const chainAddr = wallet.chainAddresses.find((ca: { chain: string }) => ca.chain === chain)
      expect(chainAddr, `应该有 ${chain} 地址`).toBeDefined()
      expect(chainAddr.address.length).toBeGreaterThan(10)
    }

    const bioforestChains = ['bfmeta', 'pmchain', 'ccchain', 'bf-demo']
    for (const chain of bioforestChains) {
      const chainAddr = wallet.chainAddresses.find((ca: { chain: string }) => ca.chain === chain)
      expect(chainAddr, `应该有 ${chain} 地址`).toBeDefined()
      const expectedPrefix = chain === 'bf-demo' ? 'c' : 'b'
      expect(chainAddr.address.startsWith(expectedPrefix)).toBe(true)
    }
  })

  test('少于 4 个点不会进入确认步骤', async ({ page }) => {
    await page.goto('/#/wallet/create')
    await page.waitForSelector('[data-testid="pattern-step"]')

    await drawPattern(page, 'pattern-lock-set-grid', [0, 1, 2])
    await page.waitForTimeout(400)

    await expect(page.locator('[data-testid="pattern-lock-confirm-grid"]')).toHaveCount(0)
    await expect(page.locator('[data-testid="pattern-lock-next-button"]')).toHaveCount(0)
  })

  test('助记词验证错误时禁用下一步', async ({ page }) => {
    await page.goto('/#/wallet/create')
    await page.waitForSelector('[data-testid="pattern-step"]')

    await drawPattern(page, 'pattern-lock-set-grid', DEFAULT_PATTERN)
    await page.click('[data-testid="pattern-lock-next-button"]')
    await page.waitForSelector('[data-testid="pattern-lock-confirm-grid"]')
    await drawPattern(page, 'pattern-lock-confirm-grid', DEFAULT_PATTERN)

    await page.waitForSelector('[data-testid="mnemonic-step"]')
    await page.click('[data-testid="toggle-mnemonic-button"]')
    await page.click('[data-testid="mnemonic-backed-up-button"]')
    await page.waitForSelector('[data-testid="verify-step"]')

    const inputs = page.locator('[data-verify-index]')
    const inputCount = await inputs.count()
    for (let i = 0; i < inputCount; i++) {
      await inputs.nth(i).fill('wrongword')
    }

    const verifyNextBtn = page.locator('[data-testid="verify-next-button"]')
    await expect(verifyNextBtn).toBeDisabled()
  })
})

// ==================== 导入流程截图测试 ====================

test.describe('钱包导入流程 - 截图测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
  })

  test('导入页面截图', async ({ page }) => {
    await page.goto('/#/onboarding/recover')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="key-type-step"]')
    await expect(page).toHaveScreenshot('recover-01-key-type.png')
  })
})
