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
  info: (msg: string) => {},
  success: (msg: string) => {},
  warn: (msg: string) => {},
  error: (msg: string) => {},
  dim: (msg: string) => {},
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

  

  const result = checkTheme(options)

  log.info(`Checked ${result.filesChecked} files`)

  if (result.errors.length === 0 && result.warnings.length === 0) {
    log.success('No theme issues found!')
    
    process.exit(0)
  }

  const allIssues = [...result.errors, ...result.warnings]
  const byFile = groupByFile(allIssues)

  for (const [_file, issues] of byFile) {
    
    for (const issue of issues) {
      const icon = issue.severity === 'error' ? colors.red + '✗' : colors.yellow + '⚠'
      
      if (issue.suggestion) {
        log.dim(`    → ${issue.suggestion}`)
      }
    }
  }

  

  if (!result.success) {
    process.exit(1)
  }

  log.success('No blocking errors (warnings can be addressed later)')
}

main()
