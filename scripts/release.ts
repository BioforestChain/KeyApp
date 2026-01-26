#!/usr/bin/env bun
/**
 * BFM Pay 正式版发布脚本
 *
 * 交互式脚本，完整发布流程：
 * 1. 检查工作区状态
 * 2. 选择版本号（小版本/中版本/大版本/当前/自定义）
 * 3. 运行类型检查和测试
 * 4. 构建 Web 和 DWEB 版本
 * 5. 上传 DWEB 到正式服务器
 * 6. 更新 package.json 和 manifest.json
 * 7. 更新 CHANGELOG.md
 * 8. 提交变更
 * 9. 推送并手动触发 CI 发布（CI 创建 tag/release）
 *
 * Usage:
 *   pnpm release
 */

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, cpSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { confirm, select, input } from '@inquirer/prompts'
import semver from 'semver'

// ==================== 配置 ====================

const ROOT = resolve(import.meta.dirname, '..')
const PACKAGE_JSON_PATH = join(ROOT, 'package.json')
const MANIFEST_JSON_PATH = join(ROOT, 'manifest.json')
const CHANGELOG_PATH = join(ROOT, 'CHANGELOG.md')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`\n${colors.cyan}▸${colors.reset} ${colors.cyan}${msg}${colors.reset}`),
}

// ==================== 工具函数 ====================

function exec(cmd: string, options?: { silent?: boolean; env?: Record<string, string> }): string {
  try {
    const result = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: options?.silent ? 'pipe' : 'inherit',
      env: { ...process.env, ...options?.env },
    })
    return typeof result === 'string' ? result.trim() : ''
  } catch (error) {
    if (options?.silent) {
      return ''
    }
    throw error
  }
}

function execOutput(cmd: string): string {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf-8' }).trim()
}

function commandExists(command: string): boolean {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJson(path: string, data: unknown) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
}

// ==================== 检查函数 ====================

async function checkWorkspace(): Promise<boolean> {
  log.step('检查工作区状态')

  // 检查是否在 worktree 中
  const cwd = process.cwd()
  if (cwd.includes('.git-worktree')) {
    if (process.env.ALLOW_WORKTREE_RELEASE === 'true') {
      log.warn('检测到 worktree 环境，继续执行（ALLOW_WORKTREE_RELEASE=true）')
    } else {
      log.error('请在主目录中运行此脚本，不要在 worktree 中运行')
      return false
    }
  }

  // 检查未提交的变更
  const status = execOutput('git status --porcelain')
  if (status) {
    log.warn('检测到未提交的变更:')
    console.log(status)

    const shouldContinue = await confirm({
      message: '是否继续？（未提交的变更将被包含在发布中）',
      default: false,
    })

    if (!shouldContinue) {
      return false
    }
  } else {
    log.success('工作区干净')
  }

  // 检查当前分支
  const branch = execOutput('git branch --show-current')
  if (branch !== 'main') {
    log.warn(`当前分支: ${branch}（建议在 main 分支发布）`)
    const shouldContinue = await confirm({
      message: '是否继续？',
      default: false,
    })
    if (!shouldContinue) {
      return false
    }
  } else {
    log.success(`当前分支: ${branch}`)
  }

  return true
}

// ==================== 版本选择 ====================

interface PackageJson {
  version: string
  lastChangelogCommit?: string
  [key: string]: unknown
}

interface ManifestJson {
  version: string
  change_log: string
  [key: string]: unknown
}

async function selectVersion(): Promise<string> {
  log.step('选择版本号')

  const pkg = readJson<PackageJson>(PACKAGE_JSON_PATH)
  const currentVersion = pkg.version

  console.log(`\n当前版本: ${colors.bold}${currentVersion}${colors.reset}\n`)

  const choice = await select({
    message: '请选择版本升级类型:',
    choices: [
      {
        value: 'patch',
        name: `🔧 Patch (${currentVersion} → ${semver.inc(currentVersion, 'patch')}) - Bug 修复`,
      },
      {
        value: 'minor',
        name: `✨ Minor (${currentVersion} → ${semver.inc(currentVersion, 'minor')}) - 新功能`,
      },
      {
        value: 'major',
        name: `🚀 Major (${currentVersion} → ${semver.inc(currentVersion, 'major')}) - 重大变更`,
      },
      {
        value: 'current',
        name: `📌 当前版本 (${currentVersion}) - 强制使用当前版本号`,
      },
      {
        value: 'custom',
        name: '✏️  自定义版本号',
      },
    ],
  })

  let newVersion: string

  if (choice === 'current') {
    newVersion = currentVersion
  } else if (choice === 'custom') {
    const customVersion = await input({
      message: '请输入版本号 (例如: 1.2.3):',
      validate: (value) => {
        if (!semver.valid(value)) {
          return '请输入有效的语义化版本号 (例如: 1.2.3)'
        }
        return true
      },
    })
    newVersion = customVersion
  } else {
    newVersion = semver.inc(currentVersion, choice as 'patch' | 'minor' | 'major')!
  }

  // 确认版本
  const confirmed = await confirm({
    message: `确认发布版本 ${colors.bold}v${newVersion}${colors.reset}？`,
    default: true,
  })

  if (!confirmed) {
    throw new Error('用户取消')
  }

  return newVersion
}

