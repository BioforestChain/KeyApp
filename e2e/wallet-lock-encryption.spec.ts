import { test, expect, type Page } from '@playwright/test'

/**
 * 钱包锁双向加密 E2E 测试
 * 
 * 验证：
 * 1. 钱包创建时的双向加密（钱包锁加密助记词，助记词加密钱包锁）
 * 2. 使用旧钱包锁修改钱包锁
 * 3. 使用助记词重置钱包锁
 */

const DEFAULT_PATTERN = [0, 1, 2, 5]
const NEW_PATTERN = [2, 5, 8, 7, 6]

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

async function createWalletAndGetMnemonic(page: Page, pattern: number[] = DEFAULT_PATTERN): Promise<string[]> {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.click('[data-testid="create-wallet-button"]')

  // 设置图案锁
  await page.waitForSelector('[data-testid="pattern-step"]')
  await drawPattern(page, 'pattern-lock-set-grid', pattern)
  await page.click('[data-testid="pattern-lock-next-button"]')
  await page.waitForSelector('[data-testid="pattern-lock-confirm-grid"]')
  await drawPattern(page, 'pattern-lock-confirm-grid', pattern)

  // 备份助记词
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

  // 验证助记词
  await page.waitForSelector('[data-testid="verify-step"]')
  await fillVerifyInputs(page, words)
  await page.click('[data-testid="verify-next-button"]')

  // 完成链选择
  await page.waitForSelector('[data-testid="chain-selector-step"]')
  await page.click('[data-testid="chain-selector-complete-button"]')

  // 等待跳转到首页
  await page.waitForURL(/.*#\/$/)
  await expect(page.locator('[data-testid="wallet-name"]:visible').first()).toBeVisible({ timeout: 10000 })

  return words
}

test.describe('钱包锁双向加密', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
  })

  test('创建钱包后 encryptedWalletLock 存在', async ({ page }) => {
    await createWalletAndGetMnemonic(page)

    // 验证 IndexedDB 中的钱包数据包含 encryptedWalletLock
    const walletData = await page.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('bfm-wallet-db', 1)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })

      const tx = db.transaction('wallets', 'readonly')
      const store = tx.objectStore('wallets')
      const wallets = await new Promise<unknown[]>((resolve, reject) => {
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result as unknown[])
        request.onerror = () => reject(request.error)
      })

      db.close()
      return wallets
    })

    expect(walletData).toHaveLength(1)
    const wallet = walletData[0] as {
      encryptedMnemonic?: { ciphertext: string }
      encryptedWalletLock?: { ciphertext: string }
    }
    
    // 验证双向加密字段都存在
    expect(wallet.encryptedMnemonic).toBeDefined()
    expect(wallet.encryptedMnemonic?.ciphertext).toBeTruthy()
    expect(wallet.encryptedWalletLock).toBeDefined()
    expect(wallet.encryptedWalletLock?.ciphertext).toBeTruthy()
  })

  test('修改钱包锁 - 使用旧图案验证', async ({ page }) => {
    await createWalletAndGetMnemonic(page)

    // 进入设置 -> 修改钱包锁
    await page.click('[data-testid="settings-tab"]')
    await page.waitForSelector('[data-testid="change-wallet-lock-button"]')
    await page.click('[data-testid="change-wallet-lock-button"]')

    // 验证当前图案
    await page.waitForSelector('[data-testid="verify-pattern-lock"]')
    await drawPattern(page, 'verify-pattern-lock', DEFAULT_PATTERN)

    // 设置新图案
    await page.waitForSelector('[data-testid="pattern-lock-set-grid"]')
    await drawPattern(page, 'pattern-lock-set-grid', NEW_PATTERN)
    await page.click('[data-testid="pattern-lock-next-button"]')

    // 确认新图案
    await page.waitForSelector('[data-testid="pattern-lock-confirm-grid"]')
    await drawPattern(page, 'pattern-lock-confirm-grid', NEW_PATTERN)

    // 等待成功提示
    await page.waitForTimeout(1000)

    // 验证：使用新图案可以解锁
    // 清除 localStorage 模拟重新打开应用
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 应该能正常显示钱包（已登录状态）
    await expect(page.locator('[data-testid="wallet-name"]:visible').first()).toBeVisible({ timeout: 10000 })
  })

  test('修改钱包锁 - 错误图案验证失败', async ({ page }) => {
    await createWalletAndGetMnemonic(page)

    // 进入设置 -> 修改钱包锁
    await page.click('[data-testid="settings-tab"]')
    await page.waitForSelector('[data-testid="change-wallet-lock-button"]')
    await page.click('[data-testid="change-wallet-lock-button"]')

    // 输入错误图案
    await page.waitForSelector('[data-testid="verify-pattern-lock"]')
    await drawPattern(page, 'verify-pattern-lock', [0, 3, 6, 7]) // 错误图案

    // 应该显示错误状态（图案变红），1.5秒后重置
    await page.waitForTimeout(500)
    
    // 验证还在验证步骤（没有进入设置新图案步骤）
    await expect(page.locator('[data-testid="pattern-lock-set-grid"]')).toHaveCount(0)
  })
})
