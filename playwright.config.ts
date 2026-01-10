/**
 * Playwright 配置 - 默认使用 Dev 环境
 * 
 * 测试分类：
 * - *.spec.ts: 在 dev 环境运行（真实服务，不含预设数据）
 * - *.mock.spec.ts: 在 mock 环境运行（使用 playwright.mock.config.ts）
 * 
 * 运行命令：
 * - pnpm e2e              # 运行 dev 环境测试
 * - pnpm e2e:mock         # 运行 mock 环境测试
 * - pnpm e2e:real         # 运行真实转账测试（需要资金账户）
 * 
 * 端口规则: 默认端口 + 6000 避免冲突
 * - e2e: 11173 (dev)
 * - e2e:mock: 11174 (mock)
 */

import { defineConfig, devices } from '@playwright/test'

// 使用 11173 端口避免与 vite 默认端口冲突
const DEV_PORT = 11173

// 绕过本地代理
process.env.NO_PROXY = 'localhost,127.0.0.1,::1'
process.env.no_proxy = 'localhost,127.0.0.1,::1'
delete process.env.http_proxy
delete process.env.https_proxy
delete process.env.HTTP_PROXY
delete process.env.HTTPS_PROXY
delete process.env.all_proxy
delete process.env.ALL_PROXY

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/test-results',
  
  // 排除 mock 测试（它们使用单独的配置）
  testIgnore: ['**/*.mock.spec.ts'],
  
  // 按测试名归类截图：e2e/__screenshots__/{projectName}/{testFileName 去掉后缀}/{arg}.png
  // 使用 {testFileName} 模板变量，Playwright 会自动替换
  snapshotPathTemplate: 'e2e/__screenshots__/{projectName}/{testFileName}/{arg}{ext}',
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html', { outputFolder: './e2e/report', open: 'never' }],
    ['list'],
  ],
  
  use: {
    baseURL: `https://localhost:${DEV_PORT}`,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // 默认使用移动端配置 (Pixel 5)
    ...devices['Pixel 5'],
    locale: process.env.TEST_LOCALE || 'en-US',
  },

  // 截图对比配置
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      threshold: 0.3,
    },
  },

  projects: [
    // 语言通过 TEST_LOCALE 环境变量控制，默认英文
    // 运行 pnpm e2e:i18n 测试中文环境
    {
      name: 'Mobile Chrome',
      use: {
        // 项目级别配置会合并/覆盖全局 use 配置
      },
    },
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
  ],

  // 使用标准 dev 服务器（端口 11173，避免与 vite 默认 517x 冲突）
  webServer: {
    command: `pnpm dev --port ${DEV_PORT}`,
    url: `https://localhost:${DEV_PORT}`,
    ignoreHTTPSErrors: true,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
