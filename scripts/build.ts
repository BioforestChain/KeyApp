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
 *   beta:   部署到 /webapp-dev/，每次 push main 自动触发
 *   stable: 部署到 /webapp/，通过 pnpm gen:stable 手动触发
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync, cpSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { uploadToSftp, getNextDevVersion } from './utils/sftp'

// Dev 版本信息（在 buildDweb 时设置）
let devVersionInfo: { version: string; dateDir: string } | null = null

// ==================== 配置 ====================

const ROOT = resolve(import.meta.dirname, '..')
const DIST_DIR = join(ROOT, 'dist')
const DIST_WEB_DIR = join(ROOT, 'dist-web')
const DIST_DWEB_DIR = join(ROOT, 'dist-dweb')
const DISTS_DIR = join(ROOT, 'dists') // plaoc 打包输出目录

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
  exec(`zip -r "${outputPath}" .`, { cwd })
}

function copyDir(src: string, dest: string) {
  if (!existsSync(src)) return
  mkdirSync(dest, { recursive: true })
  cpSync(src, dest, { recursive: true })
}

function copyDirContents(src: string, dest: string) {
  if (!existsSync(src)) return
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src)) {
    cpSync(join(src, entry), join(dest, entry), { recursive: true })
  }
}

function resolveSiteOrigin(): string | null {
  return process.env.DWEB_SITE_ORIGIN ?? process.env.VITEPRESS_SITE_ORIGIN ?? process.env.SITE_ORIGIN ?? null
}

function resolveSiteBaseUrl(): string | null {
  const origin = resolveSiteOrigin()
  if (!origin) return null
  const basePath = process.env.VITEPRESS_BASE ?? '/'
  return new URL(basePath, origin).toString()
}

function resolveReleaseBaseUrl(): string | null {
  const explicit = process.env.DWEB_RELEASE_BASE_URL ?? process.env.DWEB_ASSET_BASE_URL
  if (explicit) {
    return explicit.endsWith('/') ? explicit : `${explicit}/`
  }
  const repo = process.env.GITHUB_REPOSITORY
  const tag = process.env.RELEASE_TAG
  if (repo && tag) {
    return `https://github.com/${repo}/releases/download/${tag}/`
  }
  return null
}

function rewriteMetadataLogo(metadataPath: string, logoFileName: string, absoluteBaseUrl?: string, dwebPath?: string) {
  if (!existsSync(metadataPath)) return
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8')) as {
    logo?: string
    icons?: Array<{ src: string; [key: string]: unknown }>
  }

  const normalizedPath = dwebPath ? dwebPath.replace(/^\/+/, '') : ''
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

