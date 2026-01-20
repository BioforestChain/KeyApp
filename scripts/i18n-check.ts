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
 * - Checks if namespaces are registered in i18n/index.ts
 * - Supports --fix to add missing keys with placeholder values
 * - Exit code 1 if issues found (for CI)
 *
 * Usage:
 *   pnpm i18n:check          # Check for missing translations
 *   pnpm i18n:check --fix    # Add missing keys with [MISSING] placeholder
 *   pnpm i18n:check --verbose # Show all checked files
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

// ==================== Configuration ====================

const ROOT = resolve(import.meta.dirname, '..');
const LOCALES_DIR = join(ROOT, 'src/i18n/locales');
const I18N_INDEX_PATH = join(ROOT, 'src/i18n/index.ts');

// ==================== Chinese Literal Check Configuration ====================

// 中文字符正则（CJK Unified Ideographs 基本区）
const CHINESE_REGEX = /[\u4e00-\u9fa5]/;

// 扫描的文件模式
const SOURCE_PATTERNS = ['src/**/*.ts', 'src/**/*.tsx'];

// 排除的文件/目录模式
const SOURCE_EXCLUDE_PATTERNS = [
  '**/i18n/**', // i18n 配置和 locale 文件
  '**/*.test.ts', // 单元测试
  '**/*.test.tsx',
  '**/*.spec.ts', // 规格测试
  '**/*.spec.tsx',
  '**/*.stories.ts', // Storybook 故事
  '**/*.stories.tsx',
  '**/test/**', // 测试工具目录
  '**/__tests__/**', // Jest 测试目录
  '**/__mocks__/**', // Mock 目录
  '**/services/*/types.ts', // Zod schema 描述 (开发者文档)
  '**/services/*/types.*.ts', // Zod schema 描述变体
  '**/mock-devtools/**', // 开发工具
];

// Reference locale (source of truth for keys)
const REFERENCE_LOCALE = 'zh-CN';

// All supported locales
const LOCALES = ['zh-CN', 'zh-TW', 'en', 'ar'];

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
  step: (msg: string) => console.log(`\n${colors.cyan}▸${colors.reset} ${colors.cyan}${msg}${colors.reset}`),
  dim: (msg: string) => console.log(`${colors.dim}  ${msg}${colors.reset}`),
};

// ==================== Types ====================

type TranslationValue = string | { [key: string]: TranslationValue };
type TranslationFile = Record<string, TranslationValue>;

interface KeyDiff {
  missing: string[];
  extra: string[];
}

interface CheckResult {
  namespace: string;
  locale: string;
  missing: string[];
  extra: string[];
  untranslated: string[]; // Keys with [MISSING:xx] placeholder
}

interface ChineseLiteral {
  file: string;
  line: number;
  content: string;
}

// ==================== Utilities ====================

/**
 * Recursively extract all keys from a nested object
 * Returns flat keys like "a11y.skipToMain"
 */
function extractKeys(obj: TranslationFile, prefix = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      keys.push(...extractKeys(value as TranslationFile, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Find keys with [MISSING:xx] placeholder values
 */
function findUntranslatedKeys(obj: TranslationFile, prefix = ''): string[] {
  const untranslated: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      untranslated.push(...findUntranslatedKeys(value as TranslationFile, fullKey));
    } else if (typeof value === 'string' && value.startsWith('[MISSING:')) {
      untranslated.push(fullKey);
    }
  }

  return untranslated;
}

/**
 * Get value at a nested path
 */
function getNestedValue(obj: TranslationFile, path: string): TranslationValue | undefined {
  const parts = path.split('.');
  let current: TranslationValue = obj;

  for (const part of parts) {
    if (typeof current !== 'object' || current === null) {
      return undefined;
    }
    current = (current as Record<string, TranslationValue>)[part];
  }

  return current;
}

/**
 * Set value at a nested path
 */
function setNestedValue(obj: TranslationFile, path: string, value: TranslationValue): void {
  const parts = path.split('.');
  let current: Record<string, TranslationValue> = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part] as Record<string, TranslationValue>;
  }

  current[parts[parts.length - 1]] = value;
}

/**
 * Compare two sets of keys and find differences
 */
function compareKeys(referenceKeys: Set<string>, targetKeys: Set<string>): KeyDiff {
  const missing: string[] = [];
  const extra: string[] = [];

  for (const key of referenceKeys) {
    if (!targetKeys.has(key)) {
      missing.push(key);
    }
  }

  for (const key of targetKeys) {
    if (!referenceKeys.has(key)) {
      extra.push(key);
    }
  }

  return { missing: missing.sort(), extra: extra.sort() };
}

/**
 * Sort object keys recursively
 */
