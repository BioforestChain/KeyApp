#!/usr/bin/env bun
/**
 * i18n Completeness Check Script
 *
 * Validates that all locale files have consistent keys across all languages.
 *
 * Features:
 * - Checks all namespaces across all locales
 * - Reports missing keys per locale
 * - Reports extra keys (keys only in one locale)
 * - Supports --fix to add missing keys with placeholder values
 * - Exit code 1 if issues found (for CI)
 *
 * Usage:
 *   pnpm i18n:check          # Check for missing translations
 *   pnpm i18n:check --fix    # Add missing keys with [MISSING] placeholder
 *   pnpm i18n:check --verbose # Show all checked files
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

// ==================== Configuration ====================

const ROOT = resolve(import.meta.dirname, '..')
const LOCALES_DIR = join(ROOT, 'src/i18n/locales')

// Reference locale (source of truth for keys)
const REFERENCE_LOCALE = 'zh-CN'

// All supported locales
const LOCALES = ['zh-CN', 'zh-TW', 'en', 'ar']

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

type TranslationValue = string | Record<string, TranslationValue>
type TranslationFile = Record<string, TranslationValue>

interface KeyDiff {
  missing: string[]
  extra: string[]
}

interface CheckResult {
  namespace: string
  locale: string
  missing: string[]
  extra: string[]
}

// ==================== Utilities ====================

/**
 * Recursively extract all keys from a nested object
 * Returns flat keys like "a11y.skipToMain"
 */
function extractKeys(obj: TranslationFile, prefix = ''): string[] {
  const keys: string[] = []

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null) {
      keys.push(...extractKeys(value as TranslationFile, fullKey))
    } else {
      keys.push(fullKey)
    }
  }

  return keys
}

/**
 * Get value at a nested path
 */
function getNestedValue(obj: TranslationFile, path: string): TranslationValue | undefined {
  const parts = path.split('.')
  let current: TranslationValue = obj

  for (const part of parts) {
    if (typeof current !== 'object' || current === null) {
      return undefined
    }
    current = (current as Record<string, TranslationValue>)[part]
  }

  return current
}

/**
 * Set value at a nested path
 */
function setNestedValue(obj: TranslationFile, path: string, value: TranslationValue): void {
  const parts = path.split('.')
  let current: Record<string, TranslationValue> = obj

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {}
    }
    current = current[part] as Record<string, TranslationValue>
  }

  current[parts[parts.length - 1]] = value
}

/**
 * Compare two sets of keys and find differences
 */
function compareKeys(referenceKeys: Set<string>, targetKeys: Set<string>): KeyDiff {
  const missing: string[] = []
  const extra: string[] = []

  for (const key of referenceKeys) {
    if (!targetKeys.has(key)) {
      missing.push(key)
    }
  }

  for (const key of targetKeys) {
    if (!referenceKeys.has(key)) {
      extra.push(key)
    }
  }

  return { missing: missing.sort(), extra: extra.sort() }
}

/**
 * Sort object keys recursively
 */
function sortObjectKeys(obj: TranslationFile): TranslationFile {
  const sorted: TranslationFile = {}
  const keys = Object.keys(obj).sort()

  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'object' && value !== null) {
      sorted[key] = sortObjectKeys(value as TranslationFile)
    } else {
      sorted[key] = value
    }
  }

  return sorted
}

// ==================== Main Logic ====================

