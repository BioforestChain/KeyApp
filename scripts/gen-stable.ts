#!/usr/bin/env bun
/**
 * BFM Pay Stable 版本发布脚本
 *
 * 交互式脚本，用于生成 stable 版本：
 * 1. 检查是否有未提交的代码
 * 2. 使用 AI 生成 changelog
 * 3. 更新版本号 (package.json + manifest.json)
 * 4. 更新 CHANGELOG.md
 * 5. 提交变更并打 tag
 * 6. 推送到 GitHub 触发 CD
 *
 * Usage:
 *   pnpm gen:stable
 */

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
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
}

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`\n${colors.cyan}▸${colors.reset} ${colors.cyan}${msg}${colors.reset}`),
}

// ==================== 工具函数 ====================

function exec(cmd: string, options?: { silent?: boolean }): string {
  try {
    const result = execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: options?.silent ? 'pipe' : 'inherit',
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

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJson(path: string, data: unknown) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
}

// ==================== 检查函数 ====================

async function checkUncommittedChanges(): Promise<boolean> {
  log.step('检查未提交的代码')

  const status = execOutput('git status --porcelain')
  if (!status) {
    log.success('工作区干净')
    return true
  }

  log.warn('检测到未提交的变更:')
  console.log(status)

  const shouldContinue = await confirm({
    message: '是否继续？（未提交的变更不会包含在此版本中）',
    default: false,
  })

  return shouldContinue
}

// ==================== 版本管理 ====================

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

function getLastChangelogCommit(): string {
  const pkg = readJson<PackageJson>(PACKAGE_JSON_PATH)
  if (pkg.lastChangelogCommit) {
    return pkg.lastChangelogCommit
  }

  // 尝试从 CHANGELOG.md 获取
  if (existsSync(CHANGELOG_PATH)) {
    const content = readFileSync(CHANGELOG_PATH, 'utf-8')
    const match = content.match(/<!-- last-commit: ([a-f0-9]+) -->/)
    if (match) {
      return match[1]
    }
  }

  // 默认返回第一个 commit
  try {
    return execOutput('git rev-list --max-parents=0 HEAD')
  } catch {
    return 'HEAD~10' // fallback
  }
}

function getCurrentCommit(): string {
  return execOutput('git rev-parse HEAD')
}

async function getGitLog(fromCommit: string, toCommit: string = 'HEAD'): Promise<string> {
  try {
    // 获取提交日志
    const log = execOutput(`git log ${fromCommit}..${toCommit} --pretty=format:"%h %s" --no-merges`)
    return log
  } catch {
    return ''
  }
}

async function getGitDiff(fromCommit: string, toCommit: string = 'HEAD'): Promise<string> {
  try {
    // 获取变更摘要
    const diff = execOutput(`git diff ${fromCommit}..${toCommit} --stat`)
    return diff
  } catch {
    return ''
  }
}

// ==================== AI Changelog 生成 ====================

interface ChangelogResult {
  features: string[]
  breaking: string[]
  fixes: string[]
  suggestedBump: 'major' | 'minor' | 'patch'
  summary: string
}

async function generateChangelog(fromCommit: string): Promise<ChangelogResult> {
  log.step('使用 AI 生成 Changelog')

  const gitLog = await getGitLog(fromCommit)
  const gitDiff = await getGitDiff(fromCommit)

  if (!gitLog) {
    log.warn('没有新的提交')
    return {
      features: [],
      breaking: [],
      fixes: [],
      suggestedBump: 'patch',
      summary: '小幅更新和优化',
    }
  }

  log.info('正在分析提交历史...')
  console.log('\n提交记录:')
  console.log(gitLog)
  console.log('')

  const prompt = `你是一个专业的软件发布助手。请分析以下 git 提交历史，生成面向普通用户（非程序员）的更新日志。

## Git 提交记录
${gitLog}

## 文件变更统计
${gitDiff}

## 重要说明
1. 更新日志是给普通用户看的，不是程序员，所以要用通俗易懂的语言
2. 如果一个功能被添加后又被撤回，或者一个 bug 被修复后又恢复，这种"无效变更"不要写入日志
3. 重点描述"最终的变更结果"，而不是中间过程
4. 如果是技术重构、代码优化等用户感知不到的变更，可以归类到"性能优化"或不写

请返回以下 JSON 格式（不要包含 markdown 代码块标记）：
{
  "features": ["新功能1的描述", "新功能2的描述"],
  "breaking": ["破坏性变更1的描述"],
  "fixes": ["修复问题1的描述", "修复问题2的描述"],
  "suggestedBump": "patch 或 minor 或 major",
  "summary": "一句话总结本次更新"
}

版本号建议规则：
- patch: 仅 bug 修复，无新功能
- minor: 有新功能或小的破坏性变更
- major: 重大重构或重大破坏性变更`

  try {
    // 检查 AI API 配置
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      log.warn('未配置 OPENAI_API_KEY，将使用手动模式')
      log.info('提示: 设置环境变量 OPENAI_API_KEY 可启用 AI 自动生成')
      return await manualChangelog(gitLog)
    }

    log.info('调用 OpenAI API 生成 changelog...')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>
    }
    const result = data.choices[0]?.message?.content || ''

    console.log('\nAI 响应:')
    console.log(result)
    console.log('')

    // 解析 JSON
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ChangelogResult
    }

    throw new Error('无法解析 AI 响应')
  } catch (error) {
    log.warn(`AI 生成失败: ${error}`)
    return await manualChangelog(gitLog)
  }
}