function sortObjectKeys(obj: TranslationFile): TranslationFile {
  const sorted: TranslationFile = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'object' && value !== null) {
      sorted[key] = sortObjectKeys(value as TranslationFile);
    } else {
      sorted[key] = value;
    }
  }

  return sorted;
}

// ==================== Chinese Literal Detection ====================

/**
 * 判断是否为纯注释行
 */
function isCommentLine(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.endsWith('*/');
}

/**
 * 判断是否有 i18n-ignore 标记
 */
function hasIgnoreComment(line: string): boolean {
  return line.includes('// i18n-ignore') || line.includes('/* i18n-ignore */');
}

/**
 * 移除行尾注释，只保留代码部分
 * 例如: `name: '请求账户', // 这是注释` -> `name: '请求账户',`
 */
function removeTrailingComment(line: string): string {
  // 简单处理：找到 // 并移除后面的内容
  // 需要注意不要移除字符串内的 //
  let inString = false;
  let stringChar = '';
  let result = '';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    // 处理字符串开始/结束
    if ((char === '"' || char === "'" || char === '`') && (i === 0 || line[i - 1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = '';
      }
    }

    // 检测行尾注释（不在字符串内）
    if (!inString && char === '/' && nextChar === '/') {
      break;
    }

    result += char;
  }

  return result;
}

/**
 * 从代码行中提取字符串字面量的内容
 */
function extractStringLiterals(line: string): string[] {
  const strings: string[] = [];
  // 匹配单引号、双引号、模板字符串中的内容
  const regex = /(['"`])(?:(?!\1|\\).|\\.)*\1/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    // 去掉引号，获取字符串内容
    const content = match[0].slice(1, -1);
    strings.push(content);
  }

  return strings;
}

/**
 * 使用 Bun.Glob 扫描文件
 */
function scanSourceFiles(): string[] {
  const files: string[] = [];

  for (const pattern of SOURCE_PATTERNS) {
    const glob = new Bun.Glob(pattern);
    for (const file of glob.scanSync({ cwd: ROOT })) {
      // 检查是否匹配排除模式
      const shouldExclude = SOURCE_EXCLUDE_PATTERNS.some((excludePattern) => {
        const excludeGlob = new Bun.Glob(excludePattern);
        return excludeGlob.match(file);
      });

      if (!shouldExclude) {
        files.push(file);
      }
    }
  }

  return files;
}

/**
 * 扫描源代码文件，检测硬编码的中文字符串
 */
function checkChineseLiterals(verbose: boolean): ChineseLiteral[] {
  const results: ChineseLiteral[] = [];

  const files = scanSourceFiles();

  if (verbose) {
    log.dim(`Scanning ${files.length} source files for Chinese literals...`);
  }

  for (const file of files) {
    const filePath = join(ROOT, file);
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let inMultiLineComment = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // 处理多行注释开始
      if (trimmed.includes('/*') && !trimmed.includes('*/')) {
        inMultiLineComment = true;
      }
      // 处理多行注释结束
      if (trimmed.includes('*/')) {
        inMultiLineComment = false;
        continue;
      }

      // 跳过多行注释内容
      if (inMultiLineComment) continue;

      // 跳过单行注释
      if (isCommentLine(line)) continue;

      // 跳过带 i18n-ignore 标记的行
      if (hasIgnoreComment(line)) continue;

      // 移除行尾注释，只保留代码部分
      const codeOnly = removeTrailingComment(line);

      // 提取字符串字面量
      const stringLiterals = extractStringLiterals(codeOnly);

      // 检测字符串字面量中的中文字符
      for (const literal of stringLiterals) {
        if (CHINESE_REGEX.test(literal)) {
          results.push({
            file,
            line: i + 1,
            content: trimmed.length > 80 ? trimmed.slice(0, 77) + '...' : trimmed,
          });
          break; // 每行只报告一次
        }
      }
    }
  }

  return results;
}

// ==================== Main Logic ====================

/**
 * Get registered namespaces from src/i18n/index.ts
 */
function getRegisteredNamespaces(): string[] {
  const content = readFileSync(I18N_INDEX_PATH, 'utf-8');
  // Match: export const namespaces = [...] as const
  const match = content.match(/export\s+const\s+namespaces\s*=\s*\[([\s\S]*?)\]\s*as\s+const/);
  if (!match) {
    log.warn('Could not parse namespaces from src/i18n/index.ts');
    return [];
  }
  // Extract string literals from the array
  const arrayContent = match[1];
  const namespaces: string[] = [];
  const regex = /'([^']+)'|"([^"]+)"/g;
  let m;
  while ((m = regex.exec(arrayContent)) !== null) {
    namespaces.push(m[1] || m[2]);
  }
  return namespaces;
}

