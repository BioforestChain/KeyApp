import { input, select } from '@inquirer/prompts'
import {
  STYLES,
  BASE_COLORS,
  THEMES,
  ICON_LIBRARIES,
  FONTS,
  RADII,
  MENU_ACCENTS,
  type CreateOptions,
  type FinalOptions,
} from '../types'

const STYLE_DESCRIPTIONS: Record<string, string> = {
  vega: 'The classic shadcn/ui look. Clean, neutral, and familiar.',
  nova: 'Reduced padding and margins for compact layouts.',
  maia: 'Soft and rounded, with generous spacing.',
  lyra: 'Boxy and sharp. Pairs well with mono fonts.',
  mira: 'Compact. Made for dense interfaces.',
}

const FONT_DESCRIPTIONS: Record<string, string> = {
  inter: 'Modern and clean sans-serif',
  'noto-sans': 'Great for multilingual support',
  'nunito-sans': 'Friendly and rounded',
  figtree: 'Contemporary geometric sans',
}

/**
 * 交互式补全缺失的选项
 */
export async function promptMissingOptions(options: CreateOptions): Promise<FinalOptions> {
  // 如果使用 --yes 选项，跳过所有交互式提示
  if (options.yes) {
    const name = options.name
    if (!name) {
      throw new Error('使用 --yes 选项时必须提供 name 参数')
    }
    return {
      ...options,
      name,
      appId: `xin.dweb.${name}`,
    }
  }

  const name = options.name ?? await input({
    message: 'Miniapp 名称:',
    validate: (value) => {
      if (!value.trim()) return '名称不能为空'
      if (!/^[a-z][a-z0-9-]*$/.test(value)) {
        return '名称只能包含小写字母、数字和连字符，且必须以字母开头'
      }
      return true
    },
  })

  const appId = await input({
    message: 'App ID (反向域名格式，如 xin.dweb.my-app):',
    default: `xin.dweb.${name}`,
    validate: (value) => {
      if (!/^[a-z][a-z0-9]*(\.[a-z][a-z0-9-]*)+$/.test(value)) {
        return 'App ID 必须是反向域名格式，如 xin.dweb.my-app'
      }
      return true
    },
  })

  const useDefaults = await select({
    message: '使用默认配置?',
    choices: [
      { name: '是 - 使用默认配置 (mira 风格)', value: true },
      { name: '否 - 自定义配置', value: false },
    ],
  })

  if (useDefaults) {
    return {
      ...options,
      name,
      appId,
    }
  }

  const style = await select({
    message: '选择 UI 风格:',
    choices: STYLES.map((s) => ({
      name: `${s} - ${STYLE_DESCRIPTIONS[s]}`,
      value: s,
    })),
    default: options.style,
  })

  const baseColor = await select({
    message: '选择基础颜色:',
    choices: BASE_COLORS.map((c) => ({ name: c, value: c })),
    default: options.baseColor,
  })

  const theme = await select({
    message: '选择主题色:',
    choices: THEMES.map((t) => ({ name: t, value: t })),
    default: options.theme,
  })

  const iconLibrary = await select({
    message: '选择图标库:',
    choices: ICON_LIBRARIES.map((i) => ({ name: i, value: i })),
    default: options.iconLibrary,
  })

  const font = await select({
    message: '选择字体:',
    choices: FONTS.map((f) => ({
      name: `${f} - ${FONT_DESCRIPTIONS[f]}`,
      value: f,
    })),
    default: options.font,
  })

  const radius = await select({
    message: '选择圆角大小:',
    choices: RADII.map((r) => ({ name: r, value: r })),
    default: options.radius,
  })

  const menuAccent = await select({
    message: '选择菜单强调风格:',
    choices: MENU_ACCENTS.map((m) => ({ name: m, value: m })),
    default: options.menuAccent,
  })

  const template = await select({
    message: '选择项目模板:',
    choices: [
      { name: 'vite - Vite + React', value: 'vite' as const },
      { name: 'start - TanStack Start', value: 'start' as const },
    ],
    default: options.template,
  })

  return {
    name,
    appId,
    style,
    baseColor,
    theme,
    iconLibrary,
    font,
    radius,
    menuAccent,
    template,
    output: options.output,
    skipShadcn: options.skipShadcn,
    skipInstall: options.skipInstall,
    yes: options.yes,
    noSplash: options.noSplash,
  }
}
