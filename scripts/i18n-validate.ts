#!/usr/bin/env bun
/**
 * i18n Validation Script (for CI)
 *
 * Runs all i18n checks:
 * 1. Translation completeness check (all locales have same keys)
 * 2. Hardcoded string detection (via oxlint + eslint-plugin-i18next)
 *
 * Usage:
 *   pnpm i18n:validate           # Run all checks
 *   pnpm i18n:validate --strict  # Fail on any hardcoded strings
 */

import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')

// ==================== Colors ====================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

// ==================== Main ====================

async function main() {
  const args = process.argv.slice(2)
  const strict = args.includes('--strict')

  console.log(`
${colors.cyan}╔════════════════════════════════════════╗
║     i18n Validation (CI)               ║
╚════════════════════════════════════════╝${colors.reset}
`)

  let hasErrors = false

  // Step 1: Translation completeness check
  log.step('Checking translation completeness...')

  const checkResult = spawnSync('bun', ['scripts/i18n-check.ts'], {
    cwd: ROOT,
    stdio: 'pipe',
    encoding: 'utf-8',
  })

  if (checkResult.status !== 0) {
    log.error('Translation completeness check failed')
    // Print summary only
    const output = checkResult.stdout + checkResult.stderr
    const summaryMatch = output.match(/Found issues:[\s\S]*?Extra: \d+ keys/)
    if (summaryMatch) {
      console.log(summaryMatch[0])
    }
    hasErrors = true
  } else {
    log.success('All translations are complete')
  }

  // Step 2: Hardcoded string detection
  log.step('Checking for hardcoded strings in JSX...')

  const lintResult = spawnSync('oxlint', ['src/'], {
    cwd: ROOT,
    stdio: 'pipe',
    encoding: 'utf-8',
  })

  const lintOutput = lintResult.stdout + lintResult.stderr
  const i18nWarnings = (lintOutput.match(/i18next\(no-literal-string\)/g) || []).length

  if (i18nWarnings > 0) {
    log.warn(`Found ${i18nWarnings} hardcoded strings in JSX`)

    if (strict) {
      log.error('Strict mode: failing due to hardcoded strings')
      hasErrors = true
    } else {
      log.info('Run `pnpm lint` to see details')
    }
  } else {
    log.success('No hardcoded strings detected')
  }

  // Summary
  log.step('Summary')

  if (hasErrors) {
    console.log(`
${colors.red}✗ i18n validation failed${colors.reset}

Fixes:
  - Run ${colors.cyan}pnpm i18n:check --fix${colors.reset} to add missing translation keys
  - Check ${colors.cyan}pnpm lint${colors.reset} output for hardcoded strings
`)
    process.exit(1)
  }

  console.log(`
${colors.green}✓ i18n validation passed${colors.reset}
  - Translation completeness: ${colors.green}OK${colors.reset}
  - Hardcoded strings: ${i18nWarnings > 0 ? `${colors.yellow}${i18nWarnings} warnings${colors.reset}` : `${colors.green}OK${colors.reset}`}
`)
}

main().catch((error) => {
  log.error(`Validation failed: ${error.message}`)
  process.exit(1)
})
