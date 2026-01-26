/**
 * VitePress 插件：在 dev/build 前准备 webapp 目录
 *
 * 流程：
 * 1. 尝试从 GitHub Release 下载 webapp/webapp-dev
 * 2. 下载失败则检查本地 dist-web 是否存在
 * 3. 都没有则运行本地构建
 */

import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { resolve, join } from 'node:path'
import type { Plugin } from 'vite'

const ROOT = resolve(__dirname, '../../..')
const DOCS_PUBLIC = resolve(__dirname, '../../public')  // docs/public
const DIST_WEB_DIR = join(ROOT, 'dist-web')
const DIST_DWEB_DIR = join(ROOT, 'dist-dweb')
const DISTS_DIR = join(ROOT, 'dists')

// 从 package.json 读取 GitHub 信息
function getGitHubInfo() {
  try {
    // 尝试从 git remote 获取
    const remote = execSync('git remote get-url origin', { cwd: ROOT, encoding: 'utf-8' }).trim()
    const match = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/)
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
    }
  } catch {}
  // 默认值
  return { owner: 'BioforestChain', repo: 'KeyApp' }
}

const { owner: GITHUB_OWNER, repo: GITHUB_REPO } = getGitHubInfo()

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

const log = {
  info: (msg: string) => console.log(`${colors.blue}[webapp-loader]${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}[webapp-loader]${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}[webapp-loader]${colors.reset} ${msg}`),
}

function copyDirContents(src: string, dest: string) {
  if (!existsSync(src)) return
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src)) {
    cpSync(join(src, entry), join(dest, entry), { recursive: true })
  }
}

function commandExists(command: string): boolean {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

async function downloadFromRelease(tag: string, assetName: string, outputDir: string): Promise<boolean> {
  log.info(`尝试下载: ${tag}/${assetName}`)

  const url =
    tag === 'latest'
      ? `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest/download/${assetName}`
      : `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/${tag}/${assetName}`

  try {
    const response = await fetch(url, { redirect: 'follow' })
    if (!response.ok) {
      log.warn(`下载失败: ${response.status}`)
      return false
    }

    const tmpDir = join(ROOT, 'tmp')
    const zipPath = join(tmpDir, assetName)
    mkdirSync(tmpDir, { recursive: true })

    const buffer = await response.arrayBuffer()
    writeFileSync(zipPath, Buffer.from(buffer))

    // 解压
    if (existsSync(outputDir)) {
      rmSync(outputDir, { recursive: true, force: true })
    }
    mkdirSync(outputDir, { recursive: true })
    execSync(`unzip -q "${zipPath}" -d "${outputDir}"`, { cwd: ROOT })
    rmSync(zipPath)

    log.success(`下载完成: ${assetName}`)
    return true
  } catch (error) {
    log.warn(`下载异常: ${error}`)
    return false
  }
}

function copyLocalBuild(outputDir: string): boolean {
  if (!existsSync(DIST_WEB_DIR)) {
    return false
  }
  log.info(`使用本地构建: dist-web/`)
  if (existsSync(outputDir)) {
    rmSync(outputDir, { recursive: true, force: true })
  }
  mkdirSync(outputDir, { recursive: true })
  cpSync(DIST_WEB_DIR, outputDir, { recursive: true })
  return true
}

async function buildLocal(): Promise<boolean> {
  log.info('运行本地构建: pnpm build:web')
  try {
    execSync('pnpm build:web', { cwd: ROOT, stdio: 'inherit' })
    return existsSync(DIST_WEB_DIR)
  } catch {
    return false
  }
}

async function buildLocalDweb(): Promise<boolean> {
  log.info('运行本地构建: pnpm build:dweb')
  try {
    execSync('pnpm build:dweb', {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, SERVICE_IMPL: 'dweb' },
    })

    const distDir = join(ROOT, 'dist')
    if (existsSync(distDir)) {
      if (existsSync(DIST_DWEB_DIR)) {
        rmSync(DIST_DWEB_DIR, { recursive: true, force: true })
      }
      cpSync(distDir, DIST_DWEB_DIR, { recursive: true })
      rmSync(distDir, { recursive: true, force: true })
    }

    return existsSync(DIST_DWEB_DIR)
  } catch {
    return false
  }
}