async function manualChangelog(gitLog: string): Promise<ChangelogResult> {
  log.info('进入手动模式')

  console.log('\n提交记录:')
  console.log(gitLog)
  console.log('')

  const summary = await input({
    message: '请输入本次更新的简要描述:',
    default: '功能更新和 Bug 修复',
  })

  const featuresStr = await input({
    message: '新增功能（用逗号分隔，留空跳过）:',
    default: '',
  })

  const fixesStr = await input({
    message: 'Bug 修复（用逗号分隔，留空跳过）:',
    default: '',
  })

  const breakingStr = await input({
    message: '破坏性变更（用逗号分隔，留空跳过）:',
    default: '',
  })

  const bump = await select({
    message: '版本号升级类型:',
    choices: [
      { value: 'patch' as const, name: 'patch (0.0.x) - 仅 bug 修复' },
      { value: 'minor' as const, name: 'minor (0.x.0) - 新功能' },
      { value: 'major' as const, name: 'major (x.0.0) - 重大变更' },
    ],
    default: 'patch',
  })

  return {
    features: featuresStr ? featuresStr.split(',').map((s) => s.trim()) : [],
    fixes: fixesStr ? fixesStr.split(',').map((s) => s.trim()) : [],
    breaking: breakingStr ? breakingStr.split(',').map((s) => s.trim()) : [],
    suggestedBump: bump,
    summary,
  }
}

// ==================== 更新文件 ====================

async function updateVersion(changelog: ChangelogResult): Promise<string> {
  log.step('更新版本号')

  const pkg = readJson<PackageJson>(PACKAGE_JSON_PATH)
  const currentVersion = pkg.version

  // 计算新版本
  const bumpType = await select({
    message: `当前版本: ${currentVersion}，建议升级类型: ${changelog.suggestedBump}`,
    choices: [
      { value: 'patch' as const, name: `patch → ${semver.inc(currentVersion, 'patch')}` },
      { value: 'minor' as const, name: `minor → ${semver.inc(currentVersion, 'minor')}` },
      { value: 'major' as const, name: `major → ${semver.inc(currentVersion, 'major')}` },
    ],
    default: changelog.suggestedBump,
  })

  const newVersion = semver.inc(currentVersion, bumpType)!
  log.info(`版本号: ${currentVersion} → ${newVersion}`)

  // 更新 package.json
  pkg.version = newVersion
  pkg.lastChangelogCommit = getCurrentCommit()
  writeJson(PACKAGE_JSON_PATH, pkg)
  log.success('更新 package.json')

  // 更新 manifest.json
  if (existsSync(MANIFEST_JSON_PATH)) {
    const manifest = readJson<ManifestJson>(MANIFEST_JSON_PATH)
    manifest.version = newVersion
    manifest.change_log = changelog.summary
    writeJson(MANIFEST_JSON_PATH, manifest)
    log.success('更新 manifest.json')
  }

  return newVersion
}

