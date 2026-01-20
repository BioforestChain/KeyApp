#!/usr/bin/env bun
/**
 * i18n-set.ts - Batch set translation keys across all locales
 *
 * Usage:
 *   bun scripts/i18n-set.ts -n <namespace> -k <key> -v <values>
 *
 * Examples:
 *   # Set a simple key with all translations
 *   bun scripts/i18n-set.ts -n error -k validation.required -v '{"zh-CN":"必填项","en":"Required","zh-TW":"必填項","ar":"Required"}'
 *
 *   # Set a nested key (automatically creates parent objects)
 *   bun scripts/i18n-set.ts -n common -k form.validation.email -v '{"zh-CN":"请输入有效邮箱","en":"Please enter a valid email"}'
 *
 *   # Use shorthand locale keys
 *   bun scripts/i18n-set.ts -n error -k unknown -v '{"zh":"未知错误","en":"Unknown error"}'
 *
 * Options:
 *   -n, --namespace   Target namespace (e.g., "error", "common", "ecosystem")
 *   -k, --key         Dot-separated key path (e.g., "validation.required")
 *   -v, --values      JSON object with locale translations
 *   --dry-run         Preview changes without writing files
 *   --help            Show this help message
 *
 * Locale shortcuts:
 *   zh, zh-CN  -> zh-CN
 *   tw, zh-TW  -> zh-TW
 *   en         -> en
 *   ar         -> ar
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { parseArgs } from 'node:util';

// ==================== Configuration ====================

const ROOT = resolve(import.meta.dirname, '..');
const LOCALES_DIR = join(ROOT, 'src/i18n/locales');
const LOCALES = ['zh-CN', 'zh-TW', 'en', 'ar'] as const;
type Locale = (typeof LOCALES)[number];

// Locale shortcuts mapping
const LOCALE_SHORTCUTS: Record<string, Locale> = {
  zh: 'zh-CN',
  'zh-CN': 'zh-CN',
  'zh-cn': 'zh-CN',
  tw: 'zh-TW',
  'zh-TW': 'zh-TW',
  'zh-tw': 'zh-TW',
  en: 'en',
  ar: 'ar',
};

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
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  dim: (msg: string) => console.log(`${colors.dim}  ${msg}${colors.reset}`),
};

// ==================== Utilities ====================

function showHelp(): void {
  console.log(`
${colors.cyan}i18n-set${colors.reset} - Batch set translation keys across all locales

${colors.bold}Usage:${colors.reset}
  bun scripts/i18n-set.ts -n <namespace> -k <key> -v <values>

${colors.bold}Examples:${colors.reset}
  ${colors.dim}# Set a simple key${colors.reset}
  bun scripts/i18n-set.ts -n error -k validation.required \\
    -v '{"zh-CN":"必填项","en":"Required","zh-TW":"必填項"}'

  ${colors.dim}# Use shorthand locale keys${colors.reset}
  bun scripts/i18n-set.ts -n error -k unknown -v '{"zh":"未知错误","en":"Unknown error"}'

${colors.bold}Options:${colors.reset}
  -n, --namespace   Target namespace (e.g., "error", "common")
  -k, --key         Dot-separated key path (e.g., "validation.required")
  -v, --values      JSON object with locale translations
  --dry-run         Preview changes without writing files
  --help            Show this help message

${colors.bold}Locale shortcuts:${colors.reset}
  zh, zh-CN  -> zh-CN
  tw, zh-TW  -> zh-TW
  en         -> en
  ar         -> ar
`);
}

function parseValues(valuesStr: string): Record<Locale, string> {
  try {
    const raw = JSON.parse(valuesStr) as Record<string, string>;
    const result: Partial<Record<Locale, string>> = {};

    for (const [key, value] of Object.entries(raw)) {
      const normalizedLocale = LOCALE_SHORTCUTS[key];
      if (normalizedLocale) {
        result[normalizedLocale] = value;
      } else {
        log.warn(`Unknown locale "${key}", skipping`);
      }
    }

    return result as Record<Locale, string>;
  } catch {
    throw new Error(`Invalid JSON values: ${valuesStr}`);
  }
}

function setNestedValue(obj: Record<string, unknown>, keyPath: string, value: string): void {
  const keys = keyPath.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
}

function getNestedValue(obj: Record<string, unknown>, keyPath: string): unknown {
  const keys = keyPath.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

// ==================== Main ====================

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      namespace: { type: 'string', short: 'n' },
      key: { type: 'string', short: 'k' },
      values: { type: 'string', short: 'v' },
      'dry-run': { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    showHelp();
    process.exit(0);
  }

  const namespace = values.namespace;
  const key = values.key;
  const valuesStr = values.values;
  const dryRun = values['dry-run'];

  if (!namespace || !key || !valuesStr) {
    log.error('Missing required arguments');
    console.log(`\nUsage: bun scripts/i18n-set.ts -n <namespace> -k <key> -v <values>`);
    console.log(`Run with --help for more information.`);
    process.exit(1);
  }

  // Parse values
  const translations = parseValues(valuesStr);
  const providedLocales = Object.keys(translations) as Locale[];

  if (providedLocales.length === 0) {
    log.error('No valid translations provided');
    process.exit(1);
  }

  console.log(`\n${colors.cyan}Setting translation key${colors.reset}`);
  console.log(`  Namespace: ${colors.bold}${namespace}${colors.reset}`);
  console.log(`  Key: ${colors.bold}${key}${colors.reset}`);
  console.log(`  Translations:`);
  for (const locale of LOCALES) {
    const value = translations[locale];
    if (value !== undefined) {
      console.log(`    ${locale}: "${value}"`);
    } else {
      console.log(`    ${colors.dim}${locale}: (not provided)${colors.reset}`);
    }
  }
  console.log();

  // Process each locale file
  const results: { locale: string; action: 'created' | 'updated' | 'skipped'; oldValue?: string }[] = [];

  for (const locale of LOCALES) {
    const filePath = join(LOCALES_DIR, locale, `${namespace}.json`);
    const value = translations[locale];

    if (!existsSync(filePath)) {
      log.warn(`File not found: ${locale}/${namespace}.json`);
      results.push({ locale, action: 'skipped' });
      continue;
    }

    if (value === undefined) {
      results.push({ locale, action: 'skipped' });
      continue;
    }

    // Read and parse file
    const content = JSON.parse(readFileSync(filePath, 'utf-8'));
    const oldValue = getNestedValue(content, key);

    // Set new value
    setNestedValue(content, key, value);

    if (!dryRun) {
      writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    }

    results.push({
      locale,
      action: oldValue !== undefined ? 'updated' : 'created',
      oldValue: oldValue !== undefined ? String(oldValue) : undefined,
    });
  }

  // Print summary
  if (dryRun) {
    console.log(`${colors.yellow}[DRY RUN]${colors.reset} No files modified\n`);
  }

  console.log(`${colors.bold}Results:${colors.reset}`);
  for (const { locale, action, oldValue } of results) {
    if (action === 'created') {
      log.success(`${locale}: Created key "${key}"`);
    } else if (action === 'updated') {
      log.success(`${locale}: Updated key "${key}" (was: "${oldValue}")`);
    } else {
      log.dim(`${locale}: Skipped (no value provided or file not found)`);
    }
  }

  // Print AI-friendly summary
  console.log(`\n${colors.dim}---${colors.reset}`);
  console.log(`${colors.bold}Summary:${colors.reset} Set ${namespace}:${key}`);
  const successCount = results.filter((r) => r.action !== 'skipped').length;
  console.log(`  ${successCount}/${LOCALES.length} locales updated`);

  if (!dryRun) {
    console.log(`\n${colors.green}Done!${colors.reset} Key "${namespace}:${key}" has been set.`);
  }
}

main();
