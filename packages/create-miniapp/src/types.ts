export const STYLES = ['vega', 'nova', 'maia', 'lyra', 'mira'] as const
export const BASE_COLORS = ['neutral', 'stone', 'zinc', 'gray'] as const
export const THEMES = ['neutral', 'amber', 'blue', 'cyan', 'emerald', 'fuchsia', 'green', 'indigo', 'lime', 'orange', 'pink'] as const
export const ICON_LIBRARIES = ['lucide', 'tabler', 'hugeicons', 'phosphor'] as const
export const FONTS = ['inter', 'noto-sans', 'nunito-sans', 'figtree'] as const
export const RADII = ['default', 'none', 'small', 'medium', 'large'] as const
export const MENU_ACCENTS = ['subtle', 'bold'] as const
export const TEMPLATES = ['vite', 'start'] as const

export type Style = typeof STYLES[number]
export type BaseColor = typeof BASE_COLORS[number]
export type Theme = typeof THEMES[number]
export type IconLibrary = typeof ICON_LIBRARIES[number]
export type Font = typeof FONTS[number]
export type Radius = typeof RADII[number]
export type MenuAccent = typeof MENU_ACCENTS[number]
export type Template = typeof TEMPLATES[number]

export interface CreateOptions {
  name?: string
  style: Style
  baseColor: BaseColor
  theme: Theme
  iconLibrary: IconLibrary
  font: Font
  radius: Radius
  menuAccent: MenuAccent
  template: Template
  output: string
  skipShadcn: boolean
  skipInstall: boolean
  yes: boolean
  noSplash: boolean
}

export interface FinalOptions extends Omit<CreateOptions, 'name'> {
  name: string
  appId: string
}
