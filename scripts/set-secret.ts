#!/usr/bin/env bun

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const ENV_LOCAL_PATH = join(ROOT, '.env.local')

const ANSI = {
  clear: '\x1b[2J',
  home: '\x1b[H',
  hideCursor: '\x1b[?25l',
  showCursor: '\x1b[?25h',
  clearLine: '\x1b[2K',
  moveTo: (row: number, col: number) => `\x1b[${row};${col}H`,
  moveUp: (n: number) => `\x1b[${n}A`,
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bgBlue: '\x1b[44m',
  white: '\x1b[37m',
}

interface SecretField {
  key: string
  label: string
  isPassword: boolean
  required: boolean
  validate?: (value: string) => string | null
}

const FIELDS: SecretField[] = [
  { key: 'DWEB_SFTP_USER', label: 'DWEB SFTP 用户名 (正式)', isPassword: false, required: true },
  { key: 'DWEB_SFTP_PASS', label: 'DWEB SFTP 密码 (正式)', isPassword: true, required: true },
  { key: 'DWEB_SFTP_USER_DEV', label: 'DWEB SFTP 用户名 (开发)', isPassword: false, required: false },
  { key: 'DWEB_SFTP_PASS_DEV', label: 'DWEB SFTP 密码 (开发)', isPassword: true, required: false },
  { key: 'E2E_TEST_MNEMONIC', label: 'E2E 测试助记词', isPassword: false, required: false, validate: validateMnemonic },
  { key: 'E2E_TEST_SECOND_SECRET', label: 'E2E 安全密码', isPassword: true, required: false },
  { key: 'TRONGRID_API_KEY', label: 'TronGrid API Key', isPassword: true, required: false },
  { key: 'ETHERSCAN_API_KEY', label: 'Etherscan API Key', isPassword: true, required: false },
  { key: 'MORALIS_API_KEY', label: 'Moralis API Key', isPassword: true, required: false },
]

function validateMnemonic(v: string): string | null {
  if (!v) return null
  const words = v.split(/\s+/).filter(Boolean)
  if (words.length !== 12 && words.length !== 24) {
    return `需要 12 或 24 个词，当前 ${words.length} 个`
  }
  return null
}

interface State {
  cursor: number
  values: Map<string, string>
  editing: boolean
  editBuffer: string
  editCursor: number
  message: string
  messageType: 'info' | 'error' | 'success'
  localEnv: Map<string, string>
  ghSecrets: Set<string>
  hasGhCli: boolean
  target: 'local' | 'github' | 'both'
  saved: boolean
}

function getTermSize(): { cols: number; rows: number } {
  return { cols: process.stdout.columns || 80, rows: process.stdout.rows || 24 }
}

function checkGhCli(): boolean {
  try {
    execSync('gh auth status', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

function getGitHubSecrets(): Set<string> {
  const secrets = new Set<string>()
  try {
    const output = execSync('gh secret list', { encoding: 'utf-8', stdio: 'pipe' })
    for (const line of output.split('\n')) {
      const name = line.split('\t')[0]?.trim()
      if (name) secrets.add(name)
    }
  } catch {}
  return secrets
}

function getLocalEnv(): Map<string, string> {
  const env = new Map<string, string>()
  if (!existsSync(ENV_LOCAL_PATH)) return env
  const content = readFileSync(ENV_LOCAL_PATH, 'utf-8')
  for (const line of content.split('\n')) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)="(.*)"$/)
    if (match) env.set(match[1], match[2])
  }
  return env
}

function saveLocalEnv(values: Map<string, string>): void {
  let content = existsSync(ENV_LOCAL_PATH) ? readFileSync(ENV_LOCAL_PATH, 'utf-8') : ''
  for (const [key, value] of values) {
    if (!value) continue
    const regex = new RegExp(`^${key}=".*"$`, 'm')
    const newLine = `${key}="${value}"`
    if (regex.test(content)) {
      content = content.replace(regex, newLine)
    } else {
      content = content.trimEnd() + '\n' + newLine + '\n'
    }
  }
  writeFileSync(ENV_LOCAL_PATH, content)
}

function saveGitHubSecrets(values: Map<string, string>): number {
  let count = 0
  for (const [key, value] of values) {
    if (!value) continue
    try {
      execSync(`gh secret set ${key}`, { input: value, stdio: ['pipe', 'pipe', 'pipe'] })
      count++
    } catch {}
  }
  return count
}

function maskValue(v: string, isPassword: boolean): string {
  if (!v) return ''
  if (isPassword) return '•'.repeat(Math.min(v.length, 16))
  if (v.length > 20) return v.slice(0, 17) + '...'
  return v
}