function createZip(sourceDir: string, outputPath: string): boolean {
  try {
    execSync(`zip -r "${outputPath}" .`, { cwd: sourceDir, stdio: 'ignore' })
    return existsSync(outputPath)
  } catch {
    return false
  }
}

function normalizeAssetPath(path: string): string {
  return path.startsWith('/') ? path.slice(1) : path
}

function resolveAbsoluteBaseUrl(): string | null {
  const origin = process.env.DWEB_SITE_ORIGIN ?? process.env.VITEPRESS_SITE_ORIGIN ?? process.env.SITE_ORIGIN
  if (!origin) return null
  const base = process.env.VITEPRESS_BASE ?? '/'
  return new URL(base, origin).toString()
}

function rewriteMetadataLogo(metadataPath: string, logoFileName: string, absoluteBaseUrl?: string, dwebPath?: string): void {
  if (!existsSync(metadataPath)) return
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8')) as {
    logo?: string
    icons?: Array<{ src: string; [key: string]: unknown }>
  }

  const normalizedPath = dwebPath ? normalizeAssetPath(dwebPath) : ''
  const absoluteLogoUrl = absoluteBaseUrl
    ? new URL(normalizedPath ? `${normalizedPath}/${logoFileName}` : logoFileName, absoluteBaseUrl).toString()
    : null

  if (metadata.logo) {
    const lower = metadata.logo.toLowerCase()
    if (lower.endsWith(`/${logoFileName}`) || lower.endsWith(logoFileName)) {
      metadata.logo = absoluteLogoUrl ?? logoFileName
    }
  } else {
    metadata.logo = absoluteLogoUrl ?? logoFileName
  }

  if (Array.isArray(metadata.icons)) {
    metadata.icons = metadata.icons.map((icon) => {
      if (!icon?.src) return icon
      const src = String(icon.src)
      const lower = src.toLowerCase()
      if (lower.endsWith(`/${logoFileName}`) || lower.endsWith(logoFileName)) {
        return { ...icon, src: absoluteLogoUrl ?? logoFileName }
      }
      return icon
    })
  }

  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
}

function writeFallbackMetadata(outputDir: string, zipName: string): void {
  const manifestPath = join(ROOT, 'manifest.json')
  if (!existsSync(manifestPath)) return

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as {
    id?: string
    name?: string
    short_name?: string
    description?: string
    logo?: string
    change_log?: string
    images?: unknown[]
    author?: string[]
    version?: string
    categories?: string[]
    languages?: string[]
    homepage_url?: string
    icons?: Array<{ src: string; [key: string]: unknown }>
    home?: string
  }

  const zipPath = join(outputDir, zipName)
  let hash = ''
  let size = 0
  if (existsSync(zipPath)) {
    const zipBuffer = readFileSync(zipPath)
    hash = createHash('sha256').update(zipBuffer).digest('hex')
    size = statSync(zipPath).size
  }

  const metadata = {
    id: manifest.id ?? 'bfmpay.bfmeta.com.dweb',
    minTarget: 3,
    maxTarget: 3,
    name: manifest.name ?? 'BFM Pay',
    short_name: manifest.short_name ?? manifest.name ?? 'BFM Pay',
    description: manifest.description ?? '',
    logo: 'logo-256.webp',
    bundle_url: `./${zipName}`,
    bundle_hash: hash ? `sha256:${hash}` : '',
    bundle_size: size,
    bundle_signature: '',
    public_key_url: '',
    release_date: new Date().toString(),
    change_log: manifest.change_log ?? '',
    images: manifest.images ?? [],
    author: manifest.author ?? [],
    version: manifest.version ?? '0.0.0',
    categories: manifest.categories ?? ['application'],
    languages: manifest.languages ?? [],
    homepage_url: manifest.homepage_url ?? '',
    plugins: [],
    permissions: [],
    dir: 'ltr',
    lang: '',
    icons: (manifest.icons ?? []).map((icon) => ({
      ...icon,
      src: 'logo-256.webp',
    })),
    screenshots: [],
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#667eea',
    background_color: '#ffffff',
    shortcuts: [],
    home: manifest.home ?? '',
  }

  writeFileSync(join(outputDir, 'metadata.json'), JSON.stringify(metadata, null, 2))
}

