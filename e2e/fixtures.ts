/**
 * E2E Test Fixtures
 * 
 * 提供统一的测试 fixtures，包括：
 * - 控制台错误检测：测试结束时如果有未处理的控制台错误则失败
 * - 页面错误检测：捕获未处理的 JavaScript 错误
 * 
 * 使用方式：在测试文件中替换导入
 * ```typescript
 * // 替换原有导入
 * // import { test, expect } from '@playwright/test'
 * import { test, expect } from './fixtures'
 * ```
 */

import { test as base, expect, type Page } from '@playwright/test'

/** 允许的控制台错误模式（这些不会导致测试失败） */
const ALLOWED_ERROR_PATTERNS = [
  // React 开发模式警告
  /Warning:/,
  // Vite HMR
  /\[vite\]/,
  // 网络请求失败（可能是预期的 mock）
  /Failed to load resource/,
  /net::ERR_/,
  // 第三方库的已知警告
  /ResizeObserver loop/,
  // 开发环境的 source map 警告
  /DevTools failed to load source map/,
]

/** 检查错误是否在允许列表中 */
function isAllowedError(message: string): boolean {
  return ALLOWED_ERROR_PATTERNS.some(pattern => pattern.test(message))
}

export interface ConsoleMessage {
  type: string
  text: string
  location: string
}

/**
 * 扩展的 test fixture，包含控制台错误检测
 * 
 * consoleErrors 和 pageErrors 会自动收集错误，测试结束时断言
 */
export const test = base.extend<{
  /** 收集的控制台错误 */
  consoleErrors: ConsoleMessage[]
  /** 收集的页面错误 */
  pageErrors: Error[]
}>({
  consoleErrors: async ({ page }, use) => {
    const errors: ConsoleMessage[] = []

    // 监听控制台消息
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (!isAllowedError(text)) {
          errors.push({
            type: msg.type(),
            text,
            location: msg.location().url || 'unknown',
          })
        }
      }
    })

    await use(errors)

    // 测试结束后检查是否有错误
    if (errors.length > 0) {
      const errorMessages = errors
        .map((e, i) => `  ${i + 1}. ${e.text}\n     at ${e.location}`)
        .join('\n')
      
      // 使用 soft assertion，这样可以看到所有错误
      expect.soft(
        errors.length,
        `Console errors detected:\n${errorMessages}`
      ).toBe(0)
    }
  },

  pageErrors: async ({ page }, use) => {
    const errors: Error[] = []

    // 监听未捕获的 JavaScript 错误
    page.on('pageerror', error => {
      errors.push(error)
    })

    await use(errors)

    // 测试结束后检查是否有页面错误
    if (errors.length > 0) {
      const errorMessages = errors
        .map((e, i) => `  ${i + 1}. ${e.message}\n     ${e.stack?.split('\n')[1] || ''}`)
        .join('\n')
      
      expect.soft(
        errors.length,
        `Uncaught page errors:\n${errorMessages}`
      ).toBe(0)
    }
  },
})

export { expect }
export type { Page }
