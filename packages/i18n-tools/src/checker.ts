import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { extractKeys, setNestedValue, type TranslationFile } from './utils'

export interface CheckOptions {
  /** 项目根目录 */
  root: string
  /** i18n 目录相对路径，默认 'src/i18n' */
  i18nDir?: string
  /** 翻译文件目录名，默认 'locales' */
  localesDir?: string
  /** 必需的语言列表，默认 ['zh', 'en'] */
  requiredLocales?: string[]
  /** 是否自动修复缺失的 key */
  fix?: boolean
  /** 中文缺失占位符 */
  zhPlaceholder?: string
  /** 英文缺失占位符 */
  enPlaceholder?: string
  /** Fallback 规则检查（检查 i18n 配置文件） */
  checkFallback?: boolean
  /** 期望的 fallback 规则 */
  fallbackRules?: {
    /** 应该 fallback 到 zh 的语言 */
    toZh?: string[]
    /** 默认 fallback 语言 */
    default?: string
  }
}

export interface CheckResult {
  success: boolean
  errors: string[]
  warnings: string[]
  fixes: string[]
}

const DEFAULT_OPTIONS: Required<Omit<CheckOptions, 'root'>> = {
  i18nDir: 'src/i18n',
  localesDir: 'locales',
  requiredLocales: ['zh', 'en'],
  fix: false,
  zhPlaceholder: '[缺失]',
  enPlaceholder: '[MISSING]',
  checkFallback: true,
  fallbackRules: {
    toZh: ['zh-CN', 'zh-TW', 'zh-HK'],
    default: 'en',
  },
}

/**
 * 检查 i18n 配置和翻译文件完整性
 */
export function checkI18n(options: CheckOptions): CheckResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const result: CheckResult = {
    success: true,
    errors: [],
    warnings: [],
    fixes: [],
  }

  const localesPath = join(opts.root, opts.i18nDir, opts.localesDir)

  // 1. 检查目录存在
  if (!existsSync(localesPath)) {
    result.errors.push(`Locales directory not found: ${localesPath}`)
    result.success = false
    return result
  }

  // 2. 检查必需的语言文件
  const localeFiles: Map<string, string> = new Map()
  for (const locale of opts.requiredLocales) {
    const filePath = join(localesPath, `${locale}.json`)
    if (!existsSync(filePath)) {
      result.errors.push(`Missing required locale file: ${locale}.json`)
      result.success = false
    } else {
      localeFiles.set(locale, filePath)
    }
  }

  if (!result.success) return result

  // 3. 检查 fallback 配置
  if (opts.checkFallback) {
    const configPath = join(opts.root, opts.i18nDir, 'index.ts')
    if (existsSync(configPath)) {
      const configContent = readFileSync(configPath, 'utf-8')
      
      // 检查 zh 系列语言的 fallback
      for (const lang of opts.fallbackRules.toZh || []) {
        const pattern1 = `'${lang}': ['zh']`
        const pattern2 = `"${lang}": ["zh"]`
        if (!configContent.includes(pattern1) && !configContent.includes(pattern2)) {
          result.errors.push(`Missing fallback rule: ${lang} → zh`)
          result.success = false
        }
      }

      // 检查默认 fallback
      const defaultLang = opts.fallbackRules.default || 'en'
      const defaultPattern1 = `'default': ['${defaultLang}']`
      const defaultPattern2 = `"default": ["${defaultLang}"]`
      if (!configContent.includes(defaultPattern1) && !configContent.includes(defaultPattern2)) {
        result.errors.push(`Missing default fallback rule: default → ${defaultLang}`)
        result.success = false
      }
    } else {
      result.warnings.push(`i18n config not found: ${configPath}`)
    }
  }

  // 4. 检查 key 一致性
  const localeData: Map<string, TranslationFile> = new Map()
  const allKeys: Map<string, Set<string>> = new Map()

  for (const [locale, filePath] of localeFiles) {
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf-8')) as TranslationFile
      localeData.set(locale, data)
      allKeys.set(locale, new Set(extractKeys(data)))
    } catch (e) {
      result.errors.push(`Failed to parse ${locale}.json: ${e}`)
      result.success = false
    }
  }

  if (!result.success) return result

  // 以 zh 为基准检查 en
  const zhKeys = allKeys.get('zh')!
  const enKeys = allKeys.get('en')!
  const zhData = localeData.get('zh')!
  const enData = localeData.get('en')!

  const missingInEn = [...zhKeys].filter(k => !enKeys.has(k))
  const missingInZh = [...enKeys].filter(k => !zhKeys.has(k))

  if (missingInEn.length > 0) {
    result.warnings.push(`en.json missing ${missingInEn.length} key(s) from zh.json`)
    for (const key of missingInEn) {
      result.warnings.push(`  - ${key}`)
    }

    if (opts.fix) {
      for (const key of missingInEn) {
        setNestedValue(enData, key, `${opts.enPlaceholder} ${key}`)
      }
      writeFileSync(localeFiles.get('en')!, JSON.stringify(enData, null, 2) + '\n')
      result.fixes.push(`Added ${missingInEn.length} placeholder(s) to en.json`)
    } else {
      result.success = false
    }
  }

  if (missingInZh.length > 0) {
    result.warnings.push(`zh.json missing ${missingInZh.length} key(s) from en.json`)
    for (const key of missingInZh) {
      result.warnings.push(`  - ${key}`)
    }

    if (opts.fix) {
      for (const key of missingInZh) {
        setNestedValue(zhData, key, `${opts.zhPlaceholder} ${key}`)
      }
      writeFileSync(localeFiles.get('zh')!, JSON.stringify(zhData, null, 2) + '\n')
      result.fixes.push(`Added ${missingInZh.length} placeholder(s) to zh.json`)
    } else {
      result.success = false
    }
  }

  return result
}
