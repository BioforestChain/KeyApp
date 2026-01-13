#!/usr/bin/env bun
/**
 * i18n Multi-file Split Script
 *
 * Splits single-file locale JSONs into namespace-based directory structure.
 *
 * Input:  src/i18n/locales/{locale}.json
 * Output: src/i18n/locales/{locale}/{namespace}.json
 *
 * Usage:
 *   pnpm i18n:split          # Split all locales
 *   pnpm i18n:split --dry    # Preview without writing
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const LOCALES_DIR = join(ROOT, 'src/i18n/locales')
const LOCALES = ['en', 'zh-CN', 'zh-TW', 'ar']

const colors = {
  reset: '\x1b[0m',
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
  step: (msg: string) => console.log(`\n${colors.cyan}▸${colors.reset} ${colors.cyan}${msg}${colors.reset}`),
  dim: (msg: string) => console.log(`${colors.dim}  ${msg}${colors.reset}`),
}

type NestedObject = { [key: string]: string | NestedObject }

function splitLocale(locale: string, isDryRun: boolean): { namespaces: string[]; keyCount: number } {
  const jsonPath = join(LOCALES_DIR, `${locale}.json`)
  if (!existsSync(jsonPath)) {
    log.warn(`Skipping ${locale} - file not found`)
    return { namespaces: [], keyCount: 0 }
  }

  const content: NestedObject = JSON.parse(readFileSync(jsonPath, 'utf-8'))
  const namespaces = Object.keys(content)
  let totalKeys = 0

  const localeDir = join(LOCALES_DIR, locale)
  if (!isDryRun) {
    if (existsSync(localeDir)) rmSync(localeDir, { recursive: true })
    mkdirSync(localeDir, { recursive: true })
  }

  for (const ns of namespaces) {
    const nsContent = content[ns]
    if (typeof nsContent !== 'object') continue
    const nsPath = join(localeDir, `${ns}.json`)
    const keyCount = Object.keys(nsContent).length
    totalKeys += keyCount
    if (!isDryRun) writeFileSync(nsPath, JSON.stringify(nsContent, null, 2) + '\n')
    log.dim(`${ns}.json: ${keyCount} keys`)
  }

  return { namespaces, keyCount: totalKeys }
}

function syncArabicPlaceholders(isDryRun: boolean): void {
  log.step('Syncing Arabic placeholders from English')
  const enDir = join(LOCALES_DIR, 'en')
  const arDir = join(LOCALES_DIR, 'ar')
  const arJsonPath = join(LOCALES_DIR, 'ar.json')

  if (!existsSync(enDir)) { log.warn('English locale dir not found'); return }

  let existingAr: NestedObject = {}
  if (existsSync(arJsonPath)) existingAr = JSON.parse(readFileSync(arJsonPath, 'utf-8'))

  if (!isDryRun && !existsSync(arDir)) mkdirSync(arDir, { recursive: true })

  const enFiles = readdirSync(enDir).filter((f: string) => f.endsWith('.json'))
  for (const file of enFiles) {
    const ns = file.replace('.json', '')
    const enContent: Record<string, string> = JSON.parse(readFileSync(join(enDir, file), 'utf-8'))
    const existingNs = (existingAr[ns] || {}) as Record<string, string>
    const arContent: Record<string, string> = {}
    for (const [key, enValue] of Object.entries(enContent)) {
      arContent[key] = existingNs[key] || `[AR] ${enValue}`
    }
    if (!isDryRun) writeFileSync(join(arDir, file), JSON.stringify(arContent, null, 2) + '\n')
    log.dim(`ar/${file}: ${Object.keys(arContent).length} keys`)
  }
}

async function main() {
  const isDryRun = process.argv.includes('--dry')
  console.log(`\n${colors.cyan}╔════════════════════════════════════════╗\n║     i18n Multi-file Split Script       ║\n╚════════════════════════════════════════╝${colors.reset}\n`)
  if (isDryRun) log.warn('Dry run mode - no files will be written')

  const stats: Record<string, { namespaces: string[]; keyCount: number }> = {}
  for (const locale of LOCALES) {
    log.step(`Splitting ${locale}`)
    stats[locale] = splitLocale(locale, isDryRun)
  }

  syncArabicPlaceholders(isDryRun)

  if (!isDryRun) {
    log.step('Removing old single-file JSONs')
    for (const locale of LOCALES) {
      const oldPath = join(LOCALES_DIR, `${locale}.json`)
      if (existsSync(oldPath)) { rmSync(oldPath); log.dim(`Removed ${locale}.json`) }
    }
  }

  log.step('Summary')
  for (const [locale, { namespaces, keyCount }] of Object.entries(stats)) {
    if (namespaces.length > 0) log.success(`${locale}: ${namespaces.length} namespaces, ${keyCount} total keys`)
  }
  console.log(`\n${colors.green}✓ Split complete${colors.reset}\n\nNext: Update src/i18n/index.ts for namespace imports\n`)
}

main().catch((e) => { console.error(e); process.exit(1) })
