import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { OutputBundle, OutputChunk, Plugin, ResolvedConfig } from 'vite'
import {
  MOBILE_COMPAT_FEATURES,
  detectMobileCompatFeaturesInCode,
  type MobileCompatFeatureId,
} from './mobile-compat-features'

interface MobileCompatReportPluginOptions {
  baseline?: string
  configuredPolyfillsMode?: 'auto' | 'manual'
  configuredPolyfills?: readonly string[]
}

interface MobileCompatReportItem {
  feature: MobileCompatFeatureId
  api: string
  chunks: string[]
  polyfillable: boolean
  modernPolyfills: string[]
}

interface MobileCompatReport {
  baseline: string
  detectedFeatures: MobileCompatReportItem[]
  configuredPolyfills: string[]
  suggestions: string[]
  generatedAt: string
}

const DEFAULT_BASELINE = 'chrome>=114'

function addHit(map: Map<MobileCompatFeatureId, Set<string>>, featureId: MobileCompatFeatureId, chunk: string): void {
  let bucket = map.get(featureId)
  if (!bucket) {
    bucket = new Set<string>()
    map.set(featureId, bucket)
  }
  bucket.add(chunk)
}

function isGeneratedPolyfillChunk(fileName: string): boolean {
  return /(^|\/)polyfills?-.*\.js$/i.test(fileName)
}

export function mobileCompatReportPlugin(options: MobileCompatReportPluginOptions = {}): Plugin {
  const baseline = options.baseline ?? DEFAULT_BASELINE
  const configuredPolyfillsMode = options.configuredPolyfillsMode ?? 'manual'
  const configuredPolyfills = [...new Set(options.configuredPolyfills ?? [])].sort()

  let config: ResolvedConfig | undefined
  let outDir = 'dist'
  const chunkFeatureHits = new Map<MobileCompatFeatureId, Set<string>>()

  return {
    name: 'vite-plugin-mobile-compat-report',
    apply: 'build',

    configResolved(resolvedConfig) {
      config = resolvedConfig
      outDir = resolvedConfig.build.outDir
    },

    generateBundle(_outputOptions, bundle: OutputBundle) {
      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type !== 'chunk') {
          continue
        }
        if (isGeneratedPolyfillChunk(fileName)) {
          continue
        }
        const chunk = output as OutputChunk
        const features = detectMobileCompatFeaturesInCode(chunk.code)
        for (const feature of features) {
          addHit(chunkFeatureHits, feature.id, fileName)
        }
      }
    },

    writeBundle(outputOptions) {
      outDir = outputOptions.dir ?? outDir
    },

    closeBundle() {
      const detectedFeatures = MOBILE_COMPAT_FEATURES.filter((feature) => chunkFeatureHits.has(feature.id)).map(
        (feature) => ({
          feature: feature.id,
          api: feature.api,
          chunks: [...(chunkFeatureHits.get(feature.id) ?? [])].sort(),
          polyfillable: feature.polyfillable,
          modernPolyfills: [...feature.modernPolyfills],
        }),
      )

      const suggestions: string[] = []
      const mappedPolyfills = new Set<string>()

      for (const feature of detectedFeatures) {
        if (!feature.polyfillable) {
          suggestions.push(
            `[manual-fallback] ${feature.api} is detected but cannot be polyfilled reliably (runtime guard required)`,
          )
          continue
        }

        for (const moduleName of feature.modernPolyfills) {
          mappedPolyfills.add(moduleName)
        }

        if (
          configuredPolyfillsMode === 'manual' &&
          (configuredPolyfills.length === 0 ||
            feature.modernPolyfills.every((moduleName) => !configuredPolyfills.includes(moduleName)))
        ) {
          suggestions.push(
            `[missing-config] ${feature.api} detected but matching modern polyfill is not configured in plugin-legacy`,
          )
        }
      }

      if (configuredPolyfillsMode === 'manual') {
        for (const moduleName of configuredPolyfills) {
          if (!mappedPolyfills.has(moduleName)) {
            suggestions.push(`[redundant-config] ${moduleName} is configured but not detected in current bundle`)
          }
        }
      }

      const reportConfiguredPolyfills =
        configuredPolyfillsMode === 'auto' ? ['<auto:plugin-legacy-modern-polyfills>'] : configuredPolyfills

      const report: MobileCompatReport = {
        baseline,
        detectedFeatures,
        configuredPolyfills: reportConfiguredPolyfills,
        suggestions,
        generatedAt: new Date().toISOString(),
      }

      const reportPath = resolve(config?.root ?? process.cwd(), outDir, 'mobile-compat-report.json')
      mkdirSync(dirname(reportPath), { recursive: true })
      writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf-8')

      console.log(`\n[mobile-compat] Baseline: ${baseline}`)
      if (detectedFeatures.length === 0) {
        console.log('[mobile-compat] Feature hits: none')
      } else {
        console.log('[mobile-compat] Feature hits:')
        for (const item of detectedFeatures) {
          console.log(`  - ${item.api}: ${item.chunks.join(', ')}`)
        }
      }

      if (suggestions.length === 0) {
        console.log('[mobile-compat] Suggestions: none')
      } else {
        console.log('[mobile-compat] Suggestions:')
        for (const suggestion of suggestions) {
          console.warn(`  - ${suggestion}`)
        }
      }
      console.log(`[mobile-compat] Report generated: ${reportPath}\n`)
    },
  }
}

export default mobileCompatReportPlugin
