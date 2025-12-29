import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import type { ScreenshotRef } from './types'

const SCREENSHOT_REGEX = /toHaveScreenshot\s*\(\s*['"]([^'"]+)['"]/g

export function parseSpecFile(filePath: string): ScreenshotRef[] {
  const content = readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const refs: ScreenshotRef[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let match: RegExpExecArray | null

    SCREENSHOT_REGEX.lastIndex = 0
    while ((match = SCREENSHOT_REGEX.exec(line)) !== null) {
      refs.push({
        name: match[1],
        specFile: basename(filePath),
        line: i + 1,
      })
    }
  }

  return refs
}

export function parseAllSpecs(specFiles: string[]): Map<string, ScreenshotRef[]> {
  const result = new Map<string, ScreenshotRef[]>()

  for (const file of specFiles) {
    const specName = basename(file)
    const refs = parseSpecFile(file)
    
    if (!result.has(specName)) {
      result.set(specName, [])
    }
    result.get(specName)!.push(...refs)
  }

  return result
}
