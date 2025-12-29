import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, basename, dirname } from 'node:path'
import type { ScreenshotFile } from './types'

export function findE2eRoot(cwd: string): string | null {
  const e2eDir = join(cwd, 'e2e')
  if (existsSync(e2eDir) && statSync(e2eDir).isDirectory()) {
    return e2eDir
  }
  return null
}

export function scanScreenshots(e2eRoot: string): ScreenshotFile[] {
  const screenshotsDir = join(e2eRoot, '__screenshots__')
  if (!existsSync(screenshotsDir)) {
    return []
  }

  const results: ScreenshotFile[] = []

  function walk(dir: string, browser?: string, specDir?: string) {
    const entries = readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        if (!browser) {
          walk(fullPath, entry.name)
        } else if (!specDir) {
          walk(fullPath, browser, entry.name)
        }
      } else if (entry.isFile() && entry.name.endsWith('.png')) {
        if (browser && specDir) {
          results.push({
            path: relative(e2eRoot, fullPath),
            name: entry.name,
            browser,
            specDir,
          })
        }
      }
    }
  }

  walk(screenshotsDir)
  return results
}

export function scanSpecFiles(e2eRoot: string): string[] {
  const results: string[] = []

  function walk(dir: string) {
    if (!existsSync(dir)) return

    const entries = readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory() && entry.name !== '__screenshots__' && entry.name !== 'test-results') {
        walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.spec.ts')) {
        results.push(fullPath)
      }
    }
  }

  walk(e2eRoot)
  return results
}
