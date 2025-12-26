#!/usr/bin/env bun
/**
 * Theme (Dark Mode) Lint Script
 *
 * Validates that components follow the dark mode best practices:
 * 1. Color pairs must be used together (bg-xxx with text-xxx-foreground)
 * 2. Hardcoded colors should have dark: variants
 * 3. Don't use background colors as text colors
 *
 * Usage:
 *   pnpm theme:check          # Check for theme issues
 *   pnpm theme:check --fix    # Auto-fix some issues (experimental)
 *   pnpm theme:check --verbose # Show all checked files
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, relative } from 'node:path'

// ==================== Configuration ====================

const ROOT = resolve(import.meta.dirname, '..')
const SRC_DIR = join(ROOT, 'src')

// Files/directories to skip
const SKIP_PATTERNS = [
  '/node_modules/',
  '/.git/',  // Note: /.git/ not .git to avoid matching .git-worktree
  '/dist/',
  '/coverage/',
  '/__tests__/',
  '.stories.',
  '.test.',
  '/mock-devtools/', // Dev tools can have looser rules
]

// Contexts where hardcoded colors are acceptable
const ACCEPTABLE_CONTEXTS = [
  'bg-black', // Scanner/camera overlay
  'bg-white/20', // Semi-transparent on gradient backgrounds
  'bg-white/10',
  'bg-white/30',
  'text-white/80', // Semi-transparent white on colored backgrounds
  'text-white/50',
  'bg-gradient-', // Gradient backgrounds
]

// Backgrounds that allow text-white (these don't change much in dark mode)
const ALLOWS_TEXT_WHITE = [
  'bg-gradient-',
  'bg-green-',
  'bg-red-',
  'bg-blue-',
  'bg-orange-',
  'bg-black',
]

// ==================== Colors ====================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
}

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`\n${colors.cyan}▸${colors.reset} ${colors.cyan}${msg}${colors.reset}`),
  dim: (msg: string) => console.log(`${colors.dim}  ${msg}${colors.reset}`),
}

// ==================== Types ====================

interface Issue {
  file: string
  line: number
  column: number
  rule: string
  message: string
  severity: 'error' | 'warning'
  suggestion?: string
}

// ==================== Rules ====================

/**
 * Rule 1: Don't use background color tokens as text colors
 * e.g., text-secondary, text-accent (these are background colors)
 */
function checkBackgroundAsText(content: string, file: string): Issue[] {
  const issues: Issue[] = []
  const lines = content.split('\n')

  // Background color tokens that should NOT be used with text-
  const bgOnlyTokens = ['secondary', 'accent', 'muted', 'card', 'popover', 'sidebar']

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    for (const token of bgOnlyTokens) {
      // Match text-{token} but NOT text-{token}-foreground
      const regex = new RegExp(`text-${token}(?!-foreground)\\b`, 'g')
      let match: RegExpExecArray | null

      while ((match = regex.exec(line)) !== null) {
        issues.push({
          file,
          line: i + 1,
          column: match.index + 1,
          rule: 'no-bg-as-text',
          message: `'text-${token}' uses a background color as text color`,
          severity: 'error',
          suggestion: token === 'secondary' || token === 'muted'
            ? `Use 'text-muted-foreground' for secondary text, or 'bg-${token} text-${token}-foreground' for buttons`
            : `Use 'text-${token}-foreground' with 'bg-${token}' background`,
        })
      }
    }
  }

  return issues
}

/**
 * Rule 2: Foreground colors (except muted-foreground) should have matching background
 * Note: text-muted-foreground can be used standalone for secondary text
 * Skip peer/group conditional styles as they pair with conditional backgrounds
 */
function checkOrphanForeground(content: string, file: string): Issue[] {
  const issues: Issue[] = []
  const lines = content.split('\n')

  // These foreground colors need their background pair
  // Note: muted-foreground is excluded - it's designed for standalone use
  const foregroundTokens = ['primary', 'secondary', 'destructive', 'accent', 'card', 'popover']

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    for (const token of foregroundTokens) {
      // Look for text-{token}-foreground (including variants like /70)
      const fgMatch = line.match(new RegExp(`text-${token}-foreground`))
      if (!fgMatch) continue
      
      // Skip conditional foreground styles (peer-*, group-*, data-*)
      // These pair with conditional bg-* styles
      if (new RegExp(`(peer-|group-|data-)\\S*text-${token}-foreground`).test(line)) {
        continue
      }

      // Check if the same line or nearby context has bg-{token}
      // Expand context to 5 lines before and after
      const context = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 6)).join(' ')

      // Check for bg-{token} including conditional variants
      const hasBgToken = new RegExp(`bg-${token}|peer-\\S*:bg-${token}|data-\\S*:bg-${token}|group-\\S*:bg-${token}`).test(context)
      
      if (!hasBgToken) {
        issues.push({
          file,
          line: i + 1,
          column: fgMatch.index! + 1,
          rule: 'orphan-foreground',
          message: `'text-${token}-foreground' without visible 'bg-${token}' - verify background is set`,
          severity: 'warning',
          suggestion: `Ensure 'bg-${token}' is set on this element or a parent`,
        })
      }
    }
  }

  return issues
}