function ensureDwebBundle(): boolean {
  const metadataPath = join(DISTS_DIR, 'metadata.json')
  if (existsSync(metadataPath)) return true

  if (!existsSync(DIST_DWEB_DIR)) {
    return false
  }

  if (!commandExists('plaoc')) {
    log.warn('plaoc CLI 未安装，无法生成 DWEB metadata.json')
    return false
  }

  try {
    if (existsSync(DISTS_DIR)) {
      rmSync(DISTS_DIR, { recursive: true, force: true })
    }
    execSync(`plaoc bundle "${DIST_DWEB_DIR}" -c ./ -o "${DISTS_DIR}"`, { cwd: ROOT, stdio: 'inherit' })
    return existsSync(metadataPath)
  } catch {
    return false
  }
}

async function prepareDwebAssets(channel: 'stable' | 'beta', outputDir: string, dwebPath: string): Promise<void> {
  const zipName = channel === 'stable' ? 'bfmpay-dweb.zip' : 'bfmpay-dweb-beta.zip'
  const logoFileName = 'logo-256.webp'
  const absoluteBaseUrl = resolveAbsoluteBaseUrl()

  if (existsSync(outputDir) && existsSync(join(outputDir, 'metadata.json'))) {
    log.info(`${channel} dweb 已存在，跳过`)
    return
  }

  if (!existsSync(DIST_DWEB_DIR)) {
    await buildLocalDweb()
  }

  if (ensureDwebBundle()) {
    rmSync(outputDir, { recursive: true, force: true })
    mkdirSync(outputDir, { recursive: true })
    copyDirContents(DISTS_DIR, outputDir)

    const logosDir = join(ROOT, 'public', 'logos')
    copyDirContents(logosDir, join(outputDir, 'logos'))
    const rootLogoPath = join(outputDir, logoFileName)
    if (existsSync(join(logosDir, logoFileName))) {
      cpSync(join(logosDir, logoFileName), rootLogoPath)
    }

    const metadataPath = join(outputDir, 'metadata.json')
    if (existsSync(metadataPath)) {
      rewriteMetadataLogo(metadataPath, logoFileName, absoluteBaseUrl ?? undefined, dwebPath)
      const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8')) as { bundle_url?: string }
      if (metadata.bundle_url) {
        const bundleFile = metadata.bundle_url.replace(/^\.\//, '')
        const bundlePath = join(outputDir, bundleFile)
        if (existsSync(bundlePath)) {
          cpSync(bundlePath, join(outputDir, zipName))
        } else {
          log.warn(`DWEB bundle 未找到: ${bundlePath}`)
        }
      } else {
        log.warn('metadata.json 缺少 bundle_url')
      }
    }
    return
  }

  log.warn(`${channel} dweb 产物未准备好 (缺少 metadata.json)，使用 fallback metadata`)
  rmSync(outputDir, { recursive: true, force: true })
  mkdirSync(outputDir, { recursive: true })

  const logosDir = join(ROOT, 'public', 'logos')
  copyDirContents(logosDir, join(outputDir, 'logos'))
  if (existsSync(join(logosDir, logoFileName))) {
    cpSync(join(logosDir, logoFileName), join(outputDir, logoFileName))
  }

  const zipPath = join(outputDir, zipName)
  if (existsSync(DIST_DWEB_DIR)) {
    const zipped = createZip(DIST_DWEB_DIR, zipPath)
    if (!zipped) {
      log.warn(`无法创建 DWEB ZIP: ${zipPath}`)
    }
  } else {
    log.warn('dist-dweb 不存在，fallback metadata 将不包含有效 bundle')
  }

  writeFallbackMetadata(outputDir, zipName)
  rewriteMetadataLogo(join(outputDir, 'metadata.json'), logoFileName, absoluteBaseUrl ?? undefined, dwebPath)
}

async function prepareWebapp(channel: 'stable' | 'beta', outputDir: string): Promise<void> {
  const tag = channel === 'stable' ? 'latest' : 'beta'
  const assetName = channel === 'stable' ? 'bfmpay-web.zip' : 'bfmpay-web-beta.zip'

  // 如果目录已存在且有内容，跳过
  if (existsSync(outputDir) && existsSync(join(outputDir, 'index.html'))) {
    log.info(`${channel} 已存在，跳过`)
    return
  }

  // 1. 尝试从 Release 下载
  if (await downloadFromRelease(tag, assetName, outputDir)) {
    return
  }

  // 2. 尝试使用本地 dist-web
  if (copyLocalBuild(outputDir)) {
    return
  }

  // 3. 运行本地构建
  if (await buildLocal()) {
    copyLocalBuild(outputDir)
    return
  }

  log.warn(`无法准备 ${channel} 版本，将创建占位页面`)
  // 创建占位页面
  mkdirSync(outputDir, { recursive: true })
  writeFileSync(
    join(outputDir, 'index.html'),
    `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>BFM Pay - ${channel}</title></head>
<body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:system-ui">
  <div style="text-align:center">
    <h1>BFM Pay ${channel}</h1>
    <p>版本正在构建中...</p>
    <p><a href="../">返回首页</a></p>
  </div>
</body>
</html>`
  )
}

async function prepareAllWebapps() {
  log.info('准备 webapp 目录...')

  mkdirSync(DOCS_PUBLIC, { recursive: true })

  // 并行准备两个版本
  await Promise.all([
    prepareWebapp('stable', join(DOCS_PUBLIC, 'webapp')),
    prepareWebapp('beta', join(DOCS_PUBLIC, 'webapp-dev')),
  ])

  await Promise.all([
    prepareDwebAssets('stable', join(DOCS_PUBLIC, 'dweb'), 'dweb'),
    prepareDwebAssets('beta', join(DOCS_PUBLIC, 'dweb-dev'), 'dweb-dev'),
  ])

  log.success('webapp 目录准备完成')
}

export function webappLoaderPlugin(): Plugin {
  let prepared = false

  return {
    name: 'webapp-loader',
    enforce: 'pre',

    // dev 模式：在服务器配置时准备
    async configureServer(server) {
      if (!prepared) {
        await prepareAllWebapps()
        prepared = true
      }

      server.httpServer?.once('listening', () => {
        const origin =
          server.resolvedUrls?.local?.[0] ?? `http://localhost:${server.config.server.port ?? 5173}/`
        const baseUrl = new URL(server.config.base ?? '/', origin).toString()
        rewriteMetadataLogo(join(DOCS_PUBLIC, 'dweb', 'metadata.json'), 'logo-256.webp', baseUrl, 'dweb')
        rewriteMetadataLogo(join(DOCS_PUBLIC, 'dweb-dev', 'metadata.json'), 'logo-256.webp', baseUrl, 'dweb-dev')
      })

      // 为 webapp/dweb 子目录添加静态/SPA 处理
      // 注意：这个中间件需要在 vite 的静态文件服务之前
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''
        const base = server.config.base ?? '/'
        const basePrefix = base === '/' ? '' : base.replace(/\/$/, '')
        const requestPath = basePrefix && url.startsWith(basePrefix) ? url.slice(basePrefix.length) || '/' : url

        // 处理 /webapp/ /webapp-dev/ /dweb/ /dweb-dev/ 路径
        const match = requestPath.match(/^\/(webapp|webapp-dev|dweb|dweb-dev)(\/.*)?$/)
        if (match) {
          const webappDir = match[1]
          const subPath = match[2] || '/'
          const normalizedSubPath = subPath.replace(/^\/+/, '')

          // 检查是否请求的是静态文件
          const hasExtension = /\.[a-zA-Z0-9]+$/.test(normalizedSubPath)

          if (!hasExtension) {
            // 目录或 SPA 路由请求，返回 index.html
            const indexPath = join(DOCS_PUBLIC, webappDir, 'index.html')
            if (existsSync(indexPath)) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8')
              res.end(readFileSync(indexPath, 'utf-8'))
              return
            }
          } else {
            // 静态文件请求，尝试从 public 目录读取
            const filePath = join(DOCS_PUBLIC, webappDir, normalizedSubPath)
            if (existsSync(filePath)) {
              const ext = normalizedSubPath.split('.').pop() || ''
              const mimeTypes: Record<string, string> = {
                js: 'application/javascript',
                css: 'text/css',
                html: 'text/html',
                json: 'application/json',
                png: 'image/png',
                jpg: 'image/jpeg',
                svg: 'image/svg+xml',
                woff: 'font/woff',
                woff2: 'font/woff2',
              }
              res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
              res.end(readFileSync(filePath))
              return
            }
          }
        }
        next()
      })
    },

    // build 模式：在构建开始时准备
    async buildStart() {
      if (!prepared) {
        await prepareAllWebapps()
        prepared = true
      }
    },
  }
}