// ==================== 构建和上传 ====================

async function runBuild(): Promise<void> {
  log.step('运行类型检查')
  exec('pnpm typecheck')

  log.step('运行单元测试')
  exec('pnpm test')

  log.step('构建 Web 版本')
  exec('pnpm build:web', {
    env: { SERVICE_IMPL: 'web', VITE_DEV_MODE: 'false' },
  })

  // 移动到 dist-web
  const distDir = join(ROOT, 'dist')
  const distWebDir = join(ROOT, 'dist-web')
  if (existsSync(distWebDir)) {
    rmSync(distWebDir, { recursive: true })
  }
  if (existsSync(distDir)) {
    cpSync(distDir, distWebDir, { recursive: true })
    rmSync(distDir, { recursive: true })
  }

  log.step('构建 DWEB 版本')
  exec('pnpm build:dweb', {
    env: { SERVICE_IMPL: 'dweb', VITE_DEV_MODE: 'false' },
  })

  // 移动到 dist-dweb
  const distDwebDir = join(ROOT, 'dist-dweb')
  if (existsSync(distDwebDir)) {
    rmSync(distDwebDir, { recursive: true })
  }
  if (existsSync(distDir)) {
    cpSync(distDir, distDwebDir, { recursive: true })
    rmSync(distDir, { recursive: true })
  }

  log.step('运行 Plaoc 打包')
  const distsDir = join(ROOT, 'dists')
  if (existsSync(distsDir)) {
    rmSync(distsDir, { recursive: true })
  }
  if (commandExists('plaoc')) {
    exec(`plaoc bundle "${distDwebDir}" -c ./ -o "${distsDir}"`)
  } else {
    log.warn('Plaoc CLI 未安装，使用 dist-dweb 作为 dists 兜底')
    cpSync(distDwebDir, distsDir, { recursive: true })
  }

  log.success('构建完成')
}

async function uploadDweb(): Promise<void> {
  log.step('上传 DWEB 到正式服务器')

  const sftpUrl = process.env.DWEB_SFTP_URL || 'sftp://iweb.xin:22022'
  const sftpUser = process.env.DWEB_SFTP_USER
  const sftpPass = process.env.DWEB_SFTP_PASS

  if (!sftpUser || !sftpPass) {
    log.warn('未配置 SFTP 环境变量 (DWEB_SFTP_USER, DWEB_SFTP_PASS)')
    const shouldSkip = await confirm({
      message: '是否跳过上传？',
      default: true,
    })
    if (shouldSkip) {
      log.info('跳过上传')
      return
    }
    throw new Error('请配置 SFTP 环境变量')
  }

  // 使用 build.ts 的上传功能
  exec('bun scripts/build.ts dweb --upload --stable --skip-typecheck --skip-test', {
    env: {
      DWEB_SFTP_URL: sftpUrl,
      DWEB_SFTP_USER: sftpUser,
      DWEB_SFTP_PASS: sftpPass,
    },
  })

  log.success('上传完成')
}

// ==================== 更新文件 ====================

function updateVersionFiles(version: string, changelog: string): void {
  log.step('更新版本文件')

  // 更新 package.json
  const pkg = readJson<PackageJson>(PACKAGE_JSON_PATH)
  pkg.version = version
  pkg.lastChangelogCommit = execOutput('git rev-parse HEAD')
  writeJson(PACKAGE_JSON_PATH, pkg)
  log.success('更新 package.json')

  // 更新 manifest.json
  if (existsSync(MANIFEST_JSON_PATH)) {
    const manifest = readJson<ManifestJson>(MANIFEST_JSON_PATH)
    manifest.version = version
    manifest.change_log = changelog
    writeJson(MANIFEST_JSON_PATH, manifest)
    log.success('更新 manifest.json')
  }
}

