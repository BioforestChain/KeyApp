#!/usr/bin/env bun
/**
 * T014: i18n Extraction Script
 *
 * Extracts translations from mpay's XLF files and converts them to KeyApp's i18next JSON format.
 *
 * Features:
 * - Parses Angular XLF format (XLIFF 1.2)
 * - Converts SCREAMING_SNAKE_CASE keys to camelCase
 * - Organizes keys into semantic namespaces
 * - Preserves existing KeyApp translations
 * - Supports en-US, zh-Hans, zh-Hant locales
 *
 * Usage:
 *   pnpm i18n:extract          # Extract and merge translations
 *   pnpm i18n:extract --dry    # Preview without writing files
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, join } from 'node:path'

// ==================== 配置 ====================

const ROOT = resolve(import.meta.dirname, '..')
const MPAY_LOCALE_DIR = '/Users/kzf/Dev/bioforestChain/legacy-apps/apps/mpay/src/locale'
const KEYAPP_LOCALE_DIR = join(ROOT, 'src/i18n/locales')

const LOCALE_MAP: Record<string, string> = {
  'messages.en-US.xlf': 'en.json',
  'messages.zh-Hans.xlf': 'zh-CN.json',
  'messages.zh-Hant.xlf': 'zh-TW.json',
}

// Namespace categorization rules (order matters - first match wins)
const NAMESPACE_RULES: Array<{ namespace: string; patterns: RegExp[] }> = [
  {
    namespace: 'staking',
    patterns: [/STAKE|MINT|BURN|UNSTAKE|STAKING|REWARD/i],
  },
  {
    namespace: 'dweb',
    patterns: [/AUTHORIZE|SIGNATURE|DWEB|DAPP|PERMISSION/i],
  },
  {
    namespace: 'security',
    patterns: [/PASSWORD|FINGERPRINT|MNEMONIC|BACKUP|VERIFY|BIOMETRIC|LOCK|PIN/i],
  },
  {
    namespace: 'transaction',
    patterns: [/TRANSFER|RECEIVE|SEND|FEE|AMOUNT|BALANCE|TRANSACTION|PAYMENT|GAS/i],
  },
  {
    namespace: 'wallet',
    patterns: [/WALLET|ADDRESS|CHAIN|TOKEN|ASSET|IMPORT|EXPORT|CREATE|RESTORE/i],
  },
  {
    namespace: 'settings',
    patterns: [/SETTING|LANGUAGE|CURRENCY|THEME|NOTIFICATION|PREFERENCE/i],
  },
  {
    namespace: 'error',
    patterns: [/ERROR|FAIL|INVALID|INCORRECT|INSUFFICIENT|NOT_FOUND/i],
  },
  {
    namespace: 'common',
    patterns: [/.*/], // Catch-all
  },
]

// Keys to skip (deprecated or mpay-specific)
const SKIP_KEYS = new Set([
  'TABS',
  'MIME',
  'DP',
  'CHAT',
  'TRADE',
  'COSMICDP',
  'LIMITED_EDITION_DP',
])

// ==================== 颜色输出 ====================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`\n${colors.cyan}▸${colors.reset} ${colors.cyan}${msg}${colors.reset}`),
  dim: (msg: string) => console.log(`${colors.dim}  ${msg}${colors.reset}`),
}

// ==================== XLF 解析 ====================

interface TransUnit {
  id: string
  source: string
  target?: string
}

function parseXlf(content: string): TransUnit[] {
  const units: TransUnit[] = []

  // Extract trans-unit blocks
  const transUnitRegex = /<trans-unit\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/trans-unit>/g
  let match: RegExpExecArray | null

  while ((match = transUnitRegex.exec(content)) !== null) {
    const id = match[1]
    const block = match[2]

    // Skip numeric IDs (Angular-generated, not named keys)
    if (/^\d+$/.test(id)) {
      continue
    }

    // Extract source
    const sourceMatch = block.match(/<source>([\s\S]*?)<\/source>/)
    if (!sourceMatch) continue

    const source = cleanXlfText(sourceMatch[1])

    // Extract target (if exists)
    const targetMatch = block.match(/<target[^>]*>([\s\S]*?)<\/target>/)
    const target = targetMatch ? cleanXlfText(targetMatch[1]) : undefined

    units.push({ id, source, target })
  }

  return units
}

function cleanXlfText(text: string): string {
  return text
    .replace(/<x[^>]*\/>/g, '') // Remove interpolation placeholders
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

// ==================== 键名转换 ====================

/**
 * Convert SCREAMING_SNAKE_CASE to camelCase
 * Examples:
 *   CREATE_WALLET -> createWallet
 *   CONFIRM -> confirm
 *   I_GOT_IT -> iGotIt
 */
function toCamelCase(key: string): string {
  return key
    .toLowerCase()
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Determine namespace for a key based on patterns
 */
function getNamespace(key: string): string {
  for (const rule of NAMESPACE_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(key)) {
        return rule.namespace
      }
    }
  }
  return 'common'
}

// ==================== JSON 合并 ====================

