#!/usr/bin/env bun
/**
 * i18n-delete.ts - Delete translation keys across all locales
 *
 * Usage:
 *   bun scripts/i18n-delete.ts -n <namespace> -k <key>
 *
 * Examples:
 *   # Delete a key from all locales
 *   bun scripts/i18n-delete.ts -n error -k validation.deprecated
 *
 *   # Preview deletion without modifying files
 *   bun scripts/i18n-delete.ts -n error -k oldKey --dry-run
 *
 * Options:
 *   -n, --namespace   Target namespace (e.g., "error", "common", "ecosystem")
 *   -k, --key         Dot-separated key path (e.g., "validation.required")
 *   --dry-run         Preview changes without writing files
 *   --help            Show this help message
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { parseArgs } from 'node:util';

// ==================== Configuration ====================

const ROOT = resolve(import.meta.dirname, '..');
const LOCALES_DIR = join(ROOT, 'src/i18n/locales');
const LOCALES = ['zh-CN', 'zh-TW', 'en', 'ar'] as const;

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
${colors.cyan}i18n-delete${colors.reset} - Delete translation keys across all locales

${colors.bold}Usage:${colors.reset}
  bun scripts/i18n-delete.ts -n <namespace> -k <key>

${colors.bold}Examples:${colors.reset}
  ${colors.dim}# Delete a key from all locales${colors.reset}
  bun scripts/i18n-delete.ts -n error -k validation.deprecated

  ${colors.dim}# Preview deletion${colors.reset}
  bun scripts/i18n-delete.ts -n error -k oldKey --dry-run

${colors.bold}Options:${colors.reset}
  -n, --namespace   Target namespace (e.g., "error", "common")
  -k, --key         Dot-separated key path (e.g., "validation.required")
  --dry-run         Preview changes without writing files
  --help            Show this help message
`);
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

function deleteNestedKey(obj: Record<string, unknown>, keyPath: string): boolean {
  const keys = keyPath.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      return false;
    }
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = keys[keys.length - 1];
  if (lastKey in current) {
    delete current[lastKey];
    return true;
  }
  return false;
}

// ==================== Main ====================

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      namespace: { type: 'string', short: 'n' },
      key: { type: 'string', short: 'k' },
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
  const dryRun = values['dry-run'];

  if (!namespace || !key) {
    log.error('Missing required arguments');
    console.log(`\nUsage: bun scripts/i18n-delete.ts -n <namespace> -k <key>`);
    console.log(`Run with --help for more information.`);
    process.exit(1);
  }

  console.log(`\n${colors.cyan}Deleting translation key${colors.reset}`);
  console.log(`  Namespace: ${colors.bold}${namespace}${colors.reset}`);
  console.log(`  Key: ${colors.bold}${key}${colors.reset}`);
  console.log();

  // Process each locale file
  const results: { locale: string; action: 'deleted' | 'not_found' | 'skipped'; oldValue?: string }[] = [];

  for (const locale of LOCALES) {
    const filePath = join(LOCALES_DIR, locale, `${namespace}.json`);

    if (!existsSync(filePath)) {
      log.warn(`File not found: ${locale}/${namespace}.json`);
      results.push({ locale, action: 'skipped' });
      continue;
    }

    // Read and parse file
    const content = JSON.parse(readFileSync(filePath, 'utf-8'));
    const oldValue = getNestedValue(content, key);

    if (oldValue === undefined) {
      results.push({ locale, action: 'not_found' });
      continue;
    }

    // Delete key
    deleteNestedKey(content, key);

    if (!dryRun) {
      writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    }

    results.push({
      locale,
      action: 'deleted',
      oldValue: typeof oldValue === 'string' ? oldValue : JSON.stringify(oldValue),
    });
  }

  // Print summary
  if (dryRun) {
    console.log(`${colors.yellow}[DRY RUN]${colors.reset} No files modified\n`);
  }

  console.log(`${colors.bold}Results:${colors.reset}`);
  for (const { locale, action, oldValue } of results) {
    if (action === 'deleted') {
      log.success(`${locale}: Deleted key "${key}" (was: "${oldValue}")`);
    } else if (action === 'not_found') {
      log.dim(`${locale}: Key not found`);
    } else {
      log.dim(`${locale}: Skipped (file not found)`);
    }
  }

  // Print AI-friendly summary
  console.log(`\n${colors.dim}---${colors.reset}`);
  console.log(`${colors.bold}Summary:${colors.reset} Delete ${namespace}:${key}`);
  const deletedCount = results.filter((r) => r.action === 'deleted').length;
  console.log(`  ${deletedCount}/${LOCALES.length} locales updated`);

  if (!dryRun && deletedCount > 0) {
    console.log(`\n${colors.green}Done!${colors.reset} Key "${namespace}:${key}" has been deleted.`);
  }
}

main();
