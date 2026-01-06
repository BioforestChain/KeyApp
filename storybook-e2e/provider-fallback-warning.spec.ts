/**
 * ProviderFallbackWarning Storybook E2E 截图测试
 * 
 * 验证四条链（BFMeta, ETH, BSC, Tron）的两种场景：
 * 1. 正常数据（supported: true）- 无警告
 * 2. Fallback 警告（supported: false）- 黄色警告
 * 
 * 运行: npx playwright test --config=playwright.storybook.config.ts storybook-e2e/provider-fallback-warning.spec.ts
 */
import { expect, test } from '@playwright/test'
import { createReadStream } from 'node:fs'
import { stat, mkdir } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const storybookStaticDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../storybook-static'
)

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.html': return 'text/html; charset=utf-8'
    case '.js': return 'text/javascript; charset=utf-8'
    case '.css': return 'text/css; charset=utf-8'
    case '.json': return 'application/json; charset=utf-8'
    case '.svg': return 'image/svg+xml'
    case '.png': return 'image/png'
    case '.woff': return 'font/woff'
    case '.woff2': return 'font/woff2'
    default: return 'application/octet-stream'
  }
}

async function startStorybookServer(): Promise<{ server: Server; baseUrl: string }> {
  await stat(path.join(storybookStaticDir, 'index.html'))

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    const rawPath = decodeURIComponent(url.pathname)
    const relativePath = rawPath === '/' ? '/index.html' : rawPath
    const filePath = path.normalize(path.join(storybookStaticDir, relativePath))

    if (!filePath.startsWith(storybookStaticDir)) {
      res.statusCode = 403
      res.end('Forbidden')
      return
    }

    try {
      const stats = await stat(filePath)
      if (!stats.isFile()) {
        res.statusCode = 404
        res.end('Not found')
        return
      }
      res.statusCode = 200
      res.setHeader('Content-Type', getContentType(filePath))
      createReadStream(filePath).pipe(res)
    } catch {
      res.statusCode = 404
      res.end('Not found')
    }
  })

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()))
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Unexpected server address')

  return { server, baseUrl: `http://127.0.0.1:${address.port}` }
}

function storyIframeUrl(baseUrl: string, storyId: string): string {
  return `${baseUrl}/iframe.html?viewMode=story&id=${storyId}`
}