type NestedObject = { [key: string]: string | NestedObject }

function deepMerge(target: NestedObject, source: NestedObject): NestedObject {
  const result = { ...target }

  for (const key of Object.keys(source)) {
    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      typeof result[key] === 'object' &&
      result[key] !== null
    ) {
      result[key] = deepMerge(result[key] as NestedObject, source[key] as NestedObject)
    } else {
      // Don't overwrite existing values (preserve KeyApp customizations)
      if (!(key in result)) {
        result[key] = source[key]
      }
    }
  }

  return result
}

function sortObjectKeys(obj: NestedObject): NestedObject {
  const sorted: NestedObject = {}
  const keys = Object.keys(obj).sort()

  for (const key of keys) {
    const value = obj[key]
    if (typeof value === 'object' && value !== null) {
      sorted[key] = sortObjectKeys(value as NestedObject)
    } else {
      sorted[key] = value
    }
  }

  return sorted
}

// ==================== 主逻辑 ====================

interface ExtractionResult {
  locale: string
  extracted: number
  skipped: number
  namespaces: Record<string, number>
}

function extractLocale(xlfFile: string, isSource: boolean): { data: NestedObject; stats: ExtractionResult } {
  const content = readFileSync(join(MPAY_LOCALE_DIR, xlfFile), 'utf-8')
  const units = parseXlf(content)

  const result: NestedObject = {}
  const stats: ExtractionResult = {
    locale: xlfFile,
    extracted: 0,
    skipped: 0,
    namespaces: {},
  }

  for (const unit of units) {
    // Skip certain keys
    if (SKIP_KEYS.has(unit.id)) {
      stats.skipped++
      continue
    }

    // Get text (source for en-US, target for translations)
    const text = isSource ? unit.source : (unit.target || unit.source)
    if (!text) {
      stats.skipped++
      continue
    }

    // Determine namespace and key
    const namespace = getNamespace(unit.id)
    const camelKey = toCamelCase(unit.id)

    // Initialize namespace object if needed
    if (!result[namespace]) {
      result[namespace] = {}
      stats.namespaces[namespace] = 0
    }

    // Add to result
    ;(result[namespace] as NestedObject)[camelKey] = text
    stats.extracted++
    stats.namespaces[namespace]++
  }

  return { data: result, stats }
}

async function main() {
  const isDryRun = process.argv.includes('--dry')

  console.log(`
${colors.cyan}╔════════════════════════════════════════╗
║     T014: i18n Extraction Script       ║
╚════════════════════════════════════════╝${colors.reset}
`)

  if (isDryRun) {
    log.warn('Dry run mode - no files will be written')
  }

  const allStats: ExtractionResult[] = []

  for (const [xlfFile, jsonFile] of Object.entries(LOCALE_MAP)) {
    log.step(`Processing ${xlfFile} → ${jsonFile}`)

    const xlfPath = join(MPAY_LOCALE_DIR, xlfFile)
    if (!existsSync(xlfPath)) {
      log.warn(`XLF file not found: ${xlfPath}`)
      continue
    }

    // Extract from XLF
    const isSource = xlfFile.includes('en-US')
    const { data: extracted, stats } = extractLocale(xlfFile, isSource)
    allStats.push(stats)

    log.info(`Extracted ${stats.extracted} keys, skipped ${stats.skipped}`)
    for (const [ns, count] of Object.entries(stats.namespaces)) {
      log.dim(`${ns}: ${count} keys`)
    }

    // Load existing KeyApp JSON
    const jsonPath = join(KEYAPP_LOCALE_DIR, jsonFile)
    let existing: NestedObject = {}
    if (existsSync(jsonPath)) {
      existing = JSON.parse(readFileSync(jsonPath, 'utf-8'))
      log.info(`Loaded existing ${jsonFile}`)
    }

    // Merge (existing takes precedence)
    const merged = sortObjectKeys(deepMerge(existing, extracted))

    // Write result
    if (!isDryRun) {
      writeFileSync(jsonPath, JSON.stringify(merged, null, 2) + '\n')
      log.success(`Written ${jsonFile}`)
    } else {
      log.info(`Would write ${Object.keys(merged).length} namespaces to ${jsonFile}`)
    }
  }

  // Summary
  log.step('Summary')
  const totalExtracted = allStats.reduce((sum, s) => sum + s.extracted, 0)
  const totalSkipped = allStats.reduce((sum, s) => sum + s.skipped, 0)
  log.success(`Total: ${totalExtracted} keys extracted, ${totalSkipped} skipped`)

  // Namespace breakdown
  const allNamespaces = new Set(allStats.flatMap((s) => Object.keys(s.namespaces)))
  log.info('Keys per namespace:')
  for (const ns of [...allNamespaces].sort()) {
    const count = allStats[0]?.namespaces[ns] || 0
    log.dim(`${ns}: ${count}`)
  }

  console.log(`
${colors.green}✓ Extraction complete${colors.reset}
`)
}

main().catch((error) => {
  log.error(`Extraction failed: ${error.message}`)
  process.exit(1)
})
