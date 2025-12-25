/**
 * Worktree 管理
 */

import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { basename, join, relative, resolve, sep } from 'node:path'
import { ROOT, WORKTREE_DIR, log } from '../utils'

const ALLOWED_BRANCH_PREFIXES = [
  'feat/',
  'fix/',
  'docs/',
  'test/',
  'refactor/',
  'chore/',
  'ci/',
  'openspec/',
  'release/',
] as const

interface WorktreeEntry {
  path: string
  head: string | null
  branch: string | null
}

interface PrInfo {
  number: number
  state: string
  mergedAt: string | null
  url: string
}

interface CheckSummary {
  total: number
  success: number
  failure: number
  pending: number
  neutral: number
  skipped: number
  unknown: number
}

interface CheckDetails {
  summary: CheckSummary
  failures: string[]
  pending: string[]
  neutral: string[]
  skipped: string[]
  unknown: string[]
  success: string[]
}

function runCommand(command: string, args: string[], options?: { cwd?: string; stdio?: 'pipe' | 'inherit' }): string {
  return execFileSync(command, args, {
    encoding: 'utf-8',
    stdio: options?.stdio ?? 'pipe',
    cwd: options?.cwd ?? ROOT,
  })
}

function parseWorktrees(): WorktreeEntry[] {
  const output = runCommand('git', ['worktree', 'list', '--porcelain'])
  const lines = output.trim().split('\n')
  const entries: WorktreeEntry[] = []
  let current: WorktreeEntry | null = null

  for (const line of lines) {
    if (line.startsWith('worktree ')) {
      if (current) entries.push(current)
      current = {
        path: line.slice('worktree '.length),
        head: null,
        branch: null,
      }
      continue
    }
    if (!current) continue

    if (line.startsWith('HEAD ')) {
      current.head = line.slice('HEAD '.length)
      continue
    }
    if (line.startsWith('branch ')) {
      const ref = line.slice('branch '.length)
      current.branch = ref.replace('refs/heads/', '')
      continue
    }
    if (line === 'detached') {
      current.branch = null
    }
  }

  if (current) entries.push(current)
  return entries
}

function getWorktreeEntries(): WorktreeEntry[] {
  const root = resolve(WORKTREE_DIR)
  const prefix = root.endsWith(sep) ? root : root + sep
  return parseWorktrees().filter(entry => resolve(entry.path).startsWith(prefix))
}

function resolveWorktreePath(input: string): string {
  const directPath = resolve(ROOT, input)
  if (existsSync(directPath)) {
    return directPath
  }
  return join(WORKTREE_DIR, input)
}

function ensureWorktreeDir(): void {
  if (!existsSync(WORKTREE_DIR)) {
    mkdirSync(WORKTREE_DIR, { recursive: true })
  }
}

function ensureFileExists(filePath: string, label: string): void {
  if (!existsSync(filePath)) {
    log.error(`${label} 不存在: ${filePath}`)
    process.exit(1)
  }
  const stat = statSync(filePath)
  if (!stat.isFile()) {
    log.error(`${label} 不是文件: ${filePath}`)
    process.exit(1)
  }
}

function ensureBranchMissing(branch: string): void {
  try {
    runCommand('git', ['show-ref', '--verify', `refs/heads/${branch}`])
    log.error(`分支已存在: ${branch}`)
    process.exit(1)
  } catch {
    // branch missing is ok
  }
}

function ensureBranchPrefix(branch: string): void {
  if (/\s/.test(branch)) {
    log.error(`分支名不能包含空白字符: ${branch}`)
    process.exit(1)
  }
  const allowed = ALLOWED_BRANCH_PREFIXES.some(prefix => branch.startsWith(prefix))
  if (!allowed) {
    log.error(`分支名必须使用允许的前缀: ${ALLOWED_BRANCH_PREFIXES.join(', ')}`)
    log.info(`当前分支: ${branch}`)
    process.exit(1)
  }
}

function ensureGitRefExists(ref: string): void {
  try {
    runCommand('git', ['rev-parse', '--verify', ref])
  } catch {
    log.error(`找不到 base 引用: ${ref}`)
    process.exit(1)
  }
}

function loadPrInfo(branch: string): PrInfo | null {
  try {
    const output = runCommand('gh', [
      'pr',
      'list',
      '--head',
      branch,
      '--state',
      'all',
      '--limit',
      '1',
      '--json',
      'number,state,mergedAt,url',
    ])
    const parsed = JSON.parse(output) as PrInfo[]
    return parsed[0] ?? null
  } catch (error) {
    log.error(`无法查询 PR 信息: ${String(error)}`)
    process.exit(1)
  }
}

function resolveCheckState(check: unknown): string {
  if (typeof check !== 'object' || check === null) return 'UNKNOWN'
  const record = check as Record<string, unknown>
  const raw = record.state ?? record.conclusion ?? record.status
  return typeof raw === 'string' ? raw.toUpperCase() : 'UNKNOWN'
}

