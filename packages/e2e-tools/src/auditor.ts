import { unlinkSync } from 'node:fs'
import { join } from 'node:path'
import type { AuditResult, AuditOptions, OrphanedScreenshot } from './types'
import { findE2eRoot, scanScreenshots, scanSpecFiles } from './scanner'
import { parseAllSpecs } from './parser'

export function audit(options: AuditOptions): AuditResult {
  const e2eRoot = findE2eRoot(options.root)

  if (!e2eRoot) {
    return {
      root: options.root,
      specsScanned: 0,
      screenshotsReferenced: 0,
      screenshotsOnDisk: 0,
      orphaned: [],
      missing: [],
      success: true,
    }
  }

  const specFiles = scanSpecFiles(e2eRoot)
  const screenshots = scanScreenshots(e2eRoot)
  const refsBySpec = parseAllSpecs(specFiles)

  const allRefs = new Set<string>()
  let totalRefs = 0

  for (const [, refs] of refsBySpec) {
    for (const ref of refs) {
      allRefs.add(`${ref.specFile}:${ref.name}`)
      totalRefs++
    }
  }

  const orphaned: OrphanedScreenshot[] = []

  for (const screenshot of screenshots) {
    const key = `${screenshot.specDir}:${screenshot.name}`
    if (!allRefs.has(key)) {
      orphaned.push({
        path: screenshot.path,
        browser: screenshot.browser,
        specDir: screenshot.specDir,
        name: screenshot.name,
      })
    }
  }

  const success = options.strict ? orphaned.length === 0 : true

  return {
    root: e2eRoot,
    specsScanned: specFiles.length,
    screenshotsReferenced: totalRefs,
    screenshotsOnDisk: screenshots.length,
    orphaned,
    missing: [],
    success,
  }
}

export function removeOrphaned(e2eRoot: string, orphaned: OrphanedScreenshot[]): number {
  let removed = 0
  for (const o of orphaned) {
    try {
      unlinkSync(join(e2eRoot, o.path))
      removed++
    } catch {
      // ignore
    }
  }
  return removed
}
