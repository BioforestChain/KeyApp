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

test.describe('TokenItem Context Menu Storybook', () => {
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

  test('WithContextMenu renders more button', async ({ page }) => {
    const frame = page.frameLocator('#storybook-preview-iframe')

    await page.goto(storyUrl(baseUrl, 'token-tokenitem--with-context-menu'))
    
    // Wait for the token item to be visible
    await expect(frame.getByText('USDT')).toBeVisible()
    
    // Check that more button is visible
    const moreButton = frame.getByRole('button', { name: /更多操作/i })
    await expect(moreButton).toBeVisible()

    // Take screenshot
    await expect(frame.locator('#storybook-root')).toHaveScreenshot('with-context-menu.png')
  })

  test('ContextMenuList renders multiple items with more buttons', async ({ page }) => {
    const frame = page.frameLocator('#storybook-preview-iframe')

    await page.goto(storyUrl(baseUrl, 'token-tokenitem--context-menu-list'))
    
    // Wait for tokens to be visible using more specific selectors
    await expect(frame.locator('p.font-medium').filter({ hasText: 'USDT' })).toBeVisible()
    await expect(frame.locator('p.font-medium').filter({ hasText: 'ETH' })).toBeVisible()
    await expect(frame.locator('p.font-medium').filter({ hasText: 'TRX' })).toBeVisible()
    
    // Check that more buttons are visible for all items
    const moreButtons = frame.getByRole('button', { name: /更多操作/i })
    await expect(moreButtons).toHaveCount(3)

    // Take screenshot
    await expect(frame.locator('#storybook-root')).toHaveScreenshot('context-menu-list.png')
  })

  test('clicking more button triggers dialog', async ({ page }) => {
    const frame = page.frameLocator('#storybook-preview-iframe')

    await page.goto(storyUrl(baseUrl, 'token-tokenitem--with-context-menu'))
    
    // Wait for the token item to be visible
    await expect(frame.getByText('USDT')).toBeVisible()
    
    // Set up dialog handler
    let dialogMessage = ''
    page.on('dialog', async (dialog) => {
      dialogMessage = dialog.message()
      await dialog.accept()
    })

    // Click the more button
    const moreButton = frame.getByRole('button', { name: /更多操作/i })
    await moreButton.click()

    // Verify dialog was triggered with correct content
    expect(dialogMessage).toContain('USDT')
    expect(dialogMessage).toContain('Can destroy')
  })
})
