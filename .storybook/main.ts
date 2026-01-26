import type { StorybookConfig } from '@storybook/react-vite'
import { loadEnv } from 'vite'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-vitest', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    const env = loadEnv(config.mode ?? 'development', process.cwd(), '')
    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')) as { version?: string }
    const buildTime = new Date()
    const pad = (value: number) => value.toString().padStart(2, '0')
    const buildSuffix = `-${pad(buildTime.getUTCMonth() + 1)}${pad(buildTime.getUTCDate())}${pad(buildTime.getUTCHours())}`
    const isDevBuild = (env.VITE_DEV_MODE ?? process.env.VITE_DEV_MODE) === 'true'
    const appVersion = `${pkg.version ?? '0.0.0'}${isDevBuild ? buildSuffix : ''}`

    // Keep Storybook deterministic: use mock exchange rates instead of network calls.
    config.resolve ??= {}
    const storybookDir = dirname(fileURLToPath(import.meta.url))
    const replacement = resolve(storybookDir, '../src/services/currency-exchange/mock.ts')

    if (Array.isArray(config.resolve.alias)) {
      config.resolve.alias.push({ find: '#currency-exchange-impl', replacement })
    } else {
      config.resolve.alias = {
        ...config.resolve.alias,
        '#currency-exchange-impl': replacement,
      }
    }

    // Inject API keys for dynamic access
    const tronGridApiKey = env.TRONGRID_API_KEY ?? process.env.TRONGRID_API_KEY ?? ''
    const etherscanApiKey = env.ETHERSCAN_API_KEY ?? process.env.ETHERSCAN_API_KEY ?? ''
    config.define = {
      ...config.define,
      '__APP_VERSION__': JSON.stringify(appVersion),
      '__API_KEYS__': JSON.stringify({
        TRONGRID_API_KEY: tronGridApiKey,
        ETHERSCAN_API_KEY: etherscanApiKey,
      }),
    }

    return config
  },
}

export default config
