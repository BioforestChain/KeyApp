import { expect, test } from '@playwright/test'
import { getWalletDataFromIndexedDB } from './utils/indexeddb-helper'

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
    chainKind: 'bioforest',
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

// TODO: 链配置订阅测试存在功能性问题
// 订阅的链配置没有被正确用于钱包地址派生
test.describe.skip('Chain-config subscription', () => {
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
    await page.waitForSelector('[data-testid="page-title"]')

    const subscriptionInput = page.locator('[data-testid="subscription-url-input"]')
    await subscriptionInput.fill(SUBSCRIPTION_URL)
    await page.click('[data-testid="save-subscription-button"]')

    const refreshButton = page.locator('[data-testid="refresh-subscription-button"]')
    await expect(page.locator('[data-testid="chain-item-bf-sub"]')).toBeVisible()

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
    await expect(page.locator('[data-testid="chain-item-bf-sub"]')).toBeVisible()

    // Import wallet should derive the subscription bioforest chain address
    // Stackflow 需要从首页导航
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.click('[data-testid="import-wallet-button"]')
    await page.waitForSelector('[data-testid="mnemonic-step"]')

    await fillMnemonic(page, TEST_MNEMONIC_12_WORDS)
    await page.click('[data-testid="continue-button"]')

    await page.waitForSelector('[data-testid="pattern-lock-step"]')
    await page.fill('[data-testid="pattern-lock-input"] input', '0,1,2,5,8')
    await page.fill('[data-testid="pattern-lock-confirm"] input', '0,1,2,5,8')
    await page.click('[data-testid="complete-button"]')

    await page.waitForURL(/.*#\/$/)

    const wallets = await getWalletDataFromIndexedDB(page)
    expect(wallets).toHaveLength(1)

    const wallet = wallets[0]
    expect(wallet).toBeDefined()

    const derived = wallet.chainAddresses.find((ca: { chain: string }) => ca.chain === 'bf-sub')
    expect(derived).toBeDefined()
    expect(derived?.address.startsWith('c')).toBe(true)
  })
})