/**
 * Rule 3: Hardcoded gray colors should have dark: variants
 * e.g., bg-gray-100 should have dark:bg-gray-800
 */
function checkMissingDarkVariant(content: string, file: string): Issue[] {
  const issues: Issue[] = []
  const lines = content.split('\n')

  // Patterns that need dark: variants
  const needsDarkVariant = [
    { pattern: /\bbg-gray-(\d+)\b/g, type: 'bg' },
    { pattern: /\bbg-slate-(\d+)\b/g, type: 'bg' },
    { pattern: /\bbg-zinc-(\d+)\b/g, type: 'bg' },
    { pattern: /\btext-gray-(\d+)\b/g, type: 'text' },
    { pattern: /\bborder-gray-(\d+)\b/g, type: 'border' },
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    for (const { pattern, type } of needsDarkVariant) {
      let match: RegExpExecArray | null
      const patternCopy = new RegExp(pattern.source, pattern.flags)

      while ((match = patternCopy.exec(line)) !== null) {
        const fullMatch = match[0]
        const shade = match[1]

        // Skip if acceptable context
        if (ACCEPTABLE_CONTEXTS.some((ctx) => line.includes(ctx))) {
          continue
        }

        // Check if there's a dark: variant for this class
        const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2)).join(' ')
        const darkPattern = new RegExp(`dark:${type}-(?:gray|slate|zinc)-\\d+`)

        if (!darkPattern.test(context)) {
          issues.push({
            file,
            line: i + 1,
            column: match.index + 1,
            rule: 'missing-dark-variant',
            message: `'${fullMatch}' should have a dark: variant`,
            severity: 'warning',
            suggestion: `Add 'dark:${type}-gray-${invertShade(shade)}' or use semantic colors like 'bg-muted'`,
          })
        }
      }
    }
  }

  return issues
}

/**
 * Rule 4: bg-primary/destructive should use text-xxx-foreground, not text-white
 * In dark mode, primary-foreground changes to dark color while text-white stays white
 */
function checkTextWhiteOnSemanticBg(content: string, file: string): Issue[] {
  const issues: Issue[] = []
  const lines = content.split('\n')

  // Semantic backgrounds that need their foreground pair, not text-white
  const semanticBgs = ['primary', 'destructive', 'secondary']

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if line has text-white
    if (!line.includes('text-white')) continue
    
    // Skip if text-white is with acceptable backgrounds
    if (ALLOWS_TEXT_WHITE.some((bg) => line.includes(bg))) continue

    // Check if this line or nearby context has a semantic background
    const context = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join(' ')

    for (const bg of semanticBgs) {
      if (context.includes(`bg-${bg}`) && !context.includes(`text-${bg}-foreground`)) {
        issues.push({
          file,
          line: i + 1,
          column: line.indexOf('text-white') + 1,
          rule: 'text-white-on-semantic-bg',
          message: `'text-white' with 'bg-${bg}' - use 'text-${bg}-foreground' instead`,
          severity: 'error',
          suggestion: `Replace 'text-white' with 'text-${bg}-foreground' for proper dark mode support`,
        })
        break // Only report once per line
      }
    }
  }

  return issues
}

/**
 * Rule 5: bg-muted without text color may be invisible in dark mode
 * Only warn if the element seems to have direct text content
 */
function checkBgMutedWithoutText(content: string, file: string): Issue[] {
  const issues: Issue[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if line has bg-muted (not bg-muted/xx which is semi-transparent)
    const bgMutedMatch = line.match(/\bbg-muted\b(?!\/)/)
    if (!bgMutedMatch) continue

    // Skip if it's hover/focus/active state only
    if (/hover:bg-muted|focus:bg-muted|active:bg-muted/.test(line) && !/\sbg-muted\b/.test(line)) {
      continue
    }

    // Check if there's any text color in the same className context (within 3 lines)
    const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 4)).join(' ')
    
    // Look for text-* colors
    const hasTextColor = /\btext-(?:muted-foreground|foreground|primary|destructive|green-|red-|blue-|gray-|slate-|zinc-|white)/.test(context)
    
    // Also check if it's used purely as decorative/layout (no text content expected)
    const isDecorative = /(?:size-|w-|h-)\d+.*(?:rounded|aspect)|flex.*items-center.*justify-center.*(?:rounded|size-)/.test(context)
    
    // Skip if has text color or is decorative
    if (hasTextColor || isDecorative) continue
    
    // Skip if it's a container with child elements that likely have their own text colors
    const isContainer = /className.*bg-muted.*>\s*$|<div|<button|<span/.test(context)
    const hasChildWithText = /text-(?:muted-foreground|foreground|sm|xs|lg|xl)/.test(context)
    if (isContainer && hasChildWithText) continue

    issues.push({
      file,
      line: i + 1,
      column: bgMutedMatch.index! + 1,
      rule: 'bg-muted-no-text-color',
      message: `'bg-muted' without explicit text color - may be invisible in dark mode`,
      severity: 'warning',
      suggestion: `Add 'text-muted-foreground' or 'text-foreground' for text elements`,
    })
  }

  return issues
}

