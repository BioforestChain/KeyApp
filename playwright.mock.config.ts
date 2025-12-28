/**
 * Playwright 配置 - Mock 环境
 * 
 * 用于需要预设数据的测试（如交易历史、余额显示等）
 * 
 * 运行命令: pnpm e2e:mock
 */

import { defineConfig } from '@playwright/test'
import baseConfig from './playwright.config'

export default defineConfig({
  ...baseConfig,
  
  // 只运行 *.mock.spec.ts 测试
  testMatch: ['**/*.mock.spec.ts'],
  testIgnore: [],
  
  use: {
    ...baseConfig.use,
    baseURL: 'https://localhost:5174',
    ignoreHTTPSErrors: true,
  },

  // 使用 Mock 服务（端口 5174）
  webServer: {
    command: 'pnpm dev:mock',
    url: 'https://localhost:5174',
    ignoreHTTPSErrors: true,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
