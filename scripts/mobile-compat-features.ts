import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

export type MobileCompatFeatureId =
  | 'promise.withResolvers'
  | 'object.groupBy'
  | 'map.groupBy'
  | 'array.fromAsync'
  | 'url.canParse'
  | 'regexp.escape'
  | 'iterator.from'
  | 'set.union'
  | 'set.intersection'
  | 'set.difference'
  | 'set.symmetricDifference'
  | 'set.isSubsetOf'
  | 'set.isSupersetOf'
  | 'set.isDisjointFrom'
  | 'atomics.waitAsync'

export interface MobileCompatFeatureDefinition {
  id: MobileCompatFeatureId
  api: string
  polyfillable: boolean
  modernPolyfills: readonly string[]
  detector: (code: string) => boolean
}

const SET_METHODS = [
  'union',
  'intersection',
  'difference',
  'symmetricDifference',
  'isSubsetOf',
  'isSupersetOf',
  'isDisjointFrom',
] as const

function createSimpleDetector(pattern: RegExp): (code: string) => boolean {
  return (code: string) => pattern.test(code)
}

function collectDeclaredSetVariables(code: string): string[] {
  const names: string[] = []
  const reg = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*new\s+Set\b/g
  let match = reg.exec(code)
  while (match) {
    names.push(match[1])
    match = reg.exec(code)
  }
  return names
}

function hasSetMethodUsage(code: string, method: (typeof SET_METHODS)[number]): boolean {
  if (new RegExp(`\\bSet\\.prototype\\.${method}\\b`).test(code)) {
    return true
  }

  if (new RegExp(`\\bnew\\s+Set\\s*\\([^)]*\\)\\s*\\.${method}\\s*\\(`).test(code)) {
    return true
  }

  const setVars = collectDeclaredSetVariables(code)
  if (setVars.length === 0) {
    return false
  }

  const escaped = setVars.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`\\b(?:${escaped.join('|')})\\.${method}\\s*\\(`).test(code)
}

export const MOBILE_COMPAT_FEATURES: readonly MobileCompatFeatureDefinition[] = [
  {
    id: 'promise.withResolvers',
    api: 'Promise.withResolvers',
    polyfillable: true,
    modernPolyfills: ['es.promise.with-resolvers'],
    detector: createSimpleDetector(/\bPromise\.withResolvers\b/),
  },
  {
    id: 'object.groupBy',
    api: 'Object.groupBy',
    polyfillable: true,
    modernPolyfills: ['es.object.group-by'],
    detector: createSimpleDetector(/\bObject\.groupBy\b/),
  },
  {
    id: 'map.groupBy',
    api: 'Map.groupBy',
    polyfillable: true,
    modernPolyfills: ['es.map.group-by'],
    detector: createSimpleDetector(/\bMap\.groupBy\b/),
  },
  {
    id: 'array.fromAsync',
    api: 'Array.fromAsync',
    polyfillable: true,
    modernPolyfills: ['es.array.from-async'],
    detector: createSimpleDetector(/\bArray\.fromAsync\b/),
  },
  {
    id: 'url.canParse',
    api: 'URL.canParse',
    polyfillable: true,
    modernPolyfills: ['web.url.can-parse'],
    detector: createSimpleDetector(/\bURL\.canParse\b/),
  },
  {
    id: 'regexp.escape',
    api: 'RegExp.escape',
    polyfillable: true,
    modernPolyfills: ['es.regexp.escape'],
    detector: createSimpleDetector(/\bRegExp\.escape\b/),
  },
  {
    id: 'iterator.from',
    api: 'Iterator.from',
    polyfillable: true,
    modernPolyfills: ['es.iterator.from'],
    detector: createSimpleDetector(/\bIterator\.from\b/),
  },
  {
    id: 'set.union',
    api: 'Set.prototype.union',
    polyfillable: true,
    modernPolyfills: ['es.set.union.v2'],
    detector: (code: string) => hasSetMethodUsage(code, 'union'),
  },
  {
    id: 'set.intersection',
    api: 'Set.prototype.intersection',
    polyfillable: true,
    modernPolyfills: ['es.set.intersection.v2'],
    detector: (code: string) => hasSetMethodUsage(code, 'intersection'),
  },
  {
    id: 'set.difference',
    api: 'Set.prototype.difference',
    polyfillable: true,
    modernPolyfills: ['es.set.difference.v2'],
    detector: (code: string) => hasSetMethodUsage(code, 'difference'),
  },
  {
    id: 'set.symmetricDifference',
    api: 'Set.prototype.symmetricDifference',
    polyfillable: true,
    modernPolyfills: ['es.set.symmetric-difference.v2'],
    detector: (code: string) => hasSetMethodUsage(code, 'symmetricDifference'),
  },
  {
    id: 'set.isSubsetOf',
    api: 'Set.prototype.isSubsetOf',
    polyfillable: true,
    modernPolyfills: ['es.set.is-subset-of.v2'],
    detector: (code: string) => hasSetMethodUsage(code, 'isSubsetOf'),
  },
  {
    id: 'set.isSupersetOf',
    api: 'Set.prototype.isSupersetOf',
    polyfillable: true,
    modernPolyfills: ['es.set.is-superset-of.v2'],
    detector: (code: string) => hasSetMethodUsage(code, 'isSupersetOf'),
  },
  {
    id: 'set.isDisjointFrom',
    api: 'Set.prototype.isDisjointFrom',
    polyfillable: true,
    modernPolyfills: ['es.set.is-disjoint-from.v2'],
    detector: (code: string) => hasSetMethodUsage(code, 'isDisjointFrom'),
  },
  {
    id: 'atomics.waitAsync',
    api: 'Atomics.waitAsync',
    polyfillable: false,
    modernPolyfills: [],
    detector: createSimpleDetector(/\bAtomics\.waitAsync\b/),
  },
] as const