function resolveCheckName(check: unknown, index: number): string {
  if (typeof check !== 'object' || check === null) return `check-${index + 1}`
  const record = check as Record<string, unknown>
  const name = typeof record.name === 'string' ? record.name.trim() : ''
  if (name) return name
  const context = typeof record.context === 'string' ? record.context.trim() : ''
  if (context) return context
  return `check-${index + 1}`
}

function summarizeChecks(prNumber: number): CheckDetails {
  try {
    const output = runCommand('gh', ['pr', 'view', String(prNumber), '--json', 'statusCheckRollup'])
    const parsed = JSON.parse(output) as { statusCheckRollup?: Array<unknown> }
    const summary: CheckSummary = {
      total: 0,
      success: 0,
      failure: 0,
      pending: 0,
      neutral: 0,
      skipped: 0,
      unknown: 0,
    }
    const details: CheckDetails = {
      summary,
      failures: [],
      pending: [],
      neutral: [],
      skipped: [],
      unknown: [],
      success: [],
    }

    const rollups = parsed.statusCheckRollup ?? []
    rollups.forEach((check, index) => {
      summary.total += 1
      const state = resolveCheckState(check)
      const name = resolveCheckName(check, index)
      if (state === 'SUCCESS') {
        summary.success += 1
        details.success.push(name)
      } else if (state === 'FAILURE' || state === 'ERROR') {
        summary.failure += 1
        details.failures.push(name)
      } else if (state === 'PENDING' || state === 'EXPECTED' || state === 'IN_PROGRESS' || state === 'QUEUED') {
        summary.pending += 1
        details.pending.push(name)
      } else if (state === 'NEUTRAL' || state === 'ACTION_REQUIRED' || state === 'STALE') {
        summary.neutral += 1
        details.neutral.push(name)
      } else if (state === 'SKIPPED') {
        summary.skipped += 1
        details.skipped.push(name)
      } else {
        summary.unknown += 1
        details.unknown.push(name)
      }
    })

    return details
  } catch (error) {
    log.error(`无法查询 CI/CD 状态: ${String(error)}`)
    process.exit(1)
  }
}

function formatCheckSummary(summary: CheckSummary): string {
  if (summary.total === 0) return 'none'
  const parts = []
  if (summary.success) parts.push(`success:${summary.success}`)
  if (summary.failure) parts.push(`failure:${summary.failure}`)
  if (summary.pending) parts.push(`pending:${summary.pending}`)
  if (summary.neutral) parts.push(`neutral:${summary.neutral}`)
  if (summary.skipped) parts.push(`skipped:${summary.skipped}`)
  if (summary.unknown) parts.push(`unknown:${summary.unknown}`)
  let overall = 'mixed'
  if (summary.failure > 0) overall = 'failure'
  else if (summary.pending > 0) overall = 'pending'
  else if (summary.success > 0 && summary.success === summary.total) overall = 'success'
  return `${overall} (${parts.join(', ')})`
}

function formatCheckNames(names: string[], limit = 3): string {
  if (names.length <= limit) return names.join(', ')
  return `${names.slice(0, limit).join(', ')} +${names.length - limit}`
}

function formatCheckDetails(details: CheckDetails): string {
  if (details.summary.total === 0) return 'none'
  const summaryText = formatCheckSummary(details.summary)
  const extra: string[] = []
  if (details.failures.length > 0) extra.push(`fail:${formatCheckNames(details.failures)}`)
  if (details.pending.length > 0) extra.push(`pending:${formatCheckNames(details.pending)}`)
  if (details.unknown.length > 0) extra.push(`unknown:${formatCheckNames(details.unknown)}`)
  if (extra.length === 0) return summaryText
  return `${summaryText} [${extra.join(' | ')}]`
}

function formatPrStatus(info: PrInfo): string {
  const merged = info.mergedAt ? 'MERGED' : info.state
  return merged.toUpperCase()
}

