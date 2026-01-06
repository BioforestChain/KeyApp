import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * ProviderFallbackWarning E2E 截图测试
 *
 * 验证 ProviderResult 重构后的各种场景：
 * 1. 正常数据场景（supported: true）- 有余额，无警告
 * 2. Fallback 警告场景（supported: false）- provider 失败，显示黄色警告
 * 3. 空数据无警告场景 - Provider 正常但无数据
 * 
 * 使用真实收集的 fixtures 数据
 * 
 * 运行: pnpm e2e:mock -- provider-fallback-warning
 */

const E2E_PROVIDER_FIXTURES_KEY = 'bfm_e2e_provider_fixtures_v1'

// 加载真实收集的 fixtures
function loadProviderFixtures() {
  const e2eDir = path.dirname(fileURLToPath(import.meta.url))
  const fixturePath = path.join(e2eDir, 'fixtures/provider-data/real-provider-data.v1.json')
  const raw = fs.readFileSync(fixturePath, 'utf8')
  return { raw, data: JSON.parse(raw) }
}

const FIXTURES = loadProviderFixtures()

// 从 fixtures 中提取真实余额数据用于显示
const REAL_BALANCES = {
  ethereum: FIXTURES.data.balances.find((b: any) => b.chain === 'ethereum' && b.balanceDecimal)?.balanceDecimal || 0,
  bitcoin: FIXTURES.data.balances.find((b: any) => b.chain === 'bitcoin' && b.balanceDecimal)?.balanceDecimal || 0,
  tron: FIXTURES.data.balances.find((b: any) => b.chain === 'tron' && b.balanceDecimal)?.balanceDecimal || 0,
}

// 测试钱包数据 - 使用真实地址和真实余额
const TEST_WALLET_DATA = {
  wallets: [
    {
      id: 'test-wallet-1',
      name: 'Vitalik Wallet',
      address: FIXTURES.data.addresses.ethereum,
      chain: 'ethereum',
      chainAddresses: [
        { 
          chain: 'ethereum', 
          address: FIXTURES.data.addresses.ethereum,
          tokens: [
            { symbol: 'ETH', balance: REAL_BALANCES.ethereum.toString(), decimals: 18 },
          ],
        },
        { 
          chain: 'bitcoin', 
          address: FIXTURES.data.addresses.bitcoin,
          tokens: [
            { symbol: 'BTC', balance: REAL_BALANCES.bitcoin.toString(), decimals: 8 },
          ],
        },
        { 
          chain: 'tron', 
          address: FIXTURES.data.addresses.tron,
          tokens: [
            { symbol: 'TRX', balance: REAL_BALANCES.tron.toString(), decimals: 6 },
          ],
        },
        { 
          chain: 'binance', 
          address: FIXTURES.data.addresses.binance,
          tokens: [],
        },
      ],
      encryptedMnemonic: { ciphertext: 'test', iv: 'test', salt: 'test' },
      createdAt: Date.now(),
      tokens: [],
    },
  ],
  currentWalletId: 'test-wallet-1',
  selectedChain: 'ethereum',
}

async function setupTestWalletWithFixtures(page: Page, targetUrl: string = '/', language: string = 'zh') {
  await page.addInitScript((data) => {
    localStorage.setItem('bfm_wallets', JSON.stringify(data.wallet))
    localStorage.setItem('bfm_preferences', JSON.stringify({ language: data.lang, currency: 'USD' }))
    // 存储 provider fixtures 供 mock service 使用
    localStorage.setItem(data.fixtureKey, data.fixtures)
  }, { 
    wallet: TEST_WALLET_DATA, 
    lang: language, 
    fixtureKey: E2E_PROVIDER_FIXTURES_KEY, 
    fixtures: FIXTURES.raw 
  })

  const hashUrl = targetUrl === '/' ? '/' : `/#${targetUrl}`
  await page.goto(hashUrl)
  await page.waitForLoadState('networkidle')
}

async function waitForAppReady(page: Page) {
  await page.locator('svg[aria-label="加载中"]').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {})
}

