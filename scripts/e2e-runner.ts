#!/usr/bin/env bun
/**
 * E2E Runner - 智能分片执行 E2E 测试
 *
 * 设计原则:
 * 1. 永不单次运行全部测试 - 按文件分片执行
 * 2. 共享 dev server - 避免端口冲突
 * 3. 失败快速反馈 - 单个文件失败不影响其他文件继续
 * 4. 智能检测 - 只运行变更相关的测试
 *
 * Usage:
 *   pnpm e2e:runner                    # 运行变更的 spec 文件
 *   pnpm e2e:runner --all              # 运行所有 spec 文件
 *   pnpm e2e:runner --shard 1/3        # 手动指定分片
 *   pnpm e2e:runner --mock             # 只运行 mock 测试
 *   pnpm e2e:runner --project chrome   # 指定浏览器
 */

import { readdirSync, statSync, existsSync } from 'node:fs'
import { join, resolve, basename } from 'node:path'
import { spawnSync, spawn, type ChildProcess } from 'node:child_process'
import { createHash } from 'node:crypto'

const ROOT = resolve(import.meta.dirname, '..')
const E2E_DIR = join(ROOT, 'e2e')
const SCREENSHOTS_DIR = join(E2E_DIR, '__screenshots__')

// 端口配置
const MOCK_PORT = 11174
const DEV_PORT = 11173

interface RunnerOptions {
  all: boolean
  mock: boolean
  shard?: string
  project?: string
  update: boolean
  dryRun: boolean
  verbose: boolean
}

interface SpecFile {
  name: string
  path: string
  hash: string
  isMock: boolean
}

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(msg: string) {
  console.log(msg)
}

function logSuccess(msg: string) {
  console.log(`${colors.green}✓${colors.reset} ${msg}`)
}

function logError(msg: string) {
  console.error(`${colors.red}✗${colors.reset} ${msg}`)
}

