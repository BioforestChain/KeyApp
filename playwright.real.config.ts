/**
 * Playwright 配置 - 真实环境测试（不使用 mock）
 * 
 * 用于测试真实的链上交易
 * 运行: pnpm playwright test --config playwright.real.config.ts
 */

import { defineConfig } from '@playwright/test'
import baseConfig from './playwright.config'

export default defineConfig({
  ...baseConfig,
  
  // 串行执行，避免资金账户冲突
  fullyParallel: false,
  workers: 1,
  retries: 0,
  
  use: {
    ...baseConfig.use,
    baseURL: 'http://localhost:5175',
  },

  // 只测试移动端
  projects: baseConfig.projects?.filter(p => p.name === 'Mobile Chrome'),

  // 使用真实服务（不是 mock）
  webServer: {
    command: 'pnpm vite --port 5175',
    url: 'http://localhost:5175',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
