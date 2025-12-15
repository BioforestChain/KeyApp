#!/usr/bin/env bun
/**
 * BFM Pay 构建脚本
 *
 * 支持 web 和 dweb 两种平台的编译输出
 * 默认构建 beta 渠道，使用 --stable 构建稳定版
 *
 * Usage:
 *   bun scripts/build.ts web          # 构建 web 版本 (beta)
 *   bun scripts/build.ts dweb         # 构建 dweb 版本 (beta)
 *   bun scripts/build.ts all          # 构建所有版本 (beta)
 *   bun scripts/build.ts all --stable # 构建所有版本 (stable)
 *   bun scripts/build.ts --help       # 显示帮助
 *
 * Options:
 *   --skip-typecheck    跳过类型检查
 *   --skip-test         跳过测试
 *   --version <ver>     指定版本号
 *   --stable            构建 stable 渠道 (默认为 beta)
 *   --upload            上传 dweb 版本到服务器
 *
 * 渠道说明:
 *   beta:   部署到 /webapp-beta/，每次 push main 自动触发
 *   stable: 部署到 /webapp/，通过 pnpm gen:stable 手动触发
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, cpSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createWriteStream } from 'node:fs'

// ==================== 配置 ====================

const ROOT = resolve(import.meta.dirname, '..')
const DIST_DIR = join(ROOT, 'dist')
const DIST_WEB_DIR = join(ROOT, 'dist-web')
const DIST_DWEB_DIR = join(ROOT, 'dist-dweb')
const DISTS_DIR = join(ROOT, 'dists') // plaoc 打包输出目录

// GitHub 仓库信息
const GITHUB_OWNER = 'BioforestChain'
const GITHUB_REPO = 'KeyApp'
const GITHUB_PAGES_BASE = `/${GITHUB_REPO}/`

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`\n${colors.cyan}▸${colors.reset} ${colors.cyan}${msg}${colors.reset}`),
}

// ==================== 工具函数 ====================

function exec(cmd: string, options?: { cwd?: string; env?: Record<string, string> }) {
  log.info(`执行: ${cmd}`)
  try {
    execSync(cmd, {
      cwd: options?.cwd ?? ROOT,
      stdio: 'inherit',
      env: { ...process.env, ...options?.env },
    })
  } catch (error) {
    log.error(`命令执行失败: ${cmd}`)
    process.exit(1)
  }
}

function getVersion(): string {
  // 从命令行参数获取版本
  const versionIndex = process.argv.indexOf('--version')
  if (versionIndex !== -1 && process.argv[versionIndex + 1]) {
    return process.argv[versionIndex + 1]
  }

  // 从 package.json 获取版本
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'))
  return pkg.version || '0.0.0'
}

function getBuildVersion(): string {
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${now.getFullYear() % 100}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}-${pad(now.getHours())}.${pad(now.getMinutes())}`
}

function cleanDir(dir: string) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true })
  }
  mkdirSync(dir, { recursive: true })
}

async function createZip(sourceDir: string, outputPath: string): Promise<void> {
  log.info(`创建 ZIP: ${outputPath}`)

  // 使用系统 zip 命令（更可靠）
  const cwd = sourceDir
  const zipName = outputPath.split('/').pop()!
  exec(`zip -r "${outputPath}" .`, { cwd })
}

function copyDir(src: string, dest: string) {
  if (!existsSync(src)) return
  mkdirSync(dest, { recursive: true })
  cpSync(src, dest, { recursive: true })
}

// ==================== 构建函数 ====================

async function runTypecheck() {
  if (process.argv.includes('--skip-typecheck')) {
    log.warn('跳过类型检查')
    return
  }
  log.step('运行类型检查')
  exec('pnpm typecheck')
}

async function runTests() {
  if (process.argv.includes('--skip-test')) {
    log.warn('跳过测试')
    return
  }
  log.step('运行单元测试')
  exec('pnpm test')
}

async function buildWeb() {
  log.step('构建 Web 版本')

  cleanDir(DIST_WEB_DIR)

  // 使用 SERVICE_IMPL=web 构建
  exec('pnpm build:web', {
    env: {
      SERVICE_IMPL: 'web',
    },
  })

  // 移动到 dist-web
  if (existsSync(DIST_DIR)) {
    copyDir(DIST_DIR, DIST_WEB_DIR)
    rmSync(DIST_DIR, { recursive: true, force: true })
  }

  log.success('Web 版本构建完成')
  return DIST_WEB_DIR
}

async function buildDweb() {
  log.step('构建 DWEB 版本')

  cleanDir(DIST_DWEB_DIR)
  cleanDir(DISTS_DIR)

  // 使用 SERVICE_IMPL=dweb 构建
  exec('pnpm build:dweb', {
    env: {
      SERVICE_IMPL: 'dweb',
    },
  })

  // 移动到 dist-dweb
  if (existsSync(DIST_DIR)) {
    copyDir(DIST_DIR, DIST_DWEB_DIR)
    rmSync(DIST_DIR, { recursive: true, force: true })
  }

  // 运行 plaoc bundle 打包
  log.step('运行 Plaoc 打包')
  try {
    exec(`plaoc bundle "${DIST_DWEB_DIR}" -c ./ -o "${DISTS_DIR}"`)
    log.success('Plaoc 打包完成')
  } catch (error) {
    log.warn('Plaoc 打包失败，可能未安装 plaoc CLI')
    log.info('请安装: npm install -g @aspect/plaoc-cli')
  }

  log.success('DWEB 版本构建完成')
  return DIST_DWEB_DIR
}

// 获取渠道类型 (beta 或 stable)
function getChannel(): 'beta' | 'stable' {
  if (process.argv.includes('--stable')) {
    return 'stable'
  }
  return 'beta'
}

async function prepareGhPages(webDir: string) {
  log.step('准备 GitHub Pages 部署')

  const channel = getChannel()
  const webappDirName = channel === 'stable' ? 'webapp' : 'webapp-beta'

  // 将当前构建复制到 docs/public 目录，供 VitePress 使用
  const docsPublicWebapp = join(ROOT, 'docs', 'public', webappDirName)
  if (existsSync(docsPublicWebapp)) {
    rmSync(docsPublicWebapp, { recursive: true, force: true })
  }
  copyDir(webDir, docsPublicWebapp)
  log.info(`当前构建复制到: docs/.vitepress/public/${webappDirName}/`)

  // 构建 VitePress（会自动准备 webapp 目录）
  log.step('构建 VitePress 文档站点')
  exec('pnpm docs:build')

  // 复制 VitePress 输出到 gh-pages
  const ghPagesDir = join(ROOT, 'gh-pages')
  const docsDistDir = join(ROOT, 'docs', '.vitepress', 'dist')

  cleanDir(ghPagesDir)
  if (existsSync(docsDistDir)) {
    copyDir(docsDistDir, ghPagesDir)
  }

  // 创建 .nojekyll 文件（禁用 Jekyll 处理）
  writeFileSync(join(ghPagesDir, '.nojekyll'), '')

  log.success('GitHub Pages 目录准备完成')
  return ghPagesDir
}

async function createReleaseArtifacts(webDir: string, dwebDir: string) {
  log.step('创建 Release 产物')

  const releaseDir = join(ROOT, 'release')
  cleanDir(releaseDir)

  const version = getVersion()
  const channel = getChannel()
  const suffix = channel === 'stable' ? '' : '-beta'

  // 创建 web 版本 zip
  // stable: bfmpay-web.zip (用于 latest release)
  // beta: bfmpay-web-beta.zip (用于 beta release)
  const webZipName = channel === 'stable' ? `bfmpay-web.zip` : `bfmpay-web-beta.zip`
  const webZipPath = join(releaseDir, webZipName)
  await createZip(webDir, webZipPath)

  // 同时创建带版本号的 zip（用于存档）
  const webVersionZipPath = join(releaseDir, `bfmpay-web-${version}${suffix}.zip`)
  cpSync(webZipPath, webVersionZipPath)

  // 创建 dweb 版本 zip
  const dwebZipName = channel === 'stable' ? `bfmpay-dweb.zip` : `bfmpay-dweb-beta.zip`
  const dwebZipPath = join(releaseDir, dwebZipName)

  if (existsSync(DISTS_DIR) && readdirSync(DISTS_DIR).length > 0) {
    await createZip(DISTS_DIR, dwebZipPath)
  } else {
    // 如果 plaoc 打包失败，使用原始 dist-dweb
    await createZip(dwebDir, dwebZipPath)
  }

  // 同时创建带版本号的 zip（用于存档）
  const dwebVersionZipPath = join(releaseDir, `bfmpay-dweb-${version}${suffix}.zip`)
  cpSync(dwebZipPath, dwebVersionZipPath)

  log.success(`Release 产物创建完成: ${releaseDir}`)
  log.info(`  - ${webZipName}`)
  log.info(`  - ${dwebZipName}`)
  return releaseDir
}

async function uploadDweb() {
  if (!process.argv.includes('--upload')) {
    log.info('跳过 DWEB 上传（使用 --upload 启用）')
    return
  }

  log.step('上传 DWEB 版本')

  // 检查环境变量
  const sftpUrl = process.env.DWEB_SFTP_URL
  const sftpUser = process.env.DWEB_SFTP_USER
  const sftpPass = process.env.DWEB_SFTP_PASS

  if (!sftpUrl || !sftpUser || !sftpPass) {
    log.warn('未配置 SFTP 环境变量，跳过上传')
    log.info('请设置: DWEB_SFTP_URL, DWEB_SFTP_USER, DWEB_SFTP_PASS')
    return
  }

  // TODO: 实现 SFTP 上传
  log.warn('SFTP 上传功能待实现')
}

// ==================== 主程序 ====================

async function main() {
  const args = process.argv.slice(2).filter((arg) => !arg.startsWith('--'))
  const target = args[0] || 'all'

  console.log(`
${colors.magenta}╔════════════════════════════════════════╗
║         BFM Pay Build Script          ║
╚════════════════════════════════════════╝${colors.reset}
`)

  log.info(`目标: ${target}`)
  log.info(`版本: ${getVersion()}`)
  log.info(`构建版本: ${getBuildVersion()}`)

  if (target === '--help' || target === '-h') {
    console.log(`
Usage: bun scripts/build.ts [target] [options]

Targets:
  web       构建 Web 版本
  dweb      构建 DWEB 版本
  all       构建所有版本 (默认)

Options:
  --skip-typecheck    跳过类型检查
  --skip-test         跳过测试
  --version <ver>     指定版本号
  --stable            构建 stable 渠道 (默认为 beta)
  --upload            上传 DWEB 版本到服务器
  --help, -h          显示帮助
`)
    process.exit(0)
  }

  // 运行前置检查
  await runTypecheck()
  await runTests()

  let webDir: string | undefined
  let dwebDir: string | undefined

  // 根据目标构建
  if (target === 'web' || target === 'all') {
    webDir = await buildWeb()
  }

  if (target === 'dweb' || target === 'all') {
    dwebDir = await buildDweb()
    await uploadDweb()
  }

  // 如果构建了所有版本，准备 gh-pages
  if (target === 'all' && webDir && dwebDir) {
    await prepareGhPages(webDir)
    await createReleaseArtifacts(webDir, dwebDir)
  }

  console.log(`
${colors.green}╔════════════════════════════════════════╗
║           构建完成！                   ║
╚════════════════════════════════════════╝${colors.reset}
`)

  if (webDir) log.success(`Web 版本: ${webDir}`)
  if (dwebDir) log.success(`DWEB 版本: ${dwebDir}`)
  if (existsSync(join(ROOT, 'gh-pages'))) log.success(`GitHub Pages: ${join(ROOT, 'gh-pages')}`)
  if (existsSync(join(ROOT, 'release'))) log.success(`Release 产物: ${join(ROOT, 'release')}`)
}

main().catch((error) => {
  log.error(`构建失败: ${error.message}`)
  process.exit(1)
})
