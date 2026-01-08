import type { StorybookConfig } from '@storybook/react-vite'
import { loadEnv } from 'vite'
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
      '__API_KEYS__': JSON.stringify({
        TRONGRID_API_KEY: tronGridApiKey,
        ETHERSCAN_API_KEY: etherscanApiKey,
      }),
    }

    return config
  },
}

export default config
