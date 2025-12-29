#!/usr/bin/env bun
/**
 * E2E Tools CLI
 *
 * Usage:
 *   bunx @biochain/e2e-tools audit           # 审计当前目录
 *   bunx @biochain/e2e-tools audit --strict  # 有残留则 exit 1
 *   bunx @biochain/e2e-tools audit --fix     # 删除残留文件
 *   bunx @biochain/e2e-tools audit --verbose # 显示详细信息
 */

import { audit, removeOrphaned } from './auditor'
import type { AuditResult, OrphanedScreenshot } from './types'

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
}

const log = {
  info: (msg: string) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  dim: (msg: string) => console.log(`${colors.dim}  ${msg}${colors.reset}`),
}

function parseArgs(args: string[]) {
  return {
    command: args[0] || 'audit',
    strict: args.includes('--strict'),
    verbose: args.includes('--verbose'),
    fix: args.includes('--fix'),
  }
}

function groupBySpecDir(orphaned: OrphanedScreenshot[]): Map<string, OrphanedScreenshot[]> {
  const grouped = new Map<string, OrphanedScreenshot[]>()
  for (const o of orphaned) {
    const key = `${o.browser}/${o.specDir}`
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(o)
  }
  return grouped
}

function printResult(result: AuditResult, verbose: boolean) {
  console.log(`
${colors.cyan}╔════════════════════════════════════════╗
║     E2E Screenshot Audit               ║
╚════════════════════════════════════════╝${colors.reset}
`)

  log.info(`Scanned: ${result.root}`)
  log.info(`Specs: ${result.specsScanned} files, ${result.screenshotsReferenced} screenshots referenced`)
  log.info(`On disk: ${result.screenshotsOnDisk} screenshot files`)

  if (result.orphaned.length === 0) {
    console.log('')
    log.success('No orphaned screenshots found!')
    console.log(`\n${colors.green}✓ All screenshots are referenced in tests${colors.reset}\n`)
    return
  }

  console.log('')
  log.error(`Found ${result.orphaned.length} orphaned screenshots:`)

  const grouped = groupBySpecDir(result.orphaned)
  for (const [dir, items] of grouped) {
    console.log(`\n  ${colors.bold}${dir}/${colors.reset}`)
    for (const item of items) {
      console.log(`    ${colors.yellow}•${colors.reset} ${item.name}`)
    }
  }

  console.log(`
${colors.bold}Summary:${colors.reset}
  ${colors.yellow}Orphaned: ${result.orphaned.length}${colors.reset}
  ${colors.dim}These screenshots are not referenced by any test${colors.reset}
`)
}

function printHelp() {
  console.log(`
${colors.cyan}E2E Tools${colors.reset} - Screenshot audit utility

${colors.bold}Usage:${colors.reset}
  bunx @biochain/e2e-tools audit [options]

${colors.bold}Options:${colors.reset}
  --strict   Exit with code 1 if orphaned screenshots found
  --fix      Remove orphaned screenshot files
  --verbose  Show detailed information

${colors.bold}Examples:${colors.reset}
  bunx @biochain/e2e-tools audit
  bunx @biochain/e2e-tools audit --strict
  bunx @biochain/e2e-tools audit --fix
`)
}

async function main() {
  const args = process.argv.slice(2)
  const options = parseArgs(args)

  if (args.includes('--help') || args.includes('-h')) {
    printHelp()
    process.exit(0)
  }

  if (options.command !== 'audit') {
    log.error(`Unknown command: ${options.command}`)
    printHelp()
    process.exit(1)
  }

  const result = audit({
    root: process.cwd(),
    strict: options.strict,
    verbose: options.verbose,
    fix: options.fix,
  })

  if (result.specsScanned === 0) {
    log.warn('No e2e/ directory found in current path')
    process.exit(0)
  }

  printResult(result, options.verbose)

  if (options.fix && result.orphaned.length > 0) {
    const removed = removeOrphaned(result.root, result.orphaned)
    log.success(`Removed ${removed} orphaned screenshots`)
  }

  if (!result.success) {
    console.log(`${colors.dim}Run with --fix to remove orphaned files${colors.reset}\n`)
    process.exit(1)
  }
}

main()
