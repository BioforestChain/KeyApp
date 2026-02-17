export type CssCompatFeatureId =
  | 'field-sizing'
  | 'scroll-driven-animations'
  | 'css-scrollbar-standard'
  | 'color-mix'
  | 'container-queries'
  | 'property-at-rule'
  | 'backdrop-filter'
  | 'dynamic-viewport-units'
  | 'has-selector'

export type CssCompatSupport = 'unsupported' | 'partial' | 'supported'
export type CssCompatRisk = 'high' | 'medium' | 'low'

export interface CssCompatFeatureDefinition {
  id: CssCompatFeatureId
  api: string
  support: CssCompatSupport
  risk: CssCompatRisk
  fallback: string
  patterns: readonly RegExp[]
}

export interface CssCompatDetectedFeature {
  feature: CssCompatFeatureDefinition
  matchCount: number
}

function countPatternMatches(code: string, pattern: RegExp): number {
  const normalized = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`)
  let count = 0
  let match = normalized.exec(code)
  while (match) {
    count += 1
    match = normalized.exec(code)
  }
  return count
}

export const CSS_COMPAT_FEATURES: readonly CssCompatFeatureDefinition[] = [
  {
    id: 'field-sizing',
    api: 'field-sizing',
    support: 'unsupported',
    risk: 'high',
    fallback: '为输入组件提供 rows/min-height 或 JS autosize，避免依赖 field-sizing。',
    patterns: [/\bfield-sizing\s*:/g],
  },
  {
    id: 'scroll-driven-animations',
    api: 'animation-timeline / scroll-timeline / view()',
    support: 'unsupported',
    risk: 'high',
    fallback: '必须保留无滚动驱动动画时的静态样式，并用 @supports 做增强。',
    patterns: [/\banimation-timeline\s*:/g, /\bscroll-timeline(?:-name|-axis)?\s*:/g, /@supports\s*\(\s*animation-timeline\s*:/g],
  },
  {
    id: 'css-scrollbar-standard',
    api: 'scrollbar-width',
    support: 'partial',
    risk: 'medium',
    fallback: '保留 ::-webkit-scrollbar 回退样式，不依赖单一标准滚动条属性。',
    patterns: [/\bscrollbar-width\s*:/g],
  },
  {
    id: 'color-mix',
    api: 'color-mix()',
    support: 'supported',
    risk: 'low',
    fallback: '关键颜色需保留普通色值兜底，避免表达式解析失败导致不可读。',
    patterns: [/\bcolor-mix\s*\(/g],
  },
  {
    id: 'container-queries',
    api: '@container / container-type / container-name',
    support: 'supported',
    risk: 'low',
    fallback: '关键布局在不支持容器查询时需有基础块级布局兜底。',
    patterns: [/@container\b/g, /\bcontainer-type\s*:/g, /\bcontainer-name\s*:/g],
  },
  {
    id: 'property-at-rule',
    api: '@property',
    support: 'supported',
    risk: 'low',
    fallback: '保持未注册 CSS 变量也可用的默认值路径。',
    patterns: [/@property\s+--/g],
  },
  {
    id: 'backdrop-filter',
    api: 'backdrop-filter',
    support: 'supported',
    risk: 'medium',
    fallback: '关键可读性不能依赖模糊效果，需有纯色/透明度兜底。',
    patterns: [/\bbackdrop-filter\s*:/g, /\b-webkit-backdrop-filter\s*:/g],
  },
  {
    id: 'dynamic-viewport-units',
    api: 'dvh / svh / lvh',
    support: 'supported',
    risk: 'low',
    fallback: '保留 vh/min-height 兜底以降低宿主 WebView 差异影响。',
    patterns: [/\b(?:\d*\.?\d+)?(?:dvh|svh|lvh)\b/g],
  },
  {
    id: 'has-selector',
    api: ':has()',
    support: 'supported',
    risk: 'low',
    fallback: '不要让核心交互仅依赖 :has 选择器触发。',
    patterns: [/:has\(/g],
  },
] as const

export function detectCssCompatFeaturesInCode(code: string): CssCompatDetectedFeature[] {
  return CSS_COMPAT_FEATURES.map((feature) => {
    const matchCount = feature.patterns.reduce((sum, pattern) => sum + countPatternMatches(code, pattern), 0)
    return { feature, matchCount }
  }).filter((item) => item.matchCount > 0)
}