export function detectMobileCompatFeaturesInCode(code: string): MobileCompatFeatureDefinition[] {
  return MOBILE_COMPAT_FEATURES.filter((feature) => feature.detector(code))
}

export function collectModernPolyfills(features: readonly MobileCompatFeatureDefinition[]): string[] {
  const set = new Set<string>()
  for (const feature of features) {
    if (!feature.polyfillable) {
      continue
    }
    for (const item of feature.modernPolyfills) {
      set.add(item)
    }
  }
  return [...set].sort()
}

export function scanMobileCompatFeaturesInFiles(
  rootDir: string,
  includeExtensions: readonly string[] = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts'],
): Map<MobileCompatFeatureId, Set<string>> {
  const hits = new Map<MobileCompatFeatureId, Set<string>>()
  const ignoredDirs = new Set([
    '.git',
    '.turbo',
    '.tmp',
    'coverage',
    'dist',
    'dist-dweb',
    'dist-web',
    'node_modules',
    'playwright-report',
    'storybook-static',
    'test',
    'tests',
    'test-results',
  ])
  const ignoredFilePatterns = [/\.test\./, /\.spec\./, /\.stories\./]

  function addHit(featureId: MobileCompatFeatureId, filePath: string): void {
    let set = hits.get(featureId)
    if (!set) {
      set = new Set<string>()
      hits.set(featureId, set)
    }
    set.add(relative(process.cwd(), filePath))
  }

  function walk(dir: string): void {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (ignoredDirs.has(entry.name)) {
          continue
        }
        walk(fullPath)
        continue
      }

      const matchedExt = includeExtensions.some((ext) => entry.name.endsWith(ext))
      if (!matchedExt) {
        continue
      }
      if (ignoredFilePatterns.some((pattern) => pattern.test(entry.name))) {
        continue
      }

      const source = readFileSync(fullPath, 'utf-8')
      const features = detectMobileCompatFeaturesInCode(source)
      for (const feature of features) {
        addHit(feature.id, fullPath)
      }
    }
  }

  const stats = statSync(rootDir)
  if (stats.isDirectory()) {
    walk(rootDir)
  }

  return hits
}
