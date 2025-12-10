import { defineConfig, devices } from '@playwright/test'

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
  
  // 移除操作系统后缀，使用统一的基线截图
  // {testDir} = e2e, {testFileDir} = 相对路径, {testFileName} = 文件名
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{arg}{ext}',
  snapshotDir: './e2e/__screenshots__',
  
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html', { outputFolder: './e2e/report' }],
    ['list'],
  ],
  
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // 截图对比配置
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,  // 允许 2% 像素差异（跨平台字体渲染）
      threshold: 0.3,           // 30% 颜色阈值
    },
  },

  projects: [
    // 移动端视口 (主要测试目标)
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    // 桌面视口 (可选)
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  // 自动启动开发服务器（使用 Mock 服务，端口 5174 避免与普通 dev 冲突）
  webServer: {
    command: 'pnpm dev:mock',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
