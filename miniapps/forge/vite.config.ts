import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'
import { resolve } from 'path'
import { existsSync, readFileSync, readdirSync } from 'fs'

const E2E_SCREENSHOTS_DIR = resolve(__dirname, '../../e2e/__screenshots__/Desktop-Chrome/miniapp-ui.mock.spec.ts')
const MANIFEST_PATH = resolve(__dirname, 'manifest.json')

function getShortId(): string {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'))
  return manifest.id.split('.').pop() || ''
}

function scanScreenshots(shortId: string): string[] {
  if (!existsSync(E2E_SCREENSHOTS_DIR)) return []
  return readdirSync(E2E_SCREENSHOTS_DIR)
    .filter(f => f.startsWith(`${shortId}-`) && f.endsWith('.png'))
    .slice(0, 2)
    .map(f => `screenshots/${f}`)
}

function miniappPlugin(): Plugin {
  const shortId = getShortId()
  return {
    name: 'miniapp-manifest',
    configureServer(server) {
      server.middlewares.use('/manifest.json', (_req, res) => {
        const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'))
        manifest.screenshots = scanScreenshots(shortId)
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end(JSON.stringify(manifest, null, 2))
      })
      server.middlewares.use('/screenshots', (req, res, next) => {
        const filename = req.url?.slice(1) || ''
        const filepath = resolve(E2E_SCREENSHOTS_DIR, filename)
        if (existsSync(filepath)) {
          res.setHeader('Content-Type', 'image/png')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(readFileSync(filepath))
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [
    mkcert(),
    react(),
    tsconfigPaths(),
    tailwindcss(),
    miniappPlugin(),
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    https: true,
    fs: {
      allow: [resolve(__dirname, '../..')],
    },
  },
})