function getNamespaces(): string[] {
  const refDir = join(LOCALES_DIR, REFERENCE_LOCALE);
  return readdirSync(refDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
    .sort();
}

function checkNamespace(namespace: string, fix: boolean, verbose: boolean): CheckResult[] {
  const results: CheckResult[] = [];

  // Load reference locale
  const refPath = join(LOCALES_DIR, REFERENCE_LOCALE, `${namespace}.json`);
  if (!existsSync(refPath)) {
    log.warn(`Reference file not found: ${refPath}`);
    return results;
  }

  const refData: TranslationFile = JSON.parse(readFileSync(refPath, 'utf-8'));
  const refKeys = new Set(extractKeys(refData));

  if (verbose) {
    log.dim(`${namespace}: ${refKeys.size} keys in reference`);
  }

  // Check each locale against reference
  for (const locale of LOCALES) {
    if (locale === REFERENCE_LOCALE) continue;

    const localePath = join(LOCALES_DIR, locale, `${namespace}.json`);
    if (!existsSync(localePath)) {
      results.push({
        namespace,
        locale,
        missing: [...refKeys],
        extra: [],
        untranslated: [],
      });
      continue;
    }

    let localeData: TranslationFile = JSON.parse(readFileSync(localePath, 'utf-8'));
    const localeKeys = new Set(extractKeys(localeData));

    const diff = compareKeys(refKeys, localeKeys);
    const untranslated = findUntranslatedKeys(localeData);

    if (diff.missing.length > 0 || diff.extra.length > 0 || untranslated.length > 0) {
      results.push({
        namespace,
        locale,
        missing: diff.missing,
        extra: diff.extra,
        untranslated,
      });

      // Fix missing keys if requested
      if (fix && diff.missing.length > 0) {
        for (const key of diff.missing) {
          const refValue = getNestedValue(refData, key);
          const placeholder = typeof refValue === 'string' ? `[MISSING:${locale}] ${refValue}` : refValue;
          setNestedValue(localeData, key, placeholder as TranslationValue);
        }

        // Sort and write back
        localeData = sortObjectKeys(localeData);
        writeFileSync(localePath, JSON.stringify(localeData, null, 2) + '\n');
        log.info(`Fixed ${diff.missing.length} missing keys in ${locale}/${namespace}.json`);
      }
    }
  }

  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const fix = args.includes('--fix');
  const verbose = args.includes('--verbose');

  console.log(`
${colors.cyan}╔════════════════════════════════════════╗
║     i18n Completeness Check            ║
╚════════════════════════════════════════╝${colors.reset}
`);

  log.info(`Reference locale: ${colors.bold}${REFERENCE_LOCALE}${colors.reset}`);
  log.info(`Checking locales: ${LOCALES.filter((l) => l !== REFERENCE_LOCALE).join(', ')}`);

  if (fix) {
    log.warn('Fix mode enabled - missing keys will be added with placeholder values');
  }

  const namespaces = getNamespaces();
  log.info(`Found ${namespaces.length} namespaces`);

  // Check for unregistered namespaces
  log.step('Checking namespace registration');
  const registeredNamespaces = getRegisteredNamespaces();
  const unregisteredNamespaces = namespaces.filter((ns) => !registeredNamespaces.includes(ns));

  if (unregisteredNamespaces.length > 0) {
    log.error(`Found ${unregisteredNamespaces.length} unregistered namespace(s) in src/i18n/index.ts:`);
    for (const ns of unregisteredNamespaces) {
      log.dim(`- ${ns}`);
    }
    console.log(
      `\n${colors.red}✗ These namespaces have JSON files but are NOT registered in src/i18n/index.ts${colors.reset}`,
    );
    log.info(`Add them to the 'namespaces' array and 'resources' object in src/i18n/index.ts`);
    process.exit(1);
  } else {
    log.success(`All ${namespaces.length} namespaces are registered`);
  }

  const allResults: CheckResult[] = [];

  for (const namespace of namespaces) {
    const results = checkNamespace(namespace, fix, verbose);
    allResults.push(...results);
  }

  // Report results
  log.step('Results');

  const hasMissingKeys = allResults.some((r) => r.missing.length > 0);
  const hasExtraKeys = allResults.some((r) => r.extra.length > 0);
  const hasUntranslated = allResults.some((r) => r.untranslated.length > 0);

  if (!hasMissingKeys && !hasExtraKeys && !hasUntranslated) {
    log.success('All translations are complete!');
  } else {
    // Group by locale
    const byLocale = new Map<string, CheckResult[]>();
    for (const result of allResults) {
      if (!byLocale.has(result.locale)) {
        byLocale.set(result.locale, []);
      }
      byLocale.get(result.locale)!.push(result);
    }

    let totalMissing = 0;
    let totalExtra = 0;
    let totalUntranslated = 0;

    for (const [locale, results] of byLocale) {
      const missingCount = results.reduce((sum, r) => sum + r.missing.length, 0);
      const extraCount = results.reduce((sum, r) => sum + r.extra.length, 0);
      const untranslatedCount = results.reduce((sum, r) => sum + r.untranslated.length, 0);

      if (missingCount === 0 && extraCount === 0 && untranslatedCount === 0) continue;

      totalMissing += missingCount;
      totalExtra += extraCount;
      totalUntranslated += untranslatedCount;

      console.log(`\n${colors.bold}${locale}${colors.reset}`);

      for (const result of results) {
        if (result.missing.length > 0) {
          log.error(`${result.namespace}.json: ${result.missing.length} missing keys`);
          for (const key of result.missing.slice(0, 5)) {
            log.dim(`- ${key}`);
          }
          if (result.missing.length > 5) {
            log.dim(`  ... and ${result.missing.length - 5} more`);
          }
        }

        if (result.extra.length > 0) {
          log.warn(`${result.namespace}.json: ${result.extra.length} extra keys (not in reference)`);
          for (const key of result.extra.slice(0, 3)) {
            log.dim(`+ ${key}`);
          }
          if (result.extra.length > 3) {
            log.dim(`  ... and ${result.extra.length - 3} more`);
          }
        }

        if (result.untranslated.length > 0) {
          log.error(
            `${result.namespace}.json: ${result.untranslated.length} untranslated keys ([MISSING:] placeholders)`,
          );
          for (const key of result.untranslated.slice(0, 5)) {
            log.dim(`! ${key}`);
          }
          if (result.untranslated.length > 5) {
            log.dim(`  ... and ${result.untranslated.length - 5} more`);
          }
        }
      }
    }

    if (totalMissing > 0 || totalUntranslated > 0) {
      console.log(`
${colors.red}✗ Found translation issues:${colors.reset}
  ${totalMissing > 0 ? `${colors.red}Missing: ${totalMissing} keys${colors.reset}` : ''}
  ${totalUntranslated > 0 ? `${colors.red}Untranslated: ${totalUntranslated} keys (have [MISSING:] placeholder)${colors.reset}` : ''}
  ${colors.yellow}Extra: ${totalExtra} keys${colors.reset}
`);

      if (!fix && totalMissing > 0) {
        log.info(`Run with ${colors.cyan}--fix${colors.reset} to add missing keys with placeholder values`);
      }
      if (totalUntranslated > 0) {
        log.info(`Fix [MISSING:xx] placeholders by providing actual translations`);
      }

      process.exit(1);
    }

    // Only extra keys - warn but don't fail
    console.log(`
${colors.green}✓ No missing or untranslated keys${colors.reset}
  ${colors.yellow}Extra: ${totalExtra} keys (not in reference, can be cleaned up)${colors.reset}
`);
  }

  // Step 3: Check for Chinese literals in source code
  log.step('Checking for Chinese literals in source code');

  const chineseLiterals = checkChineseLiterals(verbose);

  if (chineseLiterals.length > 0) {
    log.error(`Found ${chineseLiterals.length} Chinese literal(s) in source code:`);

    // 按文件分组显示
    const byFile = new Map<string, ChineseLiteral[]>();
    for (const lit of chineseLiterals) {
      if (!byFile.has(lit.file)) byFile.set(lit.file, []);
      byFile.get(lit.file)!.push(lit);
    }

    for (const [file, lits] of byFile) {
      console.log(`\n  ${colors.bold}${file}${colors.reset}`);
      for (const lit of lits.slice(0, 5)) {
        log.dim(`Line ${lit.line}: ${lit.content}`);
      }
      if (lits.length > 5) {
        log.dim(`... and ${lits.length - 5} more`);
      }
    }

    console.log(`
${colors.red}✗ Chinese literals found in source code${colors.reset}

To fix:
  1. Move strings to i18n locale files (src/i18n/locales/)
  2. Use useTranslation() hook or t() function
  3. For intentional exceptions, add ${colors.cyan}// i18n-ignore${colors.reset} comment
`);

    process.exit(1);
  } else {
    log.success('No Chinese literals found in source code');
  }

  // Final success message
  console.log(`
${colors.green}✓ All ${namespaces.length} namespaces checked across ${LOCALES.length} locales${colors.reset}
${colors.green}✓ No Chinese literals in source code${colors.reset}
`);
}

main().catch((error) => {
  log.error(`Check failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