function publishDwebAssets(targetDir: string, zipAlias: string, dwebPath: string) {
  const logosDir = join(ROOT, 'public', 'logos')
  const hasDwebAssets = existsSync(DISTS_DIR) && readdirSync(DISTS_DIR).length > 0
  if (!hasDwebAssets) {
    log.warn('DWEB 产物不存在，跳过 DWEB 资源发布')
    return
  }

  cleanDir(targetDir)
  copyDirContents(DISTS_DIR, targetDir)
  copyDir(logosDir, join(targetDir, 'logos'))
  const logoFileName = 'logo-256.webp'
  const rootLogoPath = join(targetDir, logoFileName)
  if (existsSync(join(logosDir, logoFileName))) {
    cpSync(join(logosDir, logoFileName), rootLogoPath)
  }

  const metadataPath = join(targetDir, 'metadata.json')
  if (existsSync(metadataPath)) {
    const siteBaseUrl = resolveSiteBaseUrl()
    rewriteMetadataLogo(metadataPath, logoFileName, siteBaseUrl ?? undefined, dwebPath)
    const metadata = JSON.parse(readFileSync(metadataPath, 'utf-8')) as { bundle_url?: string }
    if (metadata.bundle_url) {
      const bundleFile = metadata.bundle_url.replace(/^\.\//, '')
      const bundlePath = join(targetDir, bundleFile)
      if (existsSync(bundlePath)) {
        cpSync(bundlePath, join(targetDir, zipAlias))
      } else {
        log.warn(`DWEB bundle 未找到: ${bundlePath}`)
      }
    } else {
      log.warn('metadata.json 缺少 bundle_url')
    }
  } else {
    log.warn('metadata.json 未找到，DWEB install 可能无法使用')
  }
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
      VITE_DEV_MODE: getChannel() === 'beta' ? 'true' : 'false',
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
  const channel = getChannel()
  const isDev = channel === 'beta'

  log.step(`构建 DWEB 版本 (${channel})`)

  cleanDir(DIST_DWEB_DIR)
  cleanDir(DISTS_DIR)

  // 如果是 dev 版本，先获取版本号
  if (isDev && process.argv.includes('--upload')) {
    const sftpUrl = process.env.DWEB_SFTP_URL || 'sftp://iweb.xin:22022'
    const sftpUser = process.env.DWEB_SFTP_USER_DEV || process.env.DWEB_SFTP_USER
    const sftpPass = process.env.DWEB_SFTP_PASS_DEV || process.env.DWEB_SFTP_PASS

    if (sftpUser && sftpPass) {
      try {
        const baseVersion = getVersion()
        const info = await getNextDevVersion({ url: sftpUrl, username: sftpUser, password: sftpPass }, baseVersion)
        devVersionInfo = { version: info.version, dateDir: info.dateDir }
        log.info(`Dev 版本号: ${devVersionInfo.version}`)
      } catch (error) {
        log.warn(`获取 dev 版本号失败: ${error}，使用默认版本号`)
      }
    }
  }

  // 如果是 dev 版本，修改 manifest.json
  const manifestPath = join(ROOT, 'manifest.json')
  const manifestBackupPath = join(ROOT, 'manifest.json.bak')
  let manifestModified = false

  if (isDev && existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    // 备份原始 manifest
    writeFileSync(manifestBackupPath, JSON.stringify(manifest, null, 2))

    // 修改 id 添加 dev 前缀
    const originalId = manifest.id
    manifest.id = `dev.${originalId}`

    // 修改版本号
    if (devVersionInfo) {
      manifest.version = devVersionInfo.version
    }

    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    manifestModified = true
    log.info(`manifest.json 已修改: id=${manifest.id}, version=${manifest.version}`)
  }

  try {
    // 使用 SERVICE_IMPL=dweb 构建，dev 模式添加水印标识
    exec('pnpm build:dweb', {
      env: {
        SERVICE_IMPL: 'dweb',
        VITE_DEV_MODE: isDev ? 'true' : 'false',
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
  } finally {
    // 恢复原始 manifest.json
    if (manifestModified && existsSync(manifestBackupPath)) {
      cpSync(manifestBackupPath, manifestPath)
      rmSync(manifestBackupPath)
      log.info('manifest.json 已恢复')
    }
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
  const webappDirName = channel === 'stable' ? 'webapp' : 'webapp-dev'

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

  const dwebTargetDir = join(ghPagesDir, channel === 'stable' ? 'dweb' : 'dweb-dev')
  const dwebZipAlias = channel === 'stable' ? 'bfmpay-dweb.zip' : 'bfmpay-dweb-beta.zip'
  const dwebPath = channel === 'stable' ? 'dweb' : 'dweb-dev'
  publishDwebAssets(dwebTargetDir, dwebZipAlias, dwebPath)

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

  // 复制 dweb metadata/bundle 到 release 目录（plaoc bundle 自动生成）
  if (existsSync(DISTS_DIR) && readdirSync(DISTS_DIR).length > 0) {
    copyDirContents(DISTS_DIR, releaseDir)
    log.info(`  - metadata.json`)
  } else {
    log.warn('DWEB 产物不存在，dweb://install 链接可能无法正常工作')
  }

  // 复制 DWEB logo 资源（供 metadata.json 相对路径使用）
  const logosDir = join(ROOT, 'public', 'logos')
  copyDir(logosDir, join(releaseDir, 'logos'))
  if (existsSync(join(logosDir, 'logo-256.webp'))) {
    cpSync(join(logosDir, 'logo-256.webp'), join(releaseDir, 'logo-256.webp'))
  }

  const releaseMetadataPath = join(releaseDir, 'metadata.json')
  if (existsSync(releaseMetadataPath)) {
    const releaseBaseUrl = resolveReleaseBaseUrl()
    rewriteMetadataLogo(releaseMetadataPath, 'logo-256.webp', releaseBaseUrl ?? undefined)
  }

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

  const channel = getChannel()
  log.step(`上传 DWEB 版本 (${channel})`)

  // 检查环境变量（URL 有默认值）
  const sftpUrl = process.env.DWEB_SFTP_URL || 'sftp://iweb.xin:22022'

  // 根据渠道选择账号：
  // - stable: DWEB_SFTP_USER / DWEB_SFTP_PASS (正式版账号)
  // - beta: DWEB_SFTP_USER_DEV / DWEB_SFTP_PASS_DEV (开发版账号)
  const sftpUser = channel === 'stable' ? process.env.DWEB_SFTP_USER : (process.env.DWEB_SFTP_USER_DEV || process.env.DWEB_SFTP_USER)
  const sftpPass = channel === 'stable' ? process.env.DWEB_SFTP_PASS : (process.env.DWEB_SFTP_PASS_DEV || process.env.DWEB_SFTP_PASS)

  if (!sftpUser || !sftpPass) {
    log.warn('未配置 SFTP 环境变量，跳过上传')
    log.info(channel === 'stable' ? '请设置: DWEB_SFTP_USER, DWEB_SFTP_PASS' : '请设置: DWEB_SFTP_USER_DEV, DWEB_SFTP_PASS_DEV')
    return
  }

  log.info(`SFTP 用户: ${sftpUser}`)

  // 确定上传目录：优先使用 plaoc 打包输出 (dists/)，否则使用 dist-dweb
  const uploadDir = existsSync(DISTS_DIR) && readdirSync(DISTS_DIR).length > 0 ? DISTS_DIR : DIST_DWEB_DIR

  if (!existsSync(uploadDir)) {
    log.error(`上传目录不存在: ${uploadDir}`)
    log.info('请先运行 dweb 构建')
    return
  }

  try {
    // beta 渠道按日期分组上传
    const remoteSubDir = channel === 'beta' && devVersionInfo ? devVersionInfo.dateDir : undefined

    await uploadToSftp({
      url: sftpUrl,
      username: sftpUser,
      password: sftpPass,
      sourceDir: uploadDir,
      projectName: channel === 'beta' ? 'bfmpay-dweb-dev' : 'bfmpay-dweb',
      remoteSubDir,
    })
    log.success('DWEB 上传完成')
  } catch (error) {
    log.error(`DWEB 上传失败: ${error}`)
    throw error
  }
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
