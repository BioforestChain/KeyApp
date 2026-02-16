import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { OutputAsset, OutputBundle, Plugin, ResolvedConfig } from 'vite'
import {
  CSS_COMPAT_FEATURES,
  detectCssCompatFeaturesInCode,
  type CssCompatFeatureId,
  type CssCompatRisk,
  type CssCompatSupport,
} from './css-compat-features'

interface CssCompatReportPluginOptions {
  baseline?: string
}

interface CssCompatReportItem {
  feature: CssCompatFeatureId
  api: string
  support: CssCompatSupport
  risk: CssCompatRisk
  assets: string[]
  matchCount: number
  fallback: string
}

interface CssCompatReport {
  baseline: string
  detectedFeatures: CssCompatReportItem[]
  suggestions: string[]
  generatedAt: string
}

const DEFAULT_BASELINE = 'chrome>=114'

function toAssetSource(source: OutputAsset['source']): string {
  if (typeof source === 'string') {
    return source
  }
  return Buffer.from(source).toString('utf-8')
}

function addFeatureHit(
  featureHits: Map<CssCompatFeatureId, { assets: Set<string>; matchCount: number }>,
  featureId: CssCompatFeatureId,
  assetName: string,
  count: number,
): void {
  let hit = featureHits.get(featureId)
  if (!hit) {
    hit = {
      assets: new Set<string>(),
      matchCount: 0,
    }
    featureHits.set(featureId, hit)
  }
  hit.assets.add(assetName)
  hit.matchCount += count
}

export function cssCompatReportPlugin(options: CssCompatReportPluginOptions = {}): Plugin {
  const baseline = options.baseline ?? DEFAULT_BASELINE

  let config: ResolvedConfig | undefined
  let outDir = 'dist'
  const featureHits = new Map<CssCompatFeatureId, { assets: Set<string>; matchCount: number }>()

  return {
    name: 'vite-plugin-css-compat-report',
    apply: 'build',

    configResolved(resolvedConfig) {
      config = resolvedConfig
      outDir = resolvedConfig.build.outDir
    },

    generateBundle(_outputOptions, bundle: OutputBundle) {
      for (const [fileName, output] of Object.entries(bundle)) {
        if (output.type !== 'asset' || !fileName.endsWith('.css')) {
          continue
        }

        const cssCode = toAssetSource(output.source)
        const detected = detectCssCompatFeaturesInCode(cssCode)
        for (const item of detected) {
          addFeatureHit(featureHits, item.feature.id, fileName, item.matchCount)
        }
      }
    },

    writeBundle(outputOptions) {
      outDir = outputOptions.dir ?? outDir
    },

    closeBundle() {
      const detectedFeatures = CSS_COMPAT_FEATURES.filter((feature) => featureHits.has(feature.id)).map((feature) => {
        const hit = featureHits.get(feature.id)
        return {
          feature: feature.id,
          api: feature.api,
          support: feature.support,
          risk: feature.risk,
          assets: [...(hit?.assets ?? [])].sort(),
          matchCount: hit?.matchCount ?? 0,
          fallback: feature.fallback,
        }
      })

      const suggestions: string[] = []
      for (const item of detectedFeatures) {
        if (item.support === 'unsupported') {
          suggestions.push(`[fallback-required] ${item.api}: ${item.fallback}`)
          continue
        }
        if (item.support === 'partial') {
          suggestions.push(`[fallback-recommended] ${item.api}: ${item.fallback}`)
        }
      }

      const report: CssCompatReport = {
        baseline,
        detectedFeatures,
        suggestions,
        generatedAt: new Date().toISOString(),
      }

      const reportPath = resolve(config?.root ?? process.cwd(), outDir, 'css-compat-report.json')
      mkdirSync(dirname(reportPath), { recursive: true })
      writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf-8')

      console.log(`\n[css-compat] Baseline: ${baseline}`)
      if (detectedFeatures.length === 0) {
        console.log('[css-compat] Feature hits: none')
      } else {
        console.log('[css-compat] Feature hits:')
        for (const item of detectedFeatures) {
          console.log(`  - ${item.api}: ${item.assets.join(', ')} (${item.matchCount})`)
        }
      }

      if (suggestions.length === 0) {
        console.log('[css-compat] Suggestions: none')
      } else {
        console.log('[css-compat] Suggestions:')
        for (const suggestion of suggestions) {
          console.log(`  - ${suggestion}`)
        }
      }

      console.log(`[css-compat] Report generated: ${reportPath}\n`)
    },
  }
}

export default cssCompatReportPlugin
