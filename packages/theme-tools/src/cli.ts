#!/usr/bin/env bun
/**
 * Theme Tools CLI
 * 
 * Usage:
 *   bunx @biochain/theme-tools           # Check current directory
 *   bunx @biochain/theme-tools --verbose # Show all checked files
 */

import { checkTheme } from './checker'
import type { Issue } from './types'

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
    root: process.cwd(),
    verbose: args.includes('--verbose'),
  }
}

function groupByFile(issues: Issue[]): Map<string, Issue[]> {
  const byFile = new Map<string, Issue[]>()
  for (const issue of issues) {
    if (!byFile.has(issue.file)) {
      byFile.set(issue.file, [])
    }
    byFile.get(issue.file)!.push(issue)
  }
  return byFile
}

function main() {
  const args = process.argv.slice(2)
  const options = parseArgs(args)

  console.log(`
${colors.cyan}╔════════════════════════════════════════╗
║     Theme (Dark Mode) Check            ║
╚════════════════════════════════════════╝${colors.reset}
`)

  const result = checkTheme(options)

  log.info(`Checked ${result.filesChecked} files`)

  if (result.errors.length === 0 && result.warnings.length === 0) {
    log.success('No theme issues found!')
    console.log(`\n${colors.green}✓ All files follow dark mode best practices${colors.reset}\n`)
    process.exit(0)
  }

  const allIssues = [...result.errors, ...result.warnings]
  const byFile = groupByFile(allIssues)

  for (const [file, issues] of byFile) {
    console.log(`\n${colors.bold}${file}${colors.reset}`)
    for (const issue of issues) {
      const icon = issue.severity === 'error' ? colors.red + '✗' : colors.yellow + '⚠'
      console.log(`  ${icon}${colors.reset} Line ${issue.line}: ${issue.message}`)
      if (issue.suggestion) {
        log.dim(`    → ${issue.suggestion}`)
      }
    }
  }

  console.log(`
${colors.bold}Summary:${colors.reset}
  ${colors.red}Errors: ${result.errors.length}${colors.reset}
  ${colors.yellow}Warnings: ${result.warnings.length}${colors.reset}
`)

  if (!result.success) {
    process.exit(1)
  }

  log.success('No blocking errors (warnings can be addressed later)')
}

main()
