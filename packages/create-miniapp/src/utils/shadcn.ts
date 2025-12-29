import type { FinalOptions } from '../types'

/**
 * 构建 shadcn preset URL
 */
export function buildShadcnPresetUrl(options: FinalOptions): string {
  const params = new URLSearchParams({
    base: 'base',
    style: options.style,
    baseColor: options.baseColor,
    theme: options.theme,
    iconLibrary: options.iconLibrary,
    font: options.font,
    menuAccent: options.menuAccent,
    menuColor: 'default',
    radius: options.radius,
    template: options.template,
  })
  return `https://ui.shadcn.com/init?${params.toString()}`
}

/**
 * 构建完整的 shadcn create 命令
 */
export function buildShadcnCommand(options: FinalOptions): string {
  const presetUrl = buildShadcnPresetUrl(options)
  return `pnpm dlx shadcn@latest create --preset "${presetUrl}" --template ${options.template} ${options.name}`
}
