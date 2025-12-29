#!/usr/bin/env bun
/**
 * i18n-check CLI
 * 
 * Usage:
 *   bun packages/i18n-tools/src/cli.ts              # Check current directory
 *   bun packages/i18n-tools/src/cli.ts --fix        # Auto-fix missing keys
 *   bun packages/i18n-tools/src/cli.ts --i18n-dir src/i18n
 */

import { resolve } from 'node:path'
import { checkI18n } from './checker'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
}

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
}

function parseArgs(args: string[]) {
  const options = {
    root: process.cwd(),
    fix: false,
    i18nDir: 'src/i18n',
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--fix') {
      options.fix = true
    } else if (arg === '--i18n-dir' && args[i + 1]) {
      options.i18nDir = args[++i]
    } else if (arg === '--root' && args[i + 1]) {
      options.root = resolve(args[++i])
    }
  }

  return options
}

function main() {
  const args = process.argv.slice(2)
  const options = parseArgs(args)

  console.log('\n📦 i18n Check\n')
  console.log('Fallback rules:')
  console.log('  • zh-CN, zh-TW, zh-HK → zh')
  console.log('  • other languages → en\n')

  const result = checkI18n(options)

  for (const error of result.errors) {
    log.error(error)
  }

  for (const warning of result.warnings) {
    log.warn(warning)
  }

  for (const fix of result.fixes) {
    log.success(fix)
  }

  console.log('\n' + '─'.repeat(40))

  if (result.success) {
    log.success('All i18n checks passed!')
    process.exit(0)
  } else {
    log.error('i18n check failed')
    if (!options.fix) {
      log.info('Run with --fix to add missing keys')
    }
    process.exit(1)
  }
}

main()