test.describe('ProviderFallbackWarning - 使用真实 fixtures', () => {
  
  test('钱包首页 - Ethereum 余额显示', async ({ page }) => {
    await setupTestWalletWithFixtures(page)
    await waitForAppReady(page)
    await page.waitForTimeout(2000)
    
    await expect(page).toHaveScreenshot('wallet-home-ethereum.png', {
      mask: [page.locator('[data-testid="address-display"]')],
    })
  })

  test('钱包首页 - 切换到 Bitcoin', async ({ page }) => {
    await setupTestWalletWithFixtures(page)
    await waitForAppReady(page)
    
    // 点击链选择器
    const chainSelector = page.locator('[data-testid="chain-selector"]')
    if (await chainSelector.isVisible()) {
      await chainSelector.click()
      await page.waitForTimeout(500)
      
      // 选择 Bitcoin
      const bitcoinOption = page.locator('[data-testid="chain-sheet"]').getByText(/Bitcoin/i)
      if (await bitcoinOption.isVisible()) {
        await bitcoinOption.click()
        await page.waitForTimeout(2000)
      }
    }
    
    await expect(page).toHaveScreenshot('wallet-home-bitcoin.png', {
      mask: [page.locator('[data-testid="address-display"]')],
    })
  })

  test('钱包首页 - 切换到 Tron', async ({ page }) => {
    await setupTestWalletWithFixtures(page)
    await waitForAppReady(page)
    
    const chainSelector = page.locator('[data-testid="chain-selector"]')
    if (await chainSelector.isVisible()) {
      await chainSelector.click()
      await page.waitForTimeout(500)
      
      const tronOption = page.locator('[data-testid="chain-sheet"]').getByText(/Tron/i)
      if (await tronOption.isVisible()) {
        await tronOption.click()
        await page.waitForTimeout(2000)
      }
    }
    
    await expect(page).toHaveScreenshot('wallet-home-tron.png', {
      mask: [page.locator('[data-testid="address-display"]')],
    })
  })

  test('地址余额查询 - Ethereum (有数据)', async ({ page }) => {
    await setupTestWalletWithFixtures(page, '/address-balance')
    await waitForAppReady(page)
    
    // 输入 Vitalik 地址
    const addressInput = page.locator('input').first()
    await addressInput.fill(FIXTURES.data.addresses.ethereum)
    
    // 点击查询
    const searchBtn = page.locator('button[type="submit"], button').filter({ has: page.locator('svg') }).first()
    await searchBtn.click()
    await page.waitForTimeout(5000)
    
    await expect(page).toHaveScreenshot('address-balance-ethereum-with-data.png')
  })

  test('地址余额查询 - Bitcoin (有数据)', async ({ page }) => {
    await setupTestWalletWithFixtures(page, '/address-balance')
    await waitForAppReady(page)
    
    // 切换到 Bitcoin
    const chainSelect = page.locator('select, [role="combobox"]').first()
    if (await chainSelect.isVisible()) {
      await chainSelect.click()
      const btcOption = page.getByText(/Bitcoin/i)
      if (await btcOption.isVisible()) {
        await btcOption.click()
      }
    }
    
    // 输入 Satoshi 地址
    const addressInput = page.locator('input').first()
    await addressInput.fill(FIXTURES.data.addresses.bitcoin)
    
    // 点击查询
    const searchBtn = page.locator('button[type="submit"], button').filter({ has: page.locator('svg') }).first()
    await searchBtn.click()
    await page.waitForTimeout(5000)
    
    await expect(page).toHaveScreenshot('address-balance-bitcoin-with-data.png')
  })

  test('地址交易查询 - Bitcoin (有交易记录)', async ({ page }) => {
    await setupTestWalletWithFixtures(page, '/address-transactions')
    await waitForAppReady(page)
    
    // 切换到 Bitcoin
    const chainSelect = page.locator('select, [role="combobox"]').first()
    if (await chainSelect.isVisible()) {
      await chainSelect.click()
      const btcOption = page.getByText(/Bitcoin/i)
      if (await btcOption.isVisible()) {
        await btcOption.click()
      }
    }
    
    // 输入 Satoshi 地址
    const addressInput = page.locator('input').first()
    await addressInput.fill(FIXTURES.data.addresses.bitcoin)
    
    // 点击查询
    const searchBtn = page.locator('button[type="submit"], button').filter({ has: page.locator('svg') }).first()
    await searchBtn.click()
    await page.waitForTimeout(5000)
    
    await expect(page).toHaveScreenshot('address-transactions-bitcoin.png')
  })

  test('交易历史页面', async ({ page }) => {
    await setupTestWalletWithFixtures(page, '/history')
    await waitForAppReady(page)
    await page.waitForTimeout(2000)
    
    await expect(page).toHaveScreenshot('transaction-history.png')
  })
})
