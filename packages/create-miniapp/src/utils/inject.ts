import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import type { FinalOptions } from '../types'

/**
 * 生成 manifest.json
 */
export function generateManifest(projectDir: string, options: FinalOptions): void {
  const manifest = {
    id: options.appId,
    name: options.name,
    description: `${options.name} - Bio 生态小程序`,
    longDescription: `${options.name} 是一个 Bio 生态小程序。`,
    icon: 'icon.svg',
    version: '0.1.0',
    author: 'Bio Team',
    website: `https://${options.name}.dweb.xin`,
    category: 'utility',
    tags: [],
    permissions: ['bio_requestAccounts'],
    chains: ['bfmeta'],
    officialScore: 0,
    communityScore: 0,
    screenshots: [],
    publishedAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    beta: true,
    themeColor: 'from-blue-800 via-indigo-900 to-purple-950',
    themeColorFrom: '#1e40af',
    // 启动屏配置 - 自动使用 icon 和 themeColorFrom 作为背景
    ...(options.noSplash ? {} : { splashScreen: true }),
  }

  writeFileSync(
    resolve(projectDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  )
}

/**
 * 生成 .oxlintrc.json
 */
export function generateOxlintConfig(projectDir: string): void {
  const config = {
    $schema: 'https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json',
    plugins: ['react', 'typescript', 'jsx-a11y', 'unicorn'],
    jsPlugins: ['eslint-plugin-i18next'],
    categories: {
      correctness: 'warn',
      suspicious: 'warn',
      pedantic: 'off',
      perf: 'warn',
      style: 'off',
      restriction: 'off',
      nursery: 'off',
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      eqeqeq: 'error',
      'no-var': 'error',
      'prefer-const': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-key': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-unescaped-entities': 'warn',
      'react/self-closing-comp': 'warn',
      'react/jsx-no-useless-fragment': 'warn',
      'react/jsx-curly-brace-presence': 'warn',
      'react/no-array-index-key': 'warn',
      'typescript/no-explicit-any': 'error',
      'typescript/prefer-ts-expect-error': 'warn',
      'typescript/no-non-null-assertion': 'warn',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'unicorn/no-null': 'off',
      'unicorn/prefer-query-selector': 'off',
      'unicorn/require-module-specifiers': 'off',
      'i18next/no-literal-string': ['warn', {
        mode: 'jsx-only',
        'jsx-components': { exclude: ['Trans', 'Icon', 'TablerIcon'] },
        'jsx-attributes': {
          exclude: [
            'className', 'styleName', 'style', 'type', 'key', 'id', 'name', 'role', 'as', 'asChild',
            'data-testid', 'data-test', 'data-slot', 'data-state', 'data-side', 'data-align',
            'to', 'href', 'src', 'alt', 'target', 'rel', 'method', 'action',
            'variant', 'size', 'color', 'weight', 'sign', 'align', 'justify', 'direction', 'orientation',
          ],
        },
        callees: {
          exclude: [
            't', 'i18n.t', 'useTranslation', 'Trans',
            'console.*', 'require', 'import', 'Error', 'TypeError',
            'describe', 'it', 'test', 'expect', 'vi.*',
          ],
        },
        words: {
          exclude: ['[A-Z_-]+', '[0-9.]+', '^\\s*$', '^[a-z]+$', '^https?://'],
        },
      }],
    },
    env: {
      browser: true,
      es2024: true,
    },
    ignorePatterns: [
      'node_modules',
      'dist',
      'coverage',
      '*.config.ts',
      '**/*.test.ts',
      '**/*.test.tsx',
    ],
  }

  writeFileSync(
    resolve(projectDir, '.oxlintrc.json'),
    JSON.stringify(config, null, 2)
  )
}

/**
 * 生成 vitest.config.ts (支持 unit + storybook 双项目)
 */
export function generateVitestConfig(projectDir: string): void {
  const content = `import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    projects: [
      // 单元测试项目 (jsdom)
      {
        extends: './vite.config.ts',
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./src/test-setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.stories.test.{ts,tsx}'],
        },
      },
      // Storybook 组件测试项目 (真实浏览器)
      {
        extends: './vite.config.ts',
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            storybookScript: 'pnpm storybook --ci',
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
})
`
  writeFileSync(resolve(projectDir, 'vitest.config.ts'), content)
}

/**
 * 生成 playwright.config.ts
 */
export function generatePlaywrightConfig(projectDir: string, port: number): void {
  const content = `import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.E2E_BASE_URL || 'https://localhost:${port}'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
})
`
  writeFileSync(resolve(projectDir, 'playwright.config.ts'), content)
}

/**
 * 生成 src/bio.d.ts
 */
export function generateBioTypes(projectDir: string): void {
  const srcDir = resolve(projectDir, 'src')
  if (!existsSync(srcDir)) {
    mkdirSync(srcDir, { recursive: true })
  }

  const content = `/// <reference types="@biochain/bio-sdk/types" />
`
  writeFileSync(resolve(srcDir, 'bio.d.ts'), content)
}

/**
 * 生成 src/test-setup.ts
 */
export function generateTestSetup(projectDir: string): void {
  const srcDir = resolve(projectDir, 'src')
  if (!existsSync(srcDir)) {
    mkdirSync(srcDir, { recursive: true })
  }

  const content = `import '@testing-library/jest-dom/vitest'
`
  writeFileSync(resolve(srcDir, 'test-setup.ts'), content)
}

/**
 * 生成 e2e 目录和基础测试
 */
export function generateE2ESetup(projectDir: string, name: string): void {
  const e2eDir = resolve(projectDir, 'e2e')
  if (!existsSync(e2eDir)) {
    mkdirSync(e2eDir, { recursive: true })
  }

  const content = `import { test, expect } from '@playwright/test'

test('${name} loads correctly', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/${name}/i)
})
`
  writeFileSync(resolve(e2eDir, `${name}.spec.ts`), content)

  const scriptsDir = resolve(projectDir, 'scripts')
  if (!existsSync(scriptsDir)) {
    mkdirSync(scriptsDir, { recursive: true })
  }

  const e2eScript = `import { execSync } from 'child_process'

const args = process.argv.slice(2).join(' ')
execSync(\`playwright test \${args}\`, { stdio: 'inherit' })
`
  writeFileSync(resolve(scriptsDir, 'e2e.ts'), e2eScript)
}

/**
 * 更新 package.json 添加依赖和脚本
 */
export function updatePackageJson(projectDir: string, name: string, port: number): void {
  const pkgPath = resolve(projectDir, 'package.json')
  if (!existsSync(pkgPath)) return

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

  pkg.name = `@biochain/miniapp-${name}`
  pkg.private = true
  pkg.description = `${name} - Bio 生态小程序`

  // Storybook 端口: 6007 + (port - 5184)
  const storybookPort = 6007 + (port - 5184)

  pkg.scripts = {
    ...pkg.scripts,
    'lint': 'oxlint .',
    'lint:run': 'oxlint .',
    'typecheck': 'tsc --noEmit',
    'typecheck:run': 'tsc --noEmit',
    'test': 'vitest',
    'test:run': 'vitest run --project=unit',
    'test:storybook': 'vitest run --project=storybook',
    'storybook': `storybook dev -p ${storybookPort}`,
    'build-storybook': 'storybook build',
    'e2e': 'bun scripts/e2e.ts',
    'e2e:run': 'bun scripts/e2e.ts',
    'e2e:update': 'bun scripts/e2e.ts --update-snapshots',
    'e2e:ui': 'playwright test --ui',
    'e2e:audit': 'bunx @biochain/e2e-tools audit --strict',
    'gen-logo': 'bun scripts/gen-logo.ts',
    'i18n:run': 'bunx @biochain/i18n-tools',
    'theme:run': 'bunx @biochain/theme-tools',
  }

  pkg.dependencies = {
    ...pkg.dependencies,
    '@biochain/bio-sdk': 'workspace:*',
    '@biochain/keyapp-sdk': 'workspace:*',
    'i18next': '^25.2.1',
    'react-i18next': '^15.5.2',
  }

  pkg.devDependencies = {
    ...pkg.devDependencies,
    '@biochain/e2e-tools': 'workspace:*',
    '@biochain/i18n-tools': 'workspace:*',
    '@biochain/theme-tools': 'workspace:*',
    '@playwright/test': '^1.49.1',
    '@storybook/addon-docs': '^10.1.4',
    '@storybook/addon-vitest': '^10.1.4',
    '@storybook/react': '^10.1.4',
    '@storybook/react-vite': '^10.1.4',
    '@testing-library/jest-dom': '^6.6.3',
    '@testing-library/react': '^16.0.0',
    '@vitest/browser': '^4.0.15',
    '@vitest/browser-playwright': '^4.0.15',
    'eslint-plugin-i18next': '^6.1.3',
    'jsdom': '^26.1.0',
    'oxlint': '^1.32.0',
    'playwright': '^1.57.0',
    'sharp': '^0.34.0',
    'storybook': '^10.1.4',
    'vite-plugin-mkcert': '^1.17.9',
    'vite-tsconfig-paths': '^5.1.0',
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
}

/**
 * 更新 vite.config.ts 添加 miniapp 插件
 */
export function updateViteConfig(projectDir: string, port: number): void {
  const configPath = resolve(projectDir, 'vite.config.ts')
  if (!existsSync(configPath)) return

  const content = `import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'
import { resolve } from 'path'
import { existsSync, readFileSync, readdirSync } from 'fs'

const E2E_SCREENSHOTS_DIR = resolve(__dirname, '../../e2e/__screenshots__/Desktop-Chrome/miniapp-ui.mock.spec.ts')
const MANIFEST_PATH = resolve(__dirname, 'manifest.json')

function getShortId(): string {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'))
  return manifest.id.split('.').pop() || ''
}

function scanScreenshots(shortId: string): string[] {
  if (!existsSync(E2E_SCREENSHOTS_DIR)) return []
  return readdirSync(E2E_SCREENSHOTS_DIR)
    .filter(f => f.startsWith(\`\${shortId}-\`) && f.endsWith('.png'))
    .slice(0, 2)
    .map(f => \`screenshots/\${f}\`)
}

function miniappPlugin(): Plugin {
  const shortId = getShortId()
  return {
    name: 'miniapp-manifest',
    configureServer(server) {
      server.middlewares.use('/manifest.json', (_req, res) => {
        const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'))
        manifest.screenshots = scanScreenshots(shortId)
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.end(JSON.stringify(manifest, null, 2))
      })
      server.middlewares.use('/screenshots', (req, res, next) => {
        const filename = req.url?.slice(1) || ''
        const filepath = resolve(E2E_SCREENSHOTS_DIR, filename)
        if (existsSync(filepath)) {
          res.setHeader('Content-Type', 'image/png')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(readFileSync(filepath))
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [
    mkcert(),
    react(),
    tsconfigPaths(),
    tailwindcss(),
    miniappPlugin(),
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    https: true,
    port: ${port},
    fs: {
      allow: [resolve(__dirname, '../..')],
    },
  },
})
`
  writeFileSync(configPath, content)
}

/**
 * 更新 main.tsx 添加 bio-sdk 和 i18n 导入
 */
export function updateMainTsx(projectDir: string): void {
  const mainPath = resolve(projectDir, 'src/main.tsx')
  if (!existsSync(mainPath)) return

  let content = readFileSync(mainPath, 'utf-8')

  const imports: string[] = []

  if (!content.includes('@biochain/bio-sdk')) {
    imports.push("import '@biochain/bio-sdk'")
  }

  if (!content.includes('./i18n')) {
    imports.push("import './i18n'")
  }

  if (imports.length > 0) {
    content = imports.join('\n') + '\n' + content
    writeFileSync(mainPath, content)
  }
}

/**
 * 更新 App.tsx 添加 closeSplashScreen 调用
 */
export function updateAppTsx(projectDir: string, options: FinalOptions): void {
  if (options.noSplash) return

  const appPath = resolve(projectDir, 'src/App.tsx')
  if (!existsSync(appPath)) return

  let content = readFileSync(appPath, 'utf-8')

  // 检查是否已有 useEffect 导入
  if (!content.includes('useEffect')) {
    // 添加 useEffect 导入
    content = content.replace(
      /import \{ ([^}]+) \} from ['"]react['"]/,
      "import { $1, useEffect } from 'react'"
    )
  }

  // 在 App 函数开始处添加 closeSplashScreen 调用
  const splashEffect = `
  // 关闭启动屏
  useEffect(() => {
    window.bio?.request({ method: 'bio_closeSplashScreen' })
  }, [])
`

  // 找到 function App 或 export default function App 并在其后插入
  if (!content.includes('closeSplashScreen')) {
    // 尝试匹配 function App() { 或 export default function App() {
    const functionMatch = content.match(/((?:export\s+default\s+)?function\s+App\s*\([^)]*\)\s*\{)/)
    if (functionMatch) {
      content = content.replace(functionMatch[1], functionMatch[1] + splashEffect)
    }
  }

  writeFileSync(appPath, content)
}

/**
 * 生成 i18n 国际化配置
 */
export function generateI18nSetup(projectDir: string, name: string): void {
  const i18nDir = resolve(projectDir, 'src/i18n')
  const localesDir = resolve(i18nDir, 'locales')
  mkdirSync(localesDir, { recursive: true })

  // src/i18n/index.ts
  const indexContent = `import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import zh from './locales/zh.json'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'

export const languages = {
  'zh-CN': { name: '简体中文', dir: 'ltr' as const },
  'zh-TW': { name: '中文（繁體）', dir: 'ltr' as const },
  'en': { name: 'English', dir: 'ltr' as const },
} as const

export type LanguageCode = keyof typeof languages

export const defaultLanguage: LanguageCode = 'zh-CN'

export function getLanguageDirection(lang: LanguageCode): 'ltr' | 'rtl' {
  return languages[lang]?.dir ?? 'ltr'
}

export function isRTL(lang: LanguageCode): boolean {
  return getLanguageDirection(lang) === 'rtl'
}

i18n.use(initReactI18next).init({
  resources: {
    'en': { translation: en },
    'zh': { translation: zh },
    'zh-CN': { translation: zhCN },
    'zh-TW': { translation: zhTW },
  },
  lng: defaultLanguage,
  fallbackLng: {
    'zh-CN': ['zh'],
    'zh-TW': ['zh'],
    'zh-HK': ['zh'],
    'default': ['en'],
  },
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

export default i18n
`
  writeFileSync(resolve(i18nDir, 'index.ts'), indexContent)

  // src/i18n/i18next.d.ts
  const typesContent = `import 'i18next'
import type en from './locales/en.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof en
    }
  }
}
`
  writeFileSync(resolve(i18nDir, 'i18next.d.ts'), typesContent)

  // Locale files
  const enLocale = {
    app: {
      title: name,
      subtitle: 'Bio Miniapp',
      description: `${name} - A Bio ecosystem miniapp`,
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      done: 'Done',
    },
    connect: {
      button: 'Connect Wallet',
      loading: 'Connecting...',
    },
    error: {
      sdkNotInit: 'Bio SDK not initialized',
      connectionFailed: 'Connection failed',
    },
  }

  const zhLocale = {
    app: {
      title: name,
      subtitle: 'Bio 小程序',
      description: `${name} - Bio 生态小程序`,
    },
    common: {
      loading: '加载中...',
      error: '错误',
      retry: '重试',
      cancel: '取消',
      confirm: '确认',
      back: '返回',
      next: '下一步',
      done: '完成',
    },
    connect: {
      button: '连接钱包',
      loading: '连接中...',
    },
    error: {
      sdkNotInit: 'Bio SDK 未初始化',
      connectionFailed: '连接失败',
    },
  }

  const zhCNLocale = { ...zhLocale }
  const zhTWLocale = {
    app: {
      title: name,
      subtitle: 'Bio 小程式',
      description: `${name} - Bio 生態小程式`,
    },
    common: {
      loading: '載入中...',
      error: '錯誤',
      retry: '重試',
      cancel: '取消',
      confirm: '確認',
      back: '返回',
      next: '下一步',
      done: '完成',
    },
    connect: {
      button: '連接錢包',
      loading: '連接中...',
    },
    error: {
      sdkNotInit: 'Bio SDK 未初始化',
      connectionFailed: '連接失敗',
    },
  }

  writeFileSync(resolve(localesDir, 'en.json'), JSON.stringify(enLocale, null, 2))
  writeFileSync(resolve(localesDir, 'zh.json'), JSON.stringify(zhLocale, null, 2))
  writeFileSync(resolve(localesDir, 'zh-CN.json'), JSON.stringify(zhCNLocale, null, 2))
  writeFileSync(resolve(localesDir, 'zh-TW.json'), JSON.stringify(zhTWLocale, null, 2))
}

/**
 * 生成 i18n 单元测试
 */
export function generateI18nTest(projectDir: string): void {
  const content = `import { describe, it, expect } from 'vitest'
import i18n, { languages, defaultLanguage, getLanguageDirection } from './index'

describe('i18n configuration', () => {
  it('should have default language set to zh-CN', () => {
    expect(defaultLanguage).toBe('zh-CN')
  })

  it('should have all required languages', () => {
    expect(Object.keys(languages)).toContain('zh-CN')
    expect(Object.keys(languages)).toContain('zh-TW')
    expect(Object.keys(languages)).toContain('en')
  })

  it('should return correct direction for languages', () => {
    expect(getLanguageDirection('zh-CN')).toBe('ltr')
    expect(getLanguageDirection('en')).toBe('ltr')
  })

  it('should initialize i18n correctly', () => {
    expect(i18n.isInitialized).toBe(true)
    expect(i18n.language).toBe(defaultLanguage)
  })
})
`
  writeFileSync(resolve(projectDir, 'src/i18n/index.test.ts'), content)
}

/**
 * 生成 App 组件测试
 */
export function generateAppTest(projectDir: string, name: string): void {
  const content = `import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock bio SDK
const mockBio = {
  request: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  isConnected: vi.fn(() => true),
}

describe('${name} App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(window as unknown as { bio: typeof mockBio }).bio = mockBio
  })

  it('should render without crashing', () => {
    render(<App />)
    expect(document.body).toBeInTheDocument()
  })

  it('should call closeSplashScreen on mount', async () => {
    render(<App />)
    expect(mockBio.request).toHaveBeenCalledWith({
      method: 'bio_closeSplashScreen',
    })
  })
})
`
  writeFileSync(resolve(projectDir, 'src/App.test.tsx'), content)
}

/**
 * 生成 E2E 测试辅助工具
 */
export function generateE2EHelpers(projectDir: string, name: string): void {
  const helpersDir = resolve(projectDir, 'e2e/helpers')
  mkdirSync(helpersDir, { recursive: true })

  const content = `/**
 * ${name} E2E 测试国际化辅助
 */

import type { Page, Locator } from '@playwright/test'

export const UI_TEXT = {
  common: {
    loading: /加载中|Loading/i,
    error: /错误|Error/i,
    retry: /重试|Retry/i,
    cancel: /取消|Cancel/i,
    confirm: /确认|Confirm/i,
  },
  connect: {
    button: /连接钱包|Connect Wallet/i,
    loading: /连接中|Connecting/i,
  },
} as const

export const TEST_IDS = {
  app: 'app',
  connectButton: 'connect-button',
  loading: 'loading',
} as const

export function byTestId(page: Page, testId: string): Locator {
  return page.locator(\`[data-testid="\${testId}"]\`)
}

export function i18nLocator(page: Page, selector: string, text: RegExp): Locator {
  return page.locator(\`\${selector}:has-text("\${text.source}")\`)
}

export async function setLanguage(page: Page, lang: string) {
  await page.addInitScript((language) => {
    localStorage.setItem('i18nextLng', language)
  }, lang)
}

export const mockBioSDK = \`
  window.bio = {
    request: async ({ method }) => {
      if (method === 'bio_selectAccount') {
        return { address: '0x1234...5678', name: 'Test Wallet' }
      }
      if (method === 'bio_closeSplashScreen') {
        return {}
      }
      return {}
    },
    on: () => {},
    off: () => {},
    isConnected: () => true,
  }
\`
`
  writeFileSync(resolve(helpersDir, 'i18n.ts'), content)
}

/**
 * 生成 Logo 处理脚本
 */
export function generateLogoScript(projectDir: string): void {
  const scriptsDir = resolve(projectDir, 'scripts')
  mkdirSync(scriptsDir, { recursive: true })

  const content = `import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { existsSync } from 'fs'

const SIZES = [64, 128, 256, 512]
const INPUT = process.argv[2] || 'logo.png'
const OUTPUT_DIR = 'public/logos'
const SVG_OUTPUT = 'icon.svg'

async function main() {
  if (!existsSync(INPUT)) {
    console.error(\`Error: Input file "\${INPUT}" not found\`)
    console.log('Usage: bun scripts/gen-logo.ts [input-image]')
    console.log('Example: bun scripts/gen-logo.ts logo.png')
    process.exit(1)
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  // 先 trim 一次，获取裁切后的 buffer
  const trimmed = await sharp(INPUT).trim().toBuffer()
  const metadata = await sharp(trimmed).metadata()

  console.log(\`Processing: \${INPUT} (\${metadata.width}x\${metadata.height})\`)

  // 生成各尺寸 WebP
  for (const size of SIZES) {
    const buffer = await sharp(trimmed)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 100, lossless: true })
      .toBuffer()

    const outPath = path.join(OUTPUT_DIR, \`logo-\${size}.webp\`)
    await fs.writeFile(outPath, buffer)
    console.log(\`✓ \${outPath}\`)
  }

  // 生成 256x256 PNG 作为主 icon
  const pngBuffer = await sharp(trimmed)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  const pngPath = path.join(OUTPUT_DIR, 'icon.png')
  await fs.writeFile(pngPath, pngBuffer)
  console.log(\`✓ \${pngPath}\`)

  // 生成 SVG wrapper (嵌入 PNG base64)
  const base64 = pngBuffer.toString('base64')
  const svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <image width="256" height="256" href="data:image/png;base64,\${base64}"/>
</svg>\`

  await fs.writeFile(SVG_OUTPUT, svg)
  console.log(\`✓ \${SVG_OUTPUT}\`)

  console.log('\\nDone! Update manifest.json icon field if needed.')
}

main().catch(console.error)
`
  writeFileSync(resolve(scriptsDir, 'gen-logo.ts'), content)
}

/**
 * 更新 E2E spec 使用 helpers
 */
export function generateE2ESpec(projectDir: string, name: string): void {
  const e2eDir = resolve(projectDir, 'e2e')
  mkdirSync(e2eDir, { recursive: true })

  const content = `import { test, expect } from '@playwright/test'
import { UI_TEXT, mockBioSDK } from './helpers/i18n'

test.describe('${name} UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('01 - initial load', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('01-initial.png')
  })

  test('02 - with wallet connected', async ({ page }) => {
    await page.addInitScript(mockBioSDK)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const connectButton = page.locator(\`button\`).filter({ hasText: UI_TEXT.connect.button })
    if (await connectButton.isVisible()) {
      await connectButton.click()
    }

    await expect(page).toHaveScreenshot('02-connected.png')
  })
})
`
  writeFileSync(resolve(e2eDir, `${name}.spec.ts`), content)
}

/**
 * 生成 Storybook 配置
 */
export function generateStorybookConfig(projectDir: string): void {
  const storybookDir = resolve(projectDir, '.storybook')
  mkdirSync(storybookDir, { recursive: true })

  // .storybook/main.ts
  const mainContent = `import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-vitest', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}

export default config
`
  writeFileSync(resolve(storybookDir, 'main.ts'), mainContent)

  // .storybook/preview.tsx
  const previewContent = `import type { Preview, ReactRenderer } from '@storybook/react-vite'
import type { DecoratorFunction } from 'storybook/internal/types'
import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n, { languages, defaultLanguage, getLanguageDirection, type LanguageCode } from '../src/i18n'
import '../src/index.css'

const mobileViewports = {
  iPhoneSE: {
    name: 'iPhone SE',
    styles: { width: '375px', height: '667px' },
    type: 'mobile' as const,
  },
  iPhone13: {
    name: 'iPhone 13',
    styles: { width: '390px', height: '844px' },
    type: 'mobile' as const,
  },
  iPhone13ProMax: {
    name: 'iPhone 13 Pro Max',
    styles: { width: '428px', height: '926px' },
    type: 'mobile' as const,
  },
}

const preview: Preview = {
  parameters: {
    viewport: {
      viewports: mobileViewports,
      defaultViewport: 'iPhone13',
    },
    backgrounds: {
      disable: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Language',
      defaultValue: defaultLanguage,
      toolbar: {
        icon: 'globe',
        items: Object.entries(languages).map(([code, config]) => ({
          value: code,
          title: \`\${config.name} (\${config.dir.toUpperCase()})\`,
          right: config.dir === 'rtl' ? '←' : '→',
        })),
        dynamicTitle: true,
      },
    },
    theme: {
      name: 'Theme',
      description: 'Color theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    // i18n + Theme decorator
    ((Story, context) => {
      const locale = (context.globals['locale'] || defaultLanguage) as LanguageCode
      const theme = context.globals['theme'] || 'light'
      const direction = getLanguageDirection(locale)

      useEffect(() => {
        if (i18n.language !== locale) {
          i18n.changeLanguage(locale)
        }
        document.documentElement.lang = locale
        document.documentElement.dir = direction

        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }, [locale, theme, direction])

      return (
        <I18nextProvider i18n={i18n}>
          <Story />
        </I18nextProvider>
      )
    }) as DecoratorFunction<ReactRenderer>,

    // Container decorator with theme wrapper
    ((Story, context) => {
      const theme = context.globals['theme'] || 'light'
      const direction = getLanguageDirection((context.globals['locale'] || defaultLanguage) as LanguageCode)
      const isDark = theme === 'dark'

      return (
        <div className={\`min-h-screen bg-background text-foreground transition-colors \${isDark ? 'dark' : ''}\`}>
          <div
            className="mx-auto"
            dir={direction}
            style={{
              maxWidth: 428,
              minHeight: '100vh',
            }}
          >
            <Story />
          </div>
        </div>
      )
    }) as DecoratorFunction<ReactRenderer>,
  ],
}

export default preview
`
  writeFileSync(resolve(storybookDir, 'preview.tsx'), previewContent)

  // .storybook/vitest.setup.ts
  const vitestSetupContent = `import { beforeAll } from 'vitest'
import { setProjectAnnotations } from '@storybook/react-vite'
import * as previewAnnotations from './preview'

const annotations = setProjectAnnotations([previewAnnotations])

beforeAll(annotations.beforeAll)
`
  writeFileSync(resolve(storybookDir, 'vitest.setup.ts'), vitestSetupContent)
}

/**
 * 生成示例 Story 文件 (仅用于自定义组件，shadcn/ui 组件不需要 story)
 */
export function generateExampleStory(_projectDir: string): void {
  // shadcn/ui 组件不需要 story，自定义组件由开发者自行添加
}
