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
  info: (msg: string) => {},
  success: (msg: string) => {},
  warn: (msg: string) => {},
  error: (msg: string) => {},
  dim: (msg: string) => {},
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
  

  log.info(`Scanned: ${result.root}`)
  log.info(`Specs: ${result.specsScanned} files, ${result.screenshotsReferenced} screenshots referenced`)
  log.info(`On disk: ${result.screenshotsOnDisk} screenshot files`)

  if (result.orphaned.length === 0) {
    
    log.success('No orphaned screenshots found!')
    
    return
  }

  
  log.error(`Found ${result.orphaned.length} orphaned screenshots:`)

  const grouped = groupBySpecDir(result.orphaned)
  for (const [_dir, items] of grouped) {
    
    for (const _item of items) {
      
    }
  }

  
}

function printHelp() {
  
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
    
    process.exit(1)
  }
}

main()
