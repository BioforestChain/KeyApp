export interface ScreenshotRef {
  name: string
  specFile: string
  line: number
}

export interface ScreenshotFile {
  path: string
  name: string
  browser: string
  specDir: string
}

export interface AuditResult {
  root: string
  specsScanned: number
  screenshotsReferenced: number
  screenshotsOnDisk: number
  orphaned: OrphanedScreenshot[]
  missing: MissingScreenshot[]
  success: boolean
}

export interface OrphanedScreenshot {
  path: string
  browser: string
  specDir: string
  name: string
}

export interface MissingScreenshot {
  name: string
  specFile: string
  line: number
  expectedPaths: string[]
}

export interface AuditOptions {
  root: string
  strict: boolean
  verbose: boolean
  fix: boolean
}
