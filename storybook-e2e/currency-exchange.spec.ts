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

function storyUrl(baseUrl: string, currency: 'USD' | 'CNY' | 'EUR' | 'JPY' | 'KRW'): string {
  const globals = encodeURIComponent(`currency:${currency}`)
  return `${baseUrl}/?path=/story/token-tokenitem--multi-currency&globals=${globals}`
}

test.describe('currency-exchange Storybook', () => {
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

  test('TokenItem MultiCurrency renders converted fiat values for each currency', async ({ page }) => {
    const frame = page.frameLocator('#storybook-preview-iframe')

    // USD (no conversion)
    await page.goto(storyUrl(baseUrl, 'USD'))
    await expect(frame.getByText('USDT')).toBeVisible()
    await expect(frame.getByText('≈ $1,234.56')).toBeVisible()

    // CNY (7.24) -> 1,234.56 * 7.24 = 8,938.2144
    await page.goto(storyUrl(baseUrl, 'CNY'))
    await expect(frame.getByText('≈ ¥8,938.2144')).toBeVisible()

    // EUR (0.95) -> 1,234.56 * 0.95 = 1,172.832
    await page.goto(storyUrl(baseUrl, 'EUR'))
    await expect(frame.getByText('≈ €1,172.832')).toBeVisible()

    // JPY (149.5) -> 1,234.56 * 149.5 = 184,566.72
    await page.goto(storyUrl(baseUrl, 'JPY'))
    await expect(frame.getByText('≈ ¥184,566.72')).toBeVisible()

    // KRW (1320) -> 1,234.56 * 1320 = 1,629,619.2
    await page.goto(storyUrl(baseUrl, 'KRW'))
    await expect(frame.getByText('≈ ₩1,629,619.2')).toBeVisible()
  })
})

