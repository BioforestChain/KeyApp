import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import type { CheckOptions, CheckResult, Issue } from './types'
import { allRules } from './rules'

const DEFAULT_SKIP_PATTERNS = [
  '/node_modules/',
  '/.git/',
  '/dist/',
  '/coverage/',
  '/__tests__/',
  '.stories.',
  '.test.',
]

function shouldSkipFile(filePath: string, patterns: string[]): boolean {
  return patterns.some(pattern => filePath.includes(pattern))
}

function getAllFiles(dir: string, patterns: string[], files: string[] = []): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return files
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    if (shouldSkipFile(fullPath, patterns)) continue

    let stat
    try {
      stat = statSync(fullPath)
    } catch {
      continue
    }
    
    if (stat.isDirectory()) {
      getAllFiles(fullPath, patterns, files)
    } else if (entry.endsWith('.tsx') || entry.endsWith('.jsx')) {
      files.push(fullPath)
    }
  }

  return files
}

export function checkTheme(options: CheckOptions): CheckResult {
  const { root, srcDir = 'src', skipPatterns = DEFAULT_SKIP_PATTERNS } = options
  const srcPath = join(root, srcDir)
  
  const files = getAllFiles(srcPath, skipPatterns)
  const allIssues: Issue[] = []

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const relPath = relative(root, file)

    for (const rule of allRules) {
      allIssues.push(...rule(content, relPath))
    }
  }

  const errors = allIssues.filter(i => i.severity === 'error')
  const warnings = allIssues.filter(i => i.severity === 'warning')

  return {
    success: errors.length === 0,
    errors,
    warnings,
    filesChecked: files.length,
  }
}
