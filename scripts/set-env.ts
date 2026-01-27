#!/usr/bin/env bun

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const ENV_LOCAL_PATH = join(ROOT, '.env.local')
const REGISTRY_PATH = join(ROOT, 'scripts', 'env-registry.json')

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

type MaskMode = 'none' | 'tail' | 'head' | 'head-tail' | 'hidden'

type FieldType = 'string' | 'password' | 'url' | 'number'

interface EnvField {
  key: string
  label: string
  type?: FieldType
  required?: boolean
  targets?: {
    local?: boolean
    github?: 'secret' | 'variable'
  }
  mask?: MaskMode
  description?: string
}

interface EnvRegistry {
  schemaVersion: number
  fields: EnvField[]
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
  ghVariables: Set<string>
  hasGhCli: boolean
  target: 'local' | 'github' | 'both'
  saved: boolean
}

function validateMnemonic(v: string): string | null {
  if (!v) return null
  const words = v.split(/\s+/).filter(Boolean)
  if (words.length !== 12 && words.length !== 24) {
    return `需要 12 或 24 个词，当前 ${words.length} 个`
  }
  return null
}

const CUSTOM_VALIDATORS: Record<string, (value: string) => string | null> = {
  E2E_TEST_MNEMONIC: validateMnemonic,
}

function readRegistry(): EnvRegistry {
  if (!existsSync(REGISTRY_PATH)) {
    throw new Error(`缺少配置文件: ${REGISTRY_PATH}`)
  }
  const raw = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8')) as unknown
  if (!raw || typeof raw !== 'object') throw new Error('配置文件格式错误')
  const registry = raw as EnvRegistry
  if (!Array.isArray(registry.fields)) throw new Error('配置字段缺失')
  return registry
}

const REGISTRY = readRegistry()
const FIELDS = REGISTRY.fields

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

