import { test, expect } from '@playwright/test'
import { getWalletDataFromIndexedDB } from './utils/indexeddb-helper'

/**
 * BioForest 链 E2E 测试
 *
 * 测试 BioForest 链（BFMeta, PMChain, CCChain）的特定功能
 * - 地址格式验证（生产默认 'b' 前缀）
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
        { chain: 'bfmeta', address: 'b7ADmvZJJ3n3aDxkvwbXxJX1oGgeiCzL11', tokens: [] },
        { chain: 'pmchain', address: 'b7ADmvZJJ3n3aDxkvwbXxJX1oGgeiCzL11', tokens: [] },
        { chain: 'ccchain', address: 'b7ADmvZJJ3n3aDxkvwbXxJX1oGgeiCzL11', tokens: [] },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test' },
      createdAt: Date.now(),
      tokens: [],
    },
  ],
  currentWalletId: 'test-bioforest-wallet',
  selectedChain: 'ethereum',
}

async function setupBioforestWallet(page: import('@playwright/test').Page, targetUrl: string = '/') {
  await page.addInitScript((data) => {
    localStorage.setItem('bfm_wallets', JSON.stringify(data))
  }, TEST_WALLET_WITH_BIOFOREST)
  
  const hashUrl = targetUrl === '/' ? '/' : `/#${targetUrl}`
  await page.goto(hashUrl)
  await page.waitForLoadState('networkidle')
}

test.describe('BioForest 链功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear())
  })

  test('切换到 BFMeta 链显示正确地址', async ({ page }) => {
    await setupBioforestWallet(page)

    // 打开链选择器
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')

    // 选择 BFMeta
    await page.click('[data-testid="chain-option-bfmeta"]')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })

    // 验证链选择器显示 BFMeta
    await expect(page.locator('[data-testid="chain-selector"]')).toContainText('BFMeta')

    // 验证地址以 'b' 开头（生产默认 bnid）
    const addressText = await page.locator('.font-mono').first().textContent()
    expect(addressText?.startsWith('b')).toBe(true)
  })

  test('切换到 PMChain 链显示正确地址', async ({ page }) => {
    await setupBioforestWallet(page)

    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('[data-testid="chain-option-pmchain"]')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })

    await expect(page.locator('[data-testid="chain-selector"]')).toContainText('PMChain')

    const addressText = await page.locator('.font-mono').first().textContent()
    expect(addressText?.startsWith('b')).toBe(true)
  })

  test('切换到 CCChain 链显示正确地址', async ({ page }) => {
    await setupBioforestWallet(page)

    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('[data-testid="chain-option-ccchain"]')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })

    await expect(page.locator('[data-testid="chain-selector"]')).toContainText('CCChain')

    const addressText = await page.locator('.font-mono').first().textContent()
    expect(addressText?.startsWith('b')).toBe(true)
  })

  // TODO: 修复剪贴板 mock - clipboardService 使用原生 API，需要添加测试钩子
  test.skip('BioForest 地址复制功能', async ({ page }) => {
    await setupBioforestWallet(page)

    // 切换到 BFMeta
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('[data-testid="chain-option-bfmeta"]')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })

    // 清空剪贴板历史
    await page.evaluate(() => {
      window.__CLIPBOARD__ = ''
    })

    // 点击复制按钮
    await page.click('button[aria-label="复制地址"]')
    await page.waitForTimeout(100)

    // 验证剪贴板内容以 'b' 开头（生产默认 bnid）
    const clipboardContent = await page.evaluate(() => window.__CLIPBOARD__)
    expect(typeof clipboardContent).toBe('string')
    expect(clipboardContent.startsWith('b')).toBe(true)
  })

  test('链切换后发送页面显示正确链信息', async ({ page }) => {
    await setupBioforestWallet(page)

    // 切换到 BFMeta
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('[data-testid="chain-option-bfmeta"]')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })
    
    // 等待链选择器显示 BFMeta，确保切换完成
    await expect(page.locator('[data-testid="chain-selector"]')).toContainText('BFMeta')
    
    // 导航到发送页面 (Stackflow hash 路由)
    // 等待发送按钮可交互（网络空闲后）
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="send-button"]', { state: 'visible' })
    await page.click('[data-testid="send-button"]')
    // 等待发送页面加载（增加超时以应对 CI 环境）
    await page.waitForSelector('[data-testid="page-title"]', { timeout: 30000 })

    // 验证页面正确加载
    await expect(page.locator('[data-testid="page-title"]')).toBeVisible()
  })

  test('链切换后收款页面显示正确地址', async ({ page }) => {
    await setupBioforestWallet(page)

    // 切换到 BFMeta
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('[data-testid="chain-option-bfmeta"]')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })

    // 导航到收款页面 (Stackflow hash 路由)
    await page.click('[data-testid="receive-button"]')
    await page.waitForSelector('[data-testid="page-title"]')

    // 验证显示的地址以 'b' 开头（生产默认 bnid）
    await expect(page.getByRole('button', { name: /^复制\s*b[1-9A-HJ-NP-Za-km-z]+$/ })).toBeVisible()
  })

  test('所有 BioForest 链共用相同地址', async ({ page }) => {
    await setupBioforestWallet(page)
    const addresses: string[] = []

    // 获取 BFMeta 地址
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('[data-testid="chain-option-bfmeta"]')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })
    let addressText = await page.locator('.font-mono').first().textContent()
    if (addressText) addresses.push(addressText)

    // 获取 PMChain 地址
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('[data-testid="chain-option-pmchain"]')
    await page.waitForSelector('[data-testid="chain-sheet"]', { state: 'hidden' })
    addressText = await page.locator('.font-mono').first().textContent()
    if (addressText) addresses.push(addressText)

    // 获取 CCChain 地址
    await page.click('[data-testid="chain-selector"]')
    await page.waitForSelector('[data-testid="chain-sheet"]')
    await page.click('[data-testid="chain-option-ccchain"]')
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
    // 清除数据并从首页导航
    await page.addInitScript(() => localStorage.clear())
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 点击导入钱包按钮 (Stackflow 需要从首页导航)
    await page.click('[data-testid="import-wallet-button"]')
    
    // 选择密钥类型（默认已选中"标准助记词"）
    await page.waitForSelector('[data-testid="key-type-step"]')
    await page.click('[data-testid="continue-button"]')
    
    await page.waitForSelector('[data-testid="mnemonic-step"]')

    // 填写助记词（使用 textarea）
    await page.fill('[data-testid="mnemonic-textarea"]', TEST_MNEMONIC_12)
    await page.click('[data-testid="continue-button"]')
    await page.waitForSelector('[data-testid="password-step"]')
    await page.fill('[data-testid="password-input"] input', 'Test1234!')
    await page.fill('[data-testid="confirm-password-input"] input', 'Test1234!')
    await page.click('[data-testid="continue-button"]')

    // 等待导入成功页面并进入钱包
    await page.waitForSelector('[data-testid="import-success-step"]')
    await page.click('[data-testid="enter-wallet-button"]')
    
    await page.waitForURL(/.*#\/$/)
    await page.waitForSelector('[data-testid="chain-selector"]:visible', { timeout: 10000 })

    // 验证 BioForest 地址派生 (从 IndexedDB 读取)
    const wallets = await getWalletDataFromIndexedDB(page)
    const wallet = wallets[0]

    // 验证 BioForest 链地址
    const bioforestChains = ['bfmeta', 'pmchain', 'ccchain']
    for (const chain of bioforestChains) {
      const chainAddr = wallet.chainAddresses.find((ca: { chain: string }) => ca.chain === chain)
      expect(chainAddr, `应该有 ${chain} 地址`).toBeDefined()
      // BioForest 地址以 'b' 开头（生产默认 bnid）
      expect(chainAddr.address.startsWith('b')).toBe(true)
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