export function createWorktree(options: { name?: string; branch?: string; base?: string }): void {
  const name = options.name?.trim()
  const branch = options.branch?.trim()
  const base = options.base?.trim() || 'main'

  if (!name) {
    log.error('请提供 worktree 名称')
    process.exit(1)
  }
  if (!branch) {
    log.error('请提供 --branch')
    process.exit(1)
  }

  const envSource = join(ROOT, '.env.local')
  ensureFileExists(envSource, '.env.local')
  ensureBranchPrefix(branch)
  ensureGitRefExists(base)
  ensureBranchMissing(branch)

  ensureWorktreeDir()
  const worktreePath = join(WORKTREE_DIR, name)
  if (existsSync(worktreePath)) {
    log.error(`worktree 已存在: ${worktreePath}`)
    process.exit(1)
  }

  log.section('创建 worktree')
  runCommand('git', ['worktree', 'add', worktreePath, '-b', branch, base])

  log.section('复制 .env.local')
  const envTarget = join(worktreePath, '.env.local')
  copyFileSync(envSource, envTarget)

  log.section('安装依赖')
  runCommand('pnpm', ['install'], { cwd: worktreePath, stdio: 'inherit' })

  log.success('worktree 创建完成')

  const relPath = relative(WORKTREE_DIR, worktreePath)
  const displayPath = join('.git-worktree', relPath)
  const relEnvSource = relative(ROOT, envSource)
  const relEnvTarget = relative(ROOT, envTarget)

  console.log(`\n# worktree 信息\n`)
  console.log(`- name: ${name}`)
  console.log(`- path: ${displayPath}`)
  console.log(`- abs: ${worktreePath}`)
  console.log(`- branch: ${branch}`)
  console.log(`- base: ${base}`)
  console.log(`- env: ${relEnvSource} -> ${relEnvTarget}`)
  console.log(`- install: pnpm install (ok)\n`)

  console.log(`# 下一步`)
  console.log(`  cd ${worktreePath}`)
  console.log(`  pnpm dev\n`)
}

export function deleteWorktree(options: { name?: string; force?: boolean }): void {
  const name = options.name?.trim()
  if (!name) {
    log.error('请提供 worktree 名称')
    process.exit(1)
  }

  const worktreePath = resolveWorktreePath(name)
  if (!existsSync(worktreePath) || !statSync(worktreePath).isDirectory()) {
    log.error(`worktree 不存在: ${worktreePath}`)
    process.exit(1)
  }

  const entries = getWorktreeEntries()
  const entry = entries.find(item => resolve(item.path) === resolve(worktreePath))
  if (!entry) {
    log.error(`无法识别 worktree 信息: ${worktreePath}`)
    process.exit(1)
  }

  if (entry.branch && !options.force) {
    const prInfo = loadPrInfo(entry.branch)
    if (prInfo && !prInfo.mergedAt) {
      log.error(`PR 未合并，禁止删除: #${prInfo.number} ${formatPrStatus(prInfo)}`)
      log.info(prInfo.url)
      process.exit(1)
    }
  }

  const removeArgs = ['worktree', 'remove', worktreePath]
  if (options.force) removeArgs.push('--force')
  runCommand('git', removeArgs)
  log.success(`已删除 worktree: ${relative(ROOT, worktreePath)}`)
}

export function listWorktrees(): void {
  const entries = getWorktreeEntries()
  if (entries.length === 0) {
    console.log('未发现 worktree')
    return
  }

  const rows = entries.map(entry => {
    const name = basename(entry.path)
    const relPath = relative(WORKTREE_DIR, entry.path)
    const branch = entry.branch ?? '(detached)'

    let prText = 'none'
    let checksText = 'n/a'

    if (entry.branch) {
      const prInfo = loadPrInfo(entry.branch)
      if (prInfo) {
        prText = `#${prInfo.number} ${formatPrStatus(prInfo)}`
        checksText = formatCheckDetails(summarizeChecks(prInfo.number))
      }
    }

    return {
      name,
      path: `.git-worktree/${relPath}`,
      branch,
      pr: prText,
      checks: checksText,
    }
  })

  const headers = {
    name: 'NAME',
    path: 'PATH',
    branch: 'BRANCH',
    pr: 'PR',
    checks: 'CHECKS',
  }

  const widths = {
    name: Math.max(headers.name.length, ...rows.map(row => row.name.length)),
    path: Math.max(headers.path.length, ...rows.map(row => row.path.length)),
    branch: Math.max(headers.branch.length, ...rows.map(row => row.branch.length)),
    pr: Math.max(headers.pr.length, ...rows.map(row => row.pr.length)),
    checks: Math.max(headers.checks.length, ...rows.map(row => row.checks.length)),
  }

  const pad = (value: string, width: number) => value.padEnd(width)
  console.log('# Worktrees\n')
  console.log(
    `${pad(headers.name, widths.name)}  ${pad(headers.path, widths.path)}  ${pad(headers.branch, widths.branch)}  ${pad(headers.pr, widths.pr)}  ${pad(headers.checks, widths.checks)}`
  )
  console.log(
    `${'-'.repeat(widths.name)}  ${'-'.repeat(widths.path)}  ${'-'.repeat(widths.branch)}  ${'-'.repeat(widths.pr)}  ${'-'.repeat(widths.checks)}`
  )
  for (const row of rows) {
    console.log(
      `${pad(row.name, widths.name)}  ${pad(row.path, widths.path)}  ${pad(row.branch, widths.branch)}  ${pad(row.pr, widths.pr)}  ${pad(row.checks, widths.checks)}`
    )
  }
  console.log()
}
