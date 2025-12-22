#!/usr/bin/env bun
/**
 * E2E 测试入口脚本
 *
 * 要求必须传递至少一个 spec 文件，以控制测试时间成本。
 *
 * Usage:
 *   bun scripts/e2e.ts <spec-name>     # 运行指定 spec（不需要 .spec.ts 后缀）
 *   bun scripts/e2e.ts pages guide     # 运行多个 spec
 *   bun scripts/e2e.ts --all           # 运行所有测试（等同于 pnpm e2e:all）
 *
 * Examples:
 *   bun scripts/e2e.ts pages
 *   bun scripts/e2e.ts wallet-create wallet-import
 *   bun scripts/e2e.ts i18n-boot --headed
 */

import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const ROOT = resolve(import.meta.dirname, '..')
const E2E_DIR = join(ROOT, 'e2e')

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

function getAvailableSpecs(): string[] {
  return readdirSync(E2E_DIR)
    .filter((f) => f.endsWith('.spec.ts'))
    .map((f) => f.replace('.spec.ts', ''))
    .sort()
}

function printUsage() {
  const specs = getAvailableSpecs()

  console.log(`
${colors.bold}${colors.cyan}E2E 测试入口${colors.reset}

${colors.yellow}用法:${colors.reset}
  pnpm e2e <spec-name> [spec-name...]   运行指定 spec
  pnpm e2e --all                        运行所有测试
  pnpm e2e <spec-name> --headed         带界面运行
  pnpm e2e <spec-name> --ui             使用 Playwright UI 模式

${colors.yellow}可用的 spec 文件 (${specs.length}):${colors.reset}
${specs.map((s) => `  ${colors.dim}•${colors.reset} ${s}`).join('\n')}

${colors.yellow}示例:${colors.reset}
  pnpm e2e pages
  pnpm e2e wallet-create wallet-import
  pnpm e2e i18n-boot --headed

${colors.dim}提示: 为了控制测试时间，请只运行需要的 spec 文件。
运行全部测试请使用: pnpm e2e:all${colors.reset}
`)
}

function main() {
  const args = process.argv.slice(2)

  // 如果有 --all 参数，运行所有测试
  if (args.includes('--all')) {
    const otherArgs = args.filter((a) => a !== '--all')
    console.log(`${colors.cyan}运行所有 E2E 测试...${colors.reset}\n`)
    const result = spawnSync('playwright', ['test', ...otherArgs], {
      stdio: 'inherit',
      cwd: ROOT,
    })
    process.exit(result.status ?? 1)
  }

  // 分离 spec 名称和 playwright 参数
  // 使用 -- 分隔符或识别带值的参数
  const specNames: string[] = []
  const playwrightArgs: string[] = []

  // 需要参数值的 playwright 选项
  const argsWithValue = new Set([
    '--project',
    '-p',
    '--grep',
    '-g',
    '--config',
    '-c',
    '--workers',
    '-j',
    '--timeout',
    '--retries',
    '--reporter',
    '--output',
    '--trace',
    '--shard',
    '--global-timeout',
    '--browser',
  ])

  let i = 0
  let foundSeparator = false

  while (i < args.length) {
    const arg = args[i]

    // -- 后面的都是 playwright 参数
    if (arg === '--') {
      foundSeparator = true
      i++
      continue
    }

    if (foundSeparator) {
      playwrightArgs.push(arg)
      i++
      continue
    }

    if (arg.startsWith('-')) {
      playwrightArgs.push(arg)
      // 如果是需要值的参数，把下一个参数也加入
      if (argsWithValue.has(arg) && i + 1 < args.length && !args[i + 1].startsWith('-')) {
        i++
        playwrightArgs.push(args[i])
      }
    } else {
      specNames.push(arg)
    }
    i++
  }

  // 如果没有传递 spec 名称，显示用法
  if (specNames.length === 0) {
    printUsage()
    process.exit(1)
  }

  const availableSpecs = getAvailableSpecs()

  // 验证 spec 名称
  const invalidSpecs = specNames.filter((s) => !availableSpecs.includes(s))
  if (invalidSpecs.length > 0) {
    console.error(
      `${colors.red}错误: 未找到以下 spec 文件:${colors.reset} ${invalidSpecs.join(', ')}`,
    )
    console.error(`${colors.dim}可用的 spec: ${availableSpecs.join(', ')}${colors.reset}`)
    process.exit(1)
  }

  // 构建 playwright 命令
  const specFiles = specNames.map((s) => `e2e/${s}.spec.ts`)

  console.log(`${colors.cyan}运行 E2E 测试: ${specNames.join(', ')}${colors.reset}\n`)
  const result = spawnSync('playwright', ['test', ...specFiles, ...playwrightArgs], {
    stdio: 'inherit',
    cwd: ROOT,
  })
  process.exit(result.status ?? 1)
}

main()