function logInfo(msg: string) {
  console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`)
}

/**
 * 计算文件内容 hash
 */
function getFileHash(filePath: string): string {
  try {
    const content = Bun.file(filePath).toString()
    return createHash('md5').update(content).digest('hex').slice(0, 8)
  } catch {
    return 'unknown'
  }
}

/**
 * 获取所有 spec 文件信息
 */
function getSpecFiles(mockOnly: boolean): SpecFile[] {
  const files = readdirSync(E2E_DIR)
    .filter(f => f.endsWith('.spec.ts'))
    .filter(f => !mockOnly || f.includes('.mock.'))
    .sort()

  return files.map(f => {
    const name = f.replace('.spec.ts', '')
    const path = join(E2E_DIR, f)
    const isMock = f.includes('.mock.')
    const hash = getFileHash(path)

    return { name, path, hash, isMock }
  })
}

/**
 * 解析命令行参数
 */
function parseArgs(): { options: RunnerOptions; specNames: string[] } {
  const args = process.argv.slice(2)
  const options: RunnerOptions = {
    all: false,
    mock: false,
    update: false,
    dryRun: false,
    verbose: false,
  }
  const specNames: string[] = []

  let i = 0
  while (i < args.length) {
    const arg = args[i]
    switch (arg) {
      case '--all':
        options.all = true
        break
      case '--mock':
        options.mock = true
        break
      case '--update':
      case '-u':
        options.update = true
        break
      case '--dry-run':
        options.dryRun = true
        break
      case '--verbose':
      case '-v':
        options.verbose = true
        break
      case '--shard':
        options.shard = args[++i]
        break
      case '--project':
      case '-p':
        options.project = args[++i]
        break
      default:
        if (!arg.startsWith('-')) {
          specNames.push(arg)
        }
    }
    i++
  }

  return { options, specNames }
}

/**
 * 获取变更的文件（通过 git diff）
 */
function getChangedFiles(): Set<string> {
  const result = spawnSync('git', ['diff', '--name-only', 'origin/main...HEAD'], {
    cwd: ROOT,
    encoding: 'utf-8',
  })
  
  if (result.status !== 0) {
    return new Set()
  }

  const files = new Set<string>()
  for (const line of result.stdout.split('\n')) {
    if (line.startsWith('e2e/') || line.startsWith('src/')) {
      files.add(line)
    }
  }
  return files
}

/**
 * 根据变更文件确定需要运行的 spec
 */
function getSpecsToRun(specs: SpecFile[], changedFiles: Set<string>): SpecFile[] {
  if (changedFiles.size === 0) {
    return specs
  }

  const hasSourceChanges = [...changedFiles].some(f => f.startsWith('src/'))
  
  if (hasSourceChanges) {
    logInfo('检测到 src/ 变更，将运行所有 E2E 测试')
    return specs
  }

  const changedSpecs = new Set<string>()
  for (const file of changedFiles) {
    if (file.startsWith('e2e/') && file.endsWith('.spec.ts')) {
      const name = basename(file).replace('.spec.ts', '')
      changedSpecs.add(name)
    }
    if (file.startsWith('e2e/__screenshots__/')) {
      const parts = file.split('/')
      if (parts.length >= 4) {
        const specFileName = parts[3]
        const name = specFileName.replace('.spec.ts', '')
        changedSpecs.add(name)
      }
    }
  }

  if (changedSpecs.size === 0) {
    logInfo('没有检测到 spec 文件变更')
    return []
  }

  return specs.filter(s => changedSpecs.has(s.name))
}

/**
 * 应用分片
 */
function applyShard(specs: SpecFile[], shard?: string): SpecFile[] {
  if (!shard) return specs

  const match = shard.match(/^(\d+)\/(\d+)$/)
  if (!match) {
    logError(`无效的分片格式: ${shard}，应为 N/M 格式`)
    process.exit(1)
  }

  const [, current, total] = match.map(Number)
  if (current < 1 || current > total) {
    logError(`分片索引超出范围: ${current}/${total}`)
    process.exit(1)
  }

  const chunkSize = Math.ceil(specs.length / total)
  const start = (current - 1) * chunkSize
  const end = Math.min(start + chunkSize, specs.length)

  return specs.slice(start, end)
}

/**
 * 等待服务器就绪
 */
async function waitForServer(url: string, timeout = 60000): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url, { 
        method: 'HEAD',
        // @ts-ignore - Node.js fetch 支持这个选项
        rejectUnauthorized: false,
      })
      if (res.ok || res.status === 404) return true
    } catch {
      // 继续等待
    }
    await new Promise(r => setTimeout(r, 500))
  }
  return false
}

/**
 * 启动 dev server
 */
async function startDevServer(isMock: boolean): Promise<ChildProcess> {
  const port = isMock ? MOCK_PORT : DEV_PORT
  const url = `https://localhost:${port}`
  
  // 检查是否已有服务器在运行
  try {
    const res = await fetch(url, { 
      method: 'HEAD',
      // @ts-ignore
      rejectUnauthorized: false,
    })
    if (res.ok || res.status === 404) {
      logInfo(`复用已存在的 dev server: ${url}`)
      return null as unknown as ChildProcess
    }
  } catch {
    // 服务器未运行，继续启动
  }

  logInfo(`启动 dev server: ${url}`)
  
  const command = isMock ? 'pnpm' : 'pnpm'
  const args = isMock 
    ? ['dev:mock', '--port', String(port)]
    : ['dev', '--port', String(port)]
  
  const proc = spawn(command, args, {
    cwd: ROOT,
    stdio: 'pipe',
    detached: false,
  })

  // 等待服务器就绪
  const ready = await waitForServer(url)
  if (!ready) {
    proc.kill()
    throw new Error(`Dev server 启动超时: ${url}`)
  }

  logSuccess(`Dev server 已就绪: ${url}`)
  return proc
}

/**
 * 运行单个 spec 文件
 */
function runSpec(
  spec: SpecFile,
  options: RunnerOptions
): { success: boolean; duration: number } {
  const startTime = Date.now()
  const port = spec.isMock ? MOCK_PORT : DEV_PORT
  
  // 构建 playwright 参数
  const args = ['test', spec.path]
  
  // 添加配置文件
  if (spec.isMock) {
    args.push('--config', 'playwright.mock.config.ts')
  }
  
  // 添加项目（浏览器）
  if (options.project) {
    args.push('--project', options.project)
  } else {
    args.push('--project', 'Mobile Chrome', '--project', 'Mobile Safari')
  }
  
  // 更新截图
  if (options.update) {
    args.push('--update-snapshots')
  }

  if (options.dryRun) {
    log(`${colors.dim}[dry-run] playwright ${args.join(' ')}${colors.reset}`)
    return { success: true, duration: 0 }
  }

  // 运行测试，设置环境变量告诉 playwright 复用已有服务器
  const result = spawnSync('playwright', args, {
    cwd: ROOT,
    stdio: options.verbose ? 'inherit' : 'pipe',
    env: {
      ...process.env,
      // 强制复用已有服务器
      PW_TEST_REUSE_CONTEXT: '1',
    },
  })

  const duration = Date.now() - startTime
  const success = result.status === 0

  if (!success && !options.verbose && result.stderr) {
    console.log(result.stderr.toString())
  }

  return { success, duration }
}

