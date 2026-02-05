import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

export type ExecOptions = {
  silent?: boolean
  env?: Record<string, string>
  cwd?: string
}

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg: string) => console.log(`\n${colors.cyan}▸${colors.reset} ${colors.cyan}${msg}${colors.reset}`),
}

function getArgValue(args: string[], name: string): string | null {
  const withEquals = args.find((arg) => arg.startsWith(`${name}=`))
  if (withEquals) {
    return withEquals.slice(name.length + 1)
  }
  const index = args.indexOf(name)
  if (index === -1) return null
  const next = args[index + 1]
  if (!next || next.startsWith('-')) return null
  return next
}

function resolveBooleanFlag(args: string[], name: string): boolean | undefined {
  if (args.includes(`--${name}`)) return true
  if (args.includes(`--no-${name}`)) return false
  const envKey = `RELEASE_${name.toUpperCase().replace(/-/g, '_')}`
  const envValue = process.env[envKey]
  if (!envValue) return undefined
  if (envValue === '1' || envValue === 'true') return true
  if (envValue === '0' || envValue === 'false') return false
  return undefined
}

export type ReleaseContext = {
  root: string
  workdir: string
  args: string[]
  adminMode: boolean
  nonInteractive: boolean
  versionArg: string | null
  bumpArg: string | null
  changelogArg: string | null
  skipUploadFlag: boolean | undefined
  pushFlag: boolean | undefined
  triggerFlag: boolean | undefined
  workPath: (...parts: string[]) => string
  setWorkdir: (workdir: string) => void
  exec: (cmd: string, options?: ExecOptions) => string
  execOutput: (cmd: string) => string
  readJson: <T>(path: string) => T
  writeJson: (path: string, data: unknown) => void
  colors: typeof colors
  log: typeof log
}

export function createReleaseContext(args: string[]): ReleaseContext {
  const root = resolve(import.meta.dirname, '..', '..')
  let workdir = root
  const workPath = (...parts: string[]) => join(workdir, ...parts)

  const exec = (cmd: string, options?: ExecOptions): string => {
    try {
      const result = execSync(cmd, {
        cwd: options?.cwd ?? workdir,
        encoding: 'utf-8',
        stdio: options?.silent ? 'pipe' : 'inherit',
        env: { ...process.env, ...options?.env },
      })
      return typeof result === 'string' ? result.trim() : ''
    } catch (error) {
      if (options?.silent) {
        return ''
      }
      throw error
    }
  }

  const execOutput = (cmd: string): string => execSync(cmd, { cwd: workdir, encoding: 'utf-8' }).trim()

  const adminMode = args.includes('--admin')
  const nonInteractive =
    args.includes('--non-interactive') ||
    args.includes('--yes') ||
    process.env.RELEASE_NON_INTERACTIVE === '1' ||
    process.env.RELEASE_NON_INTERACTIVE === 'true'

  return {
    root,
    workdir,
    args,
    adminMode,
    nonInteractive,
    versionArg: getArgValue(args, '--version') ?? process.env.RELEASE_VERSION ?? null,
    bumpArg: getArgValue(args, '--bump') ?? process.env.RELEASE_BUMP ?? null,
    changelogArg: getArgValue(args, '--changelog') ?? process.env.RELEASE_CHANGELOG ?? null,
    skipUploadFlag: resolveBooleanFlag(args, 'skip-upload'),
    pushFlag: resolveBooleanFlag(args, 'push'),
    triggerFlag: resolveBooleanFlag(args, 'trigger'),
    workPath,
    setWorkdir: (nextWorkdir: string) => {
      workdir = nextWorkdir
    },
    exec,
    execOutput,
    readJson: <T>(path: string) => JSON.parse(readFileSync(path, 'utf-8')) as T,
    writeJson: (path: string, data: unknown) => {
      writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
    },
    colors,
    log,
  }
}
