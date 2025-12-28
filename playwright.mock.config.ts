/**
 * Playwright 配置 - Mock 环境
 * 
 * 用于需要预设数据的测试（如交易历史、余额显示等）
 * 
 * 运行命令: pnpm e2e:mock
 * 
 * 端口规则: 默认端口 + 6000 避免冲突
 * - dev: 5173 → mock: 11173
 * - dev:mock: 5174 → e2e:mock: 11174
 */

import { defineConfig } from '@playwright/test'
import baseConfig from './playwright.config'

// 使用 11174 端口避免与 vite 默认端口冲突
const MOCK_PORT = 11174

export default defineConfig({
  ...baseConfig,
  
  // 只运行 *.mock.spec.ts 测试
  testMatch: ['**/*.mock.spec.ts'],
  testIgnore: [],
  
  use: {
    ...baseConfig.use,
    baseURL: `https://localhost:${MOCK_PORT}`,
    ignoreHTTPSErrors: true,
  },

  // 使用 Mock 服务（端口 11174，避免与 vite 默认 517x 冲突）
  webServer: {
    command: `pnpm dev:mock --port ${MOCK_PORT}`,
    url: `https://localhost:${MOCK_PORT}`,
    ignoreHTTPSErrors: true,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
