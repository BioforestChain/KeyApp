import type { Issue } from '../types'

const BG_ONLY_TOKENS = ['secondary', 'accent', 'muted', 'card', 'popover', 'sidebar']
const FOREGROUND_TOKENS = ['primary', 'secondary', 'destructive', 'accent', 'card', 'popover']
const SEMANTIC_BGS = ['primary', 'destructive', 'secondary']

const ACCEPTABLE_CONTEXTS = [
  'bg-black',
  'bg-white/20',
  'bg-white/10',
  'bg-white/30',
  'text-white/80',
  'text-white/50',
  'bg-gradient-',
]

const ALLOWS_TEXT_WHITE = [
  'bg-gradient-',
  'bg-green-',
  'bg-red-',
  'bg-blue-',
  'bg-orange-',
  'bg-black',
]

function invertShade(shade: string): string {
  const shadeMap: Record<string, string> = {
    '50': '900', '100': '800', '200': '700', '300': '600', '400': '500',
    '500': '400', '600': '300', '700': '200', '800': '100', '900': '50',
  }
  return shadeMap[shade] || '800'
}

export function checkBackgroundAsText(content: string, file: string): Issue[] {
  const issues: Issue[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const token of BG_ONLY_TOKENS) {
      const regex = new RegExp(`text-${token}(?!-foreground)\\b`, 'g')
      let match: RegExpExecArray | null
      while ((match = regex.exec(line)) !== null) {
        issues.push({
          file, line: i + 1, column: match.index + 1,
          rule: 'no-bg-as-text',
          message: `'text-${token}' uses a background color as text color`,
          severity: 'error',
          suggestion: token === 'secondary' || token === 'muted'
            ? `Use 'text-muted-foreground' for secondary text`
            : `Use 'text-${token}-foreground' with 'bg-${token}'`,
        })
      }
    }
  }
  return issues
}

export function checkOrphanForeground(content: string, file: string): Issue[] {
  const issues: Issue[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const token of FOREGROUND_TOKENS) {
      const fgMatch = line.match(new RegExp(`text-${token}-foreground`))
      if (!fgMatch) continue
      if (new RegExp(`(peer-|group-|data-)\\S*text-${token}-foreground`).test(line)) continue

      const context = lines.slice(Math.max(0, i - 5), Math.min(lines.length, i + 6)).join(' ')
      const hasBgToken = new RegExp(`bg-${token}|peer-\\S*:bg-${token}|data-\\S*:bg-${token}`).test(context)
      
      if (!hasBgToken) {
        issues.push({
          file, line: i + 1, column: fgMatch.index! + 1,
          rule: 'orphan-foreground',
          message: `'text-${token}-foreground' without visible 'bg-${token}'`,
          severity: 'warning',
          suggestion: `Ensure 'bg-${token}' is set on this element or a parent`,
        })
      }
    }
  }
  return issues
}

export function checkMissingDarkVariant(content: string, file: string): Issue[] {
  const issues: Issue[] = []
  const lines = content.split('\n')

  const patterns = [
    { pattern: /\bbg-gray-(\d+)\b/g, type: 'bg' },
    { pattern: /\bbg-slate-(\d+)\b/g, type: 'bg' },
    { pattern: /\btext-gray-(\d+)\b/g, type: 'text' },
    { pattern: /\bborder-gray-(\d+)\b/g, type: 'border' },
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const { pattern, type } of patterns) {
      const patternCopy = new RegExp(pattern.source, pattern.flags)
      let match: RegExpExecArray | null
      while ((match = patternCopy.exec(line)) !== null) {
        if (ACCEPTABLE_CONTEXTS.some(ctx => line.includes(ctx))) continue

        const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2)).join(' ')
        const darkPattern = new RegExp(`dark:${type}-(?:gray|slate|zinc)-\\d+`)

        if (!darkPattern.test(context)) {
          issues.push({
            file, line: i + 1, column: match.index + 1,
            rule: 'missing-dark-variant',
            message: `'${match[0]}' should have a dark: variant`,
            severity: 'warning',
            suggestion: `Add 'dark:${type}-gray-${invertShade(match[1])}' or use semantic colors`,
          })
        }
      }
    }
  }
  return issues
}

export function checkTextWhiteOnSemanticBg(content: string, file: string): Issue[] {
  const issues: Issue[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.includes('text-white')) continue
    if (ALLOWS_TEXT_WHITE.some(bg => line.includes(bg))) continue

    const context = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join(' ')
    for (const bg of SEMANTIC_BGS) {
      if (context.includes(`bg-${bg}`) && !context.includes(`text-${bg}-foreground`)) {
        issues.push({
          file, line: i + 1, column: line.indexOf('text-white') + 1,
          rule: 'text-white-on-semantic-bg',
          message: `'text-white' with 'bg-${bg}' - use 'text-${bg}-foreground' instead`,
          severity: 'error',
          suggestion: `Replace 'text-white' with 'text-${bg}-foreground'`,
        })
        break
      }
    }
  }
  return issues
}

export function checkBgMutedWithoutText(content: string, file: string): Issue[] {
  const issues: Issue[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const bgMutedMatch = line.match(/\bbg-muted\b(?!\/)/)
    if (!bgMutedMatch) continue
    if (/hover:bg-muted|focus:bg-muted|active:bg-muted/.test(line) && !/\sbg-muted\b/.test(line)) continue

    const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 4)).join(' ')
    const hasTextColor = /\btext-(?:muted-foreground|foreground|primary|destructive|green-|red-|blue-|gray-|white)/.test(context)
    const isDecorative = /(?:size-|w-|h-)\d+.*(?:rounded|aspect)/.test(context)
    
    if (hasTextColor || isDecorative) continue

    issues.push({
      file, line: i + 1, column: bgMutedMatch.index! + 1,
      rule: 'bg-muted-no-text-color',
      message: `'bg-muted' without explicit text color`,
      severity: 'warning',
      suggestion: `Add 'text-muted-foreground' or 'text-foreground'`,
    })
  }
  return issues
}

export const allRules = [
  checkBackgroundAsText,
  checkOrphanForeground,
  checkMissingDarkVariant,
  checkTextWhiteOnSemanticBg,
  checkBgMutedWithoutText,
]