function getNamespaces(): string[] {
  const refDir = join(LOCALES_DIR, REFERENCE_LOCALE)
  return readdirSync(refDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
    .sort()
}

function checkNamespace(namespace: string, fix: boolean, verbose: boolean): CheckResult[] {
  const results: CheckResult[] = []

  // Load reference locale
  const refPath = join(LOCALES_DIR, REFERENCE_LOCALE, `${namespace}.json`)
  if (!existsSync(refPath)) {
    log.warn(`Reference file not found: ${refPath}`)
    return results
  }

  const refData: TranslationFile = JSON.parse(readFileSync(refPath, 'utf-8'))
  const refKeys = new Set(extractKeys(refData))

  if (verbose) {
    log.dim(`${namespace}: ${refKeys.size} keys in reference`)
  }

  // Check each locale against reference
  for (const locale of LOCALES) {
    if (locale === REFERENCE_LOCALE) continue

    const localePath = join(LOCALES_DIR, locale, `${namespace}.json`)
    if (!existsSync(localePath)) {
      results.push({
        namespace,
        locale,
        missing: [...refKeys],
        extra: [],
      })
      continue
    }

    let localeData: TranslationFile = JSON.parse(readFileSync(localePath, 'utf-8'))
    const localeKeys = new Set(extractKeys(localeData))

    const diff = compareKeys(refKeys, localeKeys)

    if (diff.missing.length > 0 || diff.extra.length > 0) {
      results.push({
        namespace,
        locale,
        missing: diff.missing,
        extra: diff.extra,
      })

      // Fix missing keys if requested
      if (fix && diff.missing.length > 0) {
        for (const key of diff.missing) {
          const refValue = getNestedValue(refData, key)
          const placeholder = typeof refValue === 'string' 
            ? `[MISSING:${locale}] ${refValue}` 
            : refValue
          setNestedValue(localeData, key, placeholder as TranslationValue)
        }

        // Sort and write back
        localeData = sortObjectKeys(localeData)
        writeFileSync(localePath, JSON.stringify(localeData, null, 2) + '\n')
        log.info(`Fixed ${diff.missing.length} missing keys in ${locale}/${namespace}.json`)
      }
    }
  }

  return results
}

async function main() {
  const args = process.argv.slice(2)
  const fix = args.includes('--fix')
  const verbose = args.includes('--verbose')

  console.log(`
${colors.cyan}╔════════════════════════════════════════╗
║     i18n Completeness Check            ║
╚════════════════════════════════════════╝${colors.reset}
`)

  log.info(`Reference locale: ${colors.bold}${REFERENCE_LOCALE}${colors.reset}`)
  log.info(`Checking locales: ${LOCALES.filter((l) => l !== REFERENCE_LOCALE).join(', ')}`)

  if (fix) {
    log.warn('Fix mode enabled - missing keys will be added with placeholder values')
  }

  const namespaces = getNamespaces()
  log.info(`Found ${namespaces.length} namespaces`)

  const allResults: CheckResult[] = []

  for (const namespace of namespaces) {
    const results = checkNamespace(namespace, fix, verbose)
    allResults.push(...results)
  }

  // Report results
  log.step('Results')

  const hasMissingKeys = allResults.some((r) => r.missing.length > 0)
  const hasExtraKeys = allResults.some((r) => r.extra.length > 0)

  if (!hasMissingKeys && !hasExtraKeys) {
    log.success('All translations are complete!')
    console.log(`
${colors.green}✓ All ${namespaces.length} namespaces checked across ${LOCALES.length} locales${colors.reset}
`)
    process.exit(0)
  }

  // Group by locale
  const byLocale = new Map<string, CheckResult[]>()
  for (const result of allResults) {
    if (!byLocale.has(result.locale)) {
      byLocale.set(result.locale, [])
    }
    byLocale.get(result.locale)!.push(result)
  }

  let totalMissing = 0
  let totalExtra = 0

  for (const [locale, results] of byLocale) {
    const missingCount = results.reduce((sum, r) => sum + r.missing.length, 0)
    const extraCount = results.reduce((sum, r) => sum + r.extra.length, 0)

    if (missingCount === 0 && extraCount === 0) continue

    totalMissing += missingCount
    totalExtra += extraCount

    console.log(`\n${colors.bold}${locale}${colors.reset}`)

    for (const result of results) {
      if (result.missing.length > 0) {
        log.error(`${result.namespace}.json: ${result.missing.length} missing keys`)
        for (const key of result.missing.slice(0, 5)) {
          log.dim(`- ${key}`)
        }
        if (result.missing.length > 5) {
          log.dim(`  ... and ${result.missing.length - 5} more`)
        }
      }

      if (result.extra.length > 0) {
        log.warn(`${result.namespace}.json: ${result.extra.length} extra keys (not in reference)`)
        for (const key of result.extra.slice(0, 3)) {
          log.dim(`+ ${key}`)
        }
        if (result.extra.length > 3) {
          log.dim(`  ... and ${result.extra.length - 3} more`)
        }
      }
    }
  }

  if (totalMissing > 0) {
    console.log(`
${colors.red}✗ Found issues:${colors.reset}
  ${colors.red}Missing: ${totalMissing} keys${colors.reset}
  ${colors.yellow}Extra: ${totalExtra} keys${colors.reset}
`)

    if (!fix) {
      log.info(`Run with ${colors.cyan}--fix${colors.reset} to add missing keys with placeholder values`)
    }

    process.exit(1)
  }

  // Only extra keys - warn but don't fail
  console.log(`
${colors.green}✓ No missing translations${colors.reset}
  ${colors.yellow}Extra: ${totalExtra} keys (not in reference, can be cleaned up)${colors.reset}
`)
}

main().catch((error) => {
  log.error(`Check failed: ${error.message}`)
  console.error(error)
  process.exit(1)
})
