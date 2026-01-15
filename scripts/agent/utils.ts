/**
 * Agent 工具共享模块
 */

import { resolve, sep } from 'node:path'

export const ROOT = resolve(import.meta.dirname, '../..')
export const WHITE_BOOK_DIR = resolve(ROOT, 'docs/white-book')
export const WORKTREE_DIR = (() => {
  const marker = `${sep}.git-worktree${sep}`
  if (ROOT.includes(marker)) {
    const base = ROOT.split(marker)[0]
    return resolve(base, '.git-worktree')
  }
  return resolve(ROOT, '.git-worktree')
})()
export const BEST_PRACTICES_FILE = resolve(WHITE_BOOK_DIR, '00-必读', 'best-practices.md')

export const PROJECT_NUMBER = 5
export const PROJECT_OWNER = 'BioforestChain'
export const PROJECT_ID = 'PVT_kwDOBJVmF84BLGhY'

// Release 字段 ID 和选项
export const RELEASE_FIELD_ID = 'PVTSSF_lADOBJVmF84BLGhYzg6xpp8'
export const RELEASE_OPTIONS: Record<string, string> = {
  V1: '9359aa58',
  V2: '6a3e495d',
  V3: '7e413227',
  DRAFT: 'd75e4b65',
}

// 版本别名
export const RELEASE_ALIASES: Record<string, string> = {
  CURRENT: 'V1',
  NEXT: 'V2',
}

export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

export const log = {
  title: (_msg: string) => console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`),
  section: (msg: string) => console.log(`\n${colors.bold}${colors.green}## ${msg}${colors.reset}\n`),
  subsection: (msg: string) => console.log(`\n${colors.yellow}### ${msg}${colors.reset}\n`),
  info: (msg: string) => console.log(`${colors.dim}${msg}${colors.reset}`),
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
}

export function resolveRelease(input: string): string {
  const upper = input.toUpperCase()
  return RELEASE_ALIASES[upper] || upper
}
