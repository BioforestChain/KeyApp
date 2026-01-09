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
  // Ensure storybook build exists (avoid false-positive "passes" with empty server)
  await stat(path.join(storybookStaticDir, 'index.html'))

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    const rawPath = decodeURIComponent(url.pathname)
    const relativePath = rawPath === '/' ? '/index.html' : rawPath
    const filePath = path.normalize(path.join(storybookStaticDir, relativePath))

    // Path traversal guard
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

test.describe('AddressInput Storybook', () => {
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

  test('AddressInput UnknownAddressDisplay renders placeholder icon', async ({ page }) => {
    const frame = page.frameLocator('#storybook-preview-iframe')

    await page.goto(storyUrl(baseUrl, 'transfer-addressinput--unknown-address-display'))
    
    // Wait for the address input to be visible using title attribute as anchor
    // AddressDisplay puts the full address in the title attribute
    const addressDisplay = frame.locator('[title="0x1234567890abcdef1234567890abcdef12345678"]')
    await expect(addressDisplay).toBeVisible()

    // Take screenshot of the component
    await expect(frame.locator('#storybook-root')).toHaveScreenshot('unknown-address-display.png')
  })
  
  test('AddressInput WithValue renders in display mode', async ({ page }) => {
    const frame = page.frameLocator('#storybook-preview-iframe')

    await page.goto(storyUrl(baseUrl, 'transfer-addressinput--with-value'))
    
    // Wait for the address input to be visible
    const addressDisplay = frame.locator('[title="0x1234567890abcdef1234567890abcdef12345678"]')
    await expect(addressDisplay).toBeVisible()
    
    // Check if placeholder icon is also present
    // The visual check is done via screenshot
    await expect(frame.locator('#storybook-root')).toHaveScreenshot('with-value-display-mode.png')
  })
  
  test('AddressInput KnownContactDisplay renders contact name and address', async ({ page }) => {
    const frame = page.frameLocator('#storybook-preview-iframe')

    await page.goto(storyUrl(baseUrl, 'transfer-addressinput--known-contact-display'))
    
    // Check for contact name "Alice Cooper"
    await expect(frame.getByText('Alice Cooper')).toBeVisible()
    
    // Check for address - Note: AddressInput renders full address in text if matched contact
    await expect(frame.getByText('0x1234567890abcdef1234567890abcdef12345678')).toBeVisible()

    // Take screenshot of the component
    await expect(frame.locator('#storybook-root')).toHaveScreenshot('known-contact-display.png')
  })
})
