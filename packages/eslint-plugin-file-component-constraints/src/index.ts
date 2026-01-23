/**
 * ESLint Plugin: file-component-constraints
 *
 * 通用的文件-组件约束插件
 * 根据文件路径模式，强制要求或禁止使用特定组件
 */

import type { ESLint } from 'eslint'
import { enforceRule } from './rules/enforce'

const plugin: ESLint.Plugin = {
  meta: {
    name: 'eslint-plugin-file-component-constraints',
    version: '0.1.0',
  },
  rules: {
    enforce: enforceRule,
  },
  configs: {
    recommended: {
      plugins: ['file-component-constraints'],
      rules: {
        'file-component-constraints/enforce': 'error',
      },
    },
  },
}

export = plugin