function getGitHubVariables(): Set<string> {
  const vars = new Set<string>()
  try {
    const output = execSync('gh variable list', { encoding: 'utf-8', stdio: 'pipe' })
    for (const line of output.split('\n')) {
      const name = line.split('\t')[0]?.trim()
      if (name) vars.add(name)
    }
  } catch {}
  return vars
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

function saveLocalEnv(values: Map<string, string>, fields: EnvField[]): void {
  let content = existsSync(ENV_LOCAL_PATH) ? readFileSync(ENV_LOCAL_PATH, 'utf-8') : ''
  for (const field of fields) {
    if (!field.targets?.local) continue
    const value = values.get(field.key)
    if (!value) continue
    const regex = new RegExp(`^${field.key}=".*"$`, 'm')
    const newLine = `${field.key}="${value}"`
    if (regex.test(content)) {
      content = content.replace(regex, newLine)
    } else {
      content = content.trimEnd() + '\n' + newLine + '\n'
    }
  }
  writeFileSync(ENV_LOCAL_PATH, content)
}

function saveGitHub(values: Map<string, string>, fields: EnvField[]): number {
  let count = 0
  for (const field of fields) {
    const target = field.targets?.github
    if (!target) continue
    const value = values.get(field.key)
    if (!value) continue
    try {
      const cmd = target === 'secret' ? `gh secret set ${field.key}` : `gh variable set ${field.key}`
      execSync(cmd, { input: value, stdio: ['pipe', 'pipe', 'pipe'] })
      count++
    } catch {}
  }
  return count
}

function maskValue(value: string, field: EnvField): string {
  if (!value) return ''
  const mask = field.mask ?? (field.type === 'password' ? 'hidden' : 'tail')
  if (mask === 'none') return value
  if (mask === 'hidden') return '•'.repeat(Math.min(value.length, 16))
  if (value.length <= 6) return value
  if (mask === 'tail') return `${'*'.repeat(Math.min(value.length - 4, 12))}${value.slice(-4)}`
  if (mask === 'head') return `${value.slice(0, 4)}${'*'.repeat(Math.min(value.length - 4, 12))}`
  if (mask === 'head-tail') {
    const head = value.slice(0, 3)
    const tail = value.slice(-3)
    return `${head}${'*'.repeat(Math.min(value.length - 6, 12))}${tail}`
  }
  return value
}

function validateFieldValue(field: EnvField, value: string): string | null {
  if (!value) return null
  if (field.type === 'url') {
    try {
      new URL(value)
    } catch {
      return 'URL 格式不正确'
    }
  }
  if (field.type === 'number') {
    if (!Number.isFinite(Number(value))) return '需要数字格式'
  }
  const custom = CUSTOM_VALIDATORS[field.key]
  return custom ? custom(value) : null
}

function render(state: State): void {
  const { cols } = getTermSize()
  const width = Math.min(cols - 4, 80)
  let out = ANSI.home + ANSI.hideCursor

  const title = ' KeyApp 环境配置 '
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
    const hasGh = state.ghSecrets.has(field.key) || state.ghVariables.has(field.key)

    const prefix = isSelected ? `${ANSI.cyan}▸${ANSI.reset}` : ' '
    const labelWidth = 30
    const label = field.label.padEnd(labelWidth).slice(0, labelWidth)

    let displayValue: string
    if (state.editing && isSelected) {
      const buf = field.type === 'password' ? '•'.repeat(state.editBuffer.length) : state.editBuffer
      displayValue = `[${buf}█]`
    } else {
      const masked = maskValue(value, field)
      displayValue = value ? `[${masked}]` : `[${ANSI.dim}空${ANSI.reset}]`
    }

    const localStatus = field.targets?.local ? (hasLocal || value ? `${ANSI.green}L${ANSI.reset}` : `${ANSI.dim}·${ANSI.reset}`) : `${ANSI.dim}-${ANSI.reset}`
    const ghAvailable = field.targets?.github ? true : false
    const ghStatus = !ghAvailable
      ? `${ANSI.dim}-${ANSI.reset}`
      : !state.hasGhCli
        ? `${ANSI.dim}?${ANSI.reset}`
        : hasGh || value
          ? `${ANSI.green}G${ANSI.reset}`
          : `${ANSI.dim}·${ANSI.reset}`
    const reqMark = field.required ? `${ANSI.red}*${ANSI.reset}` : ' '

    const lineContent = `${prefix} ${reqMark}${label} ${displayValue} ${localStatus}${ghStatus}`
    const lineLen = 3 + 1 + labelWidth + 1 + Bun.stringWidth(displayValue.replace(/\x1b\[[0-9;]*m/g, '')) + 3
    const pad = Math.max(0, width - lineLen)
    out += `${ANSI.cyan}│${ANSI.reset}${lineContent}${' '.repeat(pad)}${ANSI.cyan}│${ANSI.reset}\n`
  }

  out += `${ANSI.cyan}├${'─'.repeat(width)}┤${ANSI.reset}\n`

  const selected = FIELDS[state.cursor]
  const desc = selected?.description
  const msgColor = state.messageType === 'error' ? ANSI.red : state.messageType === 'success' ? ANSI.green : ANSI.dim
  const msgText = state.message || desc || '↑↓ 移动  Enter 编辑  K 保留  D 清空  S 保存  P 推送  T 切换目标  Q 退出'
  const msgLen = Bun.stringWidth(msgText.replace(/\x1b\[[0-9;]*m/g, ''))
  out += `${ANSI.cyan}│${ANSI.reset} ${msgColor}${msgText}${ANSI.reset}${' '.repeat(Math.max(0, width - msgLen - 2))}${ANSI.cyan}│${ANSI.reset}\n`
  out += `${ANSI.cyan}└${'─'.repeat(width)}┘${ANSI.reset}\n`

  process.stdout.write(out)
}

function resetMessage(state: State): void {
  state.message = ''
  state.messageType = 'info'
}

function validateRequired(fields: EnvField[], values: Map<string, string>, target: 'local' | 'github' | 'both'): string | null {
  for (const field of fields) {
    if (!field.required) continue
    if (target === 'local' || target === 'both') {
      if (field.targets?.local && !values.get(field.key)) return `缺少必填项: ${field.label}`
    }
    if (target === 'github' || target === 'both') {
      if (field.targets?.github && !values.get(field.key)) return `缺少必填项: ${field.label}`
    }
  }
  return null
}

function applyValidation(field: EnvField, value: string): string | null {
  const error = validateFieldValue(field, value)
  return error
}

async function run(): Promise<void> {
  const localEnv = getLocalEnv()
  const hasGhCli = checkGhCli()
  const ghSecrets = hasGhCli ? getGitHubSecrets() : new Set<string>()
  const ghVariables = hasGhCli ? getGitHubVariables() : new Set<string>()

  const values = new Map<string, string>()
  for (const field of FIELDS) {
    const local = localEnv.get(field.key)
    if (local) values.set(field.key, local)
  }

  const state: State = {
    cursor: 0,
    values,
    editing: false,
    editBuffer: '',
    editCursor: 0,
    message: '',
    messageType: 'info',
    localEnv,
    ghSecrets,
    ghVariables,
    hasGhCli,
    target: 'both',
    saved: false,
  }

  process.stdout.write(ANSI.clear + ANSI.home)
  render(state)

  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.setEncoding('utf8')

  process.stdin.on('data', (key: string) => {
    const currentField = FIELDS[state.cursor]

    if (state.editing) {
      if (key === '\r') {
        const error = applyValidation(currentField, state.editBuffer)
        if (error) {
          state.message = error
          state.messageType = 'error'
          render(state)
          return
        }
        state.values.set(currentField.key, state.editBuffer)
        state.editing = false
        resetMessage(state)
        render(state)
        return
      }
      if (key === '\u0003' || key === '\u001b') {
        state.editing = false
        resetMessage(state)
        render(state)
        return
      }
      if (key === '\u007f') {
        state.editBuffer = state.editBuffer.slice(0, -1)
        render(state)
        return
      }
      state.editBuffer += key
      render(state)
      return
    }

    if (key === '\u0003' || key === 'q' || key === 'Q') {
      process.stdout.write(ANSI.showCursor)
      process.exit(0)
    }

    if (key === '\u001b[A') {
      state.cursor = (state.cursor - 1 + FIELDS.length) % FIELDS.length
      resetMessage(state)
      render(state)
      return
    }

    if (key === '\u001b[B') {
      state.cursor = (state.cursor + 1) % FIELDS.length
      resetMessage(state)
      render(state)
      return
    }

    if (key === '\r') {
      state.editing = true
      state.editBuffer = state.values.get(currentField.key) || ''
      state.editCursor = state.editBuffer.length
      resetMessage(state)
      render(state)
      return
    }

    if (key === 'd' || key === 'D') {
      state.values.delete(currentField.key)
      state.message = `已清空 ${currentField.label}`
      state.messageType = 'success'
      render(state)
      return
    }

    if (key === 'k' || key === 'K') {
      resetMessage(state)
      render(state)
      return
    }

    if (key === 't' || key === 'T') {
      state.target = state.target === 'both' ? 'local' : state.target === 'local' ? 'github' : 'both'
      state.message = `目标切换为 ${state.target}`
      state.messageType = 'info'
      render(state)
      return
    }

    if (key === 's' || key === 'S') {
      const requiredError = validateRequired(FIELDS, state.values, state.target)
      if (requiredError) {
        state.message = requiredError
        state.messageType = 'error'
        render(state)
        return
      }

      let savedCount = 0
      if (state.target === 'local' || state.target === 'both') {
        saveLocalEnv(state.values, FIELDS)
        savedCount++
      }
      if ((state.target === 'github' || state.target === 'both') && state.hasGhCli) {
        savedCount += saveGitHub(state.values, FIELDS)
      }

      state.message = savedCount > 0 ? '已保存' : '未执行保存（检查 gh 或目标）'
      state.messageType = savedCount > 0 ? 'success' : 'error'
      state.saved = savedCount > 0
      render(state)
      return
    }

    if (key === 'p' || key === 'P') {
      if (!state.hasGhCli) {
        state.message = '未检测到 gh CLI'
        state.messageType = 'error'
        render(state)
        return
      }
      const requiredError = validateRequired(FIELDS, state.values, 'github')
      if (requiredError) {
        state.message = requiredError
        state.messageType = 'error'
        render(state)
        return
      }
      const pushed = saveGitHub(state.values, FIELDS)
      state.message = pushed > 0 ? `已推送 ${pushed} 项到 GitHub` : '没有需要推送的字段'
      state.messageType = pushed > 0 ? 'success' : 'info'
      render(state)
      return
    }
  })
}

run().catch((error) => {
  console.error(`${ANSI.red}错误: ${error.message}${ANSI.reset}`)
  process.exit(1)
})