function render(state: State): void {
  const { cols } = getTermSize()
  const width = Math.min(cols - 4, 76)
  let out = ANSI.home + ANSI.hideCursor

  const title = ' BFM Pay 配置管理 '
  const padTitle = Math.floor((width - Bun.stringWidth(title)) / 2)
  out += `${ANSI.cyan}┌${'─'.repeat(width)}┐${ANSI.reset}\n`
  out += `${ANSI.cyan}│${' '.repeat(padTitle)}${ANSI.bold}${title}${ANSI.reset}${ANSI.cyan}${' '.repeat(width - padTitle - Bun.stringWidth(title))}│${ANSI.reset}\n`
  out += `${ANSI.cyan}├${'─'.repeat(width)}┤${ANSI.reset}\n`

  const targetLabel = state.target === 'both' ? 'Local + GitHub' : state.target === 'local' ? 'Local only' : 'GitHub only'
  out += `${ANSI.cyan}│${ANSI.reset} Target: ${ANSI.yellow}${targetLabel}${ANSI.reset}${' '.repeat(width - 10 - targetLabel.length)}${ANSI.cyan}│${ANSI.reset}\n`
  out += `${ANSI.cyan}├${'─'.repeat(width)}┤${ANSI.reset}\n`

  for (let i = 0; i < FIELDS.length; i++) {
    const field = FIELDS[i]
    const isSelected = i === state.cursor
    const value = state.values.get(field.key) || ''
    const hasLocal = state.localEnv.has(field.key)
    const hasGh = state.ghSecrets.has(field.key)

    const prefix = isSelected ? `${ANSI.cyan}▸${ANSI.reset}` : ' '
    const labelWidth = 28
    const label = field.label.padEnd(labelWidth).slice(0, labelWidth)

    let displayValue: string
    if (state.editing && isSelected) {
      const buf = field.isPassword ? '•'.repeat(state.editBuffer.length) : state.editBuffer
      displayValue = `[${buf}█]`
    } else {
      const masked = maskValue(value, field.isPassword)
      displayValue = value ? `[${masked}]` : `[${ANSI.dim}空${ANSI.reset}]`
    }

    const localStatus = hasLocal || value ? `${ANSI.green}L${ANSI.reset}` : `${ANSI.dim}·${ANSI.reset}`
    const ghStatus = !state.hasGhCli ? `${ANSI.dim}?${ANSI.reset}` : hasGh || value ? `${ANSI.green}G${ANSI.reset}` : `${ANSI.dim}·${ANSI.reset}`
    const reqMark = field.required ? `${ANSI.red}*${ANSI.reset}` : ' '

    const lineContent = `${prefix} ${reqMark}${label} ${displayValue} ${localStatus}${ghStatus}`
    const lineLen = 3 + 1 + labelWidth + 1 + Bun.stringWidth(displayValue.replace(/\x1b\[[0-9;]*m/g, '')) + 3
    const pad = Math.max(0, width - lineLen)
    out += `${ANSI.cyan}│${ANSI.reset}${lineContent}${' '.repeat(pad)}${ANSI.cyan}│${ANSI.reset}\n`
  }

  out += `${ANSI.cyan}├${'─'.repeat(width)}┤${ANSI.reset}\n`

  const msgColor = state.messageType === 'error' ? ANSI.red : state.messageType === 'success' ? ANSI.green : ANSI.dim
  const msgText = state.message || '↑↓ 移动  Enter 编辑  K 保留  D 清空  S 保存  T 切换目标  Q 退出'
  const msgLen = Bun.stringWidth(msgText.replace(/\x1b\[[0-9;]*m/g, ''))
  out += `${ANSI.cyan}│${ANSI.reset} ${msgColor}${msgText}${ANSI.reset}${' '.repeat(Math.max(0, width - msgLen - 2))}${ANSI.cyan}│${ANSI.reset}\n`
  out += `${ANSI.cyan}└${'─'.repeat(width)}┘${ANSI.reset}\n`

  process.stdout.write(out)
}

async function run(): Promise<void> {
  const args = process.argv.slice(2)
  if (args.includes('--list') || args.includes('-l')) {
    showListMode()
    return
  }

  const state: State = {
    cursor: 0,
    values: new Map(),
    editing: false,
    editBuffer: '',
    editCursor: 0,
    message: '',
    messageType: 'info',
    localEnv: getLocalEnv(),
    ghSecrets: getGitHubSecrets(),
    hasGhCli: checkGhCli(),
    target: 'both',
    saved: false,
  }

  for (const field of FIELDS) {
    const existing = state.localEnv.get(field.key)
    if (existing) state.values.set(field.key, existing)
  }

  process.stdout.write(ANSI.clear)
  process.stdin.setRawMode(true)
  process.stdin.resume()

  render(state)

  process.stdin.on('data', (data: Buffer) => {
    const key = data.toString()

    if (state.editing) {
      handleEditMode(state, key)
    } else {
      handleNavigationMode(state, key)
    }

    render(state)
  })

  process.on('exit', () => {
    process.stdout.write(ANSI.showCursor)
    process.stdin.setRawMode(false)
  })
}

function handleEditMode(state: State, key: string): void {
  if (key === '\r' || key === '\n') {
    const field = FIELDS[state.cursor]
    if (field.validate) {
      const err = field.validate(state.editBuffer)
      if (err) {
        state.message = err
        state.messageType = 'error'
        return
      }
    }
    state.values.set(field.key, state.editBuffer)
    state.editing = false
    state.message = `${field.key} 已更新`
    state.messageType = 'success'
  } else if (key === '\x1b') {
    state.editing = false
    state.editBuffer = ''
    state.message = '取消编辑'
    state.messageType = 'info'
  } else if (key === '\x7f') {
    state.editBuffer = state.editBuffer.slice(0, -1)
  } else if (key.length === 1 && key.charCodeAt(0) >= 32) {
    state.editBuffer += key
  }
}

function handleNavigationMode(state: State, key: string): void {
  state.message = ''
  state.messageType = 'info'

  if (key === '\x1b[A' || key === 'k') {
    state.cursor = Math.max(0, state.cursor - 1)
  } else if (key === '\x1b[B' || key === 'j') {
    state.cursor = Math.min(FIELDS.length - 1, state.cursor + 1)
  } else if (key === '\r' || key === '\n' || key === 'e') {
    state.editing = true
    state.editBuffer = state.values.get(FIELDS[state.cursor].key) || ''
    state.message = 'Enter 确认 | Esc 取消'
    state.messageType = 'info'
  } else if (key === 'd' || key === 'D') {
    const field = FIELDS[state.cursor]
    state.values.delete(field.key)
    state.message = `${field.key} 已清空`
    state.messageType = 'info'
  } else if (key === 't' || key === 'T') {
    if (state.target === 'both') state.target = 'local'
    else if (state.target === 'local') state.target = 'github'
    else state.target = 'both'
  } else if (key === 's' || key === 'S') {
    save(state)
  } else if (key === 'q' || key === 'Q' || key === '\x03') {
    process.stdout.write(ANSI.showCursor + '\n')
    if (!state.saved && state.values.size > 0) {
      console.log(`${ANSI.yellow}未保存的更改已丢弃${ANSI.reset}`)
    }
    process.exit(0)
  }
}

function save(state: State): void {
  let localCount = 0
  let ghCount = 0

  if (state.target === 'local' || state.target === 'both') {
    saveLocalEnv(state.values)
    localCount = state.values.size
  }

  if ((state.target === 'github' || state.target === 'both') && state.hasGhCli) {
    ghCount = saveGitHubSecrets(state.values)
  }

  state.saved = true
  state.localEnv = getLocalEnv()
  state.ghSecrets = getGitHubSecrets()

  if (state.target === 'both') {
    state.message = `已保存 Local:${localCount} GitHub:${ghCount}`
  } else if (state.target === 'local') {
    state.message = `已保存到 .env.local (${localCount} 项)`
  } else {
    state.message = `已保存到 GitHub Secrets (${ghCount} 项)`
  }
  state.messageType = 'success'
}

function showListMode(): void {
  const localEnv = getLocalEnv()
  const ghSecrets = getGitHubSecrets()
  const hasGhCli = checkGhCli()

  console.log(`\n${ANSI.cyan}${ANSI.bold}配置状态${ANSI.reset}\n`)

  for (const field of FIELDS) {
    const hasLocal = localEnv.has(field.key)
    const hasGh = ghSecrets.has(field.key)
    const localStatus = hasLocal ? `${ANSI.green}✓${ANSI.reset}` : `${ANSI.dim}·${ANSI.reset}`
    const ghStatus = !hasGhCli ? `${ANSI.dim}?${ANSI.reset}` : hasGh ? `${ANSI.green}✓${ANSI.reset}` : `${ANSI.dim}·${ANSI.reset}`
    const reqMark = field.required ? `${ANSI.red}*${ANSI.reset}` : ' '
    console.log(`  ${reqMark}${field.key.padEnd(25)} L:${localStatus} G:${ghStatus}  ${ANSI.dim}${field.label}${ANSI.reset}`)
  }

  if (!hasGhCli) {
    console.log(`\n${ANSI.yellow}⚠ GitHub CLI 未登录${ANSI.reset}`)
  }
  console.log()
}

run().catch((err) => {
  process.stdout.write(ANSI.showCursor)
  console.error(`${ANSI.red}错误: ${err.message}${ANSI.reset}`)
  process.exit(1)
})
