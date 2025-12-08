import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    projects: [
      // 单元测试项目
      {
        extends: './vite.config.ts',
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
          include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
              'src/**/*.stories.{ts,tsx}',
              'src/**/*.test.{ts,tsx}',
              'src/test/**',
              'src/main.tsx',
              'src/vite-env.d.ts',
            ],
          },
        },
      },
      // Storybook 组件测试项目
      {
        extends: './vite.config.ts',
        define: {
          'import.meta.env': JSON.stringify({
            MODE: 'test',
            DEV: false,
            PROD: false,
            SSR: false,
          }),
        },
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
          // 禁用 watch 模式
          watch: false,
          // Browser 模式需要 istanbul provider
          coverage: {
            provider: 'istanbul',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
              'src/**/*.stories.{ts,tsx}',
              'src/**/*.test.{ts,tsx}',
              'src/test/**',
              'src/main.tsx',
              'src/vite-env.d.ts',
            ],
          },
        },
      },
    ],
  },
})