test.describe('ProviderFallbackWarning Screenshots', () => {
  let server: Server
  let baseUrl: string

  test.beforeAll(async () => {
    const started = await startStorybookServer()
    server = started.server
    baseUrl = started.baseUrl
  })

  test.afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    )
  })

  // ==================== BFMeta 链 ====================
  test('BFMeta - Normal Data', async ({ page }) => {
    await page.goto(storyIframeUrl(baseUrl, 'wallet-walletaddressportfolio--bf-meta-normal-data'))
    await page.waitForSelector('[data-testid="wallet-address-portfolio"]', { timeout: 10000 })
    
    // 验证没有警告
    const warnings = page.locator('[data-testid="provider-fallback-warning"]')
    await expect(warnings).toHaveCount(0)
    
    await expect(page).toHaveScreenshot('bfmeta-normal-data.png')
  })

  test('BFMeta - Fallback Warning', async ({ page }) => {
    await page.goto(storyIframeUrl(baseUrl, 'wallet-walletaddressportfolio--bf-meta-fallback-warning'))
    await page.waitForSelector('[data-testid="wallet-address-portfolio"]', { timeout: 10000 })
    
    // 验证警告出现
    const warnings = page.locator('[data-testid="provider-fallback-warning"]')
    await expect(warnings.first()).toBeVisible()
    
    await expect(page).toHaveScreenshot('bfmeta-fallback-warning.png')
  })

  // ==================== Ethereum 链 ====================
  test('Ethereum - Normal Data (23.68 ETH)', async ({ page }) => {
    await page.goto(storyIframeUrl(baseUrl, 'wallet-walletaddressportfolio--ethereum-normal-data'))
    await page.waitForSelector('[data-testid="wallet-address-portfolio"]', { timeout: 10000 })
    
    await expect(page.locator('[data-testid="provider-fallback-warning"]')).toHaveCount(0)
    await expect(page).toHaveScreenshot('ethereum-normal-data.png')
  })

  test('Ethereum - Fallback Warning', async ({ page }) => {
    await page.goto(storyIframeUrl(baseUrl, 'wallet-walletaddressportfolio--ethereum-fallback-warning'))
    await page.waitForSelector('[data-testid="wallet-address-portfolio"]', { timeout: 10000 })
    
    await expect(page.locator('[data-testid="provider-fallback-warning"]').first()).toBeVisible()
    await expect(page).toHaveScreenshot('ethereum-fallback-warning.png')
  })

  // ==================== Binance/BSC 链 ====================
  test('Binance - Normal Data (234.08 BNB)', async ({ page }) => {
    await page.goto(storyIframeUrl(baseUrl, 'wallet-walletaddressportfolio--binance-normal-data'))
    await page.waitForSelector('[data-testid="wallet-address-portfolio"]', { timeout: 10000 })
    
    await expect(page.locator('[data-testid="provider-fallback-warning"]')).toHaveCount(0)
    await expect(page).toHaveScreenshot('binance-normal-data.png')
  })

  test('Binance - Fallback Warning', async ({ page }) => {
    await page.goto(storyIframeUrl(baseUrl, 'wallet-walletaddressportfolio--binance-fallback-warning'))
    await page.waitForSelector('[data-testid="wallet-address-portfolio"]', { timeout: 10000 })
    
    await expect(page.locator('[data-testid="provider-fallback-warning"]').first()).toBeVisible()
    await expect(page).toHaveScreenshot('binance-fallback-warning.png')
  })

  // ==================== Tron 链 ====================
  test('Tron - Normal Data (163,377 TRX)', async ({ page }) => {
    await page.goto(storyIframeUrl(baseUrl, 'wallet-walletaddressportfolio--tron-normal-data'))
    await page.waitForSelector('[data-testid="wallet-address-portfolio"]', { timeout: 10000 })
    
    await expect(page.locator('[data-testid="provider-fallback-warning"]')).toHaveCount(0)
    await expect(page).toHaveScreenshot('tron-normal-data.png')
  })

  test('Tron - Fallback Warning', async ({ page }) => {
    await page.goto(storyIframeUrl(baseUrl, 'wallet-walletaddressportfolio--tron-fallback-warning'))
    await page.waitForSelector('[data-testid="wallet-address-portfolio"]', { timeout: 10000 })
    
    await expect(page.locator('[data-testid="provider-fallback-warning"]').first()).toBeVisible()
    await expect(page).toHaveScreenshot('tron-fallback-warning.png')
  })

  // ==================== 混合场景 ====================
  test('Partial Fallback - Tokens OK, Transactions Failed', async ({ page }) => {
    await page.goto(storyIframeUrl(baseUrl, 'wallet-walletaddressportfolio--partial-fallback'))
    await page.waitForSelector('[data-testid="wallet-address-portfolio"]', { timeout: 10000 })
    
    // 切换到交易标签页查看警告
    const txTab = page.getByTestId('wallet-address-portfolio-tabs-tab-history')
    await txTab.click()
    await page.waitForTimeout(500)
    
    await expect(page).toHaveScreenshot('partial-fallback-transactions-tab.png')
  })

  test('Empty Data - No Warning (Provider OK)', async ({ page }) => {
    await page.goto(storyIframeUrl(baseUrl, 'wallet-walletaddressportfolio--empty-but-supported'))
    await page.waitForSelector('[data-testid="wallet-address-portfolio"]', { timeout: 10000 })
    
    // 空数据但 Provider 正常时不应该有警告
    await expect(page.locator('[data-testid="provider-fallback-warning"]')).toHaveCount(0)
    await expect(page).toHaveScreenshot('empty-no-warning.png')
  })
})
