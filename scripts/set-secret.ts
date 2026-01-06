#!/usr/bin/env bun
/**
 * 交互式配置管理工具
 *
 * 用法:
 *   pnpm set-secret              # 交互式选择要配置的项目
 *   pnpm set-secret --list       # 列出当前配置状态
 *
 * 支持配置:
 *   - E2E 测试账号（助记词、地址、安全密码）
 *   - DWEB 发布账号（SFTP 正式版/开发版）
 *
 * 配置目标:
 *   - 本地: .env.local
 *   - CI/CD: GitHub Secrets
 */

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { select, checkbox, input, password, confirm } from '@inquirer/prompts'

// ==================== 配置 ====================

const ROOT = process.cwd()
const ENV_LOCAL_PATH = join(ROOT, '.env.local')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
}

// ==================== 配置项定义 ====================

interface SecretDefinition {
  key: string
  description: string
  category: string
  required: boolean
  isPassword?: boolean
  validate?: (value: string) => string | true
}

const SECRET_DEFINITIONS: SecretDefinition[] = [
  // E2E 测试
  {
    key: 'E2E_TEST_MNEMONIC',
    description: '测试钱包助记词（24个词）',
    category: 'e2e',
    required: true,
    validate: (v) => {
      const words = v.split(/\s+/).filter(Boolean)
      if (words.length !== 24 && words.length !== 12) {
        return `助记词应为 12 或 24 个词，当前: ${words.length} 个`
      }
      return true
    },
  },
  {
    key: 'E2E_TEST_ADDRESS',
    description: '测试钱包地址（从助记词派生）',
    category: 'e2e',
    required: false,
  },
  {
    key: 'E2E_TEST_SECOND_SECRET',
    description: '安全密码/二次密钥（如果账号设置了 secondPublicKey）',
    category: 'e2e',
    required: false,
    isPassword: true,
  },

  // DWEB 发布 - 正式版
  {
    key: 'DWEB_SFTP_USER',
    description: 'SFTP 正式版用户名',
    category: 'dweb-stable',
    required: true,
  },
  {
    key: 'DWEB_SFTP_PASS',
    description: 'SFTP 正式版密码',
    category: 'dweb-stable',
    required: true,
    isPassword: true,
  },

  // DWEB 发布 - 开发版
  {
    key: 'DWEB_SFTP_USER_DEV',
    description: 'SFTP 开发版用户名',
    category: 'dweb-dev',
    required: true,
  },
  {
    key: 'DWEB_SFTP_PASS_DEV',
    description: 'SFTP 开发版密码',
    category: 'dweb-dev',
    required: true,
    isPassword: true,
  },

  // API Keys
  {
    key: 'TRONGRID_API_KEY',
    description: 'TronGrid API Key（支持逗号分隔多个，启动时随机选中一个）',
    category: 'api-keys',
    required: false,
    isPassword: true,
    validate: (v) => {
      if (!v) return true
      const keys = v.split(',').map(k => k.trim()).filter(Boolean)
      for (const key of keys) {
        if (!/^[a-f0-9-]{36}$/i.test(key)) {
          return `API Key 格式无效: ${key}（应为 UUID）`
        }
      }
      return true
    },
  },
  {
    key: 'ETHERSCAN_API_KEY',
    description: 'Etherscan API Key（支持逗号分隔多个，启动时随机选中一个）',
    category: 'api-keys',
    required: false,
    isPassword: true,
    validate: (v) => {
      if (!v) return true
      const keys = v.split(',').map(k => k.trim()).filter(Boolean)
      for (const key of keys) {
        if (!/^[A-Z0-9]{34}$/i.test(key)) {
          return `API Key 格式无效: ${key}（应为 34 位字母数字）`
        }
      }
      return true
    },
  },
]

interface CategoryDefinition {
  id: string
  name: string
  description: string
}

const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'e2e',
    name: 'E2E 测试',
    description: '端到端测试所需的测试钱包配置',
  },
  {
    id: 'dweb-stable',
    name: 'DWEB 正式版发布',
    description: 'SFTP 正式服务器账号（用于 pnpm release）',
  },
  {
    id: 'dweb-dev',
    name: 'DWEB 开发版发布',
    description: 'SFTP 开发服务器账号（用于日常 CI/CD）',
  },
  {
    id: 'api-keys',
    name: 'API Keys',
    description: '第三方 API 密钥（TronGrid 等）',
  },
]