async function updateChangelog(version: string): Promise<string> {
  log.step('更新 CHANGELOG.md')

  const summary = await input({
    message: '请输入本次更新的简要描述:',
    default: '功能更新和优化',
  })

  const date = new Date().toISOString().split('T')[0]
  const commitHash = execOutput('git rev-parse HEAD')

  let content = `## [${version}] - ${date}\n\n`
  content += `${summary}\n\n`
  content += `<!-- last-commit: ${commitHash} -->\n\n`

  // 读取现有 CHANGELOG 或创建新的
  let existingContent = ''
  if (existsSync(CHANGELOG_PATH)) {
    existingContent = readFileSync(CHANGELOG_PATH, 'utf-8')
    existingContent = existingContent.replace(/^# 更新日志\n+/, '')
    existingContent = existingContent.replace(/^# Changelog\n+/, '')
  }

  const newContent = `# 更新日志\n\n${content}${existingContent}`
  writeFileSync(CHANGELOG_PATH, newContent)

  log.success('更新 CHANGELOG.md')
  return summary
}

// ==================== Git 操作 ====================

async function commitRelease(version: string): Promise<void> {
  log.step('提交变更')

  // 添加所有变更
  exec('git add -A')

  // 提交
  exec(`git commit -m "release: v${version}"`)
  log.success(`提交: release: v${version}`)
}

async function pushAndTriggerCD(version: string): Promise<void> {
  log.step('推送到 GitHub')

  console.log(`
${colors.yellow}推送后请在 GitHub Actions 手动触发 stable 发布:${colors.reset}
  - CD 会在完成后创建 Tag 并生成 Release
`)

  const shouldPush = await confirm({
    message: '是否推送到 GitHub？',
    default: true,
  })

  if (!shouldPush) {
    log.info('跳过推送。你可以稍后手动执行:')
    console.log(`  git push origin main`)
    console.log(`  git push origin v${version}`)
    return
  }

  // 推送代码（受保护分支可能需要走 PR）
  exec('git push origin HEAD')
  log.success('推送代码')

  console.log(`
${colors.green}GitHub Actions 将自动:${colors.reset}
  - 构建 Web 和 DWEB 版本
  - 部署到 GitHub Pages
  - 创建 Tag & GitHub Release
  - 上传 DWEB 到正式服务器

请在 Actions 中手动选择 stable 触发发布。
查看进度: https://github.com/BioforestChain/KeyApp/actions
`)
}

// ==================== 主程序 ====================

async function main() {
  console.log(`
${colors.magenta}╔════════════════════════════════════════╗
║      BFM Pay Release Script           ║
╚════════════════════════════════════════╝${colors.reset}
`)

  // 1. 检查工作区
  const canContinue = await checkWorkspace()
  if (!canContinue) {
    log.info('发布已取消')
    process.exit(0)
  }

  // 2. 选择版本号
  let newVersion: string
  try {
    newVersion = await selectVersion()
  } catch (error) {
    log.info('发布已取消')
    process.exit(0)
  }

  // 3. 确认发布流程
  console.log(`
${colors.cyan}发布流程:${colors.reset}
  1. 运行类型检查和测试
  2. 构建 Web 和 DWEB 版本
  3. 上传 DWEB 到正式服务器
  4. 更新版本号和 CHANGELOG
  5. 提交变更
  6. 推送并手动触发 CI 发布（CI 创建 tag/release）
`)

  const confirmRelease = await confirm({
    message: '确认开始发布流程？',
    default: true,
  })

  if (!confirmRelease) {
    log.info('发布已取消')
    process.exit(0)
  }

  // 4. 运行构建
  await runBuild()

  // 5. 上传 DWEB
  await uploadDweb()

  // 6. 更新 CHANGELOG
  const changelog = await updateChangelog(newVersion)

  // 7. 更新版本文件
  updateVersionFiles(newVersion, changelog)

  // 8. 提交变更
  await commitRelease(newVersion)

  // 9. 推送
  await pushAndTriggerCD(newVersion)

  console.log(`
${colors.green}╔════════════════════════════════════════╗
║        发布完成！ v${newVersion.padEnd(20)}║
╚════════════════════════════════════════╝${colors.reset}

${colors.blue}下一步:${colors.reset}
  - 在 GitHub Actions 手动触发 stable 发布
  - 查看进度: https://github.com/BioforestChain/KeyApp/actions
  - 发布完成后查看 Release: https://github.com/BioforestChain/KeyApp/releases
  - 访问 GitHub Pages: https://bioforestchain.github.io/KeyApp/
`)
}

main().catch((error) => {
  log.error(`发布失败: ${error.message}`)
  process.exit(1)
})
