import type { StorybookConfig } from '@storybook/react-vite'
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
    // Keep Storybook deterministic: use mock exchange rates instead of network calls.
    config.resolve ??= {}
    const storybookDir = dirname(fileURLToPath(import.meta.url))
    const replacement = resolve(storybookDir, '../src/services/currency-exchange/mock.ts')

    if (Array.isArray(config.resolve.alias)) {
      config.resolve.alias.push({ find: '#currency-exchange-impl', replacement })
    } else {
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        '#currency-exchange-impl': replacement,
      }
    }
    return config
  },
}

export default config