// ==================== 工具函数 ====================

function exec(cmd: string, silent = false): string {
  try {
    return execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit',
    }).trim()
  } catch {
    return ''
  }
}

function checkGhCli(): boolean {
  try {
    execSync('gh --version', { stdio: 'pipe' })
    execSync('gh auth status', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

function getGitHubSecrets(): Map<string, string> {
  const secrets = new Map<string, string>()
  try {
    const output = execSync('gh secret list', { encoding: 'utf-8', stdio: 'pipe' })
    for (const line of output.split('\n')) {
      const [name, updatedAt] = line.split('\t')
      if (name) {
        secrets.set(name.trim(), updatedAt?.trim() || '')
      }
    }
  } catch {
    // gh cli not available or not authenticated
  }
  return secrets
}

function getLocalEnv(): Map<string, string> {
  const env = new Map<string, string>()
  if (!existsSync(ENV_LOCAL_PATH)) return env

  const content = readFileSync(ENV_LOCAL_PATH, 'utf-8')
  for (const line of content.split('\n')) {
    const match = line.match(/^([A-Z_]+)="(.*)"\s*$/)
    if (match) {
      env.set(match[1], match[2])
    }
  }
  return env
}

function updateLocalEnv(updates: Map<string, string>): void {
  let content = ''
  if (existsSync(ENV_LOCAL_PATH)) {
    content = readFileSync(ENV_LOCAL_PATH, 'utf-8')
  }

  for (const [key, value] of updates) {
    const regex = new RegExp(`^${key}=".*"\\s*$`, 'm')
    const newLine = `${key}="${value}"`

    if (regex.test(content)) {
      content = content.replace(regex, newLine)
    } else {
      content = content.trimEnd() + '\n' + newLine + '\n'
    }
  }

  writeFileSync(ENV_LOCAL_PATH, content)
}

async function setGitHubSecret(key: string, value: string): Promise<boolean> {
  try {
    execSync(`gh secret set ${key} --body "${value.replace(/"/g, '\\"')}"`, {
      cwd: ROOT,
      stdio: 'pipe',
    })
    return true
  } catch {
    return false
  }
}

// ==================== 地址派生 ====================

async function deriveAddress(mnemonic: string): Promise<string> {
  try {
    const { getBioforestCore, setGenesisBaseUrl } = await import('../src/services/bioforest-sdk/index.js')

    const genesisPath = `file://${join(ROOT, 'public/configs/genesis')}`
    setGenesisBaseUrl(genesisPath, { with: { type: 'json' } })

    const core = await getBioforestCore('bfmeta')
    const accountHelper = core.accountBaseHelper()
    return await accountHelper.getAddressFromSecret(mnemonic)
  } catch (error) {
    log.warn(`无法派生地址: ${error instanceof Error ? error.message : error}`)
    return ''
  }
}

// ==================== 状态显示 ====================

async function showStatus(): Promise<void> {
  console.log(`
${colors.cyan}╔════════════════════════════════════════╗
║        配置状态                        ║
╚════════════════════════════════════════╝${colors.reset}
`)

  const localEnv = getLocalEnv()
  const ghSecrets = getGitHubSecrets()
  const hasGhCli = checkGhCli()

  for (const category of CATEGORIES) {
    console.log(`\n${colors.blue}▸ ${category.name}${colors.reset} ${colors.dim}(${category.description})${colors.reset}`)

    const secrets = SECRET_DEFINITIONS.filter((s) => s.category === category.id)
    for (const secret of secrets) {
      const localValue = localEnv.get(secret.key)
      const ghValue = ghSecrets.get(secret.key)

      const localStatus = localValue
        ? `${colors.green}✓${colors.reset}`
        : `${colors.dim}✗${colors.reset}`

      const ghStatus = !hasGhCli
        ? `${colors.dim}?${colors.reset}`
        : ghValue
          ? `${colors.green}✓${colors.reset}`
          : `${colors.dim}✗${colors.reset}`

      console.log(
        `  ${secret.key.padEnd(25)} Local: ${localStatus}  GitHub: ${ghStatus}  ${colors.dim}${secret.description}${colors.reset}`,
      )
    }
  }

  if (!hasGhCli) {
    console.log(`\n${colors.yellow}⚠ GitHub CLI 未安装或未登录，无法显示 GitHub Secrets 状态${colors.reset}`)
    console.log(`  安装: brew install gh && gh auth login`)
  }

  console.log('')
}

// ==================== 配置流程 ====================

async function configureCategory(categoryId: string, target: 'local' | 'github' | 'both'): Promise<void> {
  const category = CATEGORIES.find((c) => c.id === categoryId)
  if (!category) return

  console.log(`\n${colors.cyan}▸ 配置 ${category.name}${colors.reset}\n`)

  const secrets = SECRET_DEFINITIONS.filter((s) => s.category === categoryId)
  const values = new Map<string, string>()

  for (const secret of secrets) {
    let value: string

    if (secret.isPassword) {
      value = await password({
        message: `${secret.description}:`,
      })
    } else {
      value = await input({
        message: `${secret.description}:`,
        validate: (v) => {
          if (secret.required && !v.trim()) {
            return '此项必填'
          }
          if (secret.validate) {
            return secret.validate(v)
          }
          return true
        },
      })
    }

    if (value) {
      values.set(secret.key, value)

      // 特殊处理：从助记词派生地址
      if (secret.key === 'E2E_TEST_MNEMONIC') {
        log.info('派生地址...')
        const address = await deriveAddress(value)
        if (address) {
          values.set('E2E_TEST_ADDRESS', address)
          log.success(`地址: ${address}`)
        }
      }
    }
  }

  // 保存到本地
  if (target === 'local' || target === 'both') {
    updateLocalEnv(values)
    log.success(`已更新 .env.local`)
  }

  // 保存到 GitHub
  if (target === 'github' || target === 'both') {
    if (!checkGhCli()) {
      log.error('GitHub CLI 未安装或未登录')
      log.info('安装: brew install gh && gh auth login')
      return
    }

    for (const [key, value] of values) {
      const ok = await setGitHubSecret(key, value)
      if (ok) {
        log.success(`GitHub Secret: ${key}`)
      } else {
        log.error(`GitHub Secret: ${key} 设置失败`)
      }
    }
  }
}

// ==================== 主程序 ====================

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  // 显示状态
  if (args.includes('--list') || args.includes('-l')) {
    await showStatus()
    return
  }

  console.log(`
${colors.cyan}╔════════════════════════════════════════╗
║        配置管理工具                    ║
╚════════════════════════════════════════╝${colors.reset}
`)

  // 选择要配置的类别
  const selectedCategories = await checkbox({
    message: '选择要配置的项目 (空格选中，回车确认):',
    choices: CATEGORIES.map((c) => ({
      value: c.id,
      name: `${c.name} - ${c.description}`,
    })),
    required: true,
  })

  // 选择配置目标
  const target = await select({
    message: '配置保存到:',
    choices: [
      { value: 'both' as const, name: '本地 + GitHub（推荐）' },
      { value: 'local' as const, name: '仅本地 (.env.local)' },
      { value: 'github' as const, name: '仅 GitHub Secrets' },
    ],
  })

  // 检查 GitHub CLI
  if ((target === 'github' || target === 'both') && !checkGhCli()) {
    log.error('GitHub CLI 未安装或未登录')
    log.info('安装: brew install gh && gh auth login')

    if (target === 'github') {
      return
    }

    const continueLocal = await confirm({
      message: '是否仅配置本地?',
      default: true,
    })

    if (!continueLocal) {
      return
    }
  }

  // 逐个配置
  for (const categoryId of selectedCategories) {
    await configureCategory(categoryId, target as 'local' | 'github' | 'both')
  }

  console.log(`\n${colors.green}✓ 配置完成!${colors.reset}\n`)

  // 显示最终状态
  await showStatus()
}

main().catch((error) => {
  log.error(`配置失败: ${error.message}`)
  process.exit(1)
})
