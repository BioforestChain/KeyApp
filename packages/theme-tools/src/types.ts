export interface Issue {
  file: string
  line: number
  column: number
  rule: string
  message: string
  severity: 'error' | 'warning'
  suggestion?: string
}

export interface CheckOptions {
  root: string
  srcDir?: string
  verbose?: boolean
  skipPatterns?: string[]
}

export interface CheckResult {
  success: boolean
  errors: Issue[]
  warnings: Issue[]
  filesChecked: number
}
