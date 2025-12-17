import { expect, test, type Page } from '@playwright/test'

/**
 * Arbitrary-key wallet recovery E2E
 *
 * Covers:
 * - arbitrary secret (single-line + multi-line)
 * - security warning gate
 * - address preview derives from enabled chain-config (custom id)
 * - dark mode + RTL snapshots (basic regression guard)
 */

const MANUAL_CHAIN = {
  id: 'bf-arbitrary-e2e',
  version: '1.0',
  type: 'bioforest',
  name: 'BF Arbitrary E2E',
  symbol: 'BFA',
  decimals: 8,
  prefix: 'c',
}

async function resetLocalState(page: Page) {
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

async function addManualBioforestChain(page: Page) {
  // 首先导航到首页
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  // 由于没有钱包，应该显示欢迎页面，先创建一个临时钱包导航到设置
  // 或者直接跳到链配置页面（如果路由支持）
  // 尝试直接访问设置/链配置
  await page.goto('/#/settings/chains')
  await page.waitForLoadState('networkidle')
  
  // 如果页面没有显示链配置，可能需要通过其他方式
  const hasChainConfig = await page.locator('text=链配置').isVisible().catch(() => false)
  if (!hasChainConfig) {
    // 回退：从首页导航
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  }
  
  await page.waitForSelector('text=链配置', { timeout: 5000 }).catch(() => {})

  await page.fill('textarea[placeholder^="例如："]', JSON.stringify(MANUAL_CHAIN))
  await page.click('button:has-text("添加")')

  await expect(page.getByText(MANUAL_CHAIN.name, { exact: true })).toBeVisible()
}

async function goThroughArbitraryKeyRecover(page: Page, secret: string, password: string) {
  // Stackflow 需要从首页导航
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  // 应该显示欢迎页 - 找恢复钱包的入口
  // 假设有"恢复钱包"按钮
  await page.click('text=恢复钱包').catch(() => {
    // 如果没有直接的恢复按钮，尝试其他方式
  })
  await page.waitForSelector('text=选择密钥类型', { timeout: 5000 }).catch(() => {})

  await page.getByRole('radio', { name: /任意密钥/ }).click()
  await page.click('button:has-text("继续")')

  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  const confirm = dialog.getByRole('button', { name: '确认' })
  await expect(confirm).toBeDisabled()

  await dialog.getByRole('checkbox').check()
  await confirm.click()

  await page.waitForSelector('text=任意密钥')

  await page.fill('textarea[placeholder="请输入您的密钥..."]', secret)
  await expect(page.getByText(MANUAL_CHAIN.name, { exact: true })).toBeVisible()

  await page.click('button:has-text("继续")')
  await page.waitForSelector('text=设置密码')

  await page.fill('input[placeholder="请输入密码"]', password)
  await page.fill('input[placeholder="请再次输入密码"]', password)
  await page.click('button:has-text("继续")')

  await page.waitForSelector('text=钱包创建成功！')
}

test.describe('Wallet recover (arbitrary key)', () => {
  test.beforeEach(async ({ page }) => {
    await resetLocalState(page)
    await addManualBioforestChain(page)
  })

  test('single-line secret creates wallet and contains manual bioforest chain address', async ({ page }) => {
    await goThroughArbitraryKeyRecover(page, 'my arbitrary secret', 'Test1234!')

    const walletData = await page.evaluate(() => localStorage.getItem('bfm_wallets'))
    expect(walletData).not.toBeNull()

    const parsed: {
      wallets: Array<{
        keyType?: string
        encryptedMnemonic?: unknown
        chainAddresses?: Array<{ chain: string; address: string }>
      }>
    } = JSON.parse(walletData!)

    const wallet = parsed.wallets.find((w) => w.keyType === 'arbitrary')
    expect(wallet).toBeDefined()
    expect(wallet?.encryptedMnemonic).toBeDefined()

    const derived = wallet?.chainAddresses?.find((ca) => ca.chain === MANUAL_CHAIN.id)
    expect(derived).toBeDefined()
    expect(derived?.address.startsWith('c')).toBe(true)
  })

  test('multi-line secret creates wallet and contains manual bioforest chain address', async ({ page }) => {
    await goThroughArbitraryKeyRecover(page, 'line1\nline2\nline3', 'Test1234!')

    const walletData = await page.evaluate(() => localStorage.getItem('bfm_wallets'))
    expect(walletData).not.toBeNull()

    const parsed: {
      wallets: Array<{
        keyType?: string
        chainAddresses?: Array<{ chain: string; address: string }>
      }>
    } = JSON.parse(walletData!)

    const wallet = parsed.wallets.find((w) => w.keyType === 'arbitrary')
    expect(wallet).toBeDefined()

    const derived = wallet?.chainAddresses?.find((ca) => ca.chain === MANUAL_CHAIN.id)
    expect(derived).toBeDefined()
  })

  test('dark mode snapshot (key-type + preview)', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })

    await page.goto('/#/onboarding/recover')
    await page.waitForSelector('text=选择密钥类型')
    await expect(page).toHaveScreenshot('recover-arbitrary-dark-01-key-type.png')

    await page.getByRole('radio', { name: /任意密钥/ }).click()
    await page.click('button:has-text("继续")')

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox').check()
    await dialog.getByRole('button', { name: '确认' }).click()

    await page.fill('textarea[placeholder="请输入您的密钥..."]', 'dark-mode-secret')
    await expect(page.getByText(MANUAL_CHAIN.name, { exact: true })).toBeVisible()
    await expect(page).toHaveScreenshot('recover-arbitrary-dark-02-preview.png')
  })

  test('RTL snapshot (Arabic language + preview)', async ({ page }) => {
    await page.goto('/#/settings/language')
    await page.waitForSelector('text=语言')
    await page.click('button:has-text("العربية")')

    await page.goto('/#/onboarding/recover')
    await page.waitForSelector('text=Select Key Type')

    await page.getByRole('radio', { name: /Arbitrary Key/i }).click()
    await page.click('button:has-text("Continue")')

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('checkbox').check()
    await dialog.getByRole('button', { name: 'Confirm' }).click()

    await page.fill('textarea[placeholder="Enter your secret key..."]', 'rtl-secret')
    await expect(page.getByText(MANUAL_CHAIN.name, { exact: true })).toBeVisible()
    await expect(page).toHaveScreenshot('recover-arbitrary-rtl-01-preview.png')
  })
})