/**
 * Rule 6: Success/error states should use semantic colors
 */
function checkSemanticColors(content: string, file: string): Issue[] {
  const issues: Issue[] = []
  const lines = content.split('\n')

  // Check for hardcoded success/error colors that should use theme variables
  const semanticPatterns = [
    { pattern: /\btext-green-[45]00\b/g, suggestion: 'text-success or text-green-500 (already ok)' },
    { pattern: /\btext-red-[45]00\b/g, suggestion: 'text-destructive' },
    { pattern: /\bbg-green-[45]00\b/g, suggestion: 'bg-success' },
    { pattern: /\bbg-red-[45]00\b/g, suggestion: 'bg-destructive' },
  ]

  // This rule is informational only - semantic colors are preferred but hardcoded ones work
  // Skip for now to reduce noise
  return issues
}

// ==================== Utilities ====================

function invertShade(shade: string): string {
  const shadeMap: Record<string, string> = {
    '50': '900',
    '100': '800',
    '200': '700',
    '300': '600',
    '400': '500',
    '500': '400',
    '600': '300',
    '700': '200',
    '800': '100',
    '900': '50',
  }
  return shadeMap[shade] || '800'
}

function shouldSkipFile(filePath: string): boolean {
  return SKIP_PATTERNS.some((pattern) => filePath.includes(pattern))
}

function getAllFiles(dir: string, files: string[] = []): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return files
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry)

    if (shouldSkipFile(fullPath)) continue

    let stat
    try {
      stat = statSync(fullPath)
    } catch {
      continue
    }
    
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files)
    } else if (entry.endsWith('.tsx') || entry.endsWith('.jsx')) {
      files.push(fullPath)
    }
  }

  return files
}

// ==================== Main Logic ====================

async function main() {
  const args = process.argv.slice(2)
  const verbose = args.includes('--verbose')

  console.log(`
${colors.cyan}╔════════════════════════════════════════╗
║     Theme (Dark Mode) Lint             ║
╚════════════════════════════════════════╝${colors.reset}
`)

  const files = getAllFiles(SRC_DIR)
  log.info(`Checking ${files.length} files...`)

  const allIssues: Issue[] = []

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const relPath = relative(ROOT, file)

    const issues = [
      ...checkBackgroundAsText(content, relPath),
      ...checkOrphanForeground(content, relPath),
      ...checkMissingDarkVariant(content, relPath),
      ...checkTextWhiteOnSemanticBg(content, relPath),
      ...checkBgMutedWithoutText(content, relPath),
      ...checkSemanticColors(content, relPath),
    ]

    allIssues.push(...issues)

    if (verbose && issues.length === 0) {
      log.success(relPath)
    }
  }

  // Report results
  log.step('Results')

  if (allIssues.length === 0) {
    log.success('No theme issues found!')
    console.log(`
${colors.green}✓ All ${files.length} files follow dark mode best practices${colors.reset}
`)
    process.exit(0)
  }

  // Group by file
  const byFile = new Map<string, Issue[]>()
  for (const issue of allIssues) {
    if (!byFile.has(issue.file)) {
      byFile.set(issue.file, [])
    }
    byFile.get(issue.file)!.push(issue)
  }

  const errorCount = allIssues.filter((i) => i.severity === 'error').length
  const warningCount = allIssues.filter((i) => i.severity === 'warning').length

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
  ${colors.red}Errors: ${errorCount}${colors.reset}
  ${colors.yellow}Warnings: ${warningCount}${colors.reset}
`)

  // Exit with error if there are errors (warnings are OK for CI)
  if (errorCount > 0) {
    log.info(`See docs/white-book/02-设计篇/02-视觉设计/theme-colors.md for guidance`)
    process.exit(1)
  }

  log.success('No blocking errors (warnings can be addressed later)')
}

main().catch((error) => {
  log.error(`Check failed: ${error.message}`)
  console.error(error)
  process.exit(1)
})
