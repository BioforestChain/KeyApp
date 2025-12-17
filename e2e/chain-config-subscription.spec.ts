import { expect, test } from '@playwright/test'

/**
 * Chain-config subscription E2E
 *
 * Covers:
 * - subscription URL → refresh → config appears
 * - enable/disable toggle works
 * - failed refresh keeps cached configs
 * - import uses enabled bioforest configs to derive addresses
 */

const SUBSCRIPTION_URL = 'https://example.com/chains.json'

const SUBSCRIPTION_CONFIGS = [
  {
    id: 'bf-sub',
    version: '1.0',
    type: 'bioforest',
    name: 'BF Sub',
    symbol: 'BFS',
    decimals: 8,
    prefix: 'c',
  },
]

const TEST_MNEMONIC_12 =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const TEST_MNEMONIC_12_WORDS = TEST_MNEMONIC_12.split(' ')

async function resetLocalState(page: import('@playwright/test').Page) {
  await page.addInitScript(async () => {
    localStorage.clear()
    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase('bfm_chain_config')
      request.onsuccess = () => resolve()
      request.onerror = () => resolve()
      request.onblocked = () => resolve()
    })
  })
}

async function fillMnemonic(page: import('@playwright/test').Page, words: readonly string[]) {
  for (let i = 0; i < words.length; i++) {
    const input = page.locator(`[data-word-index="${i}"]`)
    await input.fill(words[i] ?? '')
  }
}

test.describe('Chain-config subscription', () => {
  test.beforeEach(async ({ page }) => {
    await resetLocalState(page)
  })

  test('refresh + toggle + cached fallback + import derive', async ({ page }) => {
    await page.route(SUBSCRIPTION_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { ETag: '"bf-sub-v1"' },
        body: JSON.stringify(SUBSCRIPTION_CONFIGS),
      })
    })

    await page.goto('/#/settings/chains')
    await page.waitForSelector('text=链配置')

    const subscriptionInput = page.locator('input[placeholder*="example.com/chains.json"]')
    await subscriptionInput.fill(SUBSCRIPTION_URL)
    await page.click('button:has-text("保存")')

    const refreshButton = page.locator('button[aria-label="刷新订阅"]')
    await expect(page.getByText('BF Sub', { exact: true })).toBeVisible()

    const row = page.locator('div.px-4.py-3', { hasText: 'bf-sub' })
    const checkbox = row.locator('input[type="checkbox"]')
    await expect(checkbox).toBeChecked()

    await row.locator('label').click()
    await expect(checkbox).not.toBeChecked()

    await row.locator('label').click()
    await expect(checkbox).toBeChecked()

    // Failed refresh should keep cached subscription configs
    await page.unroute(SUBSCRIPTION_URL)
    await page.route(SUBSCRIPTION_URL, async (route) => {
      await route.fulfill({ status: 500, body: 'oops' })
    })
    await refreshButton.click()
    await expect(page.getByText('BF Sub', { exact: true })).toBeVisible()

    // Import wallet should derive the subscription bioforest chain address
    // Stackflow 需要从首页导航
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.click('text=导入已有钱包')
    await page.waitForSelector('text=输入助记词')

    await fillMnemonic(page, TEST_MNEMONIC_12_WORDS)
    await page.click('button:has-text("下一步")')

    await page.waitForSelector('text=设置密码')
    await page.fill('input[placeholder="输入密码"]', 'Test1234!')
    await page.fill('input[placeholder="再次输入密码"]', 'Test1234!')
    await page.click('button:has-text("完成导入")')

    await page.waitForURL(/.*#\/$/)

    const walletData = await page.evaluate(() => localStorage.getItem('bfm_wallets'))
    expect(walletData).not.toBeNull()

    const parsed: {
      wallets: Array<{ chainAddresses: Array<{ chain: string; address: string }> }>
    } = JSON.parse(walletData!)

    const wallet = parsed.wallets[0]
    expect(wallet).toBeDefined()

    const derived = wallet.chainAddresses.find((ca) => ca.chain === 'bf-sub')
    expect(derived).toBeDefined()
    expect(derived?.address.startsWith('c')).toBe(true)
  })
})
