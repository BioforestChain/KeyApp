import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './storybook-e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  snapshotDir: './storybook-e2e/__screenshots__',
  snapshotPathTemplate: '{snapshotDir}/{projectName}/{testFileName}-{arg}{ext}',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  projects: [
    {
      name: 'Mobile-Chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
      },
    },
  ],
})

