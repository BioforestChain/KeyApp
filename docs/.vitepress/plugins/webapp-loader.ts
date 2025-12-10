/**
 * VitePress 插件：在 dev/build 前准备 webapp 目录
 *
 * 流程：
 * 1. 尝试从 GitHub Release 下载 webapp/webapp-beta
 * 2. 下载失败则检查本地 dist-web 是否存在
 * 3. 都没有则运行本地构建
 */

import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync, readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { resolve, join } from 'node:path'
import type { Plugin } from 'vite'

const ROOT = resolve(__dirname, '../../..')
const DOCS_PUBLIC = resolve(__dirname, '../../public')  // docs/public
const DIST_WEB_DIR = join(ROOT, 'dist-web')

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
    prepareWebapp('beta', join(DOCS_PUBLIC, 'webapp-beta')),
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

      // 为 webapp 子目录添加 SPA fallback 中间件
      // 注意：这个中间件需要在 vite 的静态文件服务之前
      server.middlewares.use((req, res, next) => {
        const url = req.url || ''

        // 处理 /webapp/ 和 /webapp-beta/ 路径
        const match = url.match(/^\/(webapp|webapp-beta)(\/.*)?$/)
        if (match) {
          const webappDir = match[1]
          const subPath = match[2] || '/'

          // 检查是否请求的是静态文件
          const hasExtension = /\.[a-zA-Z0-9]+$/.test(subPath)

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
            const filePath = join(DOCS_PUBLIC, webappDir, subPath)
            if (existsSync(filePath)) {
              const ext = subPath.split('.').pop() || ''
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
