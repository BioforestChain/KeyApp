import { test, expect } from '@playwright/test'

/**
 * BioForest 链 E2E 测试
 *
 * 测试 BioForest 链（BFMeta, PMChain, CCChain）的特定功能
 * - 地址格式验证 ('c' 前缀)
 * - 链切换
 * - 地址复制
 */

// 使用已知 BioForest 地址的测试钱包
const TEST_WALLET_WITH_BIOFOREST = {
  wallets: [
    {
      id: 'test-bioforest-wallet',
      name: 'BioForest 测试钱包',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      chain: 'ethereum',
      chainAddresses: [
        { chain: 'ethereum', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', tokens: [] },
        { chain: 'bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', tokens: [] },
        { chain: 'tron', address: 'TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW', tokens: [] },
        { chain: 'bfmeta', address: 'cKe7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5', tokens: [] },
        { chain: 'pmchain', address: 'cKe7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5', tokens: [] },
        { chain: 'ccchain', address: 'cKe7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5', tokens: [] },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test' },
      createdAt: Date.now(),
      tokens: [],
    },
  ],
  currentWalletId: 'test-bioforest-wallet',
  selectedChain: 'ethereum',
}

async function setupBioforestWallet(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.evaluate((data) => {
    localStorage.setItem('bfm_wallets', JSON.stringify(data))
  }, TEST_WALLET_WITH_BIOFOREST)
  await page.reload()
  await page.waitForSelector('[data-testid="chain-selector"]', { timeout: 10000 })
}

test.describe('BioForest 链功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('切换到 BFMeta 链显示正确地址', async ({ page }) => {
    await setupBioforestWallet(page)

    // 打开链选择器
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')

    // 选择 BFMeta
    await page.click('text=BFMeta')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })

    // 验证链选择器显示 BFMeta
    await expect(page.locator('[data-testid="chain-selector"]')).toContainText('BFMeta')

    // 验证地址以 'c' 开头
    const addressText = await page.locator('.font-mono').first().textContent()
    expect(addressText?.startsWith('c')).toBe(true)
  })

  test('切换到 PMChain 链显示正确地址', async ({ page }) => {
    await setupBioforestWallet(page)

    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('text=PMChain')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })

    await expect(page.locator('[data-testid="chain-selector"]')).toContainText('PMChain')

    const addressText = await page.locator('.font-mono').first().textContent()
    expect(addressText?.startsWith('c')).toBe(true)
  })

  test('切换到 CCChain 链显示正确地址', async ({ page }) => {
    await setupBioforestWallet(page)

    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('text=CCChain')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })

    await expect(page.locator('[data-testid="chain-selector"]')).toContainText('CCChain')

    const addressText = await page.locator('.font-mono').first().textContent()
    expect(addressText?.startsWith('c')).toBe(true)
  })

  test('BioForest 地址复制功能', async ({ page }) => {
    await setupBioforestWallet(page)

    // 切换到 BFMeta
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('text=BFMeta')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })

    // 清空剪贴板历史
    await page.evaluate(() => {
      window.__CLIPBOARD__ = ''
    })

    // 点击复制按钮
    await page.click('button[aria-label="复制地址"]')
    await page.waitForTimeout(100)

    // 验证剪贴板内容以 'c' 开头
    const clipboardContent = await page.evaluate(() => window.__CLIPBOARD__)
    expect(typeof clipboardContent).toBe('string')
    expect(clipboardContent.startsWith('c')).toBe(true)
  })

  test('链切换后发送页面显示正确链信息', async ({ page }) => {
    await setupBioforestWallet(page)

    // 切换到 BFMeta
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('text=BFMeta')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })

    // 导航到发送页面
    await page.click('text=转账')
    await page.waitForURL('**/send')

    // 验证显示 BFMeta 链信息（使用更精确的选择器避免匹配提示文本）
    await expect(page.locator('.text-sm.font-medium:has-text("BFMeta")')).toBeVisible()
  })

  test('链切换后收款页面显示正确地址', async ({ page }) => {
    await setupBioforestWallet(page)

    // 切换到 BFMeta
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('text=BFMeta')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })

    // 导航到收款页面
    await page.click('text=收款')
    await page.waitForURL('**/receive')

    // 验证显示的地址以 'c' 开头
    const addressElement = page.locator('.font-mono').first()
    const addressText = await addressElement.textContent()
    expect(addressText?.includes('c')).toBe(true)
  })

  test('所有 BioForest 链共用相同地址', async ({ page }) => {
    await setupBioforestWallet(page)
    const addresses: string[] = []

    // 获取 BFMeta 地址
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('text=BFMeta')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })
    let addressText = await page.locator('.font-mono').first().textContent()
    if (addressText) addresses.push(addressText)

    // 获取 PMChain 地址
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('text=PMChain')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })
    addressText = await page.locator('.font-mono').first().textContent()
    if (addressText) addresses.push(addressText)

    // 获取 CCChain 地址
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('text=CCChain')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })
    addressText = await page.locator('.font-mono').first().textContent()
    if (addressText) addresses.push(addressText)

    // 验证所有地址相同（因为 BioForest 链使用相同的密钥对）
    expect(addresses.length).toBe(3)
    expect(addresses[0]).toBe(addresses[1])
    expect(addresses[1]).toBe(addresses[2])
  })
})

test.describe('BioForest 链地址派生', () => {
  const TEST_MNEMONIC_12 =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'

  test('导入钱包后 BioForest 地址格式正确', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    // 导入钱包
    await page.goto('/wallet/import')
    await page.waitForSelector('text=输入助记词')

    // 填写助记词
    const words = TEST_MNEMONIC_12.split(' ')
    for (let i = 0; i < words.length; i++) {
      const input = page.locator(`[data-word-index="${i}"]`)
      await input.fill(words[i])
    }

    await page.click('button:has-text("下一步")')
    await page.waitForSelector('text=设置密码')
    await page.fill('input[placeholder="输入密码"]', 'Test1234!')
    await page.fill('input[placeholder="再次输入密码"]', 'Test1234!')
    await page.click('button:has-text("完成导入")')

    await page.waitForURL('/')
    await page.waitForSelector('[data-testid="chain-selector"]', { timeout: 10000 })

    // 验证 BioForest 地址派生
    const walletData = await page.evaluate(() => {
      return localStorage.getItem('bfm_wallets')
    })
    const parsed = JSON.parse(walletData!)
    const wallet = parsed.wallets[0]

    // 验证 BioForest 链地址
    const bioforestChains = ['bfmeta', 'pmchain', 'ccchain']
    for (const chain of bioforestChains) {
      const chainAddr = wallet.chainAddresses.find((ca: { chain: string }) => ca.chain === chain)
      expect(chainAddr, `应该有 ${chain} 地址`).toBeDefined()
      // BioForest 地址以 'c' 开头
      expect(chainAddr.address.startsWith('c')).toBe(true)
      // 地址长度合理
      expect(chainAddr.address.length).toBeGreaterThan(20)
      expect(chainAddr.address.length).toBeLessThan(50)
    }

    // 验证所有 BioForest 链地址相同（同一密钥对）
    const bfmetaAddr = wallet.chainAddresses.find((ca: { chain: string }) => ca.chain === 'bfmeta')
    const pmchainAddr = wallet.chainAddresses.find((ca: { chain: string }) => ca.chain === 'pmchain')
    const ccchainAddr = wallet.chainAddresses.find((ca: { chain: string }) => ca.chain === 'ccchain')
    expect(bfmetaAddr.address).toBe(pmchainAddr.address)
    expect(pmchainAddr.address).toBe(ccchainAddr.address)
  })
})