/**
 * 按类型分组运行测试（mock 和 non-mock 分开）
 */
async function runSpecsByType(
  specs: SpecFile[],
  options: RunnerOptions
): Promise<{ passed: number; failed: number }> {
  const mockSpecs = specs.filter(s => s.isMock)
  const devSpecs = specs.filter(s => !s.isMock)
  
  let passed = 0
  let failed = 0

  // 运行 mock 测试
  if (mockSpecs.length > 0) {
    log(`\n${colors.bold}运行 Mock 测试 (${mockSpecs.length} 个)${colors.reset}\n`)
    
    let mockServer: ChildProcess | null = null
    try {
      if (!options.dryRun) {
        mockServer = await startDevServer(true)
      }
      
      for (const spec of mockSpecs) {
        const result = runSpec(spec, options)
        if (result.success) {
          logSuccess(`${spec.name} (${(result.duration / 1000).toFixed(1)}s)`)
          passed++
        } else {
          logError(`${spec.name} (${(result.duration / 1000).toFixed(1)}s)`)
          failed++
        }
      }
    } finally {
      if (mockServer) {
        mockServer.kill()
      }
    }
  }

  // 运行 dev 测试
  if (devSpecs.length > 0) {
    log(`\n${colors.bold}运行 Dev 测试 (${devSpecs.length} 个)${colors.reset}\n`)
    
    let devServer: ChildProcess | null = null
    try {
      if (!options.dryRun) {
        devServer = await startDevServer(false)
      }
      
      for (const spec of devSpecs) {
        const result = runSpec(spec, options)
        if (result.success) {
          logSuccess(`${spec.name} (${(result.duration / 1000).toFixed(1)}s)`)
          passed++
        } else {
          logError(`${spec.name} (${(result.duration / 1000).toFixed(1)}s)`)
          failed++
        }
      }
    } finally {
      if (devServer) {
        devServer.kill()
      }
    }
  }

  return { passed, failed }
}

/**
 * 主函数
 */
async function main() {
  const { options, specNames } = parseArgs()

  log(`\n${colors.bold}${colors.cyan}E2E Runner${colors.reset}\n`)

  // 获取所有 spec 文件
  let specs = getSpecFiles(options.mock)
  
  if (specNames.length > 0) {
    const validSpecs = specs.filter(s => specNames.includes(s.name))
    const invalidNames = specNames.filter(n => !specs.some(s => s.name === n))
    
    if (invalidNames.length > 0) {
      logError(`未找到以下 spec: ${invalidNames.join(', ')}`)
      log(`${colors.dim}可用的 spec: ${specs.map(s => s.name).join(', ')}${colors.reset}`)
      process.exit(1)
    }
    
    specs = validSpecs
  } else if (!options.all) {
    const changedFiles = getChangedFiles()
    specs = getSpecsToRun(specs, changedFiles)
  }

  // 应用分片
  specs = applyShard(specs, options.shard)

  if (specs.length === 0) {
    logInfo('没有需要运行的测试')
    process.exit(0)
  }

  // 显示将要运行的测试
  log(`${colors.yellow}将运行 ${specs.length} 个 spec 文件:${colors.reset}`)
  for (const spec of specs) {
    const mockTag = spec.isMock ? `${colors.dim}[mock]${colors.reset}` : ''
    log(`  ${colors.dim}•${colors.reset} ${spec.name} ${mockTag}`)
  }

  // 运行测试
  const startTime = Date.now()
  const { passed, failed } = await runSpecsByType(specs, options)
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1)

  // 输出总结
  log('')
  log(`${colors.bold}总结${colors.reset}`)
  log(`  ${colors.green}通过: ${passed}${colors.reset}`)
  if (failed > 0) {
    log(`  ${colors.red}失败: ${failed}${colors.reset}`)
  }
  log(`  ${colors.dim}耗时: ${totalTime}s${colors.reset}`)
  log('')

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(err => {
  logError(err.message)
  process.exit(1)
})
