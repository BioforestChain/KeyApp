#!/usr/bin/env node
/**
 * Create Miniapp CLI
 *
 * Usage:
 *   pnpm dlx @biochain/create-miniapp my-app
 *   pnpm dlx @biochain/create-miniapp my-app --style mira --theme blue
 */

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { createMiniapp } from './commands/create'
import type { CreateOptions } from './types'

const STYLES = ['vega', 'nova', 'maia', 'lyra', 'mira'] as const
const BASE_COLORS = ['neutral', 'stone', 'zinc', 'gray'] as const
const THEMES = ['neutral', 'amber', 'blue', 'cyan', 'emerald', 'fuchsia', 'green', 'indigo', 'lime', 'orange', 'pink'] as const
const ICON_LIBRARIES = ['lucide', 'tabler', 'hugeicons', 'phosphor'] as const
const FONTS = ['inter', 'noto-sans', 'nunito-sans', 'figtree'] as const
const RADII = ['default', 'none', 'small', 'medium', 'large'] as const
const MENU_ACCENTS = ['subtle', 'bold'] as const
const TEMPLATES = ['vite', 'start'] as const

yargs(hideBin(process.argv))
  .scriptName('create-miniapp')
  .usage('$0 [name] [options]')
  .command<CreateOptions>(
    '$0 [name]',
    '创建新的 Bio 生态 miniapp 项目',
    (yargs) => {
      return yargs
        .positional('name', {
          type: 'string',
          describe: 'Miniapp 名称',
        })
        .option('style', {
          type: 'string',
          describe: 'UI 风格',
          choices: STYLES,
          default: 'mira',
        })
        .option('base-color', {
          type: 'string',
          describe: '基础颜色',
          choices: BASE_COLORS,
          default: 'neutral',
        })
        .option('theme', {
          type: 'string',
          describe: '主题色',
          choices: THEMES,
          default: 'neutral',
        })
        .option('icon-library', {
          type: 'string',
          describe: '图标库',
          choices: ICON_LIBRARIES,
          default: 'lucide',
        })
        .option('font', {
          type: 'string',
          describe: '字体',
          choices: FONTS,
          default: 'inter',
        })
        .option('radius', {
          type: 'string',
          describe: '圆角大小',
          choices: RADII,
          default: 'default',
        })
        .option('menu-accent', {
          type: 'string',
          describe: '菜单强调风格',
          choices: MENU_ACCENTS,
          default: 'subtle',
        })
        .option('template', {
          type: 'string',
          describe: '项目模板',
          choices: TEMPLATES,
          default: 'vite',
        })
        .option('output', {
          type: 'string',
          describe: '输出目录',
          default: './miniapps',
        })
        .option('skip-shadcn', {
          type: 'boolean',
          describe: '跳过 shadcn 初始化',
          default: false,
        })
        .option('skip-install', {
          type: 'boolean',
          describe: '跳过依赖安装',
          default: false,
        })
        .option('yes', {
          type: 'boolean',
          alias: 'y',
          describe: '使用默认值，跳过交互式提示',
          default: false,
        })
        .option('no-splash', {
          type: 'boolean',
          describe: '禁用启动屏',
          default: false,
        })
    },
    async (argv) => {
      await createMiniapp({
        name: argv.name,
        style: argv.style as typeof STYLES[number],
        baseColor: argv['base-color'] as typeof BASE_COLORS[number],
        theme: argv.theme as typeof THEMES[number],
        iconLibrary: argv['icon-library'] as typeof ICON_LIBRARIES[number],
        font: argv.font as typeof FONTS[number],
        radius: argv.radius as typeof RADII[number],
        menuAccent: argv['menu-accent'] as typeof MENU_ACCENTS[number],
        template: argv.template as typeof TEMPLATES[number],
        output: argv.output as string,
        skipShadcn: argv['skip-shadcn'] as boolean,
        skipInstall: argv['skip-install'] as boolean,
        yes: argv.yes as boolean,
        noSplash: argv['no-splash'] as boolean,
      })
    }
  )
  .help()
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .strict()
  .parse()
