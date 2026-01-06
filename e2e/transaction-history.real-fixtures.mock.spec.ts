import { test, expect, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const E2E_FIXTURE_STORAGE_KEY = 'bfm_e2e_transaction_fixtures_v1'

type FixturePayload =
  | { version?: number; transactions: Array<{ id: string; type: string; chain?: string }> }
  | Array<{ id: string; type: string; chain?: string }>

function loadFixturePayload(): { raw: string; transactions: Array<{ id: string; type: string; chain?: string }> } {
  const e2eDir = path.dirname(fileURLToPath(import.meta.url))
  const defaultPath = path.join(e2eDir, 'fixtures/transactions/real-transactions.v1.json')
  const fixturePath = process.env.TX_FIXTURE_PATH ? path.resolve(process.env.TX_FIXTURE_PATH) : defaultPath

  const raw = fs.readFileSync(fixturePath, 'utf8')
  const parsed = JSON.parse(raw) as FixturePayload
  const transactions = Array.isArray(parsed) ? parsed : parsed.transactions
  return { raw, transactions }
}

const FIXTURE = loadFixturePayload()

const CHAIN_LABELS: Record<string, string> = {
  bfchainv2: 'BFChain V2',
  ethereum: 'Ethereum',
  bitcoin: 'Bitcoin',
  tron: 'Tron',
  binance: 'BNB Smart Chain',
}

// 测试钱包数据（带交易历史）
const TEST_WALLET_DATA = {
  wallets: [
    {
      id: 'test-wallet-1',
      name: '测试钱包',
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      chain: 'ethereum',
      chainAddresses: [
        {
          chain: 'ethereum',
          address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          tokens: [
            { symbol: 'ETH', balance: '1.5', decimals: 18 },
          ],
        },
        {
          chain: 'binance',
          address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          tokens: [
            { symbol: 'BNB', balance: '2', decimals: 18 },
          ],
        },
        {
          chain: 'tron',
          address: 'TQf2Gf5gX5dP8qP3bG9r2qkY1mZt8rKJ6u',
          tokens: [
            { symbol: 'TRX', balance: '100', decimals: 6 },
          ],
        },
        {
          chain: 'bitcoin',
          address: 'bc1qf7n7v0m3p7j9y2t5k0x8m7g0v9c5u7zv5l4q8a',
          tokens: [
            { symbol: 'BTC', balance: '0.5', decimals: 8 },
          ],
        },
        {
          chain: 'bfchainv2',
          address: 'BF2aB3cD4eF5gH6iJ7kL8mN9pQ1rS2tU3vW4xY5z',
          tokens: [
            { symbol: 'BFC', balance: '1234.5', decimals: 8 },
          ],
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

async function setupTestWalletWithFixtures(page: Page, targetUrl: string = '/', language: string = 'en') {
  await page.addInitScript((data) => {
    localStorage.setItem('bfm_wallets', JSON.stringify(data.wallet))
    localStorage.setItem('bfm_preferences', JSON.stringify({ language: data.lang, currency: 'USD' }))
    localStorage.setItem(data.fixtureKey, data.fixtures)
  }, { wallet: TEST_WALLET_DATA, lang: language, fixtureKey: E2E_FIXTURE_STORAGE_KEY, fixtures: FIXTURE.raw })

  const hashUrl = targetUrl === '/' ? '/' : `/#${targetUrl}`
  await page.goto(hashUrl)
  await page.waitForLoadState('networkidle')
}

async function waitForAppReady(page: Page) {
  await page.locator('svg[aria-label="加载中"]').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {})
}

function pickTxId(options: { chain: string; type?: string }): string | null {
  const hit = FIXTURE.transactions.find((t) => t.chain === options.chain && (!options.type || t.type === options.type))
  return hit?.id ?? null
}

async function setHistoryChainFilter(page: Page, chainId: string) {
  const label = CHAIN_LABELS[chainId] ?? chainId
  const chainCombobox = page.getByRole('combobox').first()
  await chainCombobox.scrollIntoViewIfNeeded().catch(() => {})
  await chainCombobox.click()
  await page.locator('[data-slot="select-item"]').filter({ hasText: label }).first().click()
}

test.describe('交易历史 - real fixtures screenshots', () => {
  test('交易列表截图 - real fixtures', async ({ page }) => {
    await setupTestWalletWithFixtures(page, '/history')
    await waitForAppReady(page)
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('history-real-fixtures.png')
  })

  test('交易列表截图 - per chain', async ({ page }) => {
    await setupTestWalletWithFixtures(page, '/history')
    await waitForAppReady(page)

    const chains = ['bfchainv2', 'ethereum', 'bitcoin', 'tron', 'binance']
    for (const chainId of chains) {
      await setHistoryChainFilter(page, chainId)
      await page.waitForTimeout(500)
      await expect(page).toHaveScreenshot(`history-${chainId}.png`)
    }
  })

  test('交易详情截图 - per chain', async ({ page }) => {
    const targets = [
      { chain: 'bfchainv2', type: 'send' },
      { chain: 'ethereum', type: 'approve' },
      { chain: 'bitcoin', type: 'send' },
      { chain: 'tron', type: 'interaction' },
      { chain: 'binance', type: 'approve' },
    ]

    for (const target of targets) {
      const txId = pickTxId({ chain: target.chain, type: target.type })
      if (!txId) {
        throw new Error(`${target.chain}:${target.type} transaction missing in fixture`)
      }
      await setupTestWalletWithFixtures(page, `/transaction/${txId}`)
      await waitForAppReady(page)
      await page.waitForTimeout(500)
      await expect(page).toHaveScreenshot(`transaction-detail-${target.chain}.png`)
    }
  })

  test('交易详情截图 - swap', async ({ page }) => {
    const txId = FIXTURE.transactions.find((t) => t.type === 'swap')?.id ?? null
    test.skip(!txId, 'swap transaction missing in fixture')
    if (!txId) return
    await setupTestWalletWithFixtures(page, `/transaction/${txId}`)
    await waitForAppReady(page)
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('transaction-detail-swap.png')
  })

  test('交易详情截图 - approve', async ({ page }) => {
    const txId = FIXTURE.transactions.find((t) => t.type === 'approve')?.id ?? null
    test.skip(!txId, 'approve transaction missing in fixture')
    if (!txId) return
    await setupTestWalletWithFixtures(page, `/transaction/${txId}`)
    await waitForAppReady(page)
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('transaction-detail-approve.png')
  })

  test('交易详情截图 - interaction', async ({ page }) => {
    const txId = FIXTURE.transactions.find((t) => t.type === 'interaction')?.id ?? null
    test.skip(!txId, 'interaction transaction missing in fixture')
    if (!txId) return
    await setupTestWalletWithFixtures(page, `/transaction/${txId}`)
    await waitForAppReady(page)
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot('transaction-detail-interaction.png')
  })
})