function updateChangelogFile(version: string, changelog: ChangelogResult, commitHash: string) {
  log.step('更新 CHANGELOG.md')

  const date = new Date().toISOString().split('T')[0]
  let content = `## [${version}] - ${date}\n\n`

  if (changelog.summary) {
    content += `${changelog.summary}\n\n`
  }

  if (changelog.features.length > 0) {
    content += `### 新增功能\n\n`
    changelog.features.forEach((f) => {
      content += `- ${f}\n`
    })
    content += '\n'
  }

  if (changelog.breaking.length > 0) {
    content += `### 破坏性变更\n\n`
    changelog.breaking.forEach((b) => {
      content += `- ${b}\n`
    })
    content += '\n'
  }

  if (changelog.fixes.length > 0) {
    content += `### Bug 修复\n\n`
    changelog.fixes.forEach((f) => {
      content += `- ${f}\n`
    })
    content += '\n'
  }

  content += `<!-- last-commit: ${commitHash} -->\n\n`

  // 读取现有 CHANGELOG 或创建新的
  let existingContent = ''
  if (existsSync(CHANGELOG_PATH)) {
    existingContent = readFileSync(CHANGELOG_PATH, 'utf-8')
    // 移除旧的 header
    existingContent = existingContent.replace(/^# 更新日志\n+/, '')
    existingContent = existingContent.replace(/^# Changelog\n+/, '')
  }

  const newContent = `# 更新日志\n\n${content}${existingContent}`
  writeFileSync(CHANGELOG_PATH, newContent)

  log.success('更新 CHANGELOG.md')
}

// ==================== Git 操作 ====================

async function commitAndTag(version: string) {
  log.step('提交变更并创建 Tag')

  // 添加文件
  exec('git add package.json manifest.json CHANGELOG.md')

  // 提交
  exec(`git commit -m "release: v${version}"`)
  log.success(`提交: release: v${version}`)

  // 创建 tag
  exec(`git tag -a v${version} -m "Release v${version}"`)
  log.success(`创建 Tag: v${version}`)
}

async function pushToRemote(version: string) {
  log.step('推送到远程仓库')

  const shouldPush = await confirm({
    message: '是否推送到 GitHub？（这将触发 CD 流程）',
    default: true,
  })

  if (!shouldPush) {
    log.info('跳过推送。你可以稍后手动执行:')
    console.log(`  git push origin main`)
    console.log(`  git push origin v${version}`)
    return
  }

  exec('git push origin main')
  exec(`git push origin v${version}`)
  log.success('推送完成')
}

// ==================== 主程序 ====================

async function main() {
  console.log(`
${colors.magenta}╔════════════════════════════════════════╗
║      BFM Pay Stable Release Script    ║
╚════════════════════════════════════════╝${colors.reset}
`)

  // 1. 检查未提交的代码
  const canContinue = await checkUncommittedChanges()
  if (!canContinue) {
    log.info('请先提交代码后再运行此脚本')
    process.exit(0)
  }

  // 2. 获取上次 changelog 的 commit
  const lastCommit = getLastChangelogCommit()
  const currentCommit = getCurrentCommit()
  log.info(`上次发布 commit: ${lastCommit.slice(0, 7)}`)
  log.info(`当前 commit: ${currentCommit.slice(0, 7)}`)

  // 3. 生成 changelog
  const changelog = await generateChangelog(lastCommit)

  console.log('\n生成的 Changelog:')
  console.log(JSON.stringify(changelog, null, 2))

  const confirmChangelog = await confirm({
    message: '确认使用此 Changelog？',
    default: true,
  })

  if (!confirmChangelog) {
    log.info('已取消')
    process.exit(0)
  }

  // 4. 更新版本号
  const newVersion = await updateVersion(changelog)

  // 5. 更新 CHANGELOG.md
  updateChangelogFile(newVersion, changelog, currentCommit)

  // 6. 提交并打 tag
  await commitAndTag(newVersion)

  // 7. 推送
  await pushToRemote(newVersion)

  console.log(`
${colors.green}╔════════════════════════════════════════╗
║           发布完成！ v${newVersion.padEnd(17)}║
╚════════════════════════════════════════╝${colors.reset}
`)
}

main().catch((error) => {
  log.error(`发布失败: ${error.message}`)
  process.exit(1)
})
