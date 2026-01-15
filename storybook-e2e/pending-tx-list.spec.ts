import { expect, test } from '@playwright/test'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
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
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'text/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    case '.ico':
      return 'image/x-icon'
    case '.woff':
      return 'font/woff'
    case '.woff2':
      return 'font/woff2'
    case '.ttf':
      return 'font/ttf'
    case '.map':
      return 'application/json; charset=utf-8'
    default:
      return 'application/octet-stream'
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

function storyUrl(baseUrl: string, storyId: string): string {
  return `${baseUrl}/?path=/story/${storyId}`
}

test.describe('PendingTxList Storybook', () => {
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

  test('Default renders multiple pending transactions', async ({ page }) => {
    const frame = page.frameLocator('#storybook-preview-iframe')

    await page.goto(storyUrl(baseUrl, 'transaction-pendingtxlist--default'))
    
    // Wait for the pending tx list to be visible
    await expect(frame.getByText('待处理交易')).toBeVisible({ timeout: 10000 })
    
    // Check that transactions are visible
    await expect(frame.getByText('100.5 BFM')).toBeVisible()
    await expect(frame.getByText('50 CPCC')).toBeVisible()
    await expect(frame.getByText('200 BFM')).toBeVisible()

    // Take screenshot
    await expect(frame.locator('#storybook-root')).toHaveScreenshot('pending-tx-list-default.png')
  })

  test('Broadcasting state shows spinner animation', async ({ page }) => {
    const frame = page.frameLocator('#storybook-preview-iframe')

    await page.goto(storyUrl(baseUrl, 'transaction-pendingtxlist--broadcasting'))
    
    // Wait for the pending tx list to be visible
    await expect(frame.getByText('待处理交易')).toBeVisible({ timeout: 10000 })
    
    // Check broadcasting state
    await expect(frame.getByText('广播中')).toBeVisible()

    // Take screenshot
    await expect(frame.locator('#storybook-root')).toHaveScreenshot('pending-tx-broadcasting.png')
  })

  test('Broadcasted state shows waiting confirmation', async ({ page }) => {
    const frame = page.frameLocator('#storybook-preview-iframe')

    await page.goto(storyUrl(baseUrl, 'transaction-pendingtxlist--broadcasted'))
    
    // Wait for the pending tx list to be visible
    await expect(frame.getByText('待处理交易')).toBeVisible({ timeout: 10000 })
    
    // Check broadcasted state
    await expect(frame.getByText('等待上链')).toBeVisible()

    // Take screenshot
    await expect(frame.locator('#storybook-root')).toHaveScreenshot('pending-tx-broadcasted.png')
  })

  test('Failed state shows error message and retry button', async ({ page }) => {
    const frame = page.frameLocator('#storybook-preview-iframe')

    await page.goto(storyUrl(baseUrl, 'transaction-pendingtxlist--failed'))
    
    // Wait for the pending tx list to be visible
    await expect(frame.getByText('待处理交易')).toBeVisible({ timeout: 10000 })
    
    // Check failed state
    await expect(frame.getByText('广播失败')).toBeVisible()
    await expect(frame.getByText('资产余额不足')).toBeVisible()

    // Take screenshot
    await expect(frame.locator('#storybook-root')).toHaveScreenshot('pending-tx-failed.png')
  })

  test('MultipleStates shows all status types', async ({ page }) => {
    const frame = page.frameLocator('#storybook-preview-iframe')

    await page.goto(storyUrl(baseUrl, 'transaction-pendingtxlist--multiple-states'))
    
    // Wait for the pending tx list to be visible
    await expect(frame.getByText('待处理交易')).toBeVisible({ timeout: 10000 })
    
    // Check all states are visible
    await expect(frame.getByText('广播中')).toBeVisible()
    await expect(frame.getByText('等待上链')).toBeVisible()
    await expect(frame.getByText('广播失败').first()).toBeVisible()

    // Take screenshot
    await expect(frame.locator('#storybook-root')).toHaveScreenshot('pending-tx-multiple-states.png')
  })
})
